
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../public/MT MICROFINANCE Admin 33.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

console.log("Inspecting Cell B3 (Names column, first entry?)...");
// Let's find first row with data (Row 2 based on previous dump)
const addr = "B3";
const cell = sheet[addr];
if (cell) {
    console.log(`Cell ${addr} Data:`, {
        type: cell.t,
        value: cell.v,
        text: cell.w,
        html: cell.h,
        rich: cell.r
    });
}

console.log("\nSearching for 'Kapere' in all cell properties...");
Object.keys(sheet).forEach(key => {
    if (key.startsWith('!')) return;
    const c = sheet[key];
    const rawVal = String(c.v || '').toLowerCase();
    const richVal = JSON.stringify(c.r || '').toLowerCase();
    if (rawVal.includes('kapere') || richVal.includes('kapere')) {
        console.log(`Found 'Kapere' at ${key}:`, c.v || c.r);
    }
});
