
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../server/node_modules/exceljs'));

async function calcStatusTotals() {
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(1);

    let totalPrincipal = 0;
    let totalPaid = 0;

    let activePrincipal = 0;
    let activePaid = 0;

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 2) return;

        const principal = parseFloat(row.getCell(3).value) || 0;
        const paid = parseFloat(row.getCell(4).value) || 0;
        const status = row.getCell(21).value?.toString().trim().toLowerCase() || '';

        totalPrincipal += principal;
        totalPaid += paid;

        if (status !== 'fully paid') {
            activePrincipal += principal;
            activePaid += paid;
        }
    });

    console.log('--- Status Filtering Analysis ---');
    console.log(`Total Principal:        ${totalPrincipal.toLocaleString()}`);
    console.log(`Total Paid:             ${totalPaid.toLocaleString()}`);
    console.log(`Active Principal (Not Fully Paid): ${activePrincipal.toLocaleString()}`);
    console.log(`Active Paid:            ${activePaid.toLocaleString()}`);
}

calcStatusTotals().catch(console.error);
