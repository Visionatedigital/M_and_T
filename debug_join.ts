
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhjautitkadwypreqdrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJoin() {
    console.log('Testing join with groups...');

    // Try to select loans and expand the group_id foreign key
    const { data: loans, error } = await supabase
        .from('loan_applications')
        .select('id, full_name, group_id, groups(group_name)')
        .not('group_id', 'is', null) // Only get loans with a group_id to test the join
        .limit(5);

    if (error) {
        console.error('Error fetching loans with join:', error);
        return;
    }

    console.log(`Found ${loans.length} loans with group_id.`);
    if (loans.length > 0) {
        console.log('Sample loan with group:', JSON.stringify(loans[0], null, 2));
    } else {
        console.log('No loans found with group_id not null. Cannot verify join.');
    }
}

testJoin();
