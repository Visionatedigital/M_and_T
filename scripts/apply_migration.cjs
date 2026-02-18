const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
    console.log('=== APPLYING MIGRATION: add_amount_paid ===');

    const sql = fs.readFileSync('supabase/migrations/20260210163000_add_amount_paid.sql', 'utf8');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Migration failed:', error.message);
        console.log('Trying alternative approach...');

        // Try direct query
        const { error: altError } = await supabase.from('_migrations').insert({
            version: '20260210163000',
            name: 'add_amount_paid',
            statements: [sql]
        });

        if (altError) {
            console.error('Alternative approach failed:', altError.message);
        }
    } else {
        console.log('✓ Migration applied successfully');
    }
}

applyMigration().catch(console.error);
