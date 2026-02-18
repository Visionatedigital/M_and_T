
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../server/node_modules/exceljs'));

async function checkExcelTotals() {
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx.xlsx');
    console.log('Reading file:', filePath);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(1);
    console.log(`Reading Sheet: ${sheet.name}`);

    let headerRowIndex = 0;
    const headers = {};

    // Find header row
    for (let i = 1; i <= 10; i++) {
        const row = sheet.getRow(i);
        let found = false;
        row.eachCell((cell) => {
            if (cell.value && typeof cell.value === 'string') {
                if (cell.value.includes('Loan Amount') || cell.value.includes('Period') || cell.value.includes('Total')) {
                    found = true;
                }
            }
        });
        if (found) {
            headerRowIndex = i;
            console.log(`Headers found on row ${i}`);
            row.eachCell((cell, colNumber) => {
                headers[cell.value] = colNumber;
            });
            break;
        }
    }

    if (headerRowIndex === 0) {
        console.log('Could not find header row');
        return;
    }

    console.log('Headers:', Object.keys(headers));

    const principalCol = headers['Loan Amount'] || headers['Principal'] || headers['Amount'];
    // Try to find total repayment column. Could be 'Total Repaid', 'Amount Paid', 'Total'
    const totalRepaidCol = headers['Total Repaid'] || headers['Amount Paid'] || headers['Total Amount Paid'] || headers['Total Reco'];

    // Also "Total Amount" (Expected)
    const totalExpectedCol = headers['Total Amount'] || headers['Expected Amount'];

    console.log(`Cols: Principal=${principalCol}, Paid=${totalRepaidCol}, Expected=${totalExpectedCol}`);

    let totalPrincipal = 0;
    let totalPaid = 0;
    let totalExpected = 0;

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber <= headerRowIndex) return;

        if (principalCol) {
            let val = row.getCell(principalCol).value;
            if (val && typeof val === 'object' && val.result) val = val.result;
            totalPrincipal += (parseFloat(val) || 0);
        }

        if (totalRepaidCol) {
            let val = row.getCell(totalRepaidCol).value;
            // Sometimes it's a shared string or something
            if (val && typeof val === 'object' && val.result) val = val.result;
            totalPaid += (parseFloat(val) || 0);
        }

        if (totalExpectedCol) {
            let val = row.getCell(totalExpectedCol).value;
            if (val && typeof val === 'object' && val.result) val = val.result;
            totalExpected += (parseFloat(val) || 0);
        }
    });

    console.log('--- Excel Totals ---');
    console.log(`Total Principal: ${totalPrincipal.toLocaleString()}`);
    console.log(`Total Expected:  ${totalExpected.toLocaleString()}`);
    console.log(`Total Paid:      ${totalPaid.toLocaleString()}`);
    console.log('--------------------');
}

checkExcelTotals().catch(console.error);
