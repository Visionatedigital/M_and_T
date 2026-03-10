process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xdhdcoepxqnyoahzaoie:S7G0JE9zHzJ4XyaT@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full';
const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

async function fixLogin() {
    console.log("Connecting to database...");
    try {
        await client.connect();

        const email = 'admin@mandt.placeholder';
        const newPassword = 'admin123';

        console.log(`Checking if user ${email} exists...`);
        const userRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);

        if (userRes.rows.length === 0) {
            console.log(`User ${email} NOT FOUND.`);
            const allUsers = await client.query('SELECT email FROM auth.users LIMIT 10');
            console.log("Current users in database:", allUsers.rows.map(r => r.email));
            return;
        }

        console.log(`Generating hash for password: ${newPassword}`);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // Supabase uses encrypted_password; some setups use password_hash
        try {
            await client.query('UPDATE auth.users SET encrypted_password = $1 WHERE email = $2', [hash, email]);
        } catch (colErr) {
            if (colErr.message && colErr.message.includes('encrypted_password')) {
                await client.query('UPDATE auth.users SET password_hash = $1 WHERE email = $2', [hash, email]);
            } else {
                throw colErr;
            }
        }

        console.log("\n=== SUCCESS! Password reset confirmed ===");
        console.log(`Email:    ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log("\nYou can now log in with these credentials.\n");

    } catch (err) {
        console.error("DATABASE ERROR:", err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

fixLogin();
