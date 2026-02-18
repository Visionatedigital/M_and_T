
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../server/node_modules/exceljs'));

async function analyzeIds() {
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(1);

    let count1001 = 0;
    let sum1001_Principal = 0;
    let sum1001_Paid = 0;

    let countOther = 0;
    let sumOther_Principal = 0;
    let sumOther_Paid = 0;

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 2) return;

        const loanId = row.getCell(18).value?.toString() || '';
        const principal = parseFloat(row.getCell(3).value) || 0;
        const paid = parseFloat(row.getCell(4).value) || 0;

        if (loanId.startsWith('1001')) {
            count1001++;
            sum1001_Principal += principal;
            sum1001_Paid += paid;
        } else {
            countOther++;
            sumOther_Principal += principal;
            sumOther_Paid += paid;
        }
    });

    console.log('--- Loan ID Analysis ---');
    console.log(`Series 1001xxxx: ${count1001} rows`);
    console.log(`  Sum Principal: ${sum1001_Principal.toLocaleString()}`);
    console.log(`  Sum Paid:      ${sum1001_Paid.toLocaleString()}`);

    console.log(`Other Series:    ${countOther} rows`);
    console.log(`  Sum Principal: ${sumOther_Principal.toLocaleString()}`);
    console.log(`  Sum Paid:      ${sumOther_Paid.toLocaleString()}`);
}

analyzeIds().catch(console.error);
