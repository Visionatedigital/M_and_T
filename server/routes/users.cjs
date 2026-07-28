const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const bcrypt = require('bcryptjs');
const { requireAdmin, requireStaff } = require('../lib/roles.cjs');
const { sqlOfficerVisibleLoanApps } = require('../lib/officerLoanScope.cjs');

const ACTIVE_LOAN_STATUSES = `ARRAY['approved', 'disbursed', 'completed', 'settled']::text[]`;

/** Phone-normalized join for legacy loans with no borrower_id */
function sqlBorrowerPhoneMatch(borrowerAlias, loanAlias) {
    const bPhone = `regexp_replace(regexp_replace(trim(COALESCE(${borrowerAlias}.phone_number, '')), '^\\+256', '0'), '\\D', '', 'g')`;
    const lPhone = `regexp_replace(regexp_replace(trim(COALESCE(${loanAlias}.phone_number, '')), '^\\+256', '0'), '\\D', '', 'g')`;
    return `(
        COALESCE(NULLIF(${bPhone}, ''), '') <> ''
        AND ${bPhone} = ${lPhone}
    )`;
}

/** List staff (admins + loan officers) — any staff; create accounts — admins only */
router.get('/', requireStaff, async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT p.id, p.email, p.full_name, p.first_name, p.last_name,
                   p.phone_number, p.created_at, ur.role
            FROM profiles p
            JOIN user_roles ur ON p.id = ur.user_id
            WHERE ur.role IN ('admin', 'loan_officer')
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/** Admin-only: summary of each loan officer's assigned portfolio */
router.get('/loan-officer-portfolios', requireAdmin, async (req, res) => {
    try {
        // Loans are often legacy rows with borrower_id NULL — match via assigned borrowers' phones
        // the same way Active Loans / officer scope does.
        const { rows } = await db.query(`
            WITH officers AS (
                SELECT p.id, p.full_name, p.email, p.phone_number, p.created_at
                FROM profiles p
                JOIN user_roles ur ON p.id = ur.user_id
                WHERE ur.role = 'loan_officer'
            ),
            assigned_borrowers AS (
                SELECT b.assigned_officer_id AS officer_id, COUNT(*)::int AS borrower_count
                FROM borrowers b
                WHERE b.assigned_officer_id IS NOT NULL
                GROUP BY b.assigned_officer_id
            ),
            officer_loans AS (
                SELECT DISTINCT
                    o.id AS officer_id,
                    la.id,
                    COALESCE(la.loan_amount, 0)::numeric AS principal_amount
                FROM officers o
                JOIN loan_applications la ON ${sqlOfficerVisibleLoanApps('la', 'o.id')}
                WHERE la.status = ANY(${ACTIVE_LOAN_STATUSES})
            ),
            repayments_by_loan AS (
                SELECT r.loan_application_id, COALESCE(SUM(r.amount), 0)::numeric AS amount_paid
                FROM repayments r
                GROUP BY r.loan_application_id
            ),
            portfolio_stats AS (
                SELECT
                    ol.officer_id,
                    COUNT(*)::int AS active_loan_count,
                    COALESCE(SUM(ol.principal_amount), 0)::numeric AS total_principal,
                    COALESCE(SUM(COALESCE(rbl.amount_paid, 0)), 0)::numeric AS total_paid,
                    COALESCE(SUM(GREATEST(0, (ol.principal_amount * 1.30) - COALESCE(rbl.amount_paid, 0))), 0)::numeric AS total_remaining
                FROM officer_loans ol
                LEFT JOIN repayments_by_loan rbl ON rbl.loan_application_id = ol.id
                GROUP BY ol.officer_id
            )
            SELECT
                o.id,
                o.full_name,
                o.email,
                o.phone_number,
                o.created_at,
                COALESCE(ab.borrower_count, 0) AS borrower_count,
                COALESCE(ps.active_loan_count, 0) AS active_loan_count,
                COALESCE(ps.total_principal, 0) AS total_principal,
                COALESCE(ps.total_paid, 0) AS total_paid,
                COALESCE(ps.total_remaining, 0) AS total_remaining
            FROM officers o
            LEFT JOIN assigned_borrowers ab ON ab.officer_id = o.id
            LEFT JOIN portfolio_stats ps ON ps.officer_id = o.id
            ORDER BY o.full_name ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch loan officer portfolios' });
    }
});

router.get('/loan-officer-portfolios/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const { rows: officerRows } = await db.query(
            `
            SELECT p.id, p.full_name, p.email, p.phone_number, p.created_at
            FROM profiles p
            JOIN user_roles ur ON p.id = ur.user_id
            WHERE ur.role = 'loan_officer' AND p.id = $1
            LIMIT 1
            `,
            [id]
        );

        if (officerRows.length === 0) {
            return res.status(404).json({ error: 'Loan officer not found' });
        }

        const phoneMatch = sqlBorrowerPhoneMatch('b', 'la');
        const { rows: borrowerRows } = await db.query(
            `
            WITH matched_loans AS (
                SELECT
                    b.id AS borrower_id,
                    la.id AS loan_id,
                    COALESCE(la.loan_amount, 0)::numeric AS principal,
                    COALESCE(pay.total_paid, 0)::numeric AS total_paid
                FROM borrowers b
                JOIN loan_applications la
                    ON la.status = ANY(${ACTIVE_LOAN_STATUSES})
                   AND (
                        la.borrower_id = b.id
                        OR (la.borrower_id IS NULL AND ${phoneMatch})
                   )
                LEFT JOIN (
                    SELECT loan_application_id, COALESCE(SUM(amount), 0)::numeric AS total_paid
                    FROM repayments
                    GROUP BY loan_application_id
                ) pay ON pay.loan_application_id = la.id
                WHERE b.assigned_officer_id = $1
            )
            SELECT
                b.id,
                COALESCE(NULLIF(TRIM(b.full_name), ''), 'Unnamed borrower') AS full_name,
                b.phone_number,
                b.email,
                COUNT(ml.loan_id)::int AS active_loan_count,
                COALESCE(SUM(ml.principal), 0)::numeric AS total_principal,
                COALESCE(SUM(GREATEST(0, (ml.principal * 1.30) - COALESCE(ml.total_paid, 0))), 0)::numeric AS total_remaining
            FROM borrowers b
            LEFT JOIN matched_loans ml ON ml.borrower_id = b.id
            WHERE b.assigned_officer_id = $1
            GROUP BY b.id, b.full_name, b.phone_number, b.email
            ORDER BY b.full_name ASC
            `,
            [id]
        );

        const { rows: loanRows } = await db.query(
            `
            SELECT
                la.id,
                COALESCE(NULLIF(TRIM(la.full_name), ''), 'Unnamed borrower') AS borrower_name,
                la.loan_product,
                la.status,
                la.loan_amount::numeric AS principal,
                COALESCE(pay.total_paid, 0)::numeric AS amount_paid,
                GREATEST(0, (la.loan_amount * 1.30) - COALESCE(pay.total_paid, 0))::numeric AS remaining_balance,
                la.created_at,
                la.approved_at
            FROM loan_applications la
            LEFT JOIN (
                SELECT loan_application_id, COALESCE(SUM(amount), 0)::numeric AS total_paid
                FROM repayments
                GROUP BY loan_application_id
            ) pay ON pay.loan_application_id = la.id
            WHERE ${sqlOfficerVisibleLoanApps('la', '$1')}
              AND la.status = ANY(${ACTIVE_LOAN_STATUSES})
            ORDER BY la.created_at DESC
            `,
            [id]
        );

        res.json({
            officer: officerRows[0],
            borrowers: borrowerRows,
            active_loans: loanRows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch officer portfolio details' });
    }
});

router.post('/', requireAdmin, async (req, res) => {
    const { email, password, full_name, role, phone_number } = req.body;
    if (!email || !password || !full_name || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const existing = await client.query('SELECT id FROM profiles WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'A user with this email already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const uuidRes = await client.query('SELECT gen_random_uuid() AS id');
        const userId = uuidRes.rows[0].id;
        try {
            await client.query(
                `INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, created_at, updated_at, email_confirmed_at) 
                 VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
                [userId, email, passwordHash, JSON.stringify({ full_name })]
            );
        } catch (authErr) {
            try {
                await client.query(
                    `INSERT INTO auth.users (id, email, password_hash, raw_user_meta_data, created_at) 
                     VALUES ($1, $2, $3, $4, NOW())`,
                    [userId, email, passwordHash, JSON.stringify({ full_name })]
                );
            } catch (authErr2) {
                console.warn('auth.users insert failed (both schemas):', authErr2.message);
            }
        }
        await client.query(
            'INSERT INTO profiles (id, full_name, email, phone_number, created_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (id) DO NOTHING',
            [userId, full_name, email, phone_number || null]
        );
        await client.query(
            'INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO UPDATE SET role = EXCLUDED.role',
            [userId, role]
        );
        await client.query('COMMIT');
        res.status(201).json({ id: userId, email, full_name, role, created_at: new Date().toISOString() });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    } finally {
        client.release();
    }
});

module.exports = router;
