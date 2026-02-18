
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
    const client = await pool.connect();
    try {
        console.log('--- Checking Repayments Schema ---');
        const res = await client.query("SELECT * FROM repayments LIMIT 1");
        if (res.fields) {
            console.log('Columns:', res.fields.map(f => f.name));
        } else {
            console.log('No fields found.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkSchema();
