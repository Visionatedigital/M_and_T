const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

router.get('/', async (req, res) => {
    try {
        const userId = req.user?.user_id;
        if (!userId) return res.json([]);
        
        let rows = [];
        try {
            const result = await db.query(
                'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
                [userId]
            );
            rows = result.rows;
        } catch (tableErr) {
            console.warn('Notifications table not available:', tableErr.message);
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

router.patch('/:id/read', async (req, res) => {
    try {
        const { rows } = await db.query(
            'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
            [req.params.id]
        );
        res.json(rows[0] || {});
    } catch (err) {
        res.json({}); 
    }
});

router.patch('/read-all', async (req, res) => {
    try {
        const userId = req.user?.user_id;
        if (userId) {
            await db.query('UPDATE notifications SET read = true WHERE user_id = $1', [userId]);
        }
        res.json({ success: true });
    } catch (err) {
        res.json({ success: true });
    }
});

module.exports = router;
