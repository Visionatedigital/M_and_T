import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function debugGroupMembers() {
    console.log("Checking groups...");
    const { data: groups } = await supabase.from('groups').select('*').ilike('group_name', '%SHAMIM%');
    console.log("Groups matching SHAMIM:", JSON.stringify(groups, null, 2));

    if (groups && groups.length > 0) {
        const groupIds = groups.map(g => g.id);
        console.log("\nChecking loan applications for these groups...");
        const { data: loans } = await supabase
            .from('loan_applications')
            .select('*')
            .in('group_id', groupIds);

        console.log(`Found ${loans?.length || 0} loan applications for SHAMIM groups.`);
        console.log("Loan Applications:", JSON.stringify(loans, null, 2));
    } else {
        console.log("\nChecking loan applications with group_name 'SHAMIM' directly...");
        const { data: loans } = await supabase
            .from('loan_applications')
            .select('*')
            .ilike('group_name', '%SHAMIM%');
        console.log(`Found ${loans?.length || 0} loan applications with name matching SHAMIM.`);
        console.log("Loan Applications:", JSON.stringify(loans, null, 2));
    }
}

debugGroupMembers();
