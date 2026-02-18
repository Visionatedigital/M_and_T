const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function finalCheck() {
    console.log('--- FINAL DATA VALIDATION ---');

    // Check for KAPERE group members
    const { data: members, error: memErr } = await supabase
        .from('loan_applications')
        .select('full_name, group_id, loan_amount')
        .ilike('full_name', '%KAPERE%');

    if (memErr) {
        console.error('Error fetching members:', memErr);
    } else {
        console.log(`Found ${members.length} members for KAPERE:`);
        members.forEach(m => console.log(`- ${m.full_name}: ID=${m.group_id}, Amount=${m.loan_amount}`));
    }

    // Check for Single loans (Immaculate)
    const { data: singles, error: singErr } = await supabase
        .from('loan_applications')
        .select('full_name, group_id')
        .ilike('full_name', '%Immaculate%');

    if (singErr) {
        console.error('Error fetching singles:', singErr);
    } else {
        console.log(`Found ${singles.length} single loans:`);
        singles.forEach(s => console.log(`- ${s.full_name}: ID=${s.group_id}`));
    }

    console.log('--- END OF VALIDATION ---');
}

finalCheck().catch(err => console.error(err));
