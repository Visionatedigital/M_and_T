
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../public/MT MICROFINANCE Admin 33.xlsx');
console.log(`Reading: ${filePath}`);

const workbook = XLSX.readFile(filePath);
console.log("Sheets Found:", workbook.SheetNames);

const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

console.log("\n--- Searching for 'Kapere' ---");
data.forEach((row, i) => {
    const rowStr = JSON.stringify(row).toLowerCase();
    if (rowStr.includes("kapere")) {
        console.log(`Found 'Kapere' at Row ${i}:`, JSON.stringify(row));
    }
});
