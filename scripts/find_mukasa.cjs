const XLSX = require('xlsx');

console.log('--- FIND MUKASA ---');
const workbook = XLSX.readFile('public/MT MICROFINANCE Admin 33.xlsx');
const sheetName = workbook.SheetNames[0];
console.log('Sheet Name:', sheetName);
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });

console.log(`Parsed ${jsonData.length} rows.`);

let found = false;
for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    const str = JSON.stringify(row);
    if (str.includes('Mukasa')) {
        console.log(`FOUND at Index ${i}:`, str);
        found = true;
    }
}

if (!found) console.log('NOT FOUND');
