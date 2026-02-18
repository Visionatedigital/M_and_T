
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://hhjautitkadwypreqdrd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRepayments() {
    const { data: loans } = await supabase.from('loan_applications').select('id, loan_purpose');

    const groupLoanIds = loans
        .filter(l => l.loan_purpose && (l.loan_purpose.startsWith('[') || l.loan_purpose.startsWith('{')))
        .map(l => l.id);

    console.log(`Checking repayments for ${groupLoanIds.length} group loans...`);

    const { data: repayments, error } = await supabase
        .from('repayments')
        .select('*')
        .in('loan_application_id', groupLoanIds);

    if (error) console.error(error);
    console.log(`Total repayments found for groups: ${repayments?.length || 0}`);

    if (repayments && repayments.length > 0) {
        console.log("Sample Repayment:", JSON.stringify(repayments[0], null, 2));
    }
}

checkRepayments();
