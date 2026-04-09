const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const bcrypt = require('bcryptjs');
const { requireAdmin, requireStaff } = require('../lib/roles.cjs');

/** List staff (admins + loan officers) — any staff; create accounts — admins only */
router.get('/', requireStaff, async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT p.id, p.email, p.full_name, p.first_name, p.last_name,
                   p.phone_number, p.created_at, ur.role
            FROM profiles p
            JOIN user_roles ur ON p.id = ur.user_id
            WHERE ur.role IN ('admin', 'loan_officer')
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.post('/', requireAdmin, async (req, res) => {
    const { email, password, full_name, role, phone_number } = req.body;
    if (!email || !password || !full_name || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const existing = await client.query('SELECT id FROM profiles WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'A user with this email already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const uuidRes = await client.query('SELECT gen_random_uuid() AS id');
        const userId = uuidRes.rows[0].id;
        try {
            await client.query(
                `INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, created_at, updated_at, email_confirmed_at) 
                 VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
                [userId, email, passwordHash, JSON.stringify({ full_name })]
            );
        } catch (authErr) {
            try {
                await client.query(
                    `INSERT INTO auth.users (id, email, password_hash, raw_user_meta_data, created_at) 
                     VALUES ($1, $2, $3, $4, NOW())`,
                    [userId, email, passwordHash, JSON.stringify({ full_name })]
                );
            } catch (authErr2) {
                console.warn('auth.users insert failed (both schemas):', authErr2.message);
            }
        }
        await client.query(
            'INSERT INTO profiles (id, full_name, email, phone_number, created_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (id) DO NOTHING',
            [userId, full_name, email, phone_number || null]
        );
        await client.query(
            'INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO UPDATE SET role = EXCLUDED.role',
            [userId, role]
        );
        await client.query('COMMIT');
        res.status(201).json({ id: userId, email, full_name, role, created_at: new Date().toISOString() });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    } finally {
        client.release();
    }
});

module.exports = router;
