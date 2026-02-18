
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkBugembeDate() {
    console.log('--- Checking Bugembe Dates ---');
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT * FROM loan_applications 
            WHERE id = 'e8e7cdac-7437-4054-bf08-b2bb0a9866fa'
        `);
        console.log('Bugembe Loan:', res.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkBugembeDate();
