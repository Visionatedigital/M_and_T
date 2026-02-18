
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debugGrowth() {
    console.log('--- Debugging Growth Stats Logic ---');
    const client = await pool.connect();

    try {
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                name: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                start: new Date(d.getFullYear(), d.getMonth(), 1),
                end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
            });
        }

        console.log(`Checking ${months.length} months...`);

        const growthData = await Promise.all(months.map(async (month) => {
            // Disbursed
            let disQuery = `SELECT SUM(loan_amount) as total FROM loan_applications WHERE status IN ('disbursed', 'active') AND approved_at <= $1`;
            const { rows: disRows } = await client.query(disQuery, [month.end]);
            const cumulativePrincipal = parseFloat(disRows[0].total || 0);

            // Interest (30%)
            const cumulativeInterest = cumulativePrincipal * 0.30;

            // Repayments
            let repQuery = `SELECT SUM(amount) as total FROM repayments WHERE payment_date <= $1`;
            const { rows: repRows } = await client.query(repQuery, [month.end]);
            const cumulativeRepaid = parseFloat(repRows[0].total || 0);

            return {
                month: month.name,
                portfolioValue: (cumulativePrincipal + cumulativeInterest) / 1000000,
                cashCollected: cumulativeRepaid / 1000000,
                principalDisbursed: cumulativePrincipal / 1000000
            };
        }));

        console.table(growthData);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

debugGrowth();
