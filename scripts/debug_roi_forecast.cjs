
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debugRoiForecast() {
    console.log('--- Debugging ROI & Forecast Logic ---');
    const client = await pool.connect();

    try {
        // 1. Test ROI Stats Logic
        console.log('\n--- ROI Stats ---');
        let roiQuery = `
            SELECT 
                loan_product,
                SUM(loan_amount) as total_principal,
                COUNT(*) as loan_count,
                SUM(amount_paid) as total_repaid,
                SUM(loan_amount * 1.3) as total_expected
            FROM loan_applications
            LEFT JOIN (
                SELECT loan_application_id, SUM(amount) as amount_paid 
                FROM repayments 
                GROUP BY loan_application_id
            ) r ON loan_applications.id = r.loan_application_id
            WHERE status IN ('active', 'disbursed', 'completed')
            GROUP BY loan_product
        `;
        const { rows: roiRows } = await client.query(roiQuery);
        console.table(roiRows.map(r => ({
            product: r.loan_product,
            principal: r.total_principal,
            repaid: r.total_repaid || 0,
            expected: r.total_expected
        })));

        // 2. Test Forecast Logic (Historical Data Fetch)
        console.log('\n--- Forecast History ---');
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59));
        }

        for (const date of months) {
            let query = `
                SELECT SUM(loan_amount) as total 
                FROM loan_applications 
                WHERE status IN ('disbursed', 'active') 
                AND approved_at <= $1
            `;
            const { rows } = await client.query(query, [date]);
            const val = (parseFloat(rows[0].total || 0) * 1.3) / 1000000;
            console.log(`${date.toISOString().slice(0, 7)}: ${val.toFixed(2)}M`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

debugRoiForecast();
