const XLSX = require('xlsx');
const wb = XLSX.readFile('public/MT MICROFINANCE Admin 33.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];

console.log('Searching for "Mukasa" in cells...');
const keys = Object.keys(ws);
let found = false;
for (const key of keys) {
    if (key.startsWith('!')) continue;
    const cell = ws[key];
    if (cell && (String(cell.v).includes('Mukasa') || String(cell.w).includes('Mukasa'))) {
        console.log(`FOUND MUKASA AT ${key}:`, JSON.stringify(cell));
        found = true;
    }
}
if (!found) console.log('MUKASA NOT FOUND IN ANY CELL');

// Also dump B4, B5
console.log('B4:', ws['B4'] ? JSON.stringify(ws['B4']) : 'undefined');
console.log('B5:', ws['B5'] ? JSON.stringify(ws['B5']) : 'undefined');
