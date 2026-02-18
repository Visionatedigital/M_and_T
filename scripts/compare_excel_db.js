
import ExcelJS from 'exceljs';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const { Client } = pg;

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function compareData() {
    await client.connect();
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    try {
        console.log("Reading Excel file...");
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        console.log("Fetching DB Data...");
        // Fetch all loans with their total repayments
        const res = await client.query(`
            SELECT 
                l.id, 
                l.full_name, 
                l.loan_amount, 
                l.total_amount_repaid,
                l.status
            FROM loan_applications l
        `);

        const dbLoans = res.rows;
        console.log(`DB Loans: ${dbLoans.length}`);

        let excelTotalPaid = 0;
        let dbTotalPaid = 0;
        let matchedCount = 0;
        let discrepancies = [];

        // Headers are row 1
        // Assuming columns based on file mapping:
        // Name: Col 2 (B)
        // Principal: Col 4 (D)
        // Total Paid: Col 6 (F)? Need to verify. 
        // Let's print headers first to be sure in the loop
        const headers = worksheet.getRow(1).values;
        // console.log("Headers:", headers);
        // Headers might be: [empty, 'No', 'Name', 'Period', 'Principal', 'Interest', 'Total', 'Paid', 'Bal']
        // Let's assume standard layout based on previous knowledge or just find 'Paid'

        const nameIdx = headers.findIndex(h => h && h.toString().toLowerCase().includes('name'));
        const principalIdx = headers.findIndex(h => h && h.toString().toLowerCase().includes('principal'));
        const paidIdx = headers.findIndex(h => h && h.toString().toLowerCase().includes('paid') && !h.toString().toLowerCase().includes('date')); // Avoid 'Date Paid'

        console.log(`Indices - Name: ${nameIdx}, Principal: ${principalIdx}, Paid: ${paidIdx}`);

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const name = row.getCell(nameIdx).value;
            const principal = row.getCell(principalIdx).value;
            const paid = row.getCell(paidIdx).value || 0;

            if (!name) return;

            excelTotalPaid += parseFloat(paid);

            // Find match in DB
            // formatting names might be tricky (case, spaces)
            const dbMatch = dbLoans.find(l =>
                l.full_name.trim().toLowerCase() === name.toString().trim().toLowerCase() &&
                parseInt(l.loan_amount) === parseInt(principal)
            );

            if (dbMatch) {
                matchedCount++;
                const dbPaid = parseFloat(dbMatch.total_amount_repaid || 0);
                dbTotalPaid += dbPaid;

                if (Math.abs(dbPaid - paid) > 1000) { // Tolerance of 1000 UGX
                    discrepancies.push({
                        name,
                        principal,
                        excelPaid: paid,
                        dbPaid: dbPaid,
                        diff: dbPaid - paid,
                        loanId: dbMatch.id
                    });
                }
            }
        });

        console.log(`\n--- Summary ---`);
        console.log(`Excel Total Paid: ${excelTotalPaid.toLocaleString()}`);
        console.log(`DB Total Paid (Matched Loans): ${dbTotalPaid.toLocaleString()}`);
        console.log(`Matched Loans: ${matchedCount}`);

        console.log(`\n--- Top 20 Discrepancies (DB - Excel) ---`);
        discrepancies.sort((a, b) => b.diff - a.diff);
        discrepancies.slice(0, 20).forEach(d => {
            console.log(`Name: ${d.name} | Principal: ${d.principal}`);
            console.log(`  Excel Paid: ${d.excelPaid.toLocaleString()} | DB Paid: ${d.dbPaid.toLocaleString()}`);
            console.log(`  Diff: ${d.diff.toLocaleString()} | ID: ${d.loanId}`);
        });

        // Also check Total Expected vs User's Number
        // User said Total Paid = 165,549,925
        console.log(`\nUser Target: 165,549,925`);
        console.log(`Excel Sum:   ${excelTotalPaid.toLocaleString()}`);
        console.log(`Delta:       ${(excelTotalPaid - 165549925).toLocaleString()}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

compareData();
