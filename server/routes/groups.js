const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all groups
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM groups ORDER BY group_name');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

module.exports = router;
