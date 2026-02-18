
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../server/node_modules/exceljs'));

async function checkHalves() {
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(1);

    const rows = [];
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 2) return; // Skip headers
        // Store just the principal for quick check
        const principal = parseFloat(row.getCell(3).value) || 0;
        rows.push(principal);
    });

    const totalRows = rows.length;
    console.log(`Total Rows: ${totalRows}`);

    if (totalRows % 2 !== 0) {
        console.log('Odd number of rows, cannot be perfect concatenation.');
        // But maybe header row counting is off?
    }

    const mid = Math.floor(totalRows / 2);
    const firstHalf = rows.slice(0, mid);
    const secondHalf = rows.slice(mid + (totalRows % 2)); // If odd, skip middle? Or just compare what we have

    console.log(`First Half Sum:  ${firstHalf.reduce((a, b) => a + b, 0).toLocaleString()}`);
    console.log(`Second Half Sum: ${secondHalf.reduce((a, b) => a + b, 0).toLocaleString()}`);

    let diff = 0;
    for (let i = 0; i < mid; i++) {
        if (firstHalf[i] !== secondHalf[i]) {
            diff++;
        }
    }
    console.log(`Differences between halves: ${diff}`);
}

checkHalves().catch(console.error);
