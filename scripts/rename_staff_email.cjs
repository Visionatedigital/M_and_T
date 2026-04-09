/**
 * Change staff login email (auth.users + profiles).
 *
 * Usage:
 *   node scripts/rename_staff_email.cjs <old-email> <new-email>
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');

const oldEmail = process.argv[2];
const newEmail = process.argv[3];

if (!oldEmail || !newEmail) {
    console.error('Usage: node scripts/rename_staff_email.cjs <old-email> <new-email>');
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
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    await client.connect();

    const u = await client.query('SELECT id FROM auth.users WHERE email = $1', [oldEmail]);
    if (u.rows.length === 0) {
        console.error(`No user found with email: ${oldEmail}`);
        await client.end();
        process.exit(1);
    }
    const id = u.rows[0].id;

    const taken = await client.query('SELECT id FROM auth.users WHERE email = $1 AND id <> $2', [newEmail, id]);
    if (taken.rows.length > 0) {
        console.error(`Email already in use: ${newEmail}`);
        await client.end();
        process.exit(1);
    }

    await client.query('UPDATE auth.users SET email = $1, updated_at = NOW() WHERE id = $2', [newEmail, id]);
    await client.query('UPDATE profiles SET email = $1 WHERE id = $2', [newEmail, id]);

    console.log(`Updated email for ${id}`);
    console.log(`  ${oldEmail}  →  ${newEmail}`);

    await client.end();
}

main().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
