const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// Get all users (Staff & Admins)
// Queries profiles + user_roles — avoids auth schema permission issues
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT 
                p.id,
                p.email,
                p.full_name, 
                p.first_name, 
                p.last_name, 
                p.phone_number,
                p.created_at,
                ur.role
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

// Create a new staff member
router.post('/', async (req, res) => {
    const { email, password, full_name, role, phone_number } = req.body;

    if (!email || !password || !full_name || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Check if user already exists in profiles
        const existingCheck = await client.query('SELECT id FROM profiles WHERE email = $1', [email]);
        if (existingCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'A user with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        let userId;

        // Try to insert into auth.users first (works on Supabase)
        try {
            const userRes = await client.query(`
                INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
                VALUES ($1, $2, $3, NOW(), NOW(), NOW())
                RETURNING id
            `, [email, passwordHash, JSON.stringify({ full_name })]);
            userId = userRes.rows[0].id;
        } catch (authErr) {
            // auth.users not accessible — generate a UUID
            console.warn('auth.users insert failed, using gen_random_uuid():', authErr.message);
            const uuidRes = await client.query('SELECT gen_random_uuid() AS id');
            userId = uuidRes.rows[0].id;
        }

        // Insert into profiles
        await client.query(`
            INSERT INTO profiles (id, full_name, email, phone_number, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (id) DO NOTHING
        `, [userId, full_name, email, phone_number || null]);

        // Insert into user_roles
        await client.query(`
            INSERT INTO user_roles (user_id, role)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role
        `, [userId, role]);

        await client.query('COMMIT');

        res.status(201).json({
            id: userId,
            email,
            full_name,
            role,
            created_at: new Date().toISOString()
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    } finally {
        client.release();
    }
});

module.exports = router;
