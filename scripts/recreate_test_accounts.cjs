const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function recreateTestAccounts() {
    console.log('=== RECREATING TEST ACCOUNTS ===');

    // 1. Admin account
    console.log('Creating admin account...');
    const { data: admin, error: adminErr } = await supabase.auth.admin.createUser({
        email: 'admin@mtgrowth.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: {
            full_name: 'System Administrator',
            role: 'admin'
        }
    });

    if (adminErr) {
        console.error('Admin creation error:', adminErr.message);
    } else {
        console.log('✓ Admin created:', admin.user.id);

        // Add admin role
        await supabase.from('user_roles').insert({
            user_id: admin.user.id,
            role: 'admin'
        });

        // Add admin profile
        await supabase.from('profiles').upsert({
            id: admin.user.id,
            full_name: 'System Administrator',
            phone_number: null
        });
    }

    // 2. Loan Officer account
    console.log('Creating loan officer account...');
    const { data: officer, error: officerErr } = await supabase.auth.admin.createUser({
        email: 'loanofficer@mandt.placeholder',
        password: 'Password123!',
        email_confirm: true,
        user_metadata: {
            full_name: 'Test Loan Officer',
            role: 'loan_officer'
        }
    });

    if (officerErr) {
        console.error('Loan officer creation error:', officerErr.message);
    } else {
        console.log('✓ Loan Officer created:', officer.user.id);

        // Add loan officer role
        await supabase.from('user_roles').insert({
            user_id: officer.user.id,
            role: 'loan_officer'
        });

        // Add loan officer profile
        await supabase.from('profiles').upsert({
            id: officer.user.id,
            full_name: 'Test Loan Officer',
            phone_number: null
        });
    }

    console.log('=== TEST ACCOUNTS READY ===');
}

recreateTestAccounts().catch(console.error);
