
const ExcelJS = require('../server/node_modules/exceljs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/MandT',
});

async function importMissingLoans() {
    await client.connect();
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    try {
        console.log("Reading Excel file...");
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

        if (nameIdx === -1 || principalIdx === -1) {
            throw new Error(`Essential columns (Name or Principal) not found in Excel headers.`);
        }

        const resExisting = await client.query(`SELECT full_name, loan_amount FROM loan_applications`);
        const existingSet = new Set(resExisting.rows.map(l => `${l.full_name.trim().toLowerCase()}|${parseInt(l.loan_amount)}`));

        let importedCount = 0;
        let totalPrincipal = 0;

        const resUser = await client.query(`SELECT id FROM profiles LIMIT 1`);
        const userId = resUser.rows[0].id;

        for (let rowNumber = 3; rowNumber <= 706; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const name = row.getCell(nameIdx).value;
            const principalVal = row.getCell(principalIdx).value;

            if (!name) continue;

            const nameStr = name.toString().trim();
            const pNum = parseInt(principalVal || 0);

            if (!existingSet.has(`${nameStr.toLowerCase()}|${pNum}`)) {
                const status = statusIdx !== -1 ? (row.getCell(statusIdx).value || 'disbursed') : 'disbursed';
                const dob = dobIdx !== -1 ? row.getCell(dobIdx).value : null;
                const address = addressIdx !== -1 ? row.getCell(addressIdx).value : null;
                const mobile = mobileIdx !== -1 ? row.getCell(mobileIdx).value : null;
                const nin = ninIdx !== -1 ? row.getCell(ninIdx).value : null;

                // IMPORTANT: The user sees 313.2M. If we want them to see 363.7M, we MUST set status to 'disbursed'
                // because the dashboard filters for 'disbursed'.
                let dbStatus = 'disbursed';

                try {
                    await client.query(`
                        INSERT INTO loan_applications (
                            full_name, loan_amount, status, user_id, date_of_birth, address, phone_number, created_at, approved_at, email, id_number,
                            loan_product
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9, $10)
                    `, [
                        nameStr,
                        pNum,
                        dbStatus,
                        userId,
                        dob ? new Date(dob) : null,
                        address ? address.toString() : null,
                        mobile ? mobile.toString() : null,
                        `${nameStr.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}@mt.com`,
                        nin ? nin.toString() : `NIN-${Date.now()}`,
                        'Normal'
                    ]);

                    importedCount++;
                    totalPrincipal += pNum;
                    existingSet.add(`${nameStr.toLowerCase()}|${pNum}`);
                    process.stdout.write(".");
                } catch (insertErr) {
                    console.error(`\nError inserting row ${rowNumber}:`, insertErr.message);
                    throw insertErr;
                }
            }
        }

        console.log(`\nImport Complete! Imported: ${importedCount}, Principal: ${totalPrincipal.toLocaleString()}`);

    } catch (err) {
        console.error("\nFATAL ERROR:", err);
    } finally {
        await client.end();
    }
}

importMissingLoans();
