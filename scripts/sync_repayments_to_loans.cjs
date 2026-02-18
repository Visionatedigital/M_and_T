
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function syncRepayments() {
    await client.connect();
    try {
        console.log("Syncing amount_paid in loan_applications with repayments table...");

        await client.query(`
            UPDATE loan_applications
            SET amount_paid = sub.total_paid
            FROM (
                SELECT loan_application_id, SUM(amount) as total_paid
                FROM repayments
                GROUP BY loan_application_id
            ) AS sub
            WHERE loan_applications.id = sub.loan_application_id
        `);

        // Zero out those with no repayments
        await client.query(`
            UPDATE loan_applications
            SET amount_paid = 0
            WHERE id NOT IN (SELECT loan_application_id FROM repayments)
        `);

        console.log("Sync complete!");
    } catch (err) {
        console.error("Sync failed:", err);
    } finally {
        await client.end();
    }
}
syncRepayments();
