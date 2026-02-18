
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkProjections() {
    console.log('--- Historical Loan Projections ---');
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM') as month,
                COUNT(*) as loan_count,
                SUM(loan_amount) as total_disbursed
            FROM loan_applications
            WHERE status = 'disbursed' OR status = 'active'
            GROUP BY month
            ORDER BY month
        `);
        console.table(res.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkProjections();
