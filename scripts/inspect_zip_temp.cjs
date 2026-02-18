const XLSX = require('xlsx');
const fs = require('fs');

console.log('--- INSPECT ZIP STRUCTURE (TEMP FILE) ---');

try {
    const workbook = XLSX.readFile('public/temp_check.xlsx');
    console.log('SheetNames:', workbook.SheetNames);
    console.log('Strings (SST) Count:', workbook.Strings ? workbook.Strings.length : 'undefined');
    if (workbook.Strings && workbook.Strings.length > 0) {
        console.log('First 5 Strings:', workbook.Strings.slice(0, 5));
        const found = workbook.Strings.find(s => s.t && s.t.includes('Mukasa') || (typeof s === 'string' && s.includes('Mukasa')));
        console.log('Mukasa in Strings?', !!found);
    } else {
        console.log('No Shared Strings found in workbook object.');
    }
} catch (e) {
    console.error('Error reading file:', e.message);
}
