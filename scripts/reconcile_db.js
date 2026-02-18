
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const { Client } = pg;

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function reconcile() {
    await client.connect();

    try {
        console.log("--- Reconciling Portfolio Totals ---");
        console.log("Target Principal: 316,400,000");
        console.log("Target Paid:      165,549,925");
        console.log("Target Outst:     249,588,700");

        // 1. Total Principal (All Time)
        const resPrincipal = await client.query(`SELECT SUM(loan_amount) as total FROM loan_applications`);
        const totalPrincipal = parseFloat(resPrincipal.rows[0].total || 0);

        // 2. Total Paid (All Time)
        const resPaid = await client.query(`SELECT SUM(amount) as total FROM repayments`);
        const totalPaid = parseFloat(resPaid.rows[0].total || 0);

        console.log(`\n[All Time]`);
        console.log(`Principal: ${totalPrincipal.toLocaleString()}`);
        console.log(`Paid:      ${totalPaid.toLocaleString()}`);

        // 3. Active/Disbursed Loans Only
        const resActive = await client.query(`
        SELECT SUM(loan_amount) as total 
        FROM loan_applications 
        WHERE status IN ('approved', 'active', 'repaying', 'disbursed')
    `);
        console.log(`\n[Active/Disbursed Only] Principal: ${parseFloat(resActive.rows[0].total || 0).toLocaleString()}`);

        // 4. Exclude Written Off/Rejected
        const resNoBad = await client.query(`
        SELECT SUM(loan_amount) as total 
        FROM loan_applications 
        WHERE status NOT IN ('written_off', 'rejected', 'closed')
    `);
        console.log(`[No WriteOff/Reject/Closed] Principal: ${parseFloat(resNoBad.rows[0].total || 0).toLocaleString()}`);

        // 5. 2024 Only
        const res2024 = await client.query(`
        SELECT SUM(loan_amount) as total 
        FROM loan_applications 
        WHERE created_at >= '2024-01-01'
    `);
        console.log(`[2024 Only] Principal: ${parseFloat(res2024.rows[0].total || 0).toLocaleString()}`);

        // 6. Check Specific "Exclusions" if user implies we are off
        // Group by status
        const resStatus = await client.query(`
        SELECT status, SUM(loan_amount) as total, COUNT(*) as count
        FROM loan_applications
        GROUP BY status
    `);
        console.log("\n--- Breakdown by Status ---");
        resStatus.rows.forEach(row => {
            console.log(`${row.status}: ${parseFloat(row.total || 0).toLocaleString()} (${row.count})`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

reconcile();
