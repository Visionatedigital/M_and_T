
const ExcelJS = require('../server/node_modules/exceljs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function checkParity() {
    await client.connect();
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        const headers = worksheet.getRow(2).values;
        const findCol = (name) => {
            if (!Array.isArray(headers)) return -1;
            for (let i = 1; i < headers.length; i++) {
                if (headers[i] && headers[i].toString().toLowerCase().trim() === name.toLowerCase()) return i;
            }
            return -1;
        };

        const nameIdx = findCol('name');
        const principalIdx = findCol('principal');
        const paidIdx = findCol('paid');

        const resLoans = await client.query(`SELECT id, full_name, loan_amount FROM loan_applications`);
        const dbLoans = resLoans.rows;

        let matchedPaid = 0;
        let matchedCount = 0;
        let unmatchedDbCount = 0;

        const dbLoanStatus = dbLoans.map(l => ({ ...l, matched: false }));

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2) return;
            const name = row.getCell(nameIdx).value;
            const principal = row.getCell(principalIdx).value;
            const paidVal = row.getCell(paidIdx).value;

            if (!name) return;

            // Find match in DB (that hasn't been matched yet)
            const dbMatchIdx = dbLoanStatus.findIndex(l =>
                !l.matched &&
                l.full_name.trim().toLowerCase() === name.toString().trim().toLowerCase() &&
                parseInt(l.loan_amount) === parseInt(principal || 0)
            );

            if (dbMatchIdx !== -1) {
                dbLoanStatus[dbMatchIdx].matched = true;
                let paid = 0;
                if (typeof paidVal === 'object' && paidVal !== null) {
                    if (paidVal.result !== undefined) paid = parseFloat(paidVal.result);
                } else {
                    paid = parseFloat(paidVal || 0);
                }
                matchedPaid += paid;
                matchedCount++;
            }
        });

        const unmatched = dbLoanStatus.filter(l => !l.matched);

        console.log(`Matched Loans: ${matchedCount} / ${dbLoans.length}`);
        console.log(`Excel Paid for Matched: ${matchedPaid.toLocaleString()}`);
        console.log(`Target Paid:           165,549,925`);
        console.log(`Difference:            ${(matchedPaid - 165549925).toLocaleString()}`);

        if (unmatched.length > 0) {
            console.log(`\nUnmatched DB Loans (${unmatched.length}):`);
            unmatched.slice(0, 5).forEach(u => console.log(` - ${u.full_name} (${u.loan_amount})`));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkParity();
