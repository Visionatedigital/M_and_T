
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function verifyGroups() {
    console.log("Verifying Group Migration...");

    // 1. Total Count
    const { count, error } = await supabase
        .from('loan_applications')
        .select('*', { count: 'exact', head: true });

    console.log(`Total Loan Applications: ${count}`);

    // 2. Check Specific Groups
    // Kapere
    console.log("\nChecking 'KAPERE'...");
    const { data: kapere } = await supabase
        .from('loan_applications')
        .select('loan_amount, loan_purpose, full_name')
        .ilike('loan_purpose', '%Group: KAPERE%');

    if (kapere && kapere.length > 0) {
        console.log(`Found ${kapere.length} loans for KAPERE.`);
        kapere.forEach(k => console.log(`- Amount: ${k.loan_amount}, Name: ${k.full_name}`));
    } else {
        console.log("No loans found for KAPERE group.");
    }

    // Mukasa
    console.log("\nChecking 'MUKASA'...");
    const { data: mukasa } = await supabase
        .from('loan_applications')
        .select('loan_amount, loan_purpose, full_name')
        .ilike('loan_purpose', '%Group: MUKASA%');

    if (mukasa && mukasa.length > 0) {
        console.log(`Found ${mukasa.length} loans for MUKASA.`);
        mukasa.forEach(k => console.log(`- Amount: ${k.loan_amount}, Name: ${k.full_name}`));
    } else {
        console.log("No loans found for MUKASA group.");
    }

    // 3. Check for Duplicates (Group Loans)
    // We expect 1 loan per group name in purpose
    const { data: loans } = await supabase
        .from('loan_applications')
        .select('loan_purpose')
        .ilike('loan_purpose', '%Group: %');

    if (loans) {
        const groups = loans.map(l => {
            const match = l.loan_purpose.match(/Group: ([^)]+)/); // Extracts "Group: NAME" until ')' or end?
            // "Group Loan: KAPERE (Leader..."
            // Regex: /Group Loan: (.*?) \(/
            const m = l.loan_purpose.match(/Group Loan: (.*?) \(/);
            return m ? m[1] : 'Unknown';
        });

        const counts: Record<string, number> = {};
        groups.forEach(g => counts[g] = (counts[g] || 0) + 1);

        const duplicates = Object.entries(counts).filter(([k, v]) => v > 1);

        if (duplicates.length > 0) {
            console.log(`\nFound potential duplicates for groups:`, duplicates);
        } else {
            console.log(`\nNo duplicate group loans found (based on name extraction).`);
        }
    }
}

verifyGroups();
