const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { requireAdmin } = require('../lib/roles.cjs');
const { buildAssistantSnapshot } = require('../services/assistantSnapshot.cjs');
const { buildStaffSystemPrompt } = require('../services/staffAssistantPrompt.cjs');
const { staffAssistantChat } = require('../services/aiService.cjs');

/** AI assistant and DB-backed tools — administrators only */
router.use(requireAdmin);

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
        if (typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }
        const safeRole = role === 'assistant' || role === 'user' ? role : 'user';
        const { rows } = await db.query(
            'INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [id, safeRole, content.trim()]
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
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages[] required' });
        }

        const snapshot = await buildAssistantSnapshot(req);
        const systemContent = buildStaffSystemPrompt(snapshot);
        let response = await staffAssistantChat(messages, systemContent, snapshot);
        if (typeof response !== 'string') response = String(response ?? '');
        if (!response.trim()) {
            response =
                'The model returned an empty reply. Check OPENAI_API_KEY, credits, and server logs. Your portfolio snapshot was built successfully — please try again.';
        }
        res.json({ response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
