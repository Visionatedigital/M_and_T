const path = require('path');
const dns = require('dns');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Local ISP/router DNS often fails with EAI_AGAIN on *.supabase.com.
// This only affects this Node process (not Windows DNS).
if (!process.env.DATABASE_URL || !String(process.env.DATABASE_URL).includes('localhost')) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
}

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
