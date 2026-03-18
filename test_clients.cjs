require('dotenv').config({ path: 'd:/m-t-growth-gateway/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function test() {
  try {
    const r1 = await pool.query('SELECT full_name FROM profiles WHERE full_name IS NOT NULL');
    console.log('Staff profiles:', r1.rows.length, JSON.stringify(r1.rows.slice(0,5)));
    const r2 = await pool.query("SELECT DISTINCT ON (full_name) id, full_name FROM loan_applications WHERE group_id IS NULL ORDER BY full_name, created_at DESC LIMIT 3");
    console.log('Client rows OK:', r2.rows.length);
    const r3 = await pool.query("SELECT full_name, COUNT(*) as total_loans FROM loan_applications GROUP BY full_name LIMIT 3");
    console.log('Loan agg OK:', r3.rows.length);
    const r4 = await pool.query("SELECT la.full_name, COALESCE(SUM(r.amount), 0) as total_repaid FROM repayments r JOIN loan_applications la ON r.loan_application_id = la.id GROUP BY la.full_name LIMIT 3");
    console.log('Repayments OK:', r4.rows.length);
    console.log('ALL QUERIES PASSED');
  } catch(e) {
    console.error('FAILED:', e.message, 'Code:', e.code);
  }
  pool.end();
}
test();
