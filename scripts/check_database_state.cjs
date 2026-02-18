const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkState() {
    console.log('--- Current Database State ---');

    const { data: loans, error: loanErr } = await supabase
        .from('loan_applications')
        .select('*')
        .limit(1);

    if (loanErr) {
        console.error('Error fetching loans:', loanErr.message);
    } else {
        // Fetch total count separately as .limit(1) would only give 0 or 1
        const { count: loanCount } = await supabase.from('loan_applications').select('*', { count: 'exact', head: true });
        console.log('Total Loans:', loanCount);
        if (loans.length > 0) {
            console.log('Loan Columns:', Object.keys(loans[0]));
        } else {
            console.log('Loan table is empty, trying to fetch columns via RPC or assume schema...');
        }
    }

    const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    // Check for placeholder users via profiles since we can't easily list auth.users without admin key in a simple query
    const { data: placeholderProfiles } = await supabase
        .from('profiles')
        .select('email')
        .ilike('email', '%@mandt.placeholder%');

    console.log(`Total Loans: ${loanCount}`);
    console.log(`Total Profiles: ${profileCount}`);
    console.log(`Placeholder Profiles found: ${placeholderProfiles?.length || 0}`);

    console.log('--- End of State Check ---');
}

checkState().catch(err => console.error(err));
