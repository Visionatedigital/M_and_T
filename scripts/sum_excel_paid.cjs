
const ExcelJS = require('../server/node_modules/exceljs');
const path = require('path');

async function sumExcelPaid() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        const headerRow = worksheet.getRow(2);
        const headers = headerRow.values;
        console.log("Headers Found:", JSON.stringify(headers));

        const findCol = (name) => {
            if (!Array.isArray(headers)) return -1;
            for (let i = 1; i < headers.length; i++) {
                const h = headers[i] ? headers[i].toString().toLowerCase().trim() : '';
                if (h === name.toLowerCase()) return i;
            }
            return -1;
        };

        const paidIdx = findCol('paid');
        console.log(`Resolved Paid Index: ${paidIdx}`);
        // If paidIdx is still wrong, hardcode it to 8 based on manual inspection
        const finalPaidIdx = (paidIdx === -1 || headers[paidIdx].toString().toLowerCase().trim() !== 'paid') ? 8 : paidIdx;
        console.log(`Using Final Paid Index: ${finalPaidIdx} (${headers[finalPaidIdx]})`);

        const statusIdx = headers.findIndex(h => h && h.toString().toLowerCase().trim() === 'status');
        console.log(`Status Index: ${statusIdx}`);

        const statusMap = {};

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2) return;

            const status = row.getCell(statusIdx).value || 'Unknown';
            const pVal = row.getCell(3).value;
            const paidVal = row.getCell(4).value;

            let p = 0;
            if (typeof pVal === 'object' && pVal !== null) {
                if (pVal.result !== undefined) p = parseFloat(pVal.result);
            } else {
                p = parseFloat(pVal || 0);
            }

            let paid = 0;
            if (typeof paidVal === 'object' && paidVal !== null) {
                if (paidVal.result !== undefined) paid = parseFloat(paidVal.result);
            } else {
                paid = parseFloat(paidVal || 0);
            }

            if (!statusMap[status]) {
                statusMap[status] = { principal: 0, paid: 0, count: 0 };
            }
            statusMap[status].principal += p;
            statusMap[status].paid += paid;
            statusMap[status].count++;
        });

        console.log("\n--- Breakdown by Status ---");
        for (const [status, data] of Object.entries(statusMap)) {
            console.log(`${status}:`);
            console.log(`  Count:     ${data.count}`);
            console.log(`  Principal: ${data.principal.toLocaleString()}`);
            console.log(`  Paid:      ${data.paid.toLocaleString()}`);
        }

        console.log(`\nTargets:`);
        console.log(`  Principal Target: 316,400,000`);
        console.log(`  Paid Target:      165,549,925`);

    } catch (err) {
        console.error(err);
    }
}

sumExcelPaid();
