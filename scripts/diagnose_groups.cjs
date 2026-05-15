require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../server/db.cjs');

async function main() {
  const one = async (sql, params = []) => (await db.query(sql, params)).rows[0];

  const groups = await one('SELECT COUNT(*)::int AS c FROM groups');
  const loansGroupId = await one(
    `SELECT COUNT(*)::int AS c FROM loan_applications
     WHERE group_id IS NOT NULL AND status NOT IN ('rejected')`
  );
  const loansGroupName = await one(
    `SELECT COUNT(*)::int AS c FROM loan_applications
     WHERE group_name IS NOT NULL AND TRIM(group_name) != ''
       AND status NOT IN ('rejected')`
  );
  const groupsWithLoans = await one(
    `SELECT COUNT(DISTINCT g.id)::int AS c
     FROM groups g
     INNER JOIN loan_applications la ON la.group_id = g.id
       AND la.status NOT IN ('rejected')`
  );
  const orphanGroups = await one(
    `SELECT COUNT(*)::int AS c FROM groups g
     WHERE NOT EXISTS (
       SELECT 1 FROM loan_applications la
       WHERE la.group_id = g.id AND la.status NOT IN ('rejected')
     )`
  );

  const sampleGroups = (
    await db.query(
      `SELECT g.group_name,
              COUNT(la.id)::int AS loans,
              COUNT(DISTINCT la.borrower_id)::int AS members
       FROM groups g
       LEFT JOIN loan_applications la ON la.group_id = g.id
         AND la.status NOT IN ('rejected')
       GROUP BY g.id, g.group_name
       ORDER BY loans DESC, g.group_name
       LIMIT 15`
    )
  ).rows;

  const nameOnly = (
    await db.query(
      `SELECT group_name, COUNT(*)::int AS loan_count
       FROM loan_applications
       WHERE group_id IS NULL
         AND group_name IS NOT NULL AND TRIM(group_name) != ''
         AND status NOT IN ('rejected')
       GROUP BY group_name
       ORDER BY loan_count DESC
       LIMIT 10`
    )
  ).rows;

  console.log('\n=== Group / loan linkage (local DB) ===\n');
  console.log('Total rows in groups table:', groups.c);
  console.log('Loans with group_id (non-rejected):', loansGroupId.c);
  console.log('Loans with group_name text only:', loansGroupName.c);
  console.log('Groups that have at least one linked loan:', groupsWithLoans.c);
  console.log('Orphan groups (no linked loans):', orphanGroups.c);
  console.log('\nTop groups by linked loan count:');
  console.table(sampleGroups);
  if (nameOnly.length) {
    console.log('\nLoans with group_name but NO group_id (sync would fix these):');
    console.table(nameOnly);
  } else {
    console.log('\nNo loans with group_name-only (no group_id) — sync_group_ids has nothing to do.');
  }

  const groupLoanSample = (
    await db.query(
      `SELECT la.id, la.full_name, la.borrower_id, g.group_name, la.loan_product
       FROM loan_applications la
       JOIN groups g ON g.id = la.group_id
       WHERE la.status NOT IN ('rejected')
       LIMIT 5`
    )
  ).rows;
  const withBorrower = await one(
    `SELECT COUNT(*)::int AS c FROM loan_applications
     WHERE group_id IS NOT NULL AND borrower_id IS NOT NULL
       AND status NOT IN ('rejected')`
  );
  console.log('\nGroup-linked loans with borrower_id set:', withBorrower.c, 'of', loansGroupId.c);
  console.log('Sample group-linked loans:');
  console.table(groupLoanSample);

  const gmStats = await one(
    `SELECT
       COUNT(*)::int AS loans,
       SUM(jsonb_array_length(COALESCE(group_members, '[]'::jsonb)))::int AS total_json_members,
       COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(group_members, '[]'::jsonb)) > 0)::int AS loans_with_members
     FROM loan_applications
     WHERE group_id IS NOT NULL AND status NOT IN ('rejected')`
  );
  console.log('\ngroup_members JSON on group loans:', gmStats);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.pool.end());
