const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
require('dotenv').config();

// Supabase config (using root .env values)
// Note: We need service role key to bypass RLS and fetch all data
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Local Postgres config
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Migrate Groups
        console.log('Migrating groups...');
        const { data: groups, error: gErr } = await supabase.from('groups').select('*');
        if (gErr) throw gErr;
        for (const g of groups) {
            await pool.query(
                'INSERT INTO groups (id, group_name, description, created_at, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET group_name = EXCLUDED.group_name',
                [g.id, g.group_name, g.description, g.created_at, g.status]
            );
        }
        console.log(`Migrated ${groups.length} groups.`);

        // 2. Migrate Profiles
        console.log('Migrating profiles...');
        const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
        if (pErr) throw pErr;
        for (const p of profiles) {
            // Check if user exists in auth.users first to avoid FK error
            const userCheck = await pool.query('SELECT 1 FROM auth.users WHERE id = $1', [p.id]);
            if (userCheck.rows.length === 0) {
                // Insert a dummy auth user if they don't exist to maintain data integrity for clients
                await pool.query(
                    'INSERT INTO auth.users (id, email, password_hash, raw_user_meta_data, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                    [p.id, `${p.id}@mandt.placeholder`, '$2a$10$dummyhash', JSON.stringify({ full_name: p.full_name }), p.created_at]
                );
            }
            await pool.query(
                'INSERT INTO profiles (id, full_name, phone_number, created_at, updated_at, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
                [p.id, p.full_name, p.phone_number, p.created_at, p.updated_at, p.first_name, p.last_name]
            );
        }
        console.log(`Migrated ${profiles.length} profiles.`);

        // 3. Migrate Loan Applications
        console.log('Migrating applications...');
        const { data: apps, error: aErr } = await supabase.from('loan_applications').select('*');
        if (aErr) throw aErr;
        for (const a of apps) {
            await pool.query(
                `INSERT INTO loan_applications (
                    id, user_id, full_name, email, phone_number, id_number, date_of_birth, 
                    address, loan_product, loan_amount, loan_duration_months, loan_purpose, 
                    employment_status, employer_name, monthly_income, status, created_at, 
                    updated_at, group_id, group_name, amount_paid, group_members
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                ON CONFLICT (id) DO NOTHING`,
                [
                    a.id, a.user_id, a.full_name, a.email, a.phone_number, a.id_number, a.date_of_birth,
                    a.address, a.loan_product, a.loan_amount, a.loan_duration_months, a.loan_purpose,
                    a.employment_status, a.employer_name, a.monthly_income, a.status, a.created_at,
                    a.updated_at, a.group_id, a.group_name, a.amount_paid || 0, JSON.stringify(a.group_members || [])
                ]
            );
        }
        console.log(`Migrated ${apps.length} applications.`);

        // 4. Migrate Repayments
        console.log('Migrating repayments...');
        const { data: reps, error: rErr } = await supabase.from('repayments').select('*');
        if (rErr) throw rErr;
        for (const r of reps) {
            await pool.query(
                'INSERT INTO repayments (id, loan_application_id, amount, payment_date, recorded_by, notes, created_at, updated_at, status, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING',
                [r.id, r.loan_application_id, r.amount, r.payment_date, r.recorded_by, r.notes, r.created_at, r.updated_at, r.status, r.payment_method]
            );
        }
        console.log(`Migrated ${reps.length} repayments.`);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
