const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { isAdmin, isLoanOfficer } = require('../lib/roles.cjs');

/** SQL fragment: collateral row is tied to a borrower served by this officer */
function officerCollateralClause(officerParamIndex) {
    return `(
        EXISTS (SELECT 1 FROM borrowers b WHERE b.id = c.borrower_id AND b.assigned_officer_id = $${officerParamIndex})
        OR EXISTS (
            SELECT 1 FROM loan_applications la
            JOIN borrowers b ON b.id = la.borrower_id
            WHERE la.id = c.loan_application_id AND b.assigned_officer_id = $${officerParamIndex}
        )
    )`;
}

async function assertCollateralRowAccess(req, row) {
    if (!row || isAdmin(req.user?.role)) return true;
    if (!isLoanOfficer(req.user?.role)) return false;
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) return false;
    const { rows } = await db.query(
        `
        SELECT 1
        FROM collateral c
        WHERE c.id = $1
          AND ${officerCollateralClause(2)}
        `,
        [row.id, userId]
    );
    return rows.length > 0;
}

async function assertCollateralMutationAccess(req, borrowerId, loanApplicationId) {
    if (isAdmin(req.user?.role)) return true;
    if (!isLoanOfficer(req.user?.role)) return false;
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) return false;
    let bid = borrowerId || null;
    if (!bid && loanApplicationId) {
        const r = await db.query('SELECT borrower_id FROM loan_applications WHERE id = $1', [loanApplicationId]);
        bid = r.rows[0]?.borrower_id || null;
    }
    if (!bid) return false;
    const r2 = await db.query(
        'SELECT 1 FROM borrowers WHERE id = $1 AND assigned_officer_id = $2',
        [bid, userId]
    );
    return r2.rows.length > 0;
}

router.get('/', async (req, res) => {
    try {
        const availableOnly = req.query.available === 'true';
        const userId = req.user?.user_id || req.user?.id;
        const restrictOfficer = isLoanOfficer(req.user?.role) && userId;

        const parts = [];
        const params = [];
        if (availableOnly) parts.push('c.loan_application_id IS NULL');
        if (restrictOfficer) {
            params.push(userId);
            parts.push(officerCollateralClause(params.length));
        }
        const baseFilter = parts.length ? `WHERE ${parts.join(' AND ')}` : '';

        let rows;
        try {
            const r = await db.query(
                `
                SELECT c.*,
                    COALESCE(b.full_name, la.full_name) as client_name
                FROM collateral c
                LEFT JOIN borrowers b ON c.borrower_id = b.id
                LEFT JOIN loan_applications la ON c.loan_application_id = la.id
                ${baseFilter}
                ORDER BY c.created_at DESC
                `,
                params
            );
            rows = r.rows;
        } catch (e) {
            const r = await db.query(
                `
                SELECT c.*, la.full_name as client_name
                FROM collateral c
                LEFT JOIN loan_applications la ON c.loan_application_id = la.id
                ${baseFilter}
                ORDER BY c.created_at DESC
                `,
                params
            );
            rows = r.rows;
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let row;
        try {
            const { rows } = await db.query(
                `
                SELECT c.*, COALESCE(b.full_name, la.full_name) as client_name
                FROM collateral c
                LEFT JOIN borrowers b ON c.borrower_id = b.id
                LEFT JOIN loan_applications la ON c.loan_application_id = la.id
                WHERE c.id = $1
                `,
                [id]
            );
            row = rows[0];
        } catch (e) {
            const { rows } = await db.query(
                'SELECT c.*, la.full_name as client_name FROM collateral c LEFT JOIN loan_applications la ON c.loan_application_id = la.id WHERE c.id = $1',
                [id]
            );
            row = rows[0];
        }
        if (!row) return res.status(404).json({ error: 'Collateral not found' });
        const ok = await assertCollateralRowAccess(req, row);
        if (!ok) return res.status(404).json({ error: 'Collateral not found' });
        res.json(row);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { borrower_id, loan_application_id, type, description, estimated_value, location, registration_number } = req.body;
        const allowed = await assertCollateralMutationAccess(req, borrower_id, loan_application_id);
        if (!allowed) {
            return res.status(403).json({ error: 'You can only register collateral for borrowers assigned to you.' });
        }
        try {
            const { rows } = await db.query(
                'INSERT INTO collateral (borrower_id, loan_application_id, type, description, estimated_value, location, registration_number, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                [borrower_id || null, loan_application_id, type, description, estimated_value, location, registration_number, 'active']
            );
            return res.json(rows[0]);
        } catch (e) {
            const { rows } = await db.query(
                'INSERT INTO collateral (loan_application_id, type, description, estimated_value, location, registration_number, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [loan_application_id, type, description, estimated_value, location, registration_number, 'active']
            );
            return res.json(rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const { rows: existingRows } = await db.query('SELECT * FROM collateral WHERE id = $1', [id]);
        const existing = existingRows[0];
        if (!existing) return res.status(404).json({ error: 'Collateral not found' });
        const ok = await assertCollateralRowAccess(req, existing);
        if (!ok) return res.status(404).json({ error: 'Collateral not found' });

        const allowed = ['borrower_id', 'loan_application_id', 'type', 'description', 'estimated_value',
            'current_value', 'status', 'location', 'registration_number', 'notes'];
        const updates = [];
        const values = [];
        let idx = 1;
        for (const key of allowed) {
            if (key in body) {
                updates.push(`${key} = $${idx}`);
                values.push(body[key] === '' ? null : body[key]);
                idx++;
            }
        }
        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
        const nextBorrower = 'borrower_id' in body ? body.borrower_id : existing.borrower_id;
        const nextApp = 'loan_application_id' in body ? body.loan_application_id : existing.loan_application_id;
        const stillOk = await assertCollateralMutationAccess(req, nextBorrower, nextApp);
        if (!stillOk) {
            return res.status(403).json({ error: 'You can only link collateral to borrowers assigned to you.' });
        }
        values.push(id);
        const { rows } = await db.query(
            `UPDATE collateral SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
            values
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Collateral not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
