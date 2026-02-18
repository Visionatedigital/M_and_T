const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function listTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log('Tables in public schema:');
        console.log(res.rows.map(r => r.table_name).join(', '));
        await pool.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listTables();
