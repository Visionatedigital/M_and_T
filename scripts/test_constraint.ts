
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function checkConstraint() {
    // We can't easily query information_schema via JS client directly unless exposed.
    // However, we can try to insert a row with a known invalid value and catch the error message detail.
    // The error message usually contains the constraint name.
    // But we already got the error message:
    // "new row for relation "loan_applications" violates check constraint "loan_applications_loan_product_check""
    // Try inserting into loan_products first
    console.log("Inserting 'SME Loans' into loan_products...");
    const { error: prodError } = await supabase.from('loan_products').insert({
        id: 'sme_loans_id', // manual id
        name: 'SME Loans',
        code: 'SME',
        description: 'Small Medium Enterprise Loan',
        min_amount: 100000,
        max_amount: 10000000,
        min_duration_months: 1,
        max_duration_months: 12,
        base_interest_rate: 0.05,
        processing_fee_percentage: 2,
        status: 'active'
    });

    if (prodError) {
        console.log("Failed to insert loan_product:", prodError.message);
    } else {
        console.log("Inserted loan_product 'SME Loans'.");
    }

    const candidates = ['SME Loans']; // Only test this one now

    for (const prod of candidates) {
        console.log(`Trying '${prod}'...`);
        const { error } = await supabase.from('loan_applications').insert({
            user_id: '058fe715-8763-4d85-bf86-7a11279a0899',
            full_name: `Test ${prod}`,
            email: `test_${prod.replace(/\s/g, '')}@example.com`,
            phone_number: '1234567890',
            id_number: 'TEST1234',
            date_of_birth: '1990-01-01',
            address: 'Test Address',
            loan_product: prod,
            loan_amount: 1000,
            loan_duration_months: 1,
            loan_purpose: 'Test',
            employment_status: 'Self-Employed',
            status: 'pending'
        });

        if (error) {
            console.log(`'${prod}' failed:`, error.message);
        } else {
            console.log(`'${prod}' SUCCESS!`);
            // Clean up
            await supabase.from('loan_applications').delete().eq('email', `test_${prod.replace(/\s/g, '')}@example.com`);
            return; // Found one!
        }
    }
}

checkConstraint();
