const Database = require('better-sqlite3');
const db = new Database('/Users/mark/Library/Application Support/M&T Growth Gateway/mt_growth.db');

const columns = [
    'branch_name TEXT',
    'loan_type TEXT',
    'loan_category TEXT',
    'group_name TEXT',
    'district TEXT',
    'division TEXT',
    'county TEXT',
    'village TEXT',
    'parish TEXT',
    'business_location TEXT',
    'attachments TEXT'
];

columns.forEach(col => {
    try {
        db.exec(`ALTER TABLE loan_applications ADD COLUMN ${col}`);
        console.log(`Added column ${col}`);
    } catch (e) {
        if (!e.message.includes('duplicate column')) {
            console.error(`Error adding ${col}:`, e.message);
        }
    }
});

console.log('Migration complete.');
