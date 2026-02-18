
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check700k() {
    console.log('--- Checking for 700k Loans ---');
    const client = await pool.connect();
    try {
        // 1. Check for specific amount 700,000
        const res = await client.query(`
            SELECT 
                la.id, la.loan_amount, la.status, p.full_name, g.group_name
            FROM loan_applications la
            LEFT JOIN profiles p ON la.user_id = p.id
            LEFT JOIN groups g ON la.group_id = g.id
            WHERE la.loan_amount = 700000
        `);
        console.log('Loans with 700k:', res.rows);

        // 2. Check Bugembe's loans again just to be sure
        const bugembeRes = await client.query(`
            SELECT 
                la.id, la.loan_amount, la.status
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            WHERE p.full_name ILIKE '%BUGEMBE%'
        `);
        console.log('All Bugembe Loans:', bugembeRes.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

check700k();
