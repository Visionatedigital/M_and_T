const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all notifications for the logged-in user
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.user.user_id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark a notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.user_id]
        );
        res.json({ message: 'Marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// Mark ALL as read
router.patch('/read-all', async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET read = true WHERE user_id = $1',
            [req.user.user_id]
        );
        res.json({ message: 'All marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});

module.exports = router;
