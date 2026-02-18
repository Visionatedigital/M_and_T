
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function cleanup() {
    console.log('--- Cleaning up Duplicate Repayment ---');
    const client = await pool.connect();
    try {
        const idToDelete = '63943e17-3952-4650-98cd-bc8138061355'; // The first one with dummy recorder

        const res = await client.query("DELETE FROM repayments WHERE id = $1 RETURNING *", [idToDelete]);
        console.log('Deleted Repayment:', res.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

cleanup();
