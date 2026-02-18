
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestIndividualLoan() {
    console.log("Creating test individual loan (JS)...");

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

    // 2. Create/Get a User
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
            full_name: fullName,
            loan_amount: 3000000, // 3M UGX
            loan_duration_months: 4,
            loan_purpose: "Stock Purchase",
            loan_product: productName,
            status: 'disbursed',
            phone_number: "0755555555",
            id_number: "CM99999999",
            approved_at: new Date().toISOString(),
            disbursed_at: new Date().toISOString()
        })
        .select()
        .single();

    if (loanError) {
        console.error("Error creating loan:", loanError);
    } else {
        console.log("Successfully created test individual loan!");
        console.log("Loan ID:", loan.id);
    }
}

createTestIndividualLoan();
