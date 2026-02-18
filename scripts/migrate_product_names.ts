
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function migrateProductNames() {
    console.log("Migrating Loan Product Names...");

    // 1. Fetch all loans
    const { data: loans, error } = await supabase
        .from('loan_applications')
        .select('id, loan_purpose, loan_product');

    if (error) {
        console.error("Error fetching loans:", error);
        return;
    }

    console.log(`Found ${loans.length} loans to process.`);

    let groupCount = 0;
    let indCount = 0;
    let errorCount = 0;

    for (const loan of loans) {
        let newProduct = 'Individual Loan';

        // Check purpose for Group indicator
        if (loan.loan_purpose && loan.loan_purpose.includes('Group Loan:')) {
            newProduct = 'Group Loan';
        }

        if (loan.loan_product !== newProduct) {
            const { error: updateError } = await supabase
                .from('loan_applications')
                .update({ loan_product: newProduct })
                .eq('id', loan.id);

            if (updateError) {
                console.error(`Failed to update loan ${loan.id}:`, updateError.message);
                errorCount++;
            } else {
                if (newProduct === 'Group Loan') groupCount++;
                else indCount++;
            }
        }
    }

    console.log(`Migration Complete.`);
    console.log(`- Updated to Group Loan: ${groupCount}`);
    console.log(`- Updated to Individual Loan: ${indCount}`);
    console.log(`- Errors: ${errorCount}`);
}

migrateProductNames();
