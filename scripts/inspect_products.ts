
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function inspectSchema() {
    console.log("Inspecting loan_products...");

    // 1. Get a row to see columns
    const { data, error } = await supabase.from('loan_products').select('*').limit(1);
    if (data && data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
        console.log("Sample Row:", data[0]);
    } else {
        console.log("No existing products found or error:", error);
        // Force error to see columns?
        const { error: err2 } = await supabase.from('loan_products').select('bad_col').limit(1);
        if (err2) console.log("Hint:", err2.hint || err2.message);
    }
}

inspectSchema();
