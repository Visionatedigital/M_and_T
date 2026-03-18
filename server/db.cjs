const { Pool } = require('pg');
require('dotenv').config();

// Strip sslmode from URL so ssl.rejectUnauthorized: false takes effect (fixes self-signed cert with Supabase)
let connStr = process.env.DATABASE_URL || '';
if (connStr && !connStr.includes('localhost')) {
    connStr = connStr.replace(/[?&]sslmode=[^&]*/g, '');
    connStr = connStr.replace(/\?$/, '');
    connStr += (connStr.includes('?') ? '&' : '?') + 'sslmode=no-verify';
}

const pool = new Pool({
    connectionString: connStr || process.env.DATABASE_URL,
    ssl: (connStr || process.env.DATABASE_URL || '').includes('localhost') ? false : { rejectUnauthorized: false }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};
