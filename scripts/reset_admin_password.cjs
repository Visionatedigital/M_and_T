process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });

async function resetPassword() {
    console.log("Connecting to Supabase to reset password hash...");
    const client = new Client({
        connectionString: 'postgresql://postgres.xdhdcoepxqnyoahzaoie:S7G0JE9zHzJ4XyaT@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();

        const email = 'admin@mandt.placeholder';
        const newPassword = 'password123';

        console.log(`Generating Supabase-compatible hash for ${email}...`);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        console.log(`Updating encrypted_password for ${email}...`);
        const result = await client.query(
            'UPDATE auth.users SET encrypted_password = $1 WHERE email = $2 RETURNING id',
            [hash, email]
        );

        if (result.rowCount === 0) {
            console.log(`ERROR: User ${email} not found in the database! Check your emails in auth.users.`);

            const users = await client.query('SELECT email FROM auth.users LIMIT 5');
            console.log("Available emails in auth.users:", users.rows.map(r => r.email));
        } else {
            console.log("SUCCESS! Password reset in Supabase.");
            console.log(`You can now login with Email: ${email} | Password: ${newPassword}`);
        }

    } catch (err) {
        console.error("Error formatting database:", err);
    } finally {
        await client.end();
    }
}

resetPassword();
