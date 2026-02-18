const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:Sundaylover12@localhost:5432/MandT',
});

async function listColumns() {
    try {
        console.log('Listing columns for table: profiles');
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles'
            ORDER BY ordinal_position;
        `);

        if (res.rows.length === 0) {
            console.log('Table profiles not found or has no columns.');
        } else {
            console.table(res.rows);
        }
    } catch (err) {
        console.error('Error listing columns:', err);
    } finally {
        await pool.end();
    }
}

listColumns();
