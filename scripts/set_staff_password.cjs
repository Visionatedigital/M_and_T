/**
 * Set password for an existing auth.users row (bcrypt hash, same as API login).
 * Usage (from project root):
 *   node scripts/set_staff_password.cjs <email> <new-password>
 * Example:
 *   node scripts/set_staff_password.cjs loanofficer@mandt.placeholder "Password123!"
 *
 * Requires DATABASE_URL in .env (pooler URI is fine).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
    console.error('Usage: node scripts/set_staff_password.cjs <email> <new-password>');
    process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

async function main() {
    const client = new Client({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    await client.connect();

    const found = await client.query('SELECT id, email FROM auth.users WHERE email = $1', [email]);
    if (found.rows.length === 0) {
        const sample = await client.query('SELECT email FROM auth.users LIMIT 15');
        console.error(`No user with email: ${email}`);
        console.error('Sample emails:', sample.rows.map((r) => r.email));
        await client.end();
        process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await client.query('UPDATE auth.users SET encrypted_password = $1 WHERE email = $2', [hash, email]);
    console.log(`Password updated for ${email}`);
    await client.end();
}

main().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
