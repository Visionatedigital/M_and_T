
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function listExisting() {
    console.log("Fetching existing loan applications...");
    const { data, error } = await supabase
    const { data, error } = await supabase
        .from('loan_applications')
        .select('loan_product');

    if (error) {
        console.error("Error fetching loans:", error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No existing loan applications found.");
    } else {
        const distinct = [...new Set(data.map(d => d.loan_product))];
        console.log("Found existing loan products:", distinct);
    }
}

listExisting();
