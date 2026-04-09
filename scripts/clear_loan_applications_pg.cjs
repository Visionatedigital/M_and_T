/**
 * Remove ALL loan applications and related repayment rows (fresh start for loans).
 * Does NOT delete borrowers, clients, staff, or accounting setup.
 *
 * Usage:
 *   node scripts/clear_loan_applications_pg.cjs           # dry-run (counts only)
 *   node scripts/clear_loan_applications_pg.cjs --execute # actually delete
 *
 * Requires DATABASE_URL in .env (same as API).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');

const execute = process.argv.includes('--execute');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

async function main() {
    const client = new Client({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    await client.connect();

    const rCount = await client.query('SELECT COUNT(*)::int AS c FROM public.repayments');
    const laCount = await client.query('SELECT COUNT(*)::int AS c FROM public.loan_applications');
    const rep = rCount.rows[0].c;
    const la = laCount.rows[0].c;

    console.log('Current counts:');
    console.log(`  repayments:        ${rep}`);
    console.log(`  loan_applications: ${la}`);

    if (!execute) {
        console.log('\nDry run only. To delete, run:');
        console.log('  node scripts/clear_loan_applications_pg.cjs --execute');
        await client.end();
        return;
    }

    console.log('\nDeleting…');
    await client.query('BEGIN');
    try {
        const delR = await client.query('DELETE FROM public.repayments');
        const delLa = await client.query('DELETE FROM public.loan_applications');
        await client.query('COMMIT');
        console.log(`  Deleted ${delR.rowCount} repayment row(s).`);
        console.log(`  Deleted ${delLa.rowCount} loan application row(s).`);
        console.log('  (Collateral linked to those loans is removed via ON DELETE CASCADE where applicable.)');
        console.log('\nDone. Loan applications list is empty; borrowers are unchanged.');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        await client.end();
    }
}

main().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
