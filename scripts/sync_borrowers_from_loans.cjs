#!/usr/bin/env node
/**
 * Sync borrowers from loan_applications
 * Creates borrower records for loans that have full_name but no borrower_id,
 * or whose borrower_id points to a non-existent borrower.
 * Run: node scripts/sync_borrowers_from_loans.cjs
 */
require('dotenv').config();
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '1') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function findOrCreateBorrower(loan) {
  const fullName = loan.full_name || 'Unknown';
  const phone = loan.phone_number || '';
  const email = loan.email || `${(fullName || '').replace(/\s+/g, '').toLowerCase()}@placeholder.com`;
  const address = [loan.village, loan.parish, loan.district].filter(Boolean).join(', ') || loan.district || '';

  // 1. Try by phone if we have it
  if (phone) {
    const { rows: byPhone } = await pool.query(
      'SELECT id FROM borrowers WHERE phone_number = $1 LIMIT 1',
      [phone]
    );
    if (byPhone.length > 0) return byPhone[0].id;
  }

  // 2. Try by full_name (case-insensitive)
  const { rows: byName } = await pool.query(
    'SELECT id FROM borrowers WHERE LOWER(TRIM(full_name)) = LOWER(TRIM($1)) LIMIT 1',
    [fullName]
  );
  if (byName.length > 0) return byName[0].id;

  // 3. Create new borrower
  const { rows: created } = await pool.query(`
    INSERT INTO borrowers (full_name, email, phone_number, id_number, date_of_birth, address, city)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `, [
    fullName,
    email,
    phone || null,
    loan.id_number || null,
    loan.date_of_birth || null,
    address || null,
    loan.district || loan.village || null
  ]);
  return created[0].id;
}

async function main() {
  console.log('Syncing borrowers from loan_applications...\n');

  // Find loans that need borrower linkage
  const { rows: loansToFix } = await pool.query(`
    SELECT la.id, la.full_name, la.phone_number, la.email, la.id_number, la.date_of_birth,
           la.district, la.village, la.parish, la.borrower_id
    FROM loan_applications la
    WHERE la.full_name IS NOT NULL AND la.full_name != ''
      AND (
        la.borrower_id IS NULL
        OR NOT EXISTS (SELECT 1 FROM borrowers b WHERE b.id = la.borrower_id)
      )
    ORDER BY la.created_at
  `);

  if (loansToFix.length === 0) {
    console.log('No loans need borrower sync. All loans already have valid borrower_id.');
    await pool.end();
    return;
  }

  console.log(`Found ${loansToFix.length} loan(s) without valid borrower records.\n`);

  let created = 0;
  let linked = 0;

  for (const loan of loansToFix) {
    try {
      const borrowerId = await findOrCreateBorrower(loan);
      await pool.query(
        'UPDATE loan_applications SET borrower_id = $1, updated_at = NOW() WHERE id = $2',
        [borrowerId, loan.id]
      );
      console.log(`  ✓ ${loan.full_name} (loan ${loan.id.slice(0, 8)}...) → borrower ${borrowerId.slice(0, 8)}...`);
      linked++;
    } catch (err) {
      console.error(`  ✗ ${loan.full_name}: ${err.message}`);
    }
  }

  console.log(`\nDone. Linked ${linked} loan(s) to borrowers.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
