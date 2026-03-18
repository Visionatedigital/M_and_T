const { Client } = require('pg');
require('dotenv').config({ path: './server/.env' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function migrateUsers() {
    console.log("Connecting to LOCAL Postgres database...");
    const localDb = new Client({
        connectionString: 'postgres://postgres:Sundaylover12@localhost:5432/MandT'
    });

    console.log("Connecting to SUPABASE Postgres database...");
    const supabaseDb = new Client({
        connectionString: 'postgresql://postgres.xdhdcoepxqnyoahzaoie:S7G0JE9zHzJ4XyaT@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await localDb.connect();
        await supabaseDb.connect();

        console.log("Fetching all users from local auth.users...");
        const res = await localDb.query('SELECT id, email, created_at, raw_user_meta_data, password_hash FROM auth.users');
        const users = res.rows;

        console.log(`Found ${users.length} users. Transferring to Supabase...`);

        let success = 0;
        let errors = 0;
        let current = 0;

        for (const user of users) {
            current++;
            if (current % 50 === 0) console.log(`Processed ${current}/${users.length}...`);

            try {
                // Notice we put their custom password_hash into encrypted_password so they can login.
                await supabaseDb.query(`
                    INSERT INTO auth.users 
                    (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
                    VALUES 
                    ($1::uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, $3, NOW(), $4, $5, NOW())
                    ON CONFLICT (id) DO NOTHING;
                `, [
                    user.id,
                    user.email,
                    user.password_hash || '$2a$10$dummyhash',
                    user.raw_user_meta_data,
                    user.created_at
                ]);

                // create identity so they can login
                await supabaseDb.query(`
                    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
                    VALUES ($1::uuid, $1::uuid, $2, 'email', $1::text, NOW(), NOW())
                    ON CONFLICT (provider, provider_id) DO NOTHING;
                `, [user.id, JSON.stringify({ sub: user.id, email: user.email })]);

                success++;
            } catch (err) {
                console.error(`Failed to insert user ${user.email}:`, err.message);
                errors++;
            }
        }

        console.log(`\nMigration complete! Successfully migrated ${success} users. (${errors} failed/skipped)`);

    } catch (err) {
        console.error("\nMigration failed due to a critical error:", err);
    } finally {
        await localDb.end();
        await supabaseDb.end();
    }
}

migrateUsers();
