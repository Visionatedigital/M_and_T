
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Fix env loading
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestIndividualLoan() {
    console.log("Creating test individual loan...");

    // 1. Ensure Product Exists
    const productName = "Individual Business Loan";
    let { data: product } = await supabase
        .from('loan_products')
        .select('id')
        .eq('name', productName)
        .single();

    if (!product) {
        console.log(`Product '${productName}' not found. Creating it...`);
        const { data: newProduct, error: prodError } = await supabase
            .from('loan_products')
            .insert({
                name: productName,
                interest_rate: 0.30,
                duration_months: 4,
                status: 'active'
            })
            .select()
            .single();

        if (prodError) {
            console.error("Error creating product:", prodError);
            return;
        }
        product = newProduct;
    }

    // 2. Create/Get a User (using the first available user for test)
    const { data: users } = await supabase.from('profiles').select('id, first_name, last_name').limit(1);
    if (!users || users.length === 0) {
        console.error("No users found to assign loan to.");
        return;
    }
    const testUser = users[0];
    const fullName = `${testUser.first_name} ${testUser.last_name || ''}`.trim() || "Test User";

    // 3. Create Loan Application
    const { data: loan, error: loanError } = await supabase
        .from('loan_applications')
        .insert({
            user_id: testUser.id,
            client_name: fullName,
            full_name: fullName, // legacy field fallback
            loan_amount: 5000000, // 5M UGX
            loan_duration_months: 4,
            loan_purpose: "Business Expansion",
            loan_product: productName,
            status: 'disbursed', // Directly to disbursed to show in Active Loans
            phone_number: "0700000000",
            id_number: "CM00000000",
            approved_at: new Date().toISOString(),
            disbursed_at: new Date().toISOString()
        })
        .select()
        .single();

    if (loanError) {
        console.error("Error creating loan:", loanError);
    } else {
        console.log("Successfully created test individual loan!");
        console.log(loan);
    }
}

createTestIndividualLoan();
