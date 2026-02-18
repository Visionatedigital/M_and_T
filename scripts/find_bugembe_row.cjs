
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'MT MICROFINANCE Admin 33.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('--- GLOBAL SEARCH for "Bugembe" ---');

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row) continue;

        const rowStr = JSON.stringify(row).toLowerCase();
        if (rowStr.includes('bugembe')) {
            console.log(`\nMATCH in Sheet "${sheetName}" at Row ${i}:`);
            console.log(JSON.stringify(row));

            row.forEach((cell, index) => {
                if (typeof cell === 'string' && cell.toLowerCase().includes('bugembe')) {
                    console.log(`  --> FOUND at Column ${index}: "${cell}"`);
                }
            });
        }
    }
});
