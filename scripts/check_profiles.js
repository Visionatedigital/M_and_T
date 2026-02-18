
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://hhjautitkadwypreqdrd.supabase.co";
// Using Service Role Key to bypass RLS for debugging
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU";

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking profiles...');
    const { data: profiles, error: pError, count: pCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (pError) console.error('Profile Error:', pError);
    else console.log('Total Profiles (Admin View):', pCount);

    // Check roles
    const { data: roles, error: rError } = await supabase.from('user_roles').select('*');
    if (rError) console.error('Roles Error:', rError);
    else console.log('User Roles:', roles);

    const { data: loans, error: lError, count: lCount } = await supabase.from('loan_applications').select('*', { count: 'exact', head: true });
    if (lError) console.error('Loan Error:', lError);
    else console.log('Total Loans (Admin View):', lCount);
}

checkData();
