/**
 * Sync group names from MT_ADMIN_fixed.xlsx to loan_applications.
 * Matches loans by full_name (case-insensitive) and updates group_id from groups table.
 * Run: node scripts/sync_groups_from_xlsx.cjs
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../server/db.cjs');
const pool = db.pool;
const path = require('path');
const XLSX = require('xlsx');

const XLSX_PATH = path.join(__dirname, '../public/MT_ADMIN_fixed.xlsx');

async function main() {
  const client = await pool.connect();
  try {
    // 1. Load xlsx
    const wb = XLSX.readFile(XLSX_PATH);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const header = rows[1]; // Row 2 is header: Released, Name, Principal, Paid, Balance, Group, ...
    const nameIdx = header.indexOf('Name');
    const groupIdx = header.indexOf('Group');
    const loanIdIdx = header.indexOf('Loan Id');

    if (nameIdx < 0 || groupIdx < 0) {
      console.error('Could not find Name or Group column. Header:', header);
      process.exit(1);
    }

    // 2. Build map: normalized_name -> group_name from xlsx
    const xlsxData = [];
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      const name = (row[nameIdx] || '').toString().trim();
      const group = (row[groupIdx] || '').toString().trim();
      const loanId = loanIdIdx >= 0 ? (row[loanIdIdx] || '').toString().trim() : null;
      if (name && group) {
        xlsxData.push({ name, group, loanId });
      }
    }

    console.log(`Loaded ${xlsxData.length} rows from xlsx with Group info`);

    // 3. Get all groups
    const { rows: groups } = await client.query('SELECT id, group_name FROM groups');
    const groupByName = new Map(groups.map(g => [g.group_name.trim().toUpperCase(), g.id]));

    // 4. For each xlsx row, find matching loan and update
    let updated = 0;
    let notFound = 0;
    let noGroup = 0;

    for (const { name, group, loanId } of xlsxData) {
      const groupId = groupByName.get(group.toUpperCase());
      if (!groupId) {
        noGroup++;
        continue;
      }

      // Match loan by full_name (case-insensitive, normalize spaces)
      const normName = name.replace(/\s+/g, ' ').trim();
      const nameNoPrefix = normName.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss)\s+/i, '').trim();
      const { rows: loans } = await client.query(
        `SELECT id, full_name, group_id, group_name FROM loan_applications 
         WHERE status IN ('approved', 'disbursed', 'completed', 'settled')
         AND (
           LOWER(REGEXP_REPLACE(TRIM(full_name), '\\s+', ' ', 'g')) = LOWER($1)
           OR LOWER(REGEXP_REPLACE(TRIM(full_name), '\\s+', ' ', 'g')) = LOWER($2)
         )
         ORDER BY approved_at DESC NULLS LAST
         LIMIT 1`,
        [normName, nameNoPrefix]
      );

      if (loans.length === 0) {
        notFound++;
        continue;
      }

      const loan = loans[0];
      if (loan.group_id === groupId) continue; // Already correct

      await client.query(
        'UPDATE loan_applications SET group_id = $1, group_name = $2 WHERE id = $3',
        [groupId, group, loan.id]
      );
      updated++;
      if (updated <= 10) {
        console.log(`  Updated: ${loan.full_name} -> Group ${group}`);
      }
    }

    console.log(`\nDone. Updated ${updated} loans. Not found: ${notFound}. Group missing in DB: ${noGroup}.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
