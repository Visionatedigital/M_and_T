
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'MandT',
    password: 'Sundaylover12',
    port: 5432,
});

async function checkDbTotals() {
    try {
        await client.connect();

        // Check Loan Applications count and sum
        const res = await client.query(`
            SELECT 
                COUNT(*) as count,
                SUM(loan_amount) as total_principal,
                SUM(amount_paid) as total_paid_db
            FROM loan_applications
        `);

        const row = res.rows[0];
        console.log('--- DB Totals (Loan Applications) ---');
        console.log('Count:', row.count);
        console.log('Total Principal:', parseFloat(row.total_principal).toLocaleString());
        console.log('Total Paid (Column):', parseFloat(row.total_paid_db).toLocaleString());

        // Check Repayments table
        const resRep = await client.query(`SELECT SUM(amount) as total_repaid FROM repayments`);
        console.log('Total Repaid (Repayments Table):', parseFloat(resRep.rows[0].total_repaid).toLocaleString());

        // Check for duplicates by loan_id (if it exists) or external_id
        // Let's assume there is an external_id or we can group by full_name, loan_amount, created_at

        // Check if we have a loan_id column? 
        // I will just check duplicates by (full_name, loan_amount, loan_product)
        const dupCheck = await client.query(`
            SELECT full_name, loan_amount, COUNT(*) 
            FROM loan_applications 
            GROUP BY full_name, loan_amount 
            HAVING COUNT(*) > 1 
            ORDER BY COUNT(*) DESC 
            LIMIT 5
        `);

        console.log('--- Top Duplicates ---');
        dupCheck.rows.forEach(r => {
            console.log(`${r.full_name} (${r.loan_amount}): ${r.count} copies`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

checkDbTotals();
