
const ExcelJS = require('../server/node_modules/exceljs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function fixMismatches() {
    await client.connect();
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    // DRY RUN: Set to false to apply changes
    const DRY_RUN = false;

    try {
        console.log("Reading Excel file...");
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        // Header logic from compare script
        const headers = worksheet.getRow(2).values;
        const findCol = (name) => {
            if (!Array.isArray(headers)) return -1;
            for (let i = 0; i < headers.length; i++) {
                if (headers[i] && headers[i].toString().toLowerCase().trim() === name.toLowerCase()) return i;
            }
            return -1;
        };

        const nameIdx = findCol('name');
        const principalIdx = findCol('principal');
        const paidIdx = findCol('paid');

        console.log(`Indices - Name: ${nameIdx}, Principal: ${principalIdx}, Paid: ${paidIdx}`);

        // Fetch all loans and their payments
        const resLoans = await client.query(`SELECT id, full_name, loan_amount FROM loan_applications`);
        const dbLoans = resLoans.rows;

        const resRepayments = await client.query(`SELECT id, loan_application_id, amount, created_at FROM repayments`);
        const repaymentMap = {}; // loan_id -> [records]
        resRepayments.rows.forEach(r => {
            if (!repaymentMap[r.loan_application_id]) repaymentMap[r.loan_application_id] = [];
            repaymentMap[r.loan_application_id].push(r);
        });

        const toDeleteIds = [];
        const toInsert = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2) return;

            const name = row.getCell(nameIdx).value;
            const principal = row.getCell(principalIdx).value;
            const paidVal = row.getCell(paidIdx).value;

            let excelPaid = 0;
            if (typeof paidVal === 'object' && paidVal !== null) {
                if (paidVal.result !== undefined) excelPaid = parseFloat(paidVal.result);
            } else {
                excelPaid = parseFloat(paidVal || 0);
            }

            if (!name) return;

            // Find match in DB
            const dbMatch = dbLoans.find(l =>
                l.full_name.trim().toLowerCase() === name.toString().trim().toLowerCase() &&
                parseInt(l.loan_amount) === parseInt(principal || 0)
            );

            if (dbMatch) {
                const payments = repaymentMap[dbMatch.id] || [];
                const dbTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

                const diff = dbTotal - excelPaid;

                // Case 1: DB has EXCESS (DB > Excel)
                if (diff > 1000) {
                    // Check if any single payment matches Excel Total exactly
                    const exactMatch = payments.find(p => Math.abs(parseFloat(p.amount) - excelPaid) < 500);

                    if (exactMatch) {
                        // We found a payment that matches Excel. Delete the others.
                        const others = payments.filter(p => p.id !== exactMatch.id);
                        others.forEach(o => {
                            toDeleteIds.push(o.id);
                            console.log(`[DELETE] Loan ${name}: DB Total ${dbTotal}, Excel ${excelPaid}. Keep ${exactMatch.amount}, Delete ${o.amount}`);
                        });
                    } else {
                        // No exact match. Complex case.
                        // Maybe duplicate exact amounts?
                        // If we have multiple payments of X, and Total = 2X, but Excel = X.
                        // Check if removing one makes it equal?
                        // Let's stick to EXACT Match logic first to be safe.
                        console.log(`[SKIP EXCESS] Loan ${name}: DB ${dbTotal}, Excel ${excelPaid}. No single payment matches Excel.`);
                    }
                }

                // Case 2: DB Match MISSING (DB < Excel)
                if (diff < -1000) {
                    const missing = excelPaid - dbTotal;
                    toInsert.push({
                        loan_application_id: dbMatch.id,
                        amount: missing,
                        name: name
                    });
                    console.log(`[INSERT] Loan ${name}: DB ${dbTotal}, Excel ${excelPaid}. Insert ${missing}`);
                }
            }
        });

        console.log(`\n--- Execution ---`);
        if (DRY_RUN) {
            console.log(`DRY RUN: Would delete ${toDeleteIds.length} records and insert ${toInsert.length} records.`);
        } else {
            console.log("Applying changes...");
            // Deletes
            if (toDeleteIds.length > 0) {
                await client.query(`DELETE FROM repayments WHERE id = ANY($1::uuid[])`, [toDeleteIds]);
                console.log(`Deleted ${toDeleteIds.length} records.`);
            }

            // Inserts
            for (const item of toInsert) {
                await client.query(`
                    INSERT INTO repayments (loan_application_id, amount, payment_date, notes)
                    VALUES ($1, $2, NOW(), 'Auto-correction to match Excel')
                `, [item.loan_application_id, item.amount]);
            }
            console.log(`Inserted ${toInsert.length} records.`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

fixMismatches();
