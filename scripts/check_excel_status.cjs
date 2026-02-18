
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../public/MT MICROFINANCE Admin 33.xlsx');

console.log(`Reading file: ${filePath}`);

if (!fs.existsSync(filePath)) {
    console.error("File not found!");
    process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheetNames = workbook.SheetNames;
console.log("Sheets:", sheetNames);

sheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length > 0) {
        console.log(`Total Rows: ${data.length}`);

        let maxCols = 0;
        data.forEach(row => maxCols = Math.max(maxCols, row.length));

        const allStrings = new Set();
        let foundStatus = false;

        console.log(`Scanning all ${data.length} rows for strings...`);

        for (let row = 0; row < data.length; row++) {
            if (!data[row]) continue;
            for (let col = 0; col < data[row].length; col++) {
                const val = data[row][col];
                if (typeof val === 'string' && val.trim().length > 0) {
                    allStrings.add(val);
                    if (val.includes("Maturity") || val.includes("Paid") || val.includes("Due")) {
                        console.log(`Found keyword '${val}' at Row ${row}, Col ${col}`);
                        foundStatus = true;
                    }
                }
            }
        }

        console.log(`\nTotal unique strings found: ${allStrings.size}`);
        if (allStrings.size > 0) {
            console.log("First 20 unique strings:");
            console.log(Array.from(allStrings).slice(0, 20));
        }

    }


});
