const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

router.get('/', async (req, res) => {
    try {
        const availableOnly = req.query.available === 'true';
        const baseFilter = availableOnly ? 'WHERE c.loan_application_id IS NULL' : '';
        let rows;
        try {
            const r = await db.query(`
                SELECT c.*,
                    COALESCE(b.full_name, la.full_name) as client_name
                FROM collateral c
                LEFT JOIN borrowers b ON c.borrower_id = b.id
                LEFT JOIN loan_applications la ON c.loan_application_id = la.id
                ${baseFilter}
                ORDER BY c.created_at DESC
            `);
            rows = r.rows;
        } catch (e) {
            const r = await db.query(`
                SELECT c.*, la.full_name as client_name
                FROM collateral c
                LEFT JOIN loan_applications la ON c.loan_application_id = la.id
                ${baseFilter}
                ORDER BY c.created_at DESC
            `);
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
            const { rows } = await db.query(`
                SELECT c.*, COALESCE(b.full_name, la.full_name) as client_name
                FROM collateral c
                LEFT JOIN borrowers b ON c.borrower_id = b.id
                LEFT JOIN loan_applications la ON c.loan_application_id = la.id
                WHERE c.id = $1
            `, [id]);
            row = rows[0];
        } catch (e) {
            const { rows } = await db.query(
                'SELECT c.*, la.full_name as client_name FROM collateral c LEFT JOIN loan_applications la ON c.loan_application_id = la.id WHERE c.id = $1',
                [id]
            );
            row = rows[0];
        }
        if (!row) return res.status(404).json({ error: 'Collateral not found' });
        res.json(row);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { borrower_id, loan_application_id, type, description, estimated_value, location, registration_number } = req.body;
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
        const allowed = [
            'borrower_id', 'loan_application_id', 'type', 'description', 'estimated_value',
            'current_value', 'status', 'location', 'registration_number', 'notes'
        ];
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
