
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../server/node_modules/exceljs'));

async function testStrategies() {
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(1);

    // Group by Name|Principal
    const groups = {};

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 2) return;

        // Normalize name
        const nameRaw = row.getCell(2).value?.toString() || '';
        const name = nameRaw.trim().replace(/\s+/g, ' ').toUpperCase();

        const principal = parseFloat(row.getCell(3).value) || 0;
        const paid = parseFloat(row.getCell(4).value) || 0;
        // Parse Date (Column 1)
        const dateRaw = row.getCell(1).value;
        const date = new Date(dateRaw); // Might be invalid if format is DD/MM/YYYY string

        const key = `${name}|${principal}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push({ principal, paid, date, rowNumber });
    });

    let totalPrincipal = 0;
    let totalPaid = 0;

    for (const [key, rows] of Object.entries(groups)) {
        const count = rows.length;
        // Strategy: Keep half.
        // If Even: Keep Count/2
        // If Odd: Keep Ceil(Count/2) or Floor?
        // Given 727M is EXACTLY 2x 363.7M, we expect almost all to be Even.

        /* 
           Wait, if 727,400,000 / 2 = 363,700,000.
           Then I just need to divide total principal by 2.
           Use Math.ceil?
        */
        const keepCount = Math.ceil(count / 2);

        // Strategy: Sort by Last Updated (Date)? Or Max Paid?
        // Sort by Paid Descending (Keep highest paid)
        rows.sort((a, b) => b.paid - a.paid);

        // Or Sort by Date Descending (Newest first)
        // rows.sort((a,b) => b.date - a.date);

        const kept = rows.slice(0, keepCount);

        kept.forEach(r => {
            totalPrincipal += r.principal;
            totalPaid += r.paid;
        });
    }

    console.log('--- Strategy: Keep Ceil(N/2), Max Paid ---');
    console.log(`Total Principal: ${totalPrincipal.toLocaleString()}`);
    console.log(`Total Paid:      ${totalPaid.toLocaleString()}`);
    console.log('------------------------------------------');
}

testStrategies().catch(console.error);
