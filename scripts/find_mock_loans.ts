
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function findMockLoans() {
    console.log("Analyzing loans for potential mock data...");

    const { data: loans, error } = await supabase
        .from('loan_applications')
        .select('id, full_name, loan_product, created_at, loan_amount');

    if (error) {
        console.error("Error fetching loans:", error);
        return;
    }

    console.log(`Total loans found: ${loans.length}`);

    // Strategy 1: Check for very recent created_at (likely manual tests if migration used backdated timestamps)
    // Most migrated loans should have dates from 2025 or earlier based on Excel sample.
    // If we see loans with today's date (2026-02-09), they might be manual creations.

    // Get today's date string YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const recentLoans = loans.filter(l => l.created_at.startsWith(today));

    if (recentLoans.length > 0) {
        console.log(`\nPotential Mock Loans (Created Today ${today}):`);
        recentLoans.forEach(l => {
            console.log(`- ${l.full_name} (${l.loan_product}): ${l.created_at}`);
        });
    } else {
        console.log(`\nNo loans created explicitly "today" found (checking if migration preserved old dates which it should have).`);
    }

    // Strategy 2: Check for specific "Test" names
    const testNames = loans.filter(l =>
        l.full_name.toLowerCase().includes('test') ||
        l.full_name.toLowerCase().includes('sample') ||
        l.full_name.toLowerCase().includes('demo')
    );

    if (testNames.length > 0) {
        console.log(`\nPotential Mock Loans (Suspicious Names):`);
        testNames.forEach(l => {
            console.log(`- ${l.full_name} (${l.loan_product})`);
        });
    }

    // Strategy 3: Check distinct dates distribution
    // Simply to see if there's a cluster of creation times 
    const dates = loans.map(l => l.created_at.split('T')[0]);
    const uniqueDates = [...new Set(dates)].sort();

    console.log(`\nDate Range of Loans: ${uniqueDates[0]} to ${uniqueDates[uniqueDates.length - 1]}`);
    console.log(`Total unique creation dates: ${uniqueDates.length}`);
}

findMockLoans();
