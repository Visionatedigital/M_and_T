const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all loan products
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM loan_products ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Update a loan product
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, code, min_amount, max_amount, base_interest_rate, status } = req.body;

    try {
        const { rows } = await db.query(
            `UPDATE loan_products 
             SET name = $1, code = $2, min_amount = $3, max_amount = $4, base_interest_rate = $5, status = $6
             WHERE id = $7
             RETURNING *`,
            [name, code, min_amount, max_amount, base_interest_rate, status, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

module.exports = router;
