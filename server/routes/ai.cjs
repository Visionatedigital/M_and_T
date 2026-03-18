const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

router.get('/conversations', async (req, res) => {
    try {
        const userId = req.user?.user_id || req.user?.id;
        if (!userId) return res.json([]);
        const { rows } = await db.query(
            'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/conversations', async (req, res) => {
    try {
        const userId = req.user?.user_id || req.user?.id;
        const { title } = req.body;
        const { rows } = await db.query(
            'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
            [userId, title]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM conversations WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query(
            'SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
            [id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, content } = req.body;
        const { rows } = await db.query(
            'INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [id, role, content]
        );
        await db.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const lastMessage = messages[messages.length - 1].content.toLowerCase();

        let response = "I am your M&T Growth Gateway AI assistant. I can help you with loan statistics, client information, and general microfinance inquiries.";

        if (lastMessage.includes('loan') || lastMessage.includes('stats')) {
            response = "Currently, we have several loan applications in the system. The majority are Personal Loans. Our average interest rate is 20%. Would you like to see a more detailed report?";
        } else if (lastMessage.includes('hi') || lastMessage.includes('hello')) {
            response = "Hello! I'm here to help you manage M&T operations. What information do you need?";
        }

        setTimeout(() => {
            res.json({ response });
        }, 500);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
