const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { isAdmin, isLoanOfficer } = require('../lib/roles.cjs');

const { calculateClientScore } = require('../services/scoreService');
const {
  sqlMemberCountSubquery,
  sqlOfficerGroupLoanFilter,
} = require('../lib/groupMembersSql.cjs');

/** Basic UUID v4 check for assigned_officer_id (avoids PG 22P02 invalid input syntax) */
function isValidUuid(val) {
  if (val == null || val === '') return false;
  const s = String(val).trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

/** YYYY-MM-DD or null — avoids PostgreSQL date errors from bad client input */
function normalizeDateOnlyInput(val) {
  if (val == null || val === '') return null;
  const s = String(val).trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const t = Date.parse(s);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString().slice(0, 10);
}

/** Today's calendar date in the server's local timezone (aligns with HTML `type="date"`). */
function todayYyyyMmDdLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loanPortfolioStatus(totalLoans, totalBorrowed, totalPaid, hasPastMaturity = false) {
  const loans = parseInt(totalLoans, 10) || 0;
  const borrowed = parseFloat(totalBorrowed || 0);
  const paid = parseFloat(totalPaid || 0);
  if (loans === 0) return 'No Active Loans';
  const balance = Math.max(0, borrowed * 1.3 - paid);
  if (balance <= 0) return 'Fully Paid';
  if (hasPastMaturity) return 'Past Maturity';
  return 'Current';
}

// Get all borrowers with aggregated loan data
router.get('/', async (req, res) => {
  const isGroup = req.query.isGroup === 'true';

  try {
    if (isGroup) {
      const userId = req.user?.user_id || req.user?.id;
      const officerScoped = isLoanOfficer(req.user?.role) && userId;
      const groupParams = officerScoped ? [userId] : [];
      const officerLoanFilter = officerScoped ? sqlOfficerGroupLoanFilter(1) : '';
      const memberCountSql = sqlMemberCountSubquery('g.id', officerScoped ? officerLoanFilter.replace(/\bla\./g, 'la_mc.') : '');
      // Only groups with at least one non-rejected loan linked by group_id (source of truth for stats)
      const { rows } = await db.query(`
                SELECT 
                    g.id,
                    g.group_name as full_name,
                    'Group Account' as email,
                    (SELECT b.phone_number FROM loan_applications la_p
                     JOIN borrowers b ON la_p.borrower_id = b.id
                     WHERE la_p.group_id = g.id AND la_p.status != 'rejected'
                     LIMIT 1) as phone_number,
                    g.created_at,
                    ${memberCountSql} as member_count,
                    COUNT(la.id) as total_loans,
                    SUM(COALESCE(la.loan_amount, 0)) as total_borrowed,
                    COALESCE((
                        SELECT SUM(r.amount) FROM repayments r 
                        JOIN loan_applications la2 ON r.loan_application_id = la2.id 
                        WHERE la2.group_id = g.id AND la2.status != 'rejected'
                          ${officerScoped ? 'AND la2.borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $1)' : ''}
                    ), 0) as total_paid,
                    true as is_group
                FROM groups g
                INNER JOIN loan_applications la ON g.id = la.group_id AND la.status != 'rejected' ${officerLoanFilter}
                GROUP BY g.id
                HAVING COUNT(la.id) > 0
                ORDER BY g.group_name
            `, groupParams);

      const processed = rows.map(r => {
        const total_paid = parseFloat(r.total_paid || 0);
        const total_borrowed = parseFloat(r.total_borrowed || 0);
        return {
          ...r,
          member_count: parseInt(r.member_count, 10) || 0,
          total_loans: parseInt(r.total_loans, 10) || 0,
          total_borrowed,
          total_paid,
          open_loans_balance: Math.max(0, total_borrowed * 1.3 - total_paid),
          status: loanPortfolioStatus(r.total_loans, total_borrowed, total_paid),
        };
      });
      return res.json(processed);
    }

    const userId = req.user?.user_id || req.user?.id;

    let borrowerWhere = `b.full_name NOT IN (
                SELECT p.full_name FROM profiles p
                JOIN user_roles ur ON p.id = ur.user_id
                WHERE ur.role::text IN ('admin', 'loan_officer')
            )`;
    const borrowerValues = [];
    if (isLoanOfficer(req.user?.role) && userId) {
      borrowerWhere = `b.assigned_officer_id = $1`;
      borrowerValues.push(userId);
    }

    const { rows } = await db.query(`
            SELECT 
                b.*,
                off.full_name AS assigned_officer_name,
                COUNT(la.id)::int AS total_loans,
                COUNT(la.id) FILTER (WHERE la.status IN ('approved', 'disbursed'))::int AS active_loans,
                COALESCE(SUM(la.loan_amount), 0)::numeric AS total_borrowed,
                COALESCE((
                    SELECT SUM(r.amount) FROM repayments r 
                    JOIN loan_applications la2 ON r.loan_application_id = la2.id 
                    WHERE la2.borrower_id = b.id AND la2.status != 'rejected'
                ), 0)::numeric AS total_paid,
                EXISTS (
                    SELECT 1
                    FROM loan_applications la_pm
                    WHERE la_pm.borrower_id = b.id
                      AND la_pm.status IN ('approved', 'disbursed')
                      AND la_pm.approved_at IS NOT NULL
                      AND (
                        la_pm.approved_at
                          + (COALESCE(la_pm.loan_duration_months, 4) || ' months')::interval
                      ) < NOW()
                      AND (
                        (COALESCE(la_pm.loan_amount, 0) * 1.3)
                        - COALESCE((
                            SELECT SUM(r2.amount) FROM repayments r2
                            WHERE r2.loan_application_id = la_pm.id
                          ), 0)
                      ) > 0.01
                ) AS has_past_maturity
            FROM borrowers b
            LEFT JOIN profiles off ON off.id = b.assigned_officer_id
            LEFT JOIN loan_applications la ON b.id = la.borrower_id AND la.status != 'rejected'
            WHERE ${borrowerWhere}
            GROUP BY b.id, off.full_name
            ORDER BY b.full_name
        `, borrowerValues.length ? borrowerValues : []);

    const processed = rows.map((r) => {
      const total_borrowed = parseFloat(r.total_borrowed || 0);
      const total_paid = parseFloat(r.total_paid || 0);
      const balance = Math.max(0, total_borrowed * 1.3 - total_paid);
      const total_loans = parseInt(r.total_loans, 10) || 0;
      const active_loans = parseInt(r.active_loans, 10) || 0;
      const hasPastMaturity = Boolean(r.has_past_maturity);

      return {
        ...r,
        total_loans,
        active_loans,
        total_borrowed,
        total_paid,
        open_loans_balance: balance,
        assigned_officer_name: r.assigned_officer_name || null,
        status: loanPortfolioStatus(total_loans, total_borrowed, total_paid, hasPastMaturity),
      };
    });

    res.json(processed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch borrowers' });
  }
});

// Update borrower location
router.put('/:id/location', async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id || req.user?.id;
  if (isLoanOfficer(req.user?.role) && userId) {
    const { rows: access } = await db.query(
      'SELECT id FROM borrowers WHERE id = $1 AND assigned_officer_id = $2',
      [id, userId]
    );
    if (access.length === 0) {
      return res.status(403).json({ error: 'You can only update borrowers assigned to you.' });
    }
  }
  const { district, county, sub_county, parish, village, latitude, longitude } = req.body;

  try {
    await db.query(`
      UPDATE borrowers 
      SET 
        address = $1, 
        district = $2,
        city = $3,
        province_state = $4,
        village = $5,
        latitude = $6,
        longitude = $7,
        updated_at = NOW() 
      WHERE id = $8
    `, [`${village}, ${district}`, district, district, county, village, latitude, longitude, id]);

    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get borrower's attachments from their most recent loan application
router.get('/:id/attachments', async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    if (isLoanOfficer(req.user?.role) && userId) {
      const { rows: access } = await db.query(
        'SELECT id FROM borrowers WHERE id = $1 AND assigned_officer_id = $2',
        [req.params.id, userId]
      );
      if (access.length === 0) {
        return res.status(403).json({ error: 'You can only view borrowers assigned to you.' });
      }
    }

    const { rows } = await db.query(`
      SELECT attachment_national_id, attachment_lc1_letter, attachment_recommendation_letter,
             attachment_passport_photo, attachment_income_statement
      FROM loan_applications
      WHERE borrower_id = $1
        AND (attachment_national_id IS NOT NULL OR attachment_lc1_letter IS NOT NULL
             OR attachment_recommendation_letter IS NOT NULL OR attachment_passport_photo IS NOT NULL
             OR attachment_income_statement IS NOT NULL)
      ORDER BY created_at DESC
      LIMIT 1
    `, [req.params.id]);
    if (rows.length === 0) return res.json({});
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch borrower attachments' });
  }
});

// Update borrower profile (staff)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id || req.user?.id;
  const role = req.user?.role;

  if (!isAdmin(role) && !isLoanOfficer(role)) {
    return res.status(403).json({ error: 'Staff access required.' });
  }

  if (isLoanOfficer(role) && userId) {
    const { rows: access } = await db.query(
      'SELECT id FROM borrowers WHERE id = $1 AND assigned_officer_id = $2',
      [id, userId]
    );
    if (access.length === 0) {
      return res.status(403).json({ error: 'You can only edit borrowers assigned to you.' });
    }
  }

  const allowed = [
    'full_name', 'email', 'phone_number', 'first_name', 'last_middle_name',
    'business_name', 'address', 'district', 'village', 'landline_phone', 'description',
    'city', 'province_state', 'zipcode', 'gender', 'title', 'working_status', 'unique_number',
    'country', 'id_number', 'borrower_photo',
  ];
  const body = req.body || {};
  const updates = [];
  const values = [];
  let idx = 1;
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      let v = body[key];
      if (v === '') v = null;
      if (key === 'email' && typeof v === 'string' && !v.trim()) v = null;
      updates.push(`${key} = $${idx}`);
      values.push(v);
      idx += 1;
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, 'borrower_files')) {
    const bf = body.borrower_files;
    const arr = bf == null ? null : (Array.isArray(bf) ? bf : [bf]).map((x) => String(x)).filter(Boolean);
    if (arr == null) {
      updates.push(`borrower_files = $${idx}`);
      values.push(null);
    } else {
      updates.push(`borrower_files = $${idx}::text[]`);
      values.push(arr);
    }
    idx += 1;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'assigned_officer_id')) {
    if (!isAdmin(role)) {
      return res.status(403).json({ error: 'Only administrators can change loan officer assignment.' });
    }
    const aid = body.assigned_officer_id;
    if (aid !== '' && aid != null && !isValidUuid(aid)) {
      return res.status(400).json({ error: 'Invalid loan officer id (must be a UUID).' });
    }
    updates.push(`assigned_officer_id = $${idx}`);
    values.push(aid === '' || aid == null ? null : String(aid).trim());
    idx += 1;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'credit_score')) {
    if (!isAdmin(role)) {
      return res.status(403).json({ error: 'Only administrators can edit credit score.' });
    }
    updates.push(`credit_score = $${idx}`);
    const cs = body.credit_score;
    const n = cs === '' || cs == null ? null : Number(cs);
    values.push(n != null && Number.isFinite(n) ? n : null);
    idx += 1;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'dob') || Object.prototype.hasOwnProperty.call(body, 'date_of_birth')) {
    const d = body.dob !== undefined ? body.dob : body.date_of_birth;
    updates.push(`date_of_birth = $${idx}`);
    values.push(normalizeDateOnlyInput(d));
    idx += 1;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'registered_on')) {
    const rawRo = body.registered_on;
    if (rawRo !== '' && rawRo != null) {
      const rd = normalizeDateOnlyInput(rawRo);
      if (!rd) {
        return res.status(400).json({ error: 'Invalid registration date. Use YYYY-MM-DD.' });
      }
      const today = todayYyyyMmDdLocal();
      if (rd > today) {
        return res.status(400).json({ error: 'Registration date cannot be in the future.' });
      }
      updates.push(`created_at = $${idx}::date::timestamptz`);
      values.push(rd);
      idx += 1;
    }
  }
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  values.push(id);

  try {
    const { rows } = await db.query(
      `UPDATE borrowers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Borrower not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Borrower PUT error:', err);
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Duplicate value (e.g. email already used by another borrower).' });
    }
    if (err && err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid data (check UUIDs and field formats).' });
    }
    const msg = err && err.message ? String(err.message) : 'Failed to update borrower';
    res.status(500).json({ error: msg });
  }
});

// Get borrower by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    if (isLoanOfficer(req.user?.role) && userId) {
      const { rows: access } = await db.query(
        'SELECT id FROM borrowers WHERE id = $1 AND assigned_officer_id = $2',
        [req.params.id, userId]
      );
      if (access.length === 0) {
        return res.status(403).json({ error: 'You can only view borrowers assigned to you.' });
      }
    }

    const { rows } = await db.query(`
      SELECT 
        b.*,
        COUNT(la.id) as total_loans,
        SUM(COALESCE(la.loan_amount, 0)) as total_borrowed,
        COALESCE((
          SELECT SUM(amount) FROM repayments r 
          JOIN loan_applications la2 ON r.loan_application_id = la2.id 
          WHERE la2.borrower_id = b.id
        ), 0) as total_paid
      FROM borrowers b
      LEFT JOIN loan_applications la ON b.id = la.borrower_id AND la.status != 'rejected'
      WHERE b.id = $1
      GROUP BY b.id
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Borrower not found' });

    const borrower = rows[0];
    const total_borrowed_with_interest = parseFloat(borrower.total_borrowed || 0) * 1.3;
    const total_paid = parseFloat(borrower.total_paid || 0);
    const balance = Math.max(0, total_borrowed_with_interest - total_paid);

    const response = {
      ...borrower,
      total_loans: parseInt(borrower.total_loans),
      total_borrowed: parseFloat(borrower.total_borrowed || 0),
      total_paid: total_paid,
      open_loans_balance: balance,
      status: balance <= 0 && borrower.total_loans > 0 ? 'Fully Paid' : (borrower.total_loans > 0 ? 'Current' : 'New')
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch borrower' });
  }
});

