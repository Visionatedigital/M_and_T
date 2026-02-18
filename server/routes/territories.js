const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all territories
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM territories ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch territories' });
    }
});

module.exports = router;
