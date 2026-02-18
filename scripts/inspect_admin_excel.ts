
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'public/MT MICROFINANCE Admin 33.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log('Sheets:', sheetNames);

    for (const sheetName of sheetNames) {
        console.log(`Scanning sheet: ${sheetName}`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        // Search for ID or Principal
        const idRowIndex = data.findIndex(row => JSON.stringify(row).includes('CM89052106RJID'));
        console.log(`ID CM89052106RJID found at row: ${idRowIndex}`);

        // Search for 500,000 in Column 2 (Index 2)
        const candidates = data.filter((row, index) => row[2] == 500000);
        console.log(`Found ${candidates.length} rows with 500,000 Principal.`);

        if (candidates.length > 0) {
            console.log('First 5 Candidates:', JSON.stringify(candidates.slice(0, 5), null, 2));
        }
    }

} catch (error) {
    console.error('Error reading file:', error);
}
