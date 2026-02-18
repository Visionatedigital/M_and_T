
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://hhjautitkadwypreqdrd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function extractMembers() {
    const { data: loans, error } = await supabase
        .from('loan_applications')
        .select('id, full_name, loan_purpose, loan_amount, status');

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Checking ${loans.length} loans...`);
    let jsonLoansCount = 0;

    loans.forEach(loan => {
        try {
            if (loan.loan_purpose && (loan.loan_purpose.startsWith('[') || loan.loan_purpose.startsWith('{'))) {
                const members = JSON.parse(loan.loan_purpose);
                if (Array.isArray(members) && members.length > 0) {
                    jsonLoansCount++;
                    console.log(`\nLoan ID: ${loan.id} | Group/Client: ${loan.full_name}`);
                    console.log(`Status: ${loan.status} | Total Amount: ${loan.loan_amount}`);
                    console.log(`Members Found: ${members.length}`);
                    console.log(`Sample Member: ${JSON.stringify(members[0])}`);

                    // Check if any member is "Immaculate" or matches "Kapere"
                    const kapereMatch = members.some(m => (m.name || '').toLowerCase().includes('kapere'));
                    if (kapereMatch) console.log("!!! Found KAPERE members in this JSON !!!");
                }
            }
        } catch (e) {
            // Not JSON
        }
    });

    console.log(`\nTotal loans with JSON member lists: ${jsonLoansCount}`);
}

extractMembers();
