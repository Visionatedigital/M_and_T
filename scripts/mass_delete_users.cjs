const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanUp() {
    console.log('--- STARTING DEEP CLEANUP ---');

    // 1. Delete all records from functional tables
    console.log('Clearing functional tables...');
    await supabase.from('repayments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('loan_applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Fetch all users from Auth
    console.log('Listing auth.users...');
    let allUsers = [];
    let page = 1;
    while (true) {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) {
            console.error('Error listing users:', error.message);
            break;
        }
        if (!users || users.length === 0) break;
        allUsers = allUsers.concat(users);
        if (users.length < 1000) break;
        page++;
    }

    console.log(`Found ${allUsers.length} total users.`);

    // 3. Delete non-admin users
    let deletedCount = 0;
    for (const user of allUsers) {
        const email = user.email ? user.email.toLowerCase() : '';
        const isExcluded = email.includes('admin') || email === 'test@bangbet.com' || (user.user_metadata && user.user_metadata.role === 'admin');

        if (!isExcluded) {
            console.log(`Deleting user: ${email || user.phone || user.id}`);
            const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
            if (delErr) {
                console.error(`Failed to delete ${user.id}:`, delErr.message);
            } else {
                deletedCount++;
            }
        } else {
            console.log(`Keeping admin user: ${email}`);
        }
    }

    console.log(`--- CLEANUP COMPLETE: Deleted ${deletedCount} users ---`);
}

cleanUp().catch(console.error);
