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

// Create a new territory
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Territory name is required' });
    }
    try {
        const { rows } = await db.query(
            `INSERT INTO territories (name, description, created_at, updated_at)
             VALUES ($1, $2, NOW(), NOW())
             RETURNING *`,
            [name, description || null]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'A territory with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create territory' });
    }
});

// Delete a territory
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await db.query('DELETE FROM territories WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Territory not found' });
        res.json({ message: 'Territory deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete territory' });
    }
});

module.exports = router;
