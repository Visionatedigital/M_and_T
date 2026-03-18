/**
 * Sync group_id on loan_applications from groups table.
 * For loans with group_name but null/invalid group_id, find matching group and update.
 * Run: node scripts/sync_group_ids.cjs
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../server/db.cjs');
const pool = db.pool;

async function main() {
  const client = await pool.connect();
  try {
    // 1. Get all groups
    const { rows: groups } = await client.query('SELECT id, group_name FROM groups');
    const groupByName = new Map(groups.map(g => [g.group_name.trim().toUpperCase(), g.id]));

    // 2. Find loans with group_name but missing/invalid group_id
    const { rows: loans } = await client.query(`
      SELECT la.id, la.group_name, la.group_id
      FROM loan_applications la
      WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
      AND (
        la.group_id IS NULL
        OR la.group_id NOT IN (SELECT id FROM groups)
      )
      AND la.group_name IS NOT NULL
      AND TRIM(la.group_name) != ''
    `);

    console.log(`Found ${loans.length} loans with group_name but no valid group_id`);

    let updated = 0;
    let created = 0;

    for (const loan of loans) {
      const name = (loan.group_name || '').trim();
      if (!name) continue;

      const key = name.toUpperCase();
      let groupId = groupByName.get(key);

      if (!groupId) {
        // Create new group
        const { rows: [newGroup] } = await client.query(
          `INSERT INTO groups (group_name, description, status) VALUES ($1, $2, 'active') RETURNING id`,
          [name, `Synced from loan_applications`]
        );
        groupId = newGroup.id;
        groupByName.set(key, groupId);
        created++;
      }

      await client.query(
        'UPDATE loan_applications SET group_id = $1 WHERE id = $2',
        [groupId, loan.id]
      );
      updated++;
      console.log(`  Updated loan ${loan.id}: group_name="${name}" -> group_id=${groupId}`);
    }

    console.log(`\nDone. Updated ${updated} loans, created ${created} new groups.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
