const XLSX = require('xlsx');

console.log('--- DUMP ROWS ---');
const workbook = XLSX.readFile('public/MT MICROFINANCE Admin 33.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
// Use NO header to see raw array of arrays first? No, use 'A' to compare.
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });

for (let i = 0; i < 10; i++) {
    console.log(`Row ${i}:`, JSON.stringify(jsonData[i]));
}
