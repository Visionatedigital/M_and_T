
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../public/MT MICROFINANCE Admin 33.xlsx');
console.log(`Reading: ${filePath}`);

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

console.log("Scanning for non-empty strings...");
let count = 0;
Object.keys(sheet).forEach(key => {
    if (key.startsWith('!')) return;
    const cell = sheet[key];
    if (cell.t === 's' && cell.v && cell.v.trim().length > 0) {
        count++;
        if (count <= 20) {
            console.log(`Cell ${key}: "${cell.v}"`);
        }
    }
});

if (count === 0) {
    console.log("NO non-empty strings found in the entire sheet!");
} else {
    console.log(`\nTotal non-empty strings: ${count}`);
}
