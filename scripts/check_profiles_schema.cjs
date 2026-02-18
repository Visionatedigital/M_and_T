
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
    console.log('--- Checking Schema ---');
    const client = await pool.connect();
    try {
        const tables = ['profiles', 'loan_applications'];
        for (const table of tables) {
            console.log(`\nTable: ${table}`);
            const res = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            res.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkSchema();
