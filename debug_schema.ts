
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhjautitkadwypreqdrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('Checking for tables with "group" in name...');
    // Note: Supabase JS client doesn't support querying information_schema directly easily without rpc or raw sql if not exposed.
    // But we can try to guess or use rpc if available. 
    // actually, let's just try to select from 'groups' and see if it errors.

    const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .limit(1);

    if (groupsError) {
        console.log("Error querying 'groups' table:", groupsError.message);
    } else {
        console.log("'groups' table exists!");
        if (groupsData.length > 0) {
            console.log("Sample group:", groupsData[0]);
        } else {
            console.log("groups table is empty.");
        }
    }

    console.log('\nChecking loan_applications columns again...');
    // We already saw the keys in previous step, confirming group_id exists but group_name does not.

    // Let's check if there is a 'client_groups' table or similar?
    const { data: clientGroups, error: clientGroupsError } = await supabase
        .from('client_groups')
        .select('*')
        .limit(1);

    if (clientGroupsError) {
        console.log("Error querying 'client_groups' table:", clientGroupsError.message);
    } else {
        console.log("'client_groups' table exists!");
        console.log("Sample client_group:", clientGroups[0]);
    }

}

inspectSchema();