// Create new borrower
router.post('/', async (req, res) => {
  const {
    full_name, email, phone_number, first_name, last_middle_name,
    business_name, unique_number, country, address, city,
    province_state, zipcode, gender, title, working_status, credit_score,
    dob, landline_phone, description,
    borrower_photo, borrower_files, assigned_officer_id,
    district, village,
    registered_on,
  } = req.body;

  const registrationDate = normalizeDateOnlyInput(registered_on);
  if (registrationDate) {
    const today = todayYyyyMmDdLocal();
    if (registrationDate > today) {
      return res.status(400).json({ error: 'Registration date cannot be in the future.' });
    }
  }

  try {
    const query = `
            INSERT INTO borrowers (
                full_name, email, phone_number, first_name, last_middle_name,
                business_name, unique_number, country, address, city,
                province_state, zipcode, gender, title, working_status, credit_score,
                date_of_birth, landline_phone, description,
                borrower_photo, borrower_files, assigned_officer_id,
                district, village, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, COALESCE($25::date::timestamptz, NOW()))
            RETURNING *
        `;
    const selfId = req.user?.id || req.user?.user_id;
    const assignedOfficerId = isLoanOfficer(req.user?.role) && selfId
      ? String(selfId)
      : (assigned_officer_id && typeof assigned_officer_id === 'string' && assigned_officer_id.length > 10)
        ? assigned_officer_id
        : null;

    const values = [
      full_name, email, phone_number, first_name, last_middle_name,
      business_name, unique_number, country || 'Uganda', address, city,
      province_state, zipcode, gender, title, working_status, credit_score || 300,
      dob || null, landline_phone, description,
      borrower_photo, borrower_files ? [borrower_files] : null, assignedOfficerId,
      district || null, village || null,
      registrationDate || null,
    ];

    const { rows } = await db.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ Error creating borrower:');
    console.error('  Message:', err.message);
    res.status(500).json({ error: 'Failed to create borrower: ' + err.message });
  }
});

