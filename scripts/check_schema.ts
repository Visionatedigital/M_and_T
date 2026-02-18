
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function checkSchema() {
    console.log("Checking loan_applications columns...");
    // Try to insert a dummy record to trigger error with column list or just inspect via metadata if possible.
    // Supabase client doesn't have a 'describe table' method easily.
    // But we can try to select * limit 1 and see keys.
    const { data, error } = await supabase.from('loan_applications').select('*').limit(1);

    if (error) {
        console.error("Error selecting:", error);
    } else if (data && data.length > 0) {
        console.log("Columns found in existing record:", Object.keys(data[0]).join(', '));
    } else {
        console.log("No data found, cannot infer columns easily.");
        // We can try to list columns by forcing a bad select?
        const { error: err2 } = await supabase.from('loan_applications').select('non_existent_column').limit(1);
        if (err2) console.log("Error hint might list columns:", err2.message, err2.hint);
    }
}

checkSchema();
