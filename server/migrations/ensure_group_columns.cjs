/**
 * Migration: Ensure borrowers and loan_applications have columns needed for group loans.
 * Run with: node server/migrations/ensure_group_columns.cjs
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const db = require('../db.cjs');

async function migrate() {
    try {
        await db.query(`
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS address text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS city text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS id_number text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS date_of_birth date;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS unique_number text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS business_name text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS first_name text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS last_middle_name text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS country text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS province_state text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS zipcode text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS gender text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS title text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS working_status text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS credit_score numeric;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS landline_phone text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS description text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS borrower_photo text;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS borrower_files text[];
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS loan_officer_access boolean;
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS assigned_officer_id uuid;
        `);
        console.log('✅ Borrowers columns ensured');

        await db.query(`
            ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS borrower_id uuid REFERENCES borrowers(id) ON DELETE SET NULL;
            ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS group_members jsonb DEFAULT '[]'::jsonb;
        `);
        console.log('✅ Loan applications columns ensured');

        console.log('✅ Migration complete');
    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        process.exit(0);
    }
}

migrate();
