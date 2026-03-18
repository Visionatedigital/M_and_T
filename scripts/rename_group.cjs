/**
 * Rename a group in the database.
 * Updates both groups.group_name and loan_applications.group_name.
 * Run: node scripts/rename_group.cjs "OLD_NAME" "NEW_NAME"
 * Example: node scripts/rename_group.cjs "NDYANABO" "Nangabo Group"
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../server/db.cjs');
const pool = db.pool;

async function main() {
  const oldName = process.argv[2];
  const newName = process.argv[3];

  if (!oldName || !newName) {
    console.error('Usage: node scripts/rename_group.cjs "OLD_NAME" "NEW_NAME"');
    console.error('Example: node scripts/rename_group.cjs "NDYANABO" "Nangabo Group"');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    // 1. Update groups table
    const { rowCount: groupUpdated } = await client.query(
      `UPDATE groups SET group_name = $1 WHERE TRIM(UPPER(group_name)) = TRIM(UPPER($2))`,
      [newName, oldName]
    );

    // 2. Update loan_applications.group_name
    const { rowCount: loansUpdated } = await client.query(
      `UPDATE loan_applications SET group_name = $1 WHERE TRIM(UPPER(group_name)) = TRIM(UPPER($2))`,
      [newName, oldName]
    );

    console.log(`Renamed group "${oldName}" → "${newName}"`);
    console.log(`  groups: ${groupUpdated} row(s) updated`);
    console.log(`  loan_applications: ${loansUpdated} row(s) updated`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
