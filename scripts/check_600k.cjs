
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check600k() {
    console.log('--- Checking 600k Loan ---');
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                la.id, la.loan_amount, la.status, la.created_at, p.full_name, g.group_name
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            LEFT JOIN groups g ON la.group_id = g.id
            WHERE la.loan_amount = 600000
        `);
        console.log('Loans with 600k:', res.rows);

        // Calculate days since created_at for each
        const now = new Date();
        res.rows.forEach(r => {
            const created = new Date(r.created_at);
            const diffTime = Math.abs(now - created);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            console.log(`  - Loan ID: ${r.id}, Created: ${r.created_at}, Days Ago: ${diffDays}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

check600k();
