
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../server/node_modules/exceljs'));

async function findAbaasaFull() {
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(1);

    console.log('--- ABAASA FULL DETAILS ---');

    sheet.eachRow((row, rowNumber) => {
        const name = row.getCell(2).value?.toString() || '';
        if (name.includes('ABAASA')) {
            console.log(`\nRow ${rowNumber}:`);
            row.eachCell((cell, colNumber) => {
                console.log(`  [${colNumber}] ${cell.value}`);
            });
        }
    });

    // Also check another person "Mutsinze"
    console.log('\n--- MUTSINZE FULL DETAILS ---');
    sheet.eachRow((row, rowNumber) => {
        const name = row.getCell(2).value?.toString() || '';
        if (name.includes('Mutsinze')) {
            console.log(`\nRow ${rowNumber}:`);
            row.eachCell((cell, colNumber) => {
                console.log(`  [${colNumber}] ${cell.value}`);
            });
        }
    });
}

findAbaasaFull().catch(console.error);
