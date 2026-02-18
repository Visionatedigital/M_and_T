const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// Get all users (Staff & Admins)
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT 
                u.id, 
                u.email, 
                u.created_at,
                p.full_name, 
                p.first_name, 
                p.last_name, 
                p.phone_number,
                ur.role
            FROM auth.users u
            JOIN profiles p ON u.id = p.id
            JOIN user_roles ur ON u.id = ur.user_id
            WHERE ur.role IN ('admin', 'loan_officer')
            ORDER BY u.created_at DESC
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

        // Check if user exists
        const userCheck = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert into auth.users
        const userRes = await client.query(`
            INSERT INTO auth.users (email, password_hash, raw_user_meta_data)
            VALUES ($1, $2, $3)
            RETURNING id, created_at
        `, [email, passwordHash, JSON.stringify({ full_name })]);

        const userId = userRes.rows[0].id;

        // Insert into profiles
        await client.query(`
            INSERT INTO profiles (id, full_name, email, phone_number)
            VALUES ($1, $2, $3, $4)
        `, [userId, full_name, email, phone_number]);

        // Insert into user_roles
        await client.query(`
            INSERT INTO user_roles (user_id, role)
            VALUES ($1, $2)
        `, [userId, role]);

        await client.query('COMMIT');

        res.status(201).json({
            id: userId,
            email,
            full_name,
            role,
            created_at: userRes.rows[0].created_at
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
