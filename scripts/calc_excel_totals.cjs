
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../server/node_modules/exceljs'));

async function calcUniqueTotals() {
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(1);

    let totalPrincipal = 0;
    let totalPaid = 0;

    const seen = new Set();
    let rowCount = 0;

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 2) return; // Skip headers

        // Col 2: Name
        const name = row.getCell(2).value?.toString().trim() || '';
        // Col 3: Principal
        const principal = parseFloat(row.getCell(3).value) || 0;
        // Col 4: Paid
        const paid = parseFloat(row.getCell(4).value) || 0;

        // Key: Name + Principal + Paid
        // This assumes that if a person has 2 loans of same amount and same paid, they are duplicates.
        // This is a risk, but given the exact 2x total, it's highly probable.
        const key = `${name}|${principal}|${paid}`;

        if (seen.has(key)) {
            return;
        }
        seen.add(key);
        rowCount++;

        totalPrincipal += principal;
        totalPaid += paid;
    });

    console.log('--- STRICT UNIQUE NUMBERS ---');
    console.log(`Unique Rows:     ${rowCount}`);
    console.log(`Total Principal: ${totalPrincipal.toLocaleString()}`);
    console.log(`Total Paid:      ${totalPaid.toLocaleString()}`);
    console.log('-----------------------------');
}

calcUniqueTotals().catch(console.error);
