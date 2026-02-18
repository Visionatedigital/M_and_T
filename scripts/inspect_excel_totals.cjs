
const ExcelJS = require('../server/node_modules/exceljs');
const path = require('path');

async function inspectExcelTotals() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        console.log("--- Excel Inspection (Totals) ---");

        // Row 1 often contains totals in these sheets
        const row1 = worksheet.getRow(1);
        console.log("Row 1 Values:", row1.values);

        const found363 = [];
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                const val = cell.value;
                let num = 0;
                if (typeof val === 'object' && val !== null) {
                    if (val.result !== undefined) num = parseFloat(val.result);
                } else {
                    num = parseFloat(val);
                }

                if (num === 363700000 || num === 3637000000) { // check for variations
                    found363.push({ row: rowNumber, col: colNumber, val: val });
                }
            });
        });

        if (found363.length > 0) {
            console.log("\nFound 363,700,000 at:");
            found363.forEach(f => console.log(` - Row ${f.row}, Col ${f.col}`));
        } else {
            console.log("\nCould not find 363,700,000 as a single cell value.");
        }

        // Sum Principal (Col 3) for different statuses
        const statusIdx = 21; // Based on previous headers
        const statusMap = {};
        let grandTotalPrincipal = 0;

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2) return;
            const status = row.getCell(statusIdx).value || 'Unknown';
            const principalVal = row.getCell(3).value;
            let principal = 0;
            if (typeof principalVal === 'object' && principalVal !== null) {
                if (principalVal.result !== undefined) principal = parseFloat(principalVal.result);
            } else {
                principal = parseFloat(principalVal || 0);
            }

            if (!statusMap[status]) statusMap[status] = 0;
            statusMap[status] += principal;
            grandTotalPrincipal += principal;
        });

        console.log("\n--- Principal Breakdown by Status ---");
        for (const [status, sum] of Object.entries(statusMap)) {
            console.log(` - ${status}: ${sum.toLocaleString()}`);
        }
        console.log(`Grand Total Principal: ${grandTotalPrincipal.toLocaleString()}`);

    } catch (err) {
        console.error(err);
    }
}

inspectExcelTotals();
