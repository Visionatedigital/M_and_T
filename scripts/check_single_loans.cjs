const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSingleLoans() {
    console.log('Checking for Immaculate and Olivia...');
    const { data: loans, error } = await supabase
        .from('loan_applications')
        .select('full_name, group_id, status')
        .or('full_name.ilike.%Immaculate%,full_name.ilike.%Olivia%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Found loans:');
    loans.forEach(l => {
        console.log(`- ${l.full_name}: group_id = ${l.group_id}, status = ${l.status}`);
    });
}

checkSingleLoans();
