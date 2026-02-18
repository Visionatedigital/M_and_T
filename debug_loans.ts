
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhjautitkadwypreqdrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectLoanSchema() {
    console.log('Fetching one loan to inspect keys...');
    const { data: loans, error } = await supabase
        .from('loan_applications')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching loans:', error);
        return;
    }

    if (loans.length === 0) {
        console.log('No loans found.');
        return;
    }

    console.log('Keys available on loan object:', Object.keys(loans[0]));
    console.log('Sample Loan:', loans[0]);
}

inspectLoanSchema();
