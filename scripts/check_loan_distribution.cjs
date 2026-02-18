
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://hhjautitkadwypreqdrd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDistribution() {
    console.log('Checking loan distribution...');

    // Get all loans (lightweight)
    const { data: loans, error } = await supabase
        .from('loan_applications')
        .select('user_id, full_name, loan_product');

    if (error) {
        console.error(error);
        return;
    }

    const userCounts = {};
    const nameCounts = {};

    loans.forEach(l => {
        userCounts[l.user_id] = (userCounts[l.user_id] || 0) + 1;
        nameCounts[l.full_name] = (nameCounts[l.full_name] || 0) + 1;
    });

    console.log('Total Loans:', loans.length);
    console.log('Unique User IDs:', Object.keys(userCounts).length);
    console.log('Unique Names:', Object.keys(nameCounts).length);

    console.log('\nTop 5 Users by Loan Count:');
    Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([id, count]) => console.log(`${id}: ${count}`));

    console.log('\nTop 5 Names by Loan Count:');
    Object.entries(nameCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([name, count]) => console.log(`${name}: ${count}`));
}

checkDistribution();
