
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fixBugembe() {
    console.log('--- Fixing Bugembe Loan (PG) ---');
    const client = await pool.connect();
    try {
        const loanId = '98c6e17c-ccee-4a2a-aa62-dff1e74e8c50';
        const amount = 650000;

        // 1. Insert Repayment
        // Use user's own ID as recorder if no admin available, assuming constraints allow valid UUID
        const recorderId = '25466ed3-563b-4fd4-9a1f-72d492c853fb';
        const insertRes = await client.query(`
            INSERT INTO repayments (id, loan_application_id, amount, payment_date, recorded_by)
            VALUES (gen_random_uuid(), $1, $2, NOW(), $3)
            RETURNING *;
        `, [loanId, amount, recorderId]);
        console.log('Inserted Repayment:', insertRes.rows[0]);

        // 2. Update Loan Status
        const updateRes = await client.query(`
            UPDATE loan_applications
            SET status = 'fully_paid', updated_at = NOW()
            WHERE id = $1
            RETURNING *;
        `, [loanId]);
        console.log('Updated Loan Status:', updateRes.rows[0].status);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

fixBugembe();
