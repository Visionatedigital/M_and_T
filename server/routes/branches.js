const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all branches
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM branches ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
});

module.exports = router;
