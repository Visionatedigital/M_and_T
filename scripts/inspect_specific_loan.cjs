const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function inspectLoanRepayments() {
    await client.connect();
    // Miss Nalwada Phionah
    const loanId = '1c5563b5-eb81-4b2e-93e1-cf933021255c';

    try {
        console.log(`--- Inspecting Repayments for Loan ${loanId} ---`);
        const res = await client.query(`
      SELECT id, amount, payment_date::date as p_date, created_at
      FROM repayments
      WHERE loan_application_id = $1
      ORDER BY payment_date, amount
    `, [loanId]);

        console.log(`Total Repayments: ${res.rowCount}`);
        console.table(res.rows);

        // Check for duplicates (same amount, same date)
        const potentialDupes = [];
        for (let i = 0; i < res.rows.length - 1; i++) {
            const curr = res.rows[i];
            const next = res.rows[i + 1];
            // Check if date and amount match
            const d1 = new Date(curr.p_date).toISOString().split('T')[0];
            const d2 = new Date(next.p_date).toISOString().split('T')[0];

            if (d1 === d2 && curr.amount === next.amount) {
                potentialDupes.push({ original: curr, duplicate: next });
                i++; // Skip next one as we paired it
            }
        }

        if (potentialDupes.length > 0) {
            console.log(`\nFound ${potentialDupes.length} potential duplicate pairs based on Date + Amount:`);
            potentialDupes.forEach(p => {
                console.log(`  Pair: ${p.original.amount} on ${p.original.p_date}`);
                console.log(`    ID 1: ${p.original.id} (Created: ${p.original.created_at})`);
                console.log(`    ID 2: ${p.duplicate.id} (Created: ${p.duplicate.created_at})`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspectLoanRepayments();
