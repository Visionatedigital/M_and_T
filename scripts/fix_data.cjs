require('dotenv').config({ path: 'server/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixMissingData() {
    try {
        const id = '27ba1b12-d4cf-4783-ab1d-f53b203d3839';
        console.log(`Fixing data for application ${id}...`);

        // Update the loan application with the profile's email/phone if missing
        // Or just hardcode it for this test record if profile is also missing
        await pool.query(`
            UPDATE loan_applications
            SET 
                email = COALESCE(email, 'loanofficer@mandt.placeholder'),
                phone_number = COALESCE(phone_number, '0700000000')
            WHERE id = $1
        `, [id]);

        console.log('SUCCESS: Data backfilled.');
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        process.exit();
    }
}

fixMissingData();
