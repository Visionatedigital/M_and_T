
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function cleanupMockData() {
    console.log("Cleaning up mock data...");

    const today = new Date().toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch loans created today
    const { data: loans, error } = await supabase
        .from('loan_applications')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${tomorrowStr}T00:00:00`);

    if (error) {
        console.error("Error fetching loans:", error);
        return;
    }

    if (!loans || loans.length === 0) {
        console.log("No loans found created today.");
        return;
    }

    console.log(`Found ${loans.length} loans created today.`);

    // Filter for blank names or suspicious data
    const toDelete = loans.filter(l => !l.full_name || l.full_name.trim() === '' || l.full_name === 'Test User');

    if (toDelete.length === 0) {
        console.log("No suspicious loans found amongst today's creations.");
        // Double check if there are 3 records. 
        // Based on previous logs, there were 3 extra records. 
        // If they have names, we should still list them.
        console.log("Listing all loans created today to be safe:");
        loans.forEach(l => console.log(`- ${l.id}: ${l.full_name} (${l.loan_product})`));
    } else {
        console.log(`Deleting ${toDelete.length} suspicious loans...`);
        const ids = toDelete.map(l => l.id);

        const { error: delError } = await supabase
            .from('loan_applications')
            .delete()
            .in('id', ids);

        if (delError) {
            console.error("Error deleting loans:", delError);
        } else {
            console.log("Successfully deleted mock loans.");
        }
    }
}

cleanupMockData();
