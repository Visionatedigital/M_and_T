const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

router.use((req, res, next) => {
    const role = String(req.user?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
    if (role === 'loan_officer') {
        return res.status(403).json({ error: 'Asset management is restricted to admin users.' });
    }
    next();
});

// Get all assets
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM assets ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
});

// Create asset
router.post('/', async (req, res) => {
    const { name, category, serial_number, purchase_date, value, location, status } = req.body;
    try {
        const query = `
            INSERT INTO assets (name, category, serial_number, purchase_date, value, location, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [name, category, serial_number, purchase_date, value || 0, location, status || 'Active'];
        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create asset' });
    }
});

// Update asset
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, serial_number, purchase_date, value, location, status } = req.body;
    try {
        const query = `
            UPDATE assets 
            SET name=$1, category=$2, serial_number=$3, purchase_date=$4, value=$5, location=$6, status=$7, updated_at=now()
            WHERE id=$8
            RETURNING *
        `;
        const values = [name, category, serial_number, purchase_date, value, location, status, id];
        const { rows } = await db.query(query, values);
        if (rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update asset' });
    }
});

module.exports = router;
