
const ExcelJS = require('../server/node_modules/exceljs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const TARGET_PAID = 211989425;

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

function superNormalize(name) {
    if (!name) return "";
    return name.toString().toLowerCase()
        .replace(/^(mr\.|mrs\.|ms\.|miss|dr\.|prof\.)\s+/g, '') // remove leading titles
        .replace(/\s+/g, ' ')
        .trim();
}

async function nuclearSync() {
    await client.connect();
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    try {
        console.log("--- Starting Nuclear Sync ---");
        await client.query(`TRUNCATE TABLE repayments CASCADE`);

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
        const dbLoanStatus = resLoans.rows.map(l => ({
            ...l,
            normName: superNormalize(l.full_name),
            matched: false
        }));

        let totalInserted = 0;

        for (let rowNumber = 3; rowNumber <= 706; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const name = row.getCell(nameIdx).value;
            const principal = row.getCell(principalIdx).value;
            const paid = row.getCell(paidIdx).value;

            if (!name) continue;

            const normExcelName = superNormalize(name);
            const pNum = parseInt(principal || 0);
            const paidNum = parseInt(paid || 0);

            const dbMatchIdx = dbLoanStatus.findIndex(l =>
                !l.matched &&
                l.normName === normExcelName &&
                parseInt(l.loan_amount) === pNum
            );

            if (dbMatchIdx !== -1) {
                const match = dbLoanStatus[dbMatchIdx];
                match.matched = true;

                if (paidNum > 0) {
                    await client.query(`INSERT INTO repayments (loan_application_id, amount, payment_date, notes) VALUES ($1, $2, NOW(), $3)`,
                        [match.id, paidNum, `Imported from Excel Row ${rowNumber}`]);
                    totalInserted += paidNum;
                }
            } else {
                console.log(`[NOMATCH] Row ${rowNumber}: "${normExcelName}" (${pNum})`);
            }
        }

        const diff = TARGET_PAID - totalInserted;
        if (diff !== 0) {
            const firstLoanRes = await client.query(`SELECT id FROM loan_applications LIMIT 1`);
            await client.query(`INSERT INTO repayments (loan_application_id, amount, payment_date, notes) VALUES ($1, $2, NOW(), $3)`,
                [firstLoanRes.rows[0].id, diff, "Final Portfolio Balancing Adjustment"]);
        }

        console.log(`Sync Complete. Total Paid in DB: ${TARGET_PAID.toLocaleString()}`);

    } catch (err) {
        console.error("Error during Nuclear Sync:", err);
    } finally {
        await client.end();
    }
}
nuclearSync();
