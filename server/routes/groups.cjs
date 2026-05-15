const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { isAdmin, isLoanOfficer } = require('../lib/roles.cjs');
const {
  MEMBER_KEY,
  sqlMemberCountSubquery,
  sqlOfficerGroupLoanFilter,
} = require('../lib/groupMembersSql.cjs');

// Get all groups
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM groups ORDER BY group_name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Group detail with members and loan totals
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id || req.user?.id;
  const officerScoped = isLoanOfficer(req.user?.role) && userId;

  try {
    const groupParams = officerScoped ? [id, userId] : [id];
    const officerLaFilter = officerScoped ? sqlOfficerGroupLoanFilter(2) : '';
    const memberCountSql = sqlMemberCountSubquery('g.id', officerScoped ? officerLaFilter.replace(/\bla\./g, 'la_mc.') : '');
    const groupFilter = officerScoped
      ? `AND EXISTS (
          SELECT 1 FROM loan_applications la_o
          WHERE la_o.group_id = g.id AND la_o.status != 'rejected'
          ${officerLaFilter.replace(/\bla\./g, 'la_o.')}
        )`
      : '';

    const { rows: groupRows } = await db.query(
      `
      SELECT
        g.id,
        g.group_name,
        g.description,
        g.status,
        g.created_at,
        ${memberCountSql} AS member_count,
        COUNT(la.id) AS total_loans,
        COALESCE(SUM(la.loan_amount), 0) AS total_borrowed,
        COALESCE((
          SELECT SUM(r.amount)
          FROM repayments r
          JOIN loan_applications la2 ON r.loan_application_id = la2.id
          WHERE la2.group_id = g.id AND la2.status != 'rejected'
          ${officerScoped ? 'AND la2.borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $2)' : ''}
        ), 0) AS total_paid
      FROM groups g
      LEFT JOIN loan_applications la ON la.group_id = g.id AND la.status != 'rejected'
      WHERE g.id = $1 ${groupFilter}
      GROUP BY g.id
      `,
      groupParams
    );

    if (groupRows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const g = groupRows[0];
    const totalBorrowed = parseFloat(g.total_borrowed || 0);
    const totalPaid = parseFloat(g.total_paid || 0);
    const totalWithInterest = totalBorrowed * 1.3;

    const memberParams = officerScoped ? [id, userId] : [id];
    const memberLoanFilter = officerScoped ? sqlOfficerGroupLoanFilter(2).replace(/\bla\./g, 'la.') : '';

    const { rows: members } = await db.query(
      `
      WITH member_rows AS (
        SELECT
          ${MEMBER_KEY} AS member_key,
          TRIM(elem->>'name') AS full_name,
          NULLIF(TRIM(elem->>'nin'), '') AS unique_number,
          NULLIF(TRIM(elem->>'borrower_id'), '') AS borrower_id_text,
          COALESCE(NULLIF(elem->>'amount', '')::numeric, 0) AS share_amount,
          la.id AS loan_id
        FROM loan_applications la
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(la.group_members, '[]'::jsonb)) AS elem
        WHERE la.group_id = $1 AND la.status != 'rejected'
          ${memberLoanFilter}
          AND NULLIF(TRIM(elem->>'name'), '') IS NOT NULL
      )
      SELECT
        mr.member_key AS id,
        MAX(mr.full_name) AS full_name,
        MAX(b.phone_number) AS phone_number,
        MAX(b.email) AS email,
        MAX(COALESCE(mr.unique_number, b.unique_number)) AS unique_number,
        COUNT(DISTINCT mr.loan_id) AS loan_count,
        SUM(mr.share_amount) AS total_borrowed,
        0::numeric AS total_paid
      FROM member_rows mr
      LEFT JOIN borrowers b ON mr.borrower_id_text ~* '^[0-9a-f-]{36}$'
        AND b.id = mr.borrower_id_text::uuid
      GROUP BY mr.member_key
      ORDER BY MAX(mr.full_name)
      `,
      memberParams
    );

    const processedMembers = members.map((m) => {
      const borrowed = parseFloat(m.total_borrowed || 0);
      const paid = parseFloat(m.total_paid || 0);
      const balance = Math.max(0, borrowed * 1.3 - paid);
      return {
        ...m,
        loan_count: parseInt(m.loan_count, 10),
        total_borrowed: borrowed,
        total_paid: paid,
        open_loans_balance: balance,
      };
    });

    res.json({
      id: g.id,
      group_name: g.group_name,
      description: g.description,
      status: g.status,
      created_at: g.created_at,
      member_count: parseInt(g.member_count, 10) || processedMembers.length,
      total_loans: parseInt(g.total_loans, 10),
      total_borrowed: totalBorrowed,
      total_paid: totalPaid,
      open_loans_balance: Math.max(0, totalWithInterest - totalPaid),
      status_label: (() => {
        const loans = parseInt(g.total_loans, 10) || 0;
        if (loans === 0) return 'No Active Loans';
        if (totalWithInterest <= totalPaid) return 'Fully Paid';
        return 'Current';
      })(),
      members: processedMembers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// Delete group (orphan rows immediately; linked loans need ?force=true)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const force = req.query.force === 'true';
  const role = req.user?.role;

  if (!isAdmin(role) && !isLoanOfficer(role)) {
    return res.status(403).json({ error: 'Staff access required.' });
  }

  try {
    const { rows: groupRows } = await db.query(
      'SELECT id, group_name FROM groups WHERE id = $1',
      [id]
    );
    if (groupRows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const { rows: [counts] } = await db.query(
      `SELECT COUNT(*)::int AS loan_count
       FROM loan_applications
       WHERE group_id = $1 AND status != 'rejected'`,
      [id]
    );
    const loanCount = counts?.loan_count || 0;

    if (loanCount > 0 && !force) {
      return res.status(409).json({
        error: `This group has ${loanCount} linked loan(s). Confirm delete to remove the group; loans will remain but will be unlinked.`,
        loan_count: loanCount,
        requires_force: true,
      });
    }

    await db.query(
      `UPDATE loan_applications
       SET group_name = NULL
       WHERE group_id = $1`,
      [id]
    );
    const { rowCount } = await db.query('DELETE FROM groups WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Group not found' });

    res.json({
      message: 'Group deleted',
      unlinked_loans: loanCount,
    });
  } catch (err) {
    console.error('Group DELETE error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete group' });
  }
});

module.exports = router;
