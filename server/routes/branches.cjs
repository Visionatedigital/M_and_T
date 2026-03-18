const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM branches ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    const { name, code, address, phone, email, status, territory_id } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Branch name and code are required' });
    try {
        const { rows } = await db.query(
            `INSERT INTO branches (name, code, address, phone, email, status, territory_id, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING *`,
            [name, code, address || null, phone || null, email || null, status || 'active', territory_id || null]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') return res.status(409).json({ error: 'A branch with this code already exists' });
        res.status(500).json({ error: 'Failed to create branch' });
    }
});

router.put('/:id', async (req, res) => {
    const { name, code, address, phone, email, status, territory_id } = req.body;
    try {
        const { rows } = await db.query(
            `UPDATE branches SET name=COALESCE($1,name), code=COALESCE($2,code), address=COALESCE($3,address),
             phone=$4, email=$5, status=COALESCE($6,status), territory_id=$7, updated_at=NOW()
             WHERE id=$8 RETURNING *`,
            [name, code, address, phone || null, email || null, status, territory_id || null, req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Branch not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update branch' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await db.query('DELETE FROM branches WHERE id=$1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Branch not found' });
        res.json({ message: 'Branch deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete branch' });
    }
});

module.exports = router;
