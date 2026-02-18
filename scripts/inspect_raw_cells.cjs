
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'MT MICROFINANCE Admin 33.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log(`--- Raw Cell Inspection for ${sheetName} ---`);
console.log(`Range: ${worksheet['!ref']}`);

// Check A1 to B10
const cols = ['A', 'B', 'C', 'D'];
for (let r = 1; r <= 30; r++) { // Rows 1-30
    let rowLog = `Row ${r}: `;
    for (let c of cols) {
        const cellAddress = c + r;
        const cell = worksheet[cellAddress];
        if (cell) {
            rowLog += `[${c}: v=${cell.v}, t=${cell.t}, w=${cell.w || ''}] `;
        } else {
            rowLog += `[${c}: (empty)] `;
        }
    }
    console.log(rowLog);
}

// Also check around Row 177 where data was found
console.log('\n--- Around Row 177 ---');
for (let r = 175; r <= 180; r++) {
    let rowLog = `Row ${r}: `;
    for (let c of cols) {
        const cellAddress = c + r;
        const cell = worksheet[cellAddress];
        if (cell) {
            rowLog += `[${c}: v=${cell.v}, t=${cell.t}, w=${cell.w || ''}] `;
        } else {
            rowLog += `[${c}: (empty)] `;
        }
    }
    console.log(rowLog);
}
