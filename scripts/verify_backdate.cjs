
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verifyBackdate() {
    console.log('--- Verifying Backdate ---');
    const client = await pool.connect();
    try {
        // 1. Check Specific User (Kiguli Hassan)
        console.log('Checking Kiguli Hassan:');
        const res = await client.query(`
            SELECT 
                la.id, la.loan_amount, la.created_at, la.date_of_birth,
                p.full_name
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            WHERE p.full_name ILIKE '%KIGULI HASSAN%'
        `);
        res.rows.forEach(r => console.log(r));

        // 2. Check Range of Dates
        console.log('\nDate Range:');
        const dateRes = await client.query(`
            SELECT MIN(created_at), MAX(created_at) FROM loan_applications
        `);
        console.log(dateRes.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

verifyBackdate();
