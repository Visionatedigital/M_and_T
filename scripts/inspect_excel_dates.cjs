
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'MT_ADMIN_fixed.xlsx.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- Inspecting Date Columns ---');
// Col 0: Released
// Col 7: Maturity
// Col 10: DOB

for (let i = 1; i <= 20; i++) {
    const row = data[i];
    if (!row) continue;

    console.log(`Row ${i}:`);
    console.log(`  Released (Col 0): ${row[0]} (Type: ${typeof row[0]})`);
    console.log(`  Maturity (Col 7): ${row[7]} (Type: ${typeof row[7]})`);
    console.log(`  DOB (Col 10): ${row[10]} (Type: ${typeof row[10]})`);
}
