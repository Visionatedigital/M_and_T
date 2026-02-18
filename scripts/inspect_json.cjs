
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'loan_data.json');
console.log(`Reading file: ${filePath}`);
const stats = fs.statSync(filePath);
console.log(`Last Modified: ${stats.mtime.toISOString()}`);

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
console.log('--- Inspecting JSON Data ---');
console.log(`Is Array? ${Array.isArray(data)}`);
if (Array.isArray(data)) {
    console.log(`Length: ${data.length}`);
    if (data.length > 0) {
        console.log('First Item:', JSON.stringify(data[0], null, 2));
    }
} else {
    console.log('Keys:', Object.keys(data));
}
