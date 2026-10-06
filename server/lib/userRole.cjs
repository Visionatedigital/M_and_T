'use strict';

const { normalizeRole } = require('./roles.cjs');

/** When a user has multiple rows in user_roles, pick the highest-privilege role for JWT / API. */
function pickPrimaryRole(roleRows) {
  if (!roleRows || !roleRows.length) return 'client';
  const priority = (role) => {
    const r = normalizeRole(role);
    if (r === 'admin' || r === 'administrator' || r === 'super_admin') return 0;
    if (r === 'loan_officer') return 1;
    return 2;
  };
  let best = roleRows[0].role;
  for (let i = 1; i < roleRows.length; i += 1) {
    const candidate = roleRows[i].role;
    if (priority(candidate) < priority(best)) best = candidate;
  }
  return best;
}

async function fetchPrimaryRoleForUser(db, userId) {
  const { rows } = await db.query(
    `SELECT role FROM user_roles WHERE user_id = $1 ORDER BY
      CASE lower(trim(role))
        WHEN 'admin' THEN 0
        WHEN 'administrator' THEN 0
        WHEN 'super_admin' THEN 0
        WHEN 'loan_officer' THEN 1
        ELSE 2
      END,
      role ASC`,
    [userId],
  );
  return pickPrimaryRole(rows);
}

module.exports = { pickPrimaryRole, fetchPrimaryRoleForUser };
