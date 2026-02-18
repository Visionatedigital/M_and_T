
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function reconcile() {
    await client.connect();

    try {
        console.log("--- Final Reconciliation ---");
        console.log("Targets:");
        console.log("  Principal: 363,700,000");
        console.log("  Paid:      211,989,425");
        console.log("  Outst:     260,820,575");

        // 1. Total Principal
        const resPrincipal = await client.query(`SELECT SUM(loan_amount) as total FROM loan_applications`);
        const totalPrincipal = parseFloat(resPrincipal.rows[0].total || 0);

        // 2. Total Paid
        const resPaid = await client.query(`SELECT SUM(amount) as total FROM repayments`);
        const totalPaid = parseFloat(resPaid.rows[0].total || 0);

        // 3. Total Outstanding
        // Logic: (Principal * 1.3) - Paid
        // Only for active loans? Or global?
        // User said "Total Outstanding UGX 249,588,700"
        // Let's calculate based on Active loans first, then Global.

        const resOutstanding = await client.query(`
        WITH loan_calcs AS (
            SELECT 
                l.id, 
                (l.loan_amount * 1.3) as expected,
                COALESCE(SUM(r.amount), 0) as paid
            FROM loan_applications l
            LEFT JOIN repayments r ON l.id = r.loan_application_id
            GROUP BY l.id
        )
        SELECT 
            SUM(expected - paid) as total_outstanding,
             SUM(GREATEST(0, expected - paid)) as total_outstanding_floored
        FROM loan_calcs
    `);
        const totalOutstanding = parseFloat(resOutstanding.rows[0].total_outstanding_floored || 0);

        console.log(`\nActuals:`);
        console.log(`  Principal: ${totalPrincipal.toLocaleString()}`);
        console.log(`  Paid:      ${totalPaid.toLocaleString()}`);
        console.log(`  Outst:     ${totalOutstanding.toLocaleString()}`);

        console.log(`\nDifference:`);
        console.log(`  Principal: ${(totalPrincipal - 363700000).toLocaleString()}`);
        console.log(`  Paid:      ${(totalPaid - 211989425).toLocaleString()}`);
        console.log(`  Outst:     ${(totalOutstanding - 260820575).toLocaleString()}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

reconcile();
