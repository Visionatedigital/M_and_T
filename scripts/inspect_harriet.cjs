
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function inspectHarriet() {
    await client.connect();

    try {
        const res = await client.query(`SELECT id, full_name FROM loan_applications WHERE full_name ILIKE '%Nakyeyune Harriet%'`);
        if (res.rowCount === 0) {
            console.log("No user found.");
            return;
        }
        const loanId = res.rows[0].id; // Mrs. Nakyeyune Harriet
        console.log(`Found ID: ${loanId} for ${res.rows[0].full_name}`);

        // Inspect Repayments
        console.log(`--- Inspecting Repayments ---`);
        const resRep = await client.query(`
      SELECT id, amount, payment_date::date as p_date, created_at
      FROM repayments
      WHERE loan_application_id = $1
      ORDER BY payment_date, amount
    `, [loanId]);

        console.log(`Total Repayments: ${resRep.rowCount}`); // Should mean total ~ 1,082,000
        console.table(resRep.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspectHarriet();
