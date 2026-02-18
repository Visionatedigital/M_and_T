
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

    if (error) {
        console.error(error);
        return;
    }

    const withBreakdown = (repayments || []).filter(r => r.member_breakdown && (Array.isArray(r.member_breakdown) ? r.member_breakdown.length > 0 : Object.keys(r.member_breakdown).length > 0));

    console.log(`Total repayments found: ${repayments?.length || 0}`);
    console.log(`Repayments with member breakdown: ${withBreakdown.length}`);

    if (withBreakdown.length > 0) {
        console.log("\nSample Breakdown from first match:");
        console.log(JSON.stringify(withBreakdown[0].member_breakdown, null, 2));
    }
}

checkRepayments();
