
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Banned NINs (User confirming they are errors)
const BANNED_NINS = [
    'CM91052105JPQJ', 'CF9605210AJCLK', 'CM9905210RQE9K',
    'CM99100109N2VL', 'CF75009105FV1G', 'CF8705210FDMGH',
    'CF9605210AJCLK'
];

async function syncConflicts() {
    console.log('--- Syncing Conflicts & Multi-Loans ---');
    const client = await pool.connect();

    try {
        const filePath = path.join(process.cwd(), 'public', 'MT_ADMIN_fixed.xlsx.xlsx');
        const workbook = XLSX.readFile(filePath);
        const data = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1'], { header: 1 }) as any[][];

        // Load DB Loans
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

        let updatedCount = 0;

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length < 5) continue;

            const name = row[1];
            const principal = parseFloat(row[2]);
            const paid = parseFloat(row[3]);
            const nin = row[19];

            if (!name || isNaN(principal)) continue;

            let matches = [];

            // 1. Check if NIN is Banned
            if (nin && BANNED_NINS.includes(nin)) {
                console.log(`Skipping Banned NIN ${nin} for ${name}. Fallback to Name.`);
                // Name match only
                const cleanName = name.replace(/Mr\.|Mrs\.|Ms\./yi, '').trim().toLowerCase();
                matches = loans.filter(l => l.full_name.toLowerCase().includes(cleanName));
            } else if (nin && nin.length > 5) {
                // Normal NIN match
                matches = loans.filter(l => l.id_number && l.id_number.includes(nin));
            }

            // Fallback to name if no NIN match
            if (matches.length === 0) {
                const cleanName = name.replace(/Mr\.|Mrs\.|Ms\./yi, '').trim().toLowerCase();
                matches = loans.filter(l => l.full_name.toLowerCase().includes(cleanName));
            }

            // Filter matches by Principal Amount (approx match)
            matches = matches.filter(l => Math.abs(parseFloat(l.loan_amount) - principal) < 50000);

            if (matches.length > 0) {
                // If multiple matches, we need to pick one that hasn't been fully paid?
                // Or simply pick the one with matching "Paid" amount?
                // Actually, for multiple loans, we might need to be careful not to double-apply.

                // Strategy: Check if THIS specific repayment amount exists in ANY of the matches?
                // Or just find the first match that needs update?

                let targetLoan = null;
                for (const match of matches) {
                    const repRes = await client.query("SELECT SUM(amount) as total FROM repayments WHERE loan_application_id = $1", [match.id]);
                    const existingPaid = parseFloat(repRes.rows[0].total || '0');

                    // If existing paid is DIFFERENT, this might be the loan to update
                    if (Math.abs(existingPaid - paid) > 1000) {
                        targetLoan = match;
                        break;
                    }
                }

                if (targetLoan) {
                    const repRes = await client.query("SELECT SUM(amount) as total FROM repayments WHERE loan_application_id = $1", [targetLoan.id]);
                    const existingPaid = parseFloat(repRes.rows[0].total || '0');
                    const diff = paid - existingPaid;

                    if (diff > 0) {
                        console.log(`MATCH: ${name} (Amount: ${principal})`);
                        console.log(`  -> Adding Repayment: ${diff} to Loan ${targetLoan.id}`);

                        await client.query(`
                            INSERT INTO repayments (id, loan_application_id, amount, payment_date, recorded_by)
                            VALUES (gen_random_uuid(), $1, $2, NOW(), $3)
                        `, [targetLoan.id, diff, '00000000-0000-0000-0000-000000000000']);
                        updatedCount++;
                    }
                }
            }
        }

        console.log(`\nUpdated ${updatedCount} loans.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

syncConflicts();
