
const ExcelJS = require('../server/node_modules/exceljs');
const path = require('path');

async function dumpExcelData() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        const headers = worksheet.getRow(2).values;
        const findCol = (name) => {
            for (let i = 0; i < headers.length; i++) {
                if (headers[i] && headers[i].toString().toLowerCase().trim() === name.toLowerCase()) return i;
            }
            return -1;
        };

        const nameIdx = findCol('name');
        const principalIdx = findCol('principal');
        const paidIdx = findCol('paid');
        const ninIdx = findCol('nin') || -1;

        console.log(`Indices - Name: ${nameIdx}, Principal: ${principalIdx}, Paid: ${paidIdx}, NIN: ${ninIdx}`);

        const targets = ['harriet', 'phionah', 'tebajukila', 'amuda'];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2) return;
            const name = row.getCell(nameIdx).value || '';
            const match = targets.some(t => name.toString().toLowerCase().includes(t));

            if (match) {
                console.log(`Row ${rowNumber}: Name="${name}", P=${row.getCell(principalIdx).value}, Paid=${row.getCell(paidIdx).value}, NIN=${ninIdx !== -1 ? row.getCell(ninIdx).value : 'N/A'}`);
            }
        });

    } catch (err) {
        console.error(err);
    }
}

dumpExcelData();
