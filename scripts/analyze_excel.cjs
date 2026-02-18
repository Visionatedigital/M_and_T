const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/MT MICROFINANCE Admin 33.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });

console.log('--- EXCEL STRUCTURE ANALYSIS ---');
for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
    console.log(`Row ${i}:`, JSON.stringify(jsonData[i]));
}
