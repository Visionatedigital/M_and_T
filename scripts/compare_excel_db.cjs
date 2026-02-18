
const ExcelJS = require('../server/node_modules/exceljs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

async function compareData() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
    });

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
                COALESCE(SUM(r.amount), 0) as total_amount_repaid,
                l.status
            FROM loan_applications l
            LEFT JOIN repayments r ON l.id = r.loan_application_id
            GROUP BY l.id
        `);

        const dbLoans = res.rows;
        console.log(`DB Loans: ${dbLoans.length}`);

        let excelTotalPaid = 0;
        let dbTotalPaid = 0;
        let matchedCount = 0;
        let discrepancies = [];

        // Headers are on Row 2 based on debug output
        const headerRow = worksheet.getRow(2);
        const headers = headerRow.values;

        // Helper to find column index
        const findCol = (name) => {
            if (!Array.isArray(headers)) return -1;
            for (let i = 0; i < headers.length; i++) {
                if (headers[i] && headers[i].toString().toLowerCase().trim() === name.toLowerCase()) return i;
            }
            return -1;
        };

        const nameIdx = findCol('name'); // Should be 3
        const principalIdx = findCol('principal'); // Should be 4
        const paidIdx = findCol('paid'); // Should be 8 covering 'PAID'

        console.log(`Indices - Name: ${nameIdx}, Principal: ${principalIdx}, Paid: ${paidIdx}`);

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2) return; // Skip header rows

            const name = row.getCell(nameIdx).value;
            const principal = row.getCell(principalIdx).value;
            const paidVal = row.getCell(paidIdx).value;

            let paid = 0;
            if (typeof paidVal === 'object' && paidVal !== null) {
                if (paidVal.result !== undefined) paid = parseFloat(paidVal.result);
            } else {
                paid = parseFloat(paidVal || 0);
            }

            if (!name) return;

            excelTotalPaid += paid;

            // Find match in DB
            // formatting names might be tricky (case, spaces)
            const dbMatch = dbLoans.find(l =>
                l.full_name.trim().toLowerCase() === name.toString().trim().toLowerCase() &&
                parseInt(l.loan_amount) === parseInt(principal || 0)
            );

            if (dbMatch) {
                matchedCount++;
                const dbPaid = parseFloat(dbMatch.total_amount_repaid || 0);
                dbTotalPaid += dbPaid;

                if (Math.abs(dbPaid - paid) > 500) { // Tolerance
                    discrepancies.push({
                        row: rowNumber,
                        name,
                        principal: parseInt(principal || 0),
                        excelPaid: paid,
                        dbPaid: dbPaid,
                        diff: dbPaid - paid,
                        loanId: dbMatch.id
                    });
                }
            } else {
                // console.log(`No match for ${name}`);
            }
        });

        console.log(`\n--- Summary ---`);
        console.log(`Excel Total Paid: ${excelTotalPaid.toLocaleString()}`);
        console.log(`DB Total Paid (Matched): ${dbTotalPaid.toLocaleString()}`);
        console.log(`Matched Loans: ${matchedCount}`);

        console.log(`\n--- Top Discrepancies (DB Has More) ---`);
        const dbMore = discrepancies.filter(d => d.diff > 0).sort((a, b) => b.diff - a.diff);
        dbMore.slice(0, 50).forEach(d => {
            console.log(`Row ${d.row}: ${d.name} | P: ${d.principal.toLocaleString()}`);
            console.log(`  Excel: ${d.excelPaid.toLocaleString()} | DB: ${d.dbPaid.toLocaleString()} | Diff: +${d.diff.toLocaleString()}`);
            console.log(`  ID: ${d.loanId}`);
        });

        console.log(`\n--- Top Discrepancies (Excel Has More) ---`);
        const excelMore = discrepancies.filter(d => d.diff < 0).sort((a, b) => a.diff - b.diff); // most negative first
        excelMore.slice(0, 10).forEach(d => {
            console.log(`Row ${d.row}: ${d.name} | P: ${d.principal.toLocaleString()}`);
            console.log(`  Excel: ${d.excelPaid.toLocaleString()} | DB: ${d.dbPaid.toLocaleString()} | Diff: ${d.diff.toLocaleString()}`);
            console.log(`  ID: ${d.loanId}`);
        });


    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

compareData();
