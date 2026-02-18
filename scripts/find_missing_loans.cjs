
const ExcelJS = require('../server/node_modules/exceljs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function findMissingLoans() {
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
        const statusIdx = findCol('status');

        const resLoans = await client.query(`SELECT full_name, loan_amount FROM loan_applications`);
        const dbLoans = resLoans.rows.map(l => ({
            name: l.full_name.trim().toLowerCase(),
            principal: parseInt(l.loan_amount)
        }));

        const missing = [];
        const seenInExcel = new Set();

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2 || rowNumber >= 707) return; // skip headers and summary

            const name = row.getCell(nameIdx).value;
            const principalVal = row.getCell(principalIdx).value;
            const status = row.getCell(statusIdx).value || 'Unknown';

            if (!name) return;

            const nameStr = name.toString().trim().toLowerCase();
            const pNum = parseInt(principalVal || 0);

            // Check if this specific combo exists in DB
            const exists = dbLoans.some(l => l.name === nameStr && l.principal === pNum);

            if (!exists) {
                missing.push({ row: rowNumber, name: name.toString(), principal: pNum, status: status });
            }
        });

        console.log(`\nFound ${missing.length} loans in Excel missing from DB.`);
        console.log("\nSample Missing Loans:");
        missing.slice(0, 20).forEach(m => console.log(` - Row ${m.row}: ${m.name} (${m.principal.toLocaleString()}) [${m.status}]`));

        const totalMissingPrincipal = missing.reduce((sum, m) => sum + m.principal, 0);
        console.log(`\nTotal Missing Principal: ${totalMissingPrincipal.toLocaleString()}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

findMissingLoans();
