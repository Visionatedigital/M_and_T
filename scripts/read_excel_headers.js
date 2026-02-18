
const ExcelJS = require('exceljs');
const path = require('path');

async function readHeaders() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1); // Assuming first sheet

        const headers = worksheet.getRow(1).values;
        console.log("Headers:", headers);

        // Also print first row of data to verify types
        const firstRow = worksheet.getRow(2).values;
        console.log("First Row Data:", firstRow);

    } catch (err) {
        console.error(err);
    }
}

readHeaders();
