
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../server/node_modules/exceljs'));

async function dumpRows() {
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx.xlsx');
    console.log('Reading file:', filePath);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(1);
    console.log(`Reading Sheet: ${sheet.name}`);

    // Dump first 20 rows
    for (let i = 1; i <= 20; i++) {
        const row = sheet.getRow(i);
        const values = [];
        row.eachCell((cell, colNumber) => {
            values.push(`[${colNumber}] ${cell.value}`);
        });
        if (values.length > 0) {
            console.log(`Row ${i}:`, values.join(' | '));
        }
    }
}

dumpRows().catch(console.error);
