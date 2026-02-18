
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkDates() {
    console.log('--- Checking Created vs Approved Dates ---');
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                id, created_at, approved_at, status
            FROM loan_applications
            WHERE created_at < '2025-01-01'
            LIMIT 10
        `);
        console.table(res.rows.map(r => ({
            id: r.id.substring(0, 8),
            status: r.status,
            created: r.created_at ? r.created_at.toISOString() : 'NULL',
            approved: r.approved_at ? r.approved_at.toISOString() : 'NULL'
        })));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkDates();
