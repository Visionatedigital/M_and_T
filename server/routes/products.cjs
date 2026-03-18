const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM loan_products ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, code, description, min_amount, max_amount, base_interest_rate } = req.body;
        const { rows } = await db.query(
            'INSERT INTO loan_products (name, code, description, min_amount, max_amount, base_interest_rate, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, code, description, min_amount, max_amount, base_interest_rate, 'active']
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
