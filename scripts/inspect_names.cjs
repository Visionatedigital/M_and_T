
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(process.cwd(), 'public', 'MT_ADMIN_fixed.xlsx.xlsx');
console.log(`Reading file: ${filePath}`);
const stats = fs.statSync(filePath);
console.log(`File Size: ${stats.size} bytes`);
console.log(`Last Modified: ${stats.mtime.toISOString()}`);

const workbook = XLSX.readFile(filePath);

console.log('--- GLOBAL TEXT SEARCH ---');

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    // Use !ref to get the full range just in case
    console.log(`Sheet "${sheetName}" Range: ${worksheet['!ref']}`);

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let stringCount = 0;

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row) continue;

        // Check ALL columns
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            if (typeof cell === 'string' && cell.trim().length > 1) { // >1 char
                console.log(`[${sheetName}] Row ${i}, Col ${j}: "${cell}"`);
                stringCount++;
                if (stringCount > 20) break; // Limit output
            }
        }
        if (stringCount > 20) break;
    }

    if (stringCount === 0) {
        console.log(`[${sheetName}] No strings > 1 char found in ENTIRE sheet.`);
    }
});
