const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT id, full_name, email, phone_number, id_number, address, created_at FROM guarantors ORDER BY full_name'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
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
        const { id } = req.params;
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
        const { id } = req.params;
        const { rowCount } = await db.query('DELETE FROM guarantors WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Guarantor not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete guarantor' });
    }
});

module.exports = router;
