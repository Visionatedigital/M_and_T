const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { isAdmin, isLoanOfficer } = require('../lib/roles.cjs');

router.get('/', async (req, res) => {
    try {
        const userId = req.user?.user_id || req.user?.id;

        if (isAdmin(req.user?.role)) {
            const { rows } = await db.query(
                'SELECT id, full_name, email, phone_number, id_number, address, created_at FROM guarantors ORDER BY full_name'
            );
            return res.json(rows);
        }

        if (!isLoanOfficer(req.user?.role) || !userId) {
            return res.status(403).json({ error: 'Administrator or loan officer access required.' });
        }

        const { rows } = await db.query(
            `
            SELECT DISTINCT g.id, g.full_name, g.email, g.phone_number, g.id_number, g.address, g.created_at
            FROM guarantors g
            WHERE EXISTS (
                SELECT 1
                FROM loan_applications la
                JOIN borrowers b ON b.id = la.borrower_id
                WHERE b.assigned_officer_id = $1
                  AND la.guarantors IS NOT NULL
                  AND la.guarantors::text != ''
                  AND la.guarantors::text ILIKE '%' || g.id::text || '%'
            )
            ORDER BY g.full_name
            `,
            [userId]
        );
        return res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        if (!isAdmin(req.user?.role) && !isLoanOfficer(req.user?.role)) {
            return res.status(403).json({ error: 'Staff access required.' });
        }
        const { full_name, email, phone_number, id_number, address } = req.body;
        const { rows } = await db.query(
            `INSERT INTO guarantors (full_name, email, phone_number, id_number, address)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [full_name || '', email || '', phone_number || '', id_number || '', address || '']
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create guarantor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (!isAdmin(req.user?.role) && !isLoanOfficer(req.user?.role)) {
            return res.status(403).json({ error: 'Staff access required.' });
        }
        const userId = req.user?.user_id || req.user?.id;
        const { id } = req.params;
        if (isLoanOfficer(req.user?.role) && userId) {
            const { rows } = await db.query(
                `
                SELECT 1 FROM guarantors g WHERE g.id = $1::uuid AND EXISTS (
                    SELECT 1 FROM loan_applications la
                    JOIN borrowers b ON b.id = la.borrower_id
                    WHERE b.assigned_officer_id = $2
                      AND la.guarantors IS NOT NULL
                      AND la.guarantors::text ILIKE '%' || g.id::text || '%'
                )
                `,
                [id, userId]
            );
            if (rows.length === 0) {
                return res.status(403).json({ error: 'Guarantor is not linked to your portfolio.' });
            }
        }
        const { full_name, email, phone_number, id_number, address } = req.body;
        const { rows } = await db.query(
            `UPDATE guarantors SET
                full_name = COALESCE($1, full_name),
                email = COALESCE($2, email),
                phone_number = COALESCE($3, phone_number),
                id_number = COALESCE($4, id_number),
                address = COALESCE($5, address),
                updated_at = NOW()
             WHERE id = $6
             RETURNING *`,
            [full_name, email, phone_number, id_number, address, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Guarantor not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update guarantor' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!isAdmin(req.user?.role) && !isLoanOfficer(req.user?.role)) {
            return res.status(403).json({ error: 'Staff access required.' });
        }
        const userId = req.user?.user_id || req.user?.id;
        const { id } = req.params;
        if (isLoanOfficer(req.user?.role) && userId) {
            const { rows } = await db.query(
                `
                SELECT 1 FROM guarantors g WHERE g.id = $1::uuid AND EXISTS (
                    SELECT 1 FROM loan_applications la
                    JOIN borrowers b ON b.id = la.borrower_id
                    WHERE b.assigned_officer_id = $2
                      AND la.guarantors IS NOT NULL
                      AND la.guarantors::text ILIKE '%' || g.id::text || '%'
                )
                `,
                [id, userId]
            );
            if (rows.length === 0) {
                return res.status(403).json({ error: 'Guarantor is not linked to your portfolio.' });
            }
        }
        const { rowCount } = await db.query('DELETE FROM guarantors WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Guarantor not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete guarantor' });
    }
});

module.exports = router;
