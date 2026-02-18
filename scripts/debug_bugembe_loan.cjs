
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBugembe() {
    console.log('--- Debugging Bugembe Loan ---');

    // 1. Find the Group
    const { data: groups, error: groupError } = await supabase
        .from('groups')
        .select('id, group_name')
        .ilike('group_name', '%KAMOGA%');

    if (groupError) console.error('Group Error:', groupError);
    console.log('Groups Found:', groups);

    if (groups && groups.length > 0) {
        const groupIds = groups.map(g => g.id);

        // 2. Find Loans in these groups with 500k amount
        // We select profiles(full_name) to see who it is linked to
        const { data: loans, error: loanError } = await supabase
            .from('loan_applications')
            .select(`
                id, loan_amount, status, user_id
            `)
            .in('group_id', groupIds)
            .eq('loan_amount', 500000);

        if (loanError) console.error('Loan Error:', loanError);
        console.log('Loans Found in KAMOGA (500k):', JSON.stringify(loans, null, 2));

        if (loans) {
            for (const loan of loans) {
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', loan.user_id).single();
                console.log(`Loan ${loan.id} is linked to:`, profile ? profile.full_name : 'NULL PROFILE');
            }
        }
    }

    // 3. Check for Duplicate Bugembe Profiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', '%BUGEMBE%');

    if (profileError) console.error('Profile Error:', profileError);
    console.log('Profiles matching BUGEMBE:', profiles);
}

debugBugembe();