// Delete borrower (no active loan records on file)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id || req.user?.id;
  const role = req.user?.role;

  if (!isAdmin(role) && !isLoanOfficer(role)) {
    return res.status(403).json({ error: 'Staff access required.' });
  }

  if (isLoanOfficer(role) && userId) {
    const { rows: access } = await db.query(
      'SELECT id FROM borrowers WHERE id = $1 AND assigned_officer_id = $2',
      [id, userId]
    );
    if (access.length === 0) {
      return res.status(403).json({ error: 'You can only delete borrowers assigned to you.' });
    }
  }

  try {
    const { rows: blocking } = await db.query(
      `SELECT la.id, la.status
       FROM loan_applications la
       WHERE la.borrower_id = $1 AND la.status NOT IN ('rejected')
       LIMIT 1`,
      [id]
    );
    if (blocking.length > 0) {
      return res.status(409).json({
        error: 'Cannot delete this client while they have loan application(s) on file. Remove or reject those loans first.',
      });
    }

    const { rowCount } = await db.query('DELETE FROM borrowers WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Borrower not found' });
    res.json({ message: 'Borrower deleted' });
  } catch (err) {
    console.error('Borrower DELETE error:', err);
    if (err && err.code === '23503') {
      return res.status(409).json({
        error: 'Cannot delete: this client is still referenced by other records in the system.',
      });
    }
    res.status(500).json({ error: err.message || 'Failed to delete borrower' });
  }
});

module.exports = router;
