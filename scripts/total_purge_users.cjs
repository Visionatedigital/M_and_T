const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function purgeUsers() {
    console.log('--- STARTING TOTAL PURGE ---');
    let totalDeleted = 0;

    while (true) {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        if (error) {
            console.error('Error listing users:', error.message);
            break;
        }

        const toDelete = users.filter(user => {
            const email = user.email ? user.email.toLowerCase() : '';
            const isExcluded = email.includes('admin') || email === 'test@bangbet.com';
            return !isExcluded;
        });

        if (toDelete.length === 0) {
            console.log('No more users to delete.');
            break;
        }

        console.log(`Dealing with batch of ${toDelete.length} users...`);
        for (const user of toDelete) {
            const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
            if (delErr) {
                console.error(`Failed to delete ${user.id}: ${delErr.message}`);
            } else {
                totalDeleted++;
            }
        }

        console.log(`Deleted ${totalDeleted} so far...`);
        // Wait a bit to let Supabase catch up
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`--- PURGE COMPLETE. DELETED ${totalDeleted} USERS ---`);
}

purgeUsers().catch(console.error);
