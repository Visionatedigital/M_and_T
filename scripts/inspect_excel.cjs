const fs = require('fs');
const XLSX = require('xlsx');

const filePath = 'public/MT MICROFINANCE Admin 33.xlsx';
const buf = fs.readFileSync(filePath);
const text = buf.toString('utf8');

const cRegex = /<c\s+[^>]*r="([A-Z]+[0-9]+)"[^>]*>(.*?)<\/c>/gs;
let match;
let cellData = {};

while ((match = cRegex.exec(text)) !== null) {
    const addr = match[1];
    const content = match[2];
    const isMatch = content.match(/<is[^>]*>.*?<t[^>]*>(.*?)<\/t>.*?<\/is>/s);
    if (isMatch) {
        cellData[addr] = isMatch[1].trim();
    } else {
        const vMatch = content.match(/<v\s*>(.*?)<\/v>/);
        if (vMatch) cellData[addr] = vMatch[1].trim();
    }
}

let rowMap = {};
for (let addr in cellData) {
    const rowNum = parseInt(addr.replace(/[^0-9]/g, ''));
    const col = addr.replace(/[0-9]/g, '');
    if (!rowMap[rowNum]) rowMap[rowNum] = {};
    rowMap[rowNum][col] = cellData[addr];
}

let totalValid = 0;
let missingPhone = 0;
let missingNIN = 0;
let missingBoth = 0;

for (const [num, data] of Object.entries(rowMap)) {
    if (Number(num) < 3) continue;
    const name = data.B;
    const principal = Number(data.C);
    if (!name || isNaN(principal) || principal <= 0 || name.toUpperCase().includes('TOTAL')) continue;

    totalValid++;
    if (!data.N) missingPhone++;
    if (!data.T) missingNIN++;
    if (!data.N && !data.T) missingBoth++;
}

console.log('\n--- Row 5 Detail ---');
if (rowMap[5]) {
    console.log(JSON.stringify(rowMap[5], null, 2));
} else {
    console.log('Row 5 not found in rowMap.');
}

// Check total count of NINs found
let ninCount = 0;
for (let addr in cellData) {
    if (addr.startsWith('T')) ninCount++;
}
console.log(`Total cells in Column T: ${ninCount}`);

console.log('--- FINAL SUMMARY ---');
console.log('Total Valid Loans:', totalValid);
console.log('Missing Phone:', missingPhone);
console.log('Missing NIN:', missingNIN);
console.log('Missing Both:', missingBoth);
console.log('--- END ---');
