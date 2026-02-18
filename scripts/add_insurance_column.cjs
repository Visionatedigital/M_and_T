require('dotenv').config({ path: 'server/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addInsuranceStatus() {
    try {
        console.log('Adding insurance_status column to loan_applications table...');
        await pool.query(`
            ALTER TABLE loan_applications 
            ADD COLUMN IF NOT EXISTS insurance_status TEXT DEFAULT 'Not Insured';
        `);
        console.log('SUCCESS: Column added.');
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        process.exit();
    }
}

addInsuranceStatus();
