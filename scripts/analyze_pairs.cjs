
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../server/node_modules/exceljs'));

async function analyzePairs() {
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(1);

    // key: principal|paid
    // value: array of names
    const groups = {};

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 2) return;

        const name = row.getCell(2).value?.toString().trim() || '';
        const principal = parseFloat(row.getCell(3).value) || 0;
        const paid = parseFloat(row.getCell(4).value) || 0;

        const key = `${principal}|${paid}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(name);
    });

    let exactPairs = 0;
    let oddGroups = 0;

    console.log('--- Duplicate Analysis ---');
    for (const [key, names] of Object.entries(groups)) {
        if (names.length >= 2) {
            // Check if names are similar
            console.log(`[${key}] Count: ${names.length}`);
            console.log(`Names: ${names.slice(0, 4).join(' || ')}`);
            if (names.length % 2 === 0) exactPairs++;
            else oddGroups++;
        }
    }

    console.log(`Groups with even counts: ${exactPairs}`);
    console.log(`Groups with odd counts:  ${oddGroups}`);
}

analyzePairs().catch(console.error);
