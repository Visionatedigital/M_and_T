const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });

async function resetPassword() {
    console.log("Connecting to Supabase to reset password hash...");
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const email = 'loanofficer@mandt.place'; // Replace with user's actual email
        const newPassword = 'password123'; // Replace with desired password

        console.log(`Generating hash for ${email}...`);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // Ensure the password_hash column exists
        console.log("Ensuring password_hash column exists on auth.users...");
        await client.query(`
            ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
        `);

        console.log(`Updating password_hash for ${email}...`);
        const result = await client.query(
            'UPDATE auth.users SET password_hash = $1 WHERE email = $2 RETURNING id',
            [hash, email]
        );

        if (result.rowCount === 0) {
            console.log(`ERROR: User ${email} not found in the database!`);
        } else {
            console.log("SUCCESS! Password reset.");
            console.log(`You can now login with Email: ${email} | Password: ${newPassword}`);
        }

    } catch (err) {
        console.error("Error formatting database:", err);
    } finally {
        await client.end();
    }
}

resetPassword();
