require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../server/db.cjs');
const { sqlMemberCountSubquery } = require('../server/lib/groupMembersSql.cjs');

async function main() {
  const memberCountSql = sqlMemberCountSubquery('g.id');
  const { rows } = await db.query(
    `SELECT g.group_name, ${memberCountSql} AS member_count
     FROM groups g
     INNER JOIN loan_applications la ON la.group_id = g.id AND la.status != 'rejected'
     GROUP BY g.id, g.group_name
     ORDER BY member_count DESC, g.group_name
     LIMIT 15`
  );
  console.table(rows);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.pool.end());
