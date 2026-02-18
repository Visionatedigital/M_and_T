
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

function safeDate(val) {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return d;
}

async function dynamicImport() {
    await client.connect();
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    try {
        const resCols = await client.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'loan_applications'`);
        const columns = resCols.rows;

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
        const dobIdx = findCol('dob');
        const addressIdx = findCol('address');
        const mobileIdx = findCol('mobile');
        const ninIdx = findCol('nin') !== -1 ? findCol('nin') : findCol('nin number');

        const resExisting = await client.query(`SELECT full_name, loan_amount FROM loan_applications`);
        const existingLoans = resExisting.rows.map(l => ({
            norm: superNormalize(l.full_name),
            amount: parseInt(l.loan_amount),
            matched: false
        }));

        const resUser = await client.query(`SELECT id FROM profiles LIMIT 1`);
        const userId = resUser.rows[0].id;

        let importedCount = 0;

        for (let rowNumber = 3; rowNumber <= 706; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const name = row.getCell(nameIdx).value;
            const principalVal = row.getCell(principalIdx).value;

            if (!name) continue;
            const normName = superNormalize(name);
            const pNum = parseInt(principalVal || 0);

            // STATEFUL MATCHING: Find an unmatched loan in DB
            const matchIdx = existingLoans.findIndex(l => !l.matched && l.norm === normName && l.amount === pNum);

            if (matchIdx !== -1) {
                // Already in DB, mark as matched so next Excel row with same name/amt can be imported
                existingLoans[matchIdx].matched = true;
            } else {
                // Not in DB (or not enough copies in DB), so IMPORT
                const data = {
                    full_name: name.toString().trim(),
                    loan_amount: pNum,
                    status: 'disbursed',
                    user_id: userId,
                    email: `${normName.replace(/[^a-z0-9]/g, '')}_${Date.now()}@mt.com`,
                    id_number: row.getCell(ninIdx).value ? row.getCell(ninIdx).value.toString() : `NIN-${Date.now()}`,
                    loan_product: 'Individual Loan',
                    created_at: new Date(),
                    updated_at: new Date(),
                    approved_at: new Date(),
                    phone_number: row.getCell(mobileIdx).value ? row.getCell(mobileIdx).value.toString() : '0000000000',
                    address: row.getCell(addressIdx).value ? row.getCell(addressIdx).value.toString() : 'N/A',
                    date_of_birth: safeDate(row.getCell(dobIdx).value) || new Date('1990-01-01')
                };

                columns.forEach(col => {
                    if (col.is_nullable === 'NO' && data[col.column_name] === undefined && col.column_name !== 'id') {
                        if (col.data_type.includes('int') || col.data_type.includes('decimal') || col.data_type.includes('numeric')) {
                            data[col.column_name] = 0;
                        } else if (col.data_type.includes('timestamp') || col.data_type.includes('date')) {
                            data[col.column_name] = new Date();
                        } else {
                            data[col.column_name] = 'N/A';
                        }
                    }
                });

                const keys = Object.keys(data).filter(k => columns.some(c => c.column_name === k));
                const vals = keys.map(k => data[k]);
                const query = `INSERT INTO loan_applications (${keys.join(', ')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(', ')})`;

                try {
                    await client.query(query, vals);
                    importedCount++;
                    // Add to existingLoans so we don't import again if Excel has even more copies
                    existingLoans.push({ norm: normName, amount: pNum, matched: true });
                } catch (err) {
                    console.error(`Error row ${rowNumber} (${normName}):`, err.message);
                    throw err;
                }
            }
        }
        console.log(`Import Complete! Imported ${importedCount} loans.`);
    } catch (err) {
        console.error("FATAL:", err);
    } finally {
        await client.end();
    }
}
dynamicImport();
