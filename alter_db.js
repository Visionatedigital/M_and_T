const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const appData = path.join(os.homedir(), 'Library', 'Application Support', 'M&T Growth Gateway'); // Guessing electron path
// Let's find the db file first
console.log(appData);
