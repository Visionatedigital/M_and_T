
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function safeSync() {
    console.log('--- Full Sync Repayments (MT_ADMIN_fixed) ---');
    const client = await pool.connect();

    try {
        // 1. Load Excel Data
        const filePath = path.join(process.cwd(), 'public', 'MT_ADMIN_fixed.xlsx.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheetName = 'Sheet1';
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        console.log(`Loaded ${data.length} rows from Excel.`);

        // 2. Load All Active Loans with Profiles
        const loansRes = await client.query(`
            SELECT 
                la.id, la.loan_amount, la.status, 
                p.full_name, la.id_number, p.phone_number,
                g.group_name
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            LEFT JOIN groups g ON la.group_id = g.id
            WHERE la.status = 'disbursed' OR la.status = 'active'
        `);
        const loans = loansRes.rows;
        console.log(`Loaded ${loans.length} active loans from DB.`);

        let matchedCount = 0;
        let diffCount = 0;
        let skippedCount = 0;
        let updatedCount = 0;

        // Skip header row (Index 0 is headers based on previous check)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length < 5) continue;

            // Map Columns
            // [0] Released, [1] Name, [2] Principal, [3] Paid, [4] Balance, [5] Group, 
            // [13] Mobile, [19] NIN

            const name = row[1];
            const principal = parseFloat(row[2]);
            const paid = parseFloat(row[3]);
            const balance = parseFloat(row[4]);
            const group = row[5];
            const mobile = row[13];
            const nin = row[19];

            if (!name || isNaN(principal)) continue;

            // Matching Logic
            let match = null;

            // 1. Try NIN Match
            if (nin && typeof nin === 'string' && nin.length > 5) {
                match = loans.find(l => l.id_number && l.id_number.includes(nin));
            }

            // 2. Try Name Match (Exact or Fuzzy)
            if (!match && name) {
                // Remove titles like "Mr.", "Mrs." for better matching
                const cleanName = name.replace(/Mr\.|Mrs\.|Ms\./yi, '').trim().toLowerCase();
                match = loans.find(l => {
                    const dbName = l.full_name.toLowerCase();
                    return dbName.includes(cleanName) || cleanName.includes(dbName);
                });
            }

            // 3. Verify Principal matches (safety check)
            if (match) {
                const dbAmount = parseFloat(match.loan_amount);
                // Allow 1.0 diff for floats
                if (Math.abs(dbAmount - principal) > 50000) {
                    console.log(`⚠️ MISMATCH detected for ${name}: Excel Amount ${principal} != DB Amount ${dbAmount}. Skipping.`);
                    match = null; // Unsafe to match
                }
            }

            if (match) {
                matchedCount++;

                // Check Repayments
                const repRes = await client.query("SELECT SUM(amount) as total FROM repayments WHERE loan_application_id = $1", [match.id]);
                const existingPaid = parseFloat(repRes.rows[0].total || '0');

                // Allow small difference (e.g. 1000 UGX)
                if (Math.abs(existingPaid - paid) > 1000) {
                    const diff = paid - existingPaid;

                    if (diff > 0) {
                        console.log(`MATCH: ${name} (NIN: ${nin})`);
                        console.log(`  Excel: Paid ${paid}, DB: Paid ${existingPaid}`);
                        console.log(`  -> Adding Repayment: ${diff}`);
                        diffCount++;

                        // UNCOMMENT TO EXECUTE
                        await client.query(`
                            INSERT INTO repayments (id, loan_application_id, amount, payment_date, recorded_by)
                            VALUES (gen_random_uuid(), $1, $2, NOW(), $3)
                        `, [match.id, diff, '00000000-0000-0000-0000-000000000000']);
                        updatedCount++;
                    } else {
                        console.log(`WARNING: ${name} DB has MORE paid (${existingPaid}) than Excel (${paid}). Ignoring.`);
                    }
                }
            } else {
                // If it's a 700k/500k loan we care about, log it
                if (principal > 100000) {
                    console.log(`NO MATCH for: ${name} (Amount: ${principal}, Group: ${group})`);
                    skippedCount++;
                }
            }
        }

        console.log(`\nSummary:`);
        console.log(`  Matched Loans: ${matchedCount}`);
        console.log(`  Actual Updates: ${updatedCount}`);
        console.log(`  No Match Found: ${skippedCount}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

safeSync();
