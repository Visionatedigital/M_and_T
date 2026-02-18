
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check2024() {
    console.log('--- Checking 2024 Loans ---');
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                la.id, la.loan_amount, la.created_at, p.full_name
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            WHERE la.created_at < '2025-01-01'
            LIMIT 5
        `);
        console.log('Loans from 2024:', res.rows);

        // Search for Kiguli broadly
        const kiguli = await client.query(`
            SELECT * FROM profiles WHERE full_name ILIKE '%KIGULI%'
        `);
        console.log('Kiguli Profile:', kiguli.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

check2024();
