import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

async function inspectExcelFile() {
    try {
        const excelPath = path.join(process.cwd(), 'public', 'MT MICROFINANCE Admin 33.xlsx');

        if (!fs.existsSync(excelPath)) {
            console.error('Excel file not found at:', excelPath);
            return;
        }

        console.log('Reading Excel file...');
        const workbook = XLSX.readFile(excelPath);

        console.log('\\n=== Sheet Names ===');
        workbook.SheetNames.forEach((name, index) => {
            console.log(`${index + 1}. ${name}`);
        });

        // Read first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`\\n=== Sheet: ${sheetName} ===`);
        console.log(`Total rows: ${data.length}`);

        if (data.length > 0) {
            console.log('\\n=== Column Names ===');
            const firstRow = data[0] as any;
            Object.keys(firstRow).forEach((key, index) => {
                console.log(`${index + 1}. "${key}"`);
            });

            console.log('\\n=== First 3 Rows (Sample) ===');
            data.slice(0, 3).forEach((row, index) => {
                console.log(`\\nRow ${index + 1}:`);
                console.log(JSON.stringify(row, null, 2));
            });
        }

    } catch (error) {
        console.error('Error inspecting Excel file:', error);
    }
}

inspectExcelFile();
