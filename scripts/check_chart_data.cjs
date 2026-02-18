
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkChart() {
    console.log('--- Checking Chart Data (Post-Fix) ---');
    const client = await pool.connect();

    try {
        const months = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                name: d.toLocaleString('default', { month: 'short' }),
                start: new Date(d.getFullYear(), d.getMonth(), 1),
                end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
            });
        }

        const stats = await Promise.all(months.map(async (m) => {
            const res = await client.query(`
                SELECT SUM(loan_amount) as total
                FROM loan_applications
                WHERE status IN ('disbursed', 'active')
                AND approved_at >= $1 AND approved_at <= $2
            `, [m.start, m.end]);
            return {
                month: m.name,
                disbursed: res.rows[0].total || '0'
            };
        }));

        console.table(stats);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkChart();
