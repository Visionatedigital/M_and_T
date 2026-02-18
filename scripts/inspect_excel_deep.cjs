
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../public/MT MICROFINANCE Admin 33.xlsx');
console.log(`Reading: ${filePath}`);

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

console.log(`Sheet: ${sheetName}`);
console.log(`Range: ${sheet['!ref']}`);

// Inspect specific cells in first 10 rows, columns A-G
const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
for (let r = 1; r <= 10; r++) {
    let rowLog = [];
    cols.forEach(c => {
        const cellAddress = `${c}${r}`;
        const cell = sheet[cellAddress];
        if (cell) {
            rowLog.push(`${cellAddress}: ${JSON.stringify(cell)}`);
        } else {
            rowLog.push(`${cellAddress}: <empty>`);
        }
    });
    console.log(`Row ${r}:`, rowLog.join(' | '));
}

// Check for any cell with type 's' (string) anywhere in the sheet
console.log("\nScanning for ANY string cells...");
let stringCount = 0;
Object.keys(sheet).forEach(key => {
    if (key.startsWith('!')) return;
    const cell = sheet[key];
    if (cell.t === 's') {
        stringCount++;
        if (stringCount <= 10) {
            console.log(`String Cell ${key}:`, JSON.stringify(cell));
        }
    }
});

console.log(`Total String Cells: ${stringCount}`);
