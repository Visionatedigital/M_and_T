
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: 'd:/m-t-growth-gateway/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log("Checking loan_applications...");
    const { data: loans, error: lErr } = await supabase.from('loan_applications').select('*').limit(5);
    if (lErr) console.error("Loan Err:", lErr.message);
    else console.log("LOANS:", JSON.stringify(loans, null, 2));

    console.log("Checking repayments...");
    const { data: reps, error: rErr } = await supabase.from('repayments').select('*').limit(5);
    if (rErr) console.error("Rep Err:", rErr.message);
    else console.log("REPAYMENTS:", JSON.stringify(reps, null, 2));

    process.exit(0);
}

check();
