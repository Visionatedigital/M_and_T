
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

async function inspectRepayments() {
    await client.connect();

    try {
        console.log("--- Inspecting Repayments ---");

        // 1. Top 10 Repayments
        console.log("\n[Top 10 Repayments]");
        const resTop = await client.query(`
        SELECT amount, payment_date, loan_application_id 
        FROM repayments 
        ORDER BY amount DESC 
        LIMIT 10
    `);
        resTop.rows.forEach(r => console.log(`${r.amount.toLocaleString()} on ${new Date(r.payment_date).toISOString().split('T')[0]} (Loan ${r.loan_application_id})`));

        // 2. Loans where Total Paid > Expected (Principal * 1.3)
        console.log("\n[Overpaid Loans?]");
        const resOver = await client.query(`
        WITH loan_totals AS (
            SELECT 
                l.id, 
                l.loan_amount, 
                (l.loan_amount * 1.3) as expected,
                SUM(r.amount) as total_paid
            FROM loan_applications l
            JOIN repayments r ON l.id = r.loan_application_id
            GROUP BY l.id
        )
        SELECT * FROM loan_totals WHERE total_paid > expected
        ORDER BY (total_paid - expected) DESC
        LIMIT 10
    `);

        if (resOver.rowCount === 0) console.log("No loans overpaid.");
        else resOver.rows.forEach(r => {
            console.log(`Loan ${r.id}: Paid ${parseFloat(r.total_paid).toLocaleString()} vs Expected ${parseFloat(r.expected).toLocaleString()} (Diff: ${(r.total_paid - r.expected).toLocaleString()})`);
        });

        // 3. Repayments by Date (to find migration spikes)
        console.log("\n[Repayments by Date - Top 5]");
        const resDate = await client.query(`
        SELECT payment_date::date as p_date, SUM(amount) as total, COUNT(*) as count
        FROM repayments
        GROUP BY p_date
        ORDER BY total DESC
        LIMIT 5
    `);
        resDate.rows.forEach(r => console.log(`${new Date(r.p_date).toISOString().split('T')[0]}: ${parseFloat(r.total).toLocaleString()} (${r.count} payments)`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspectRepayments();
