
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'MT_ADMIN_fixed.xlsx.xlsx');
console.log(`Reading file: ${filePath}`);

const workbook = XLSX.readFile(filePath);
const sheetName = 'Sheet1';
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`Total Rows: ${data.length}`);

// Storage for duplicates
const nameMap = {}; // Name -> [RowIndex, RowData]
const ninMap = {};  // NIN -> [RowIndex, RowData]

// Iterate data (skip header)
for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 2) continue;

    const name = row[1]; // Name is at index 1
    const principal = row[2];
    const nin = row[19]; // NIN is at index 19 (based on previous logs)

    if (name && typeof name === 'string') {
        const cleanName = name.trim().toUpperCase();
        if (!nameMap[cleanName]) {
            nameMap[cleanName] = [];
        }
        nameMap[cleanName].push({ row: i + 1, principal, nin });
    }

    if (nin && typeof nin === 'string' && nin.length > 5) {
        const cleanNIN = nin.trim().toUpperCase();
        if (!ninMap[cleanNIN]) {
            ninMap[cleanNIN] = [];
        }
        ninMap[cleanNIN].push({ row: i + 1, name, principal });
    }
}

console.log('\n--- DUPLICATE NAMES ---');
let nameDupCount = 0;
for (const [name, entries] of Object.entries(nameMap)) {
    if (entries.length > 1) {
        console.log(`\nName: "${name}" appears ${entries.length} times:`);
        entries.forEach(e => console.log(`  - Row ${e.row}: Amount=${e.principal}, NIN=${e.nin || 'N/A'}`));
        nameDupCount++;
    }
}
if (nameDupCount === 0) console.log('No duplicate names found.');

console.log('\n--- DUPLICATE NINs ---');
let ninDupCount = 0;
for (const [nin, entries] of Object.entries(ninMap)) {
    if (entries.length > 1) {
        console.log(`\nNIN: "${nin}" appears ${entries.length} times:`);
        entries.forEach(e => console.log(`  - Row ${e.row}: Name="${e.name}", Amount=${e.principal}`));
        ninDupCount++;
    }
}
if (ninDupCount === 0) console.log('No duplicate NINs found.');
