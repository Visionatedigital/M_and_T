
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fix700k() {
    console.log('--- Fixing Bugembe 700k Loan ---');
    const client = await pool.connect();
    try {
        const loanId = 'e8e7cdac-7437-4054-bf08-b2bb0a9866fa';
        const expectedPaid = 682000;

        // 1. Check existing repayments
        const res = await client.query("SELECT * FROM repayments WHERE loan_application_id = $1", [loanId]);
        console.log('Existing Repayments:', res.rows);

        const totalPaid = res.rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);

        if (totalPaid === 0) {
            console.log(`Inserting missing repayment of ${expectedPaid}...`);
            const recorderId = '25466ed3-563b-4fd4-9a1f-72d492c853fb'; // Bugembe himself or admin
            const insertRes = await client.query(`
                INSERT INTO repayments (id, loan_application_id, amount, payment_date, recorded_by)
                VALUES (gen_random_uuid(), $1, $2, NOW(), $3)
                RETURNING *;
            `, [loanId, expectedPaid, recorderId]);
            console.log('Inserted:', insertRes.rows[0]);
        } else {
            console.log(`Loan already has ${totalPaid} paid. Skipping insertion.`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

fix700k();
