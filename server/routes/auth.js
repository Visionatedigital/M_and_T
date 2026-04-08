const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM auth.users WHERE email = $1', [email]);

        console.log(`[LOGIN ATTEMPT] Email: ${email}`);
        console.log(`[LOGIN ATTEMPT] DB row count: ${rows.length}`);

        const dbHost = (db.pool && db.pool.options) ? db.pool.options.host : 'unknown';

        if (rows.length === 0) {
            console.log(`[LOGIN FAILED] Reason: User not found in auth.users by email.`);
            return res.status(401).json({ error: `Email not found: ${email} (DB: ${dbHost})` });
        }

        const user = rows[0];

        if (!user.encrypted_password) {
            console.log(`[LOGIN FAILED] Reason: encrypted_password column is null or empty.`);
            return res.status(401).json({ error: 'Auth settings incomplete (DB: ' + dbHost + ')' });
        }

        const isMatch = await bcrypt.compare(password, user.encrypted_password);
        console.log(`[LOGIN ATTEMPT] Bcrypt match result: ${isMatch}`);

        if (!isMatch) {
            console.log(`[LOGIN FAILED] Reason: Password hash mismatch.`);
            return res.status(401).json({ error: `Invalid password for ${email} (DB: ${dbHost})` });
        }

        // Fetch user role
        const { rows: roleRows } = await db.query('SELECT role FROM user_roles WHERE user_id = $1', [user.id]);
        const role = roleRows.length > 0 ? roleRows[0].role : 'client';

        // Fetch profile for full_name
        const { rows: profileRows } = await db.query('SELECT full_name, first_name FROM profiles WHERE id = $1', [user.id]);
        const fullName = profileRows.length > 0 ? profileRows[0].full_name : '';
        const firstName = profileRows.length > 0 ? profileRows[0].first_name : '';

        // Added user_id to payload for compatibility with middleware/routes
        const token = jwt.sign(
            { id: user.id, user_id: user.id, email: user.email, role, full_name: fullName },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role,
                full_name: fullName,
                first_name: firstName,
                metadata: user.raw_user_meta_data
            }
        });
    } catch (err) {
        console.error('[LOGIN]', err.code || 'ERR', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user (Verify Token)
router.get('/me', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { rows } = await db.query('SELECT * FROM auth.users WHERE id = $1', [decoded.id]);

        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        // Fetch role
        const { rows: roleRows } = await db.query('SELECT role FROM user_roles WHERE user_id = $1', [decoded.id]);
        const role = roleRows.length > 0 ? roleRows[0].role : 'client';

        // Fetch profile
        const { rows: profileRows } = await db.query('SELECT full_name, first_name, last_name FROM profiles WHERE id = $1', [decoded.id]);
        const fullName = profileRows.length > 0 ? profileRows[0].full_name : '';
        const firstName = profileRows.length > 0 ? profileRows[0].first_name : '';

        res.json({
            id: rows[0].id,
            email: rows[0].email,
            role,
            full_name: fullName,
            first_name: firstName,
            metadata: rows[0].raw_user_meta_data
        });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
