
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkId() {
    console.log('--- Checking ID 9160286 ---');
    const client = await pool.connect();
    try {
        // Search in profiles
        const pRes = await client.query("SELECT * FROM profiles WHERE id::text LIKE '%9160286%' OR phone_number LIKE '%9160286%'");
        console.log('Profiles:', pRes.rows);

        // Search in loans
        const lRes = await client.query("SELECT * FROM loan_applications WHERE id::text LIKE '%9160286%'");
        console.log('Loans:', lRes.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkId();
