/** Distinct key for a row in loan_applications.group_members JSONB */
const MEMBER_KEY = `COALESCE(
  NULLIF(TRIM(elem->>'borrower_id'), ''),
  NULLIF(TRIM(elem->>'nin'), ''),
  LOWER(REGEXP_REPLACE(TRIM(elem->>'name'), '\\s+', ' ', 'g'))
)`;

/**
 * Count distinct group members from group_members JSON (fallback: loan full_name).
 * @param {string} groupIdSql - SQL ref to group id, e.g. g.id
 * @param {string} [loanAliasWhere] - extra AND clauses; use la_mc / la_fn aliases
 */
function sqlMemberCountSubquery(groupIdSql, loanAliasWhere = '') {
  const mcWhere = loanAliasWhere.replace(/\bla\./g, 'la_mc.').replace(/\bla_fn\./g, 'la_mc.');
  const fnWhere = loanAliasWhere.replace(/\bla\./g, 'la_fn.').replace(/\bla_mc\./g, 'la_fn.');
  return `COALESCE(
    (
      SELECT COUNT(DISTINCT mk)::int
      FROM (
        SELECT ${MEMBER_KEY} AS mk
        FROM loan_applications la_mc
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(la_mc.group_members, '[]'::jsonb)) AS elem
        WHERE la_mc.group_id = ${groupIdSql}
          AND la_mc.status != 'rejected'
          ${mcWhere}
          AND COALESCE(NULLIF(TRIM(elem->>'name'), ''), NULLIF(TRIM(elem->>'nin'), '')) IS NOT NULL
      ) s
      WHERE mk IS NOT NULL
    ),
    (
      SELECT COUNT(DISTINCT LOWER(REGEXP_REPLACE(TRIM(la_fn.full_name), '\\s+', ' ', 'g')))::int
      FROM loan_applications la_fn
      WHERE la_fn.group_id = ${groupIdSql}
        AND la_fn.status != 'rejected'
        ${fnWhere}
        AND NULLIF(TRIM(la_fn.full_name), '') IS NOT NULL
    ),
    0
  )`;
}

/** Officer scope: group loan rows with no borrower_id but members assigned to officer */
function sqlOfficerGroupLoanFilter(paramIndex = 1) {
  return ` AND (
    la.borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $${paramIndex})
    OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE(la.group_members, '[]'::jsonb)) elem_o
      WHERE NULLIF(TRIM(elem_o->>'borrower_id'), '') ~* '^[0-9a-f-]{36}$'
        AND (elem_o->>'borrower_id')::uuid IN (
          SELECT id FROM borrowers WHERE assigned_officer_id = $${paramIndex}
        )
    )
  ) `;
}

module.exports = {
  MEMBER_KEY,
  sqlMemberCountSubquery,
  sqlOfficerGroupLoanFilter,
};
