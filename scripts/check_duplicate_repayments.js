
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

async function checkDuplicates() {
    await client.connect();

    try {
        console.log("--- Checking for Duplicate Repayments ---");

        // Find repayments with same loan_id, amount, and date
        // payment_date might be timestamp, so cast to date
        const res = await client.query(`
        SELECT 
            loan_application_id, 
            amount, 
            payment_date::date as p_date,
            COUNT(*) as count,
            SUM(amount) as total_impact
        FROM repayments
        GROUP BY loan_application_id, amount, p_date
        HAVING COUNT(*) > 1
        ORDER BY total_impact DESC
    `);

        console.log(`Found ${res.rowCount} sets of potential duplicates.`);

        let totalDuplicateValue = 0;
        res.rows.forEach(row => {
            // value of (count - 1) * amount
            const extra = (row.count - 1) * parseFloat(row.amount);
            totalDuplicateValue += extra;
            console.log(`Loan ${row.loan_application_id}: ${row.amount} on ${row.p_date} (x${row.count}) - Extra: ${extra.toLocaleString()}`);
        });

        console.log(`\nTotal Excess Value from Duplicates: ${totalDuplicateValue.toLocaleString()}`);

        // Also check total repayments count
        const resCount = await client.query('SELECT COUNT(*) FROM repayments');
        console.log(`Total Repayment Records: ${resCount.rows[0].count}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkDuplicates();
