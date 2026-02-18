
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function summarize() {
    console.log('--- Bugembe Loan Summary ---');
    const client = await pool.connect();
    try {
        // 1. Get all loans
        const loansRes = await client.query(`
            SELECT 
                la.id, la.loan_amount, la.status, la.created_at, g.group_name
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            LEFT JOIN groups g ON la.group_id = g.id
            WHERE p.full_name ILIKE '%BUGEMBE%'
            ORDER BY la.created_at DESC
        `);

        for (const loan of loansRes.rows) {
            console.log(`\nLoan ID: ${loan.id}`);
            console.log(`Amount: ${loan.loan_amount}`);
            console.log(`Status: ${loan.status}`);
            console.log(`Group: ${loan.group_name}`);

            // Get repayments
            const repRes = await client.query("SELECT amount, payment_date FROM repayments WHERE loan_application_id = $1", [loan.id]);
            if (repRes.rows.length > 0) {
                console.log('  Repayments:');
                repRes.rows.forEach(r => console.log(`    - ${r.amount} on ${r.payment_date}`));
                const total = repRes.rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);
                console.log(`  Total Paid: ${total}`);
                const expectedTotal = parseFloat(loan.loan_amount) * 1.3;
                console.log(`  Balance: ${expectedTotal - total}`);
            } else {
                console.log('  No Repayments');
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

summarize();
