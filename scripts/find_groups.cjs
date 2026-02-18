
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'MT MICROFINANCE Admin 33.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('--- Searching for Groups in Excel ---');

const groups = ['KAMOGA', 'RISING STARS', 'SENDI', 'WILBER', 'AISHA'];

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row) continue;

        const rowStr = JSON.stringify(row).toLowerCase();
        for (const group of groups) {
            if (rowStr.includes(group.toLowerCase())) {
                console.log(`\nGROUP MATCH "${group}" in Sheet "${sheetName}" at Row ${i}:`);
                console.log(JSON.stringify(row));
                // Print next 5 rows to see if loans follow
                for (let j = 1; j <= 5; j++) {
                    if (data[i + j]) console.log(`  Row ${i + j}:`, JSON.stringify(data[i + j]));
                }
            }
        }
    }
});
