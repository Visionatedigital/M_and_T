
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function checkSystem() {
    console.log("Checking System Configuration...");

    // 1. Check if 'Individual Loan' is accepted (Product Constraint)
    console.log("Testing Product Constraint...");
    const { data: validProduct, error: prodError } = await supabase
        .from('loan_applications')
        .select('loan_product')
        .limit(1);

    // Try to update one record to 'Individual Loan' to see if it fails
    if (validProduct && validProduct.length > 0) {
        // We won't actually commit if we can avoid it, or we pick a test record.
        // But the previous script failed on this, so running that script is the best test.
        console.log("Skipping direct write test, will rely on migration script output.");
    }

    // 2. Check Policies (via listing)
    // We can't see postgres policies via client easily.
    // We will inspect the behavior by trying to act as a loan officer.
    // But first let's create a Loan Officer if one doesn't exist.

    console.log("Checking for Loan Officer role...");
    // Create a dummy user and assign role? 
    // Or just look for existing roles
    const { data: roles } = await supabase.from('user_roles').select('*').eq('role', 'loan_officer');
    console.log(`Found ${roles?.length || 0} users with 'loan_officer' role.`);

}

checkSystem();
