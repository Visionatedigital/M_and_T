process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function verify() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ ERROR: DATABASE_URL not found in .env');
        return;
    }
    console.log(`Connecting to: ${dbUrl.split('@')[1]}`);
    
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const email = 'admin@mandt.placeholder';
        const password123 = 'admin123';
        
        console.log(`Searching for user: ${email}`);
        const { rows } = await client.query('SELECT id, email, encrypted_password FROM auth.users WHERE email = $1', [email]);
        
        if (rows.length === 0) {
            console.error('❌ ERROR: User not found in database!');
            const all = await client.query('SELECT email FROM auth.users LIMIT 10');
            console.log('Available users:', all.rows.map(r => r.email));
            return;
        }

        const user = rows[0];
        console.log('✅ User found. encrypted_password length:', user.encrypted_password ? user.encrypted_password.length : 'NULL');
        
        const isMatch123 = await bcrypt.compare('admin123', user.encrypted_password);
        if (isMatch123) {
            console.log('✅ SUCCESS: Password "admin123" matches!');
        } else {
            console.error('❌ ERROR: Password "admin123" does NOT match.');
            const isMatchOld = await bcrypt.compare('password123', user.encrypted_password);
            if (isMatchOld) {
                console.log('⚠️ NOTE: Found a match with "password123"!');
            }
        }

        const { rows: roleRows } = await client.query('SELECT role FROM user_roles WHERE user_id = $1', [user.id]);
        console.log(`User role: ${roleRows.length > 0 ? roleRows[0].role : 'NONE'}`);

    } catch (err) {
        console.error('DATABASE ERROR:', err.message);
    } finally {
        await client.end();
    }
}

verify();
