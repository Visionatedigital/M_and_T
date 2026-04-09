/**
 * Create staff user via Postgres (same as POST /api/users) — works with DATABASE_URL only.
 *
 * Usage:
 *   node scripts/create_staff_user_pg.cjs <email> <full_name> [loan_officer|admin] [password]
 *
 * If password is omitted, set STAFF_PASSWORD or a random one is generated and printed.
 */
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const email = process.argv[2];
const fullName = process.argv[3];
const role = (process.argv[4] || 'loan_officer').toLowerCase().trim();
let password = process.argv[5] || process.env.STAFF_PASSWORD;

if (!email || !fullName) {
    console.error('Usage: node scripts/create_staff_user_pg.cjs <email> <full_name> [loan_officer|admin] [password]');
    process.exit(1);
}

if (!['loan_officer', 'admin'].includes(role)) {
    console.error('role must be loan_officer or admin');
    process.exit(1);
}

if (!password || String(password).length < 8) {
    password = crypto.randomBytes(16).toString('base64url') + 'aA1!';
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

async function main() {
    const client = new Client({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    await client.connect();

    const existing = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let userId;

    if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        await client.query('UPDATE auth.users SET encrypted_password = $1, updated_at = NOW() WHERE id = $2', [
            passwordHash,
            userId,
        ]);
        console.log(`Updated password for existing user: ${userId}`);
    } else {
        const uuidRes = await client.query('SELECT gen_random_uuid() AS id');
        userId = uuidRes.rows[0].id;
        try {
            await client.query(
                `INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
                 VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
                [userId, email, passwordHash, JSON.stringify({ full_name: fullName })]
            );
        } catch (authErr) {
            try {
                await client.query(
                    `INSERT INTO auth.users (id, email, password_hash, raw_user_meta_data, created_at)
                     VALUES ($1, $2, $3, $4, NOW())`,
                    [userId, email, passwordHash, JSON.stringify({ full_name: fullName })]
                );
            } catch (authErr2) {
                console.error('auth.users insert failed:', authErr.message, authErr2.message);
                await client.end();
                process.exit(1);
            }
        }
        console.log(`Created auth user: ${userId}`);
    }

    await client.query(
        `INSERT INTO profiles (id, full_name, email, phone_number, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email`,
        [userId, fullName, email, null]
    );

    await client.query(
        `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)
         ON CONFLICT (user_id, role) DO UPDATE SET role = EXCLUDED.role`,
        [userId, role]
    );

    console.log(`Ensured role: ${role}`);

    console.log('\n--- Staff login (Staff portal) ---');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name:     ${fullName}`);
    console.log(`Role:     ${role}`);
    if (!process.argv[5] && !process.env.STAFF_PASSWORD) {
        console.log('\n(Password was auto-generated; save it now.)');
    }

    await client.end();
}

main().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
