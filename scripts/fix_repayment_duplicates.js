
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function fixDuplicates() {
    await client.connect();

    // Dry Run Mode? Set to true to just list, false to delete
    const DRY_RUN = false;

    try {
        console.log(`--- Identifying Duplicate Repayments (Batch ~06:44) ---`);

        // Find potential duplicates: Created in the 06:40-06:50 window
        // Adjust time window as needed based on analysis (06:44 was the key time)
        // We are looking for records created today (2026-02-15) between 06:40 and 06:50 UTC? 
        // The logs showed 2026-02-15T06:44:42.906Z. 

        const startWindow = '2026-02-15 06:40:00+00';
        const endWindow = '2026-02-15 06:50:00+00';

        const res = await client.query(`
      SELECT * 
      FROM repayments 
      WHERE created_at >= $1 AND created_at <= $2
    `, [startWindow, endWindow]);

        console.log(`Found ${res.rowCount} repayments in the suspect window.`);

        let deletableCount = 0;
        let deletableValue = 0;
        const toDeleteIds = [];

        for (const record of res.rows) {
            // Check other repayments for this loan
            const resOther = await client.query(`
            SELECT SUM(amount) as total
            FROM repayments
            WHERE loan_application_id = $1
            AND id != $2
        `, [record.loan_application_id, record.id]);

            const otherSum = parseFloat(resOther.rows[0].total || 0);
            const thisAmount = parseFloat(record.amount);

            // Logic: If other payments exist and sum up to roughly this amount (or more/less?)
            // In our analysis: 278k + 405k = 683k. This record = 683k.
            // So OtherSum == ThisAmount.

            const diff = Math.abs(otherSum - thisAmount);

            // Tolerance?
            if (diff < 2000) { // Exact match or close
                // console.log(`[DELETE CANDIDATE] Loan ${record.loan_application_id}: This=${thisAmount}, OtherSum=${otherSum}`);
                deletableCount++;
                deletableValue += thisAmount;
                toDeleteIds.push(record.id);
            } else {
                // console.log(`[KEEP?] Loan ${record.loan_application_id}: This=${thisAmount}, OtherSum=${otherSum} (Diff: ${diff})`);
                // If OtherSum is 0, this is the ONLY payment. KEEP IT.
            }
        }

        console.log(`\nSummary:`);
        console.log(`Total Candidates: ${res.rowCount}`);
        console.log(`Matched as Redundant (Sum matches others): ${deletableCount}`);
        console.log(`Total Value to Remove: ${deletableValue.toLocaleString()}`);

        if (toDeleteIds.length > 0) {
            if (DRY_RUN) {
                console.log("DRY RUN: No records deleted.");
            } else {
                console.log("Deleting records...");
                // Batch delete
                // Postgres limit on params? 360 records is fine.
                // Split if too huge, but < 1000 is safe.
                const query = `DELETE FROM repayments WHERE id = ANY($1::uuid[])`;
                await client.query(query, [toDeleteIds]);
                console.log("Deletion Complete.");
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

fixDuplicates();
