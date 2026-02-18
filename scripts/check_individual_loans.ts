
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIndividualLoans() {
    console.log("Checking for individual loans...");

    // 1. Get all loan products to see what exists
    const { data: allLoans, error } = await supabase
        .from('loan_applications')
        .select('id, full_name, loan_product, status, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching loans:", error);
        return;
    }

    // Group by product
    const loansByProduct: Record<string, number> = {};
    const loansByStatus: Record<string, number> = {};
    const activeIndividualLoans: any[] = [];

    allLoans?.forEach(loan => {
        loansByProduct[loan.loan_product] = (loansByProduct[loan.loan_product] || 0) + 1;
        loansByStatus[loan.status] = (loansByStatus[loan.status] || 0) + 1;

        if (loan.loan_product !== 'Bodaboda Group Loan' && (loan.status === 'approved' || loan.status === 'disbursed')) {
            activeIndividualLoans.push(loan);
        }
    });

    console.log("\n--- Loan Statistics ---");
    console.log("Total Loans:", allLoans?.length);
    console.log("\nBy Product:");
    console.table(loansByProduct);
    console.log("\nBy Status:");
    console.table(loansByStatus);

    console.log("\n--- Active Individual Loans (Status: approved/disbursed, Product != Bodaboda Group Loan) ---");
    if (activeIndividualLoans.length > 0) {
        console.table(activeIndividualLoans);
    } else {
        console.log("No active individual loans found.");
    }
}

checkIndividualLoans();
