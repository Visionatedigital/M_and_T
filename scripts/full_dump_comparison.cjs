
const ExcelJS = require('../server/node_modules/exceljs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

function superNormalize(name) {
    if (!name) return "";
    return name.toString().toLowerCase()
        .replace(/^(mr\.|mrs\.|ms\.|miss|dr\.|prof\.)\s+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function runAudit() {
    await client.connect();
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    try {
        console.log("Reading DB...");
        const resLoans = await client.query(`SELECT id, full_name, loan_amount FROM loan_applications`);
        const dbLoans = resLoans.rows.map(l => ({
            ...l,
            norm: superNormalize(l.full_name),
            matched: false
        }));

        console.log("Reading Excel...");
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        let excelTotal = 0;
        let matchedCount = 0;
        let unmatchedRows = [];

        for (let rowNumber = 3; rowNumber <= 706; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const name = row.getCell(2).value;
            const principal = row.getCell(3).value;
            if (!name) continue;

            const normExcel = superNormalize(name);
            const pNum = parseInt(principal || 0);
            excelTotal += pNum;

            const matchIdx = dbLoans.findIndex(l => !l.matched && l.norm === normExcel && parseInt(l.loan_amount) === pNum);

            if (matchIdx !== -1) {
                dbLoans[matchIdx].matched = true;
                matchedCount++;
            } else {
                unmatchedRows.push({ row: rowNumber, name, normExcel, principal: pNum });
            }
        }

        console.log("\n--- Audit Results ---");
        console.log(`Excel Total Rows (3-706): ${matchedCount + unmatchedRows.length}`);
        console.log(`Matched with DB:           ${matchedCount}`);
        console.log(`Unmatched (Missing/Title): ${unmatchedRows.length}`);

        if (unmatchedRows.length > 0) {
            console.log("\nSample Unmatched Rows (First 10):");
            unmatchedRows.slice(0, 10).forEach(u => {
                console.log(` - Row ${u.row}: "${u.name}" (Norm: "${u.normExcel}") | Principal: ${u.principal}`);
            });

            // Search for "ssentuyo yusuf" again but more carefully
            const sample = unmatchedRows[0];
            console.log(`\nSearching DB for possible matches for "${sample.normExcel}"...`);
            const similar = dbLoans.filter(l => l.norm.includes(sample.normExcel) || sample.normExcel.includes(l.norm));
            similar.forEach(s => {
                console.log(`   Found in DB: "${s.full_name}" (Norm: "${s.norm}") | Principal: ${s.loan_amount} | Matched: ${s.matched}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
runAudit();
