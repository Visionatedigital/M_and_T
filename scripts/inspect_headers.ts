
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'MT MICROFINANCE Admin 33.xlsx');
const workbook = XLSX.readFile(filePath);

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`\n--- Sheet: ${sheetName} ---`);
    console.log(`Total Rows: ${data.length}`);

    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(data.length, 100); i++) { // Check first 100 rows
        const row = data[i];
        if (!row) continue;
        const rowStr = JSON.stringify(row).toLowerCase();
        if (rowStr.includes('principal') || rowStr.includes('amount') || rowStr.includes('balance') || rowStr.includes('client')) {
            console.log(`Potential Header Row ${i}:`, JSON.stringify(row));
            headerRowIndex = i;

            // Print next 3 rows to see data format
            for (let j = 1; j <= 3; j++) {
                if (i + j < data.length) {
                    console.log(`Row ${i + j}:`, JSON.stringify(data[i + j]));
                }
            }
            break;
        }
    }

    if (headerRowIndex === -1) {
        console.log('No header row found with keywords.');
        // Print first 5 non-empty rows just in case
        let rowsLogged = 0;
        for (let i = 0; i < Math.min(data.length, 20); i++) {
            const row = data[i];
            if (row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
                console.log(`Row ${i}:`, JSON.stringify(row));
                rowsLogged++;
                if (rowsLogged >= 5) break;
            }
        }
    }
});
