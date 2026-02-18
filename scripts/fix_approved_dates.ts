
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fixDates() {
    console.log('--- Fixing Approved Dates ---');
    const client = await pool.connect();

    try {
        const res = await client.query(`
            UPDATE loan_applications 
            SET approved_at = created_at 
            WHERE status IN ('disbursed', 'active') 
            AND approved_at IS NULL
        `);

        console.log(`Updated ${res.rowCount} loans.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

fixDates();
