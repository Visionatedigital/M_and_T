
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function verify() {
    console.log("Verifying migration...");

    // 1. Count Total Loans
    const { count, error: countError } = await supabase
        .from('loan_applications')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error("Error counting loans:", countError);
    else console.log(`Total Loan Applications: ${count}`);

    // 2. Check Sample
    const { data: sample, error: sampleError } = await supabase
        .from('loan_applications')
        .select(`
            id, 
            full_name, 
            net_loan:loan_amount, 
            product:loan_product, 
            status, 
            created_at, 
            purpose:loan_purpose
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (sampleError) {
        console.error("Error fetching sample:", sampleError);
    } else {
        console.log("Recent Sample Loans:", JSON.stringify(sample, null, 2));
    }

    // 3. Check Distinct Products
    const { data: products, error: prodError } = await supabase
        .from('loan_applications')
        .select('loan_product');

    if (prodError) console.error("Error fetching products:", prodError);
    else {
        const distinct = [...new Set(products.map(p => p.loan_product))];
        console.log("Distinct Loan Products:", distinct);
    }

    // 4. Check Status Distribution
    const { data: statuses, error: statError } = await supabase
        .from('loan_applications')
        .select('status');

    if (statError) console.error("Error fetching statuses:", statError);
    else {
        const dist = statuses.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        console.log("Status Distribution:", dist);
    }
}

verify();
