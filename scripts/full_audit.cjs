
const ExcelJS = require('../server/node_modules/exceljs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function fullAudit() {
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

        const resLoans = await client.query(`SELECT id, full_name, loan_amount FROM loan_applications`);
        const dbLoans = resLoans.rows.map(l => ({
            id: l.id,
            name: l.full_name.trim().toLowerCase(),
            principal: parseInt(l.loan_amount),
            matched: false
        }));

        const excelRows = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2 || rowNumber >= 707) return;
            const name = row.getCell(nameIdx).value;
            const principal = row.getCell(principalIdx).value;
            if (name) {
                excelRows.push({
                    name: name.toString().trim().toLowerCase(),
                    principal: parseInt(principal || 0),
                    matched: false
                });
            }
        });

        // Match
        excelRows.forEach(er => {
            const dbIdx = dbLoans.findIndex(dl => !dl.matched && dl.name === er.name && dl.principal === er.principal);
            if (dbIdx !== -1) {
                dbLoans[dbIdx].matched = true;
                er.matched = true;
            }
        });

        const inBoth = excelRows.filter(r => r.matched);
        const onlyExcel = excelRows.filter(r => !r.matched);
        const onlyDb = dbLoans.filter(r => !r.matched);

        console.log(`--- Global Audit ---`);
        console.log(`Excel Sum (data only): ${excelRows.reduce((s, r) => s + r.principal, 0).toLocaleString()}`);
        console.log(`DB Sum:               ${dbLoans.reduce((s, r) => s + r.principal, 0).toLocaleString()}`);

        console.log(`\nResults:`);
        console.log(` - Matched in Both:   ${inBoth.length} loans (${inBoth.reduce((s, r) => s + r.principal, 0).toLocaleString()})`);
        console.log(` - Only in Excel:     ${onlyExcel.length} loans (${onlyExcel.reduce((s, r) => s + r.principal, 0).toLocaleString()})`);
        console.log(` - Only in DB:        ${onlyDb.length} loans (${onlyDb.reduce((s, r) => s + r.principal, 0).toLocaleString()})`);

        if (onlyDb.length > 0) {
            console.log(`\nSample DB-Only Loans:`);
            onlyDb.slice(0, 5).forEach(d => console.log(` - ${d.name} (${d.principal.toLocaleString()})`));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

fullAudit();
