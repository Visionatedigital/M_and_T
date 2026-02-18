
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Helper to parse DD/MM/YYYY
function parseDate(dateStr: string) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.trim().split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-based
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    // Adjust to Noon to avoid timezone shifting to previous day
    date.setHours(12, 0, 0, 0);
    return date;
}

async function backdateLoans() {
    console.log('--- Backdating Loans & Updating DOBs ---');
    const client = await pool.connect();

    try {
        const filePath = path.join(process.cwd(), 'public', 'MT_ADMIN_fixed.xlsx.xlsx');
        const workbook = XLSX.readFile(filePath);
        const data = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1'], { header: 1 }) as any[][];

        // Load DB Loans
        const loansRes = await client.query(`
            SELECT 
                la.id, la.loan_amount, la.created_at,
                p.id as user_id, p.full_name, la.id_number, p.phone_number
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            WHERE la.status = 'disbursed' OR la.status = 'active'
        `);
        const loans = loansRes.rows;

        let updatedLoans = 0;
        let updatedDOBs = 0;

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length < 5) continue;

            const releasedStr = row[0]; // Col 0
            const name = row[1];
            const principal = parseFloat(row[2]);
            const dobStr = row[10];     // Col 10
            const nin = row[19];

            if (!name || isNaN(principal)) continue;

            // Matching Logic (Same as Sync)
            let match = null;
            if (nin && typeof nin === 'string' && nin.length > 5) {
                match = loans.find(l => l.id_number && l.id_number.includes(nin));
            }
            if (!match && name) {
                const cleanName = name.replace(/Mr\.|Mrs\.|Ms\./yi, '').trim().toLowerCase();
                match = loans.find(l => l.full_name.toLowerCase().includes(cleanName));
            }

            // Verify Principal
            if (match && Math.abs(parseFloat(match.loan_amount) - principal) > 50000) {
                match = null;
            }

            if (match) {
                // 1. Update Loan Date (Released)
                const releaseDate = parseDate(releasedStr);
                if (releaseDate) {
                    // Update created_at
                    await client.query(`
                        UPDATE loan_applications 
                        SET created_at = $1 
                        WHERE id = $2
                    `, [releaseDate.toISOString(), match.id]);
                    updatedLoans++;
                }

                // 2. Update DOB (in loan_applications based on schema)
                const dobDate = parseDate(dobStr);
                if (dobDate) {
                    await client.query(`
                        UPDATE loan_applications 
                        SET date_of_birth = $1 
                        WHERE id = $2
                    `, [dobDate.toISOString(), match.id]);
                    updatedDOBs++;
                }
            }
        }

        console.log(`\nSummary:`);
        console.log(`  Backdated Loans: ${updatedLoans}`);
        console.log(`  Updated DOBs: ${updatedDOBs}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

backdateLoans();
