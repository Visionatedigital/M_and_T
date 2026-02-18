const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
    console.log('--- STARTING CLEANUP ---');

    // 1. Fetch placeholder profiles
    const { data: placeholders, error: fetchErr } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', '%@mandt.placeholder%');

    if (fetchErr) {
        console.error('Error fetching placeholders:', fetchErr);
        return;
    }

    if (!placeholders || placeholders.length === 0) {
        console.log('No placeholder records found.');
        return;
    }

    const userIds = placeholders.map(p => p.id);
    console.log(`Found ${userIds.length} placeholder records to delete.`);

    // 2. Fetch loan IDs for these users
    const { data: loans, error: fetchLoanErr } = await supabase
        .from('loan_applications')
        .select('id')
        .in('user_id', userIds);

    if (fetchLoanErr) {
        console.error('Error fetching loans:', fetchLoanErr);
    } else if (loans && loans.length > 0) {
        const loanIds = loans.map(l => l.id);

        // 3. Delete repayments associated with these loans
        const { error: repayErr } = await supabase
            .from('repayments')
            .delete()
            .in('loan_application_id', loanIds);

        if (repayErr) {
            console.error('Error deleting repayments:', repayErr);
        } else {
            console.log(`Deleted repayments for ${loanIds.length} placeholder loans.`);
        }
    }

    // 4. Delete loan applications associated with these users
    const { error: loanErr } = await supabase
        .from('loan_applications')
        .delete()
        .in('user_id', userIds);

    if (loanErr) {
        console.error('Error deleting loan applications:', loanErr);
    } else {
        console.log('Deleted associated loan applications.');
    }

    // 3. Delete auth.users
    const batchSize = 20;
    for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        console.log(`Deleting auth batch ${i / batchSize + 1} (${batch.length} users)...`);

        await Promise.all(batch.map(async (id) => {
            await supabase.auth.admin.deleteUser(id);
        }));
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 4. Force delete remaining profiles (in case cascade failed)
    console.log('Force deleting remaining profiles...');
    const { error: profErr } = await supabase
        .from('profiles')
        .delete()
        .in('id', userIds);

    if (profErr) {
        console.error('Error force deleting profiles:', profErr);
    } else {
        console.log('Profiles cleanup successful.');
    }

    console.log('--- CLEANUP COMPLETE ---');
}

cleanup().catch(err => console.error(err));
