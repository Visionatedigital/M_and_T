/**
 * Canonical client / loan ID format: MT001, MT002, … (MT + 3 zero-padded digits).
 * Replaces legacy random MNT-###### borrower codes.
 */

const MT_CODE_RE = /^MT[0-9]{3}$/i;
const LEGACY_MNT_RE = /^MNT-?[0-9]{5,6}$/i;

function normalizeMtCode(value) {
  const s = String(value || '').trim().toUpperCase();
  return s || '';
}

function isMtCode(value) {
  return MT_CODE_RE.test(normalizeMtCode(value));
}

function isLegacyMntCode(value) {
  return LEGACY_MNT_RE.test(normalizeMtCode(value));
}

/**
 * Next unused MT### across borrowers.unique_number and loan_applications.loan_reference.
 * @param {import('pg').Pool | import('pg').PoolClient} db
 */
async function nextMtCode(db) {
  const { rows } = await db.query(`
    SELECT COALESCE(MAX(n), 0) AS n
    FROM (
      SELECT CAST(substring(upper(unique_number) from 3) AS int) AS n
      FROM borrowers
      WHERE unique_number ~* '^MT[0-9]{3}$'
      UNION ALL
      SELECT CAST(substring(upper(loan_reference) from 3) AS int) AS n
      FROM loan_applications
      WHERE loan_reference ~* '^MT[0-9]{3}$'
    ) t
  `);
  const next = Number(rows[0]?.n || 0) + 1;
  if (next > 999) {
    throw new Error('MT ID sequence exhausted (MT999). Contact support to extend the format.');
  }
  return `MT${String(next).padStart(3, '0')}`;
}

/**
 * Prefer an unused MT### if the client sent one; otherwise allocate the next code.
 * Blank / legacy MNT-… values are replaced with a new MT###.
 * @param {import('pg').Pool | import('pg').PoolClient} db
 * @param {string | null | undefined} preferred
 * @param {{ excludeBorrowerId?: string | null, excludeLoanId?: string | null }} [opts]
 */
async function resolveMtCode(db, preferred, opts = {}) {
  const code = normalizeMtCode(preferred);

  if (isMtCode(code)) {
    const params = [code];
    let borrowerClause = 'upper(unique_number) = $1';
    let loanClause = 'upper(loan_reference) = $1';
    if (opts.excludeBorrowerId) {
      params.push(opts.excludeBorrowerId);
      borrowerClause += ` AND id <> $${params.length}`;
    }
    if (opts.excludeLoanId) {
      params.push(opts.excludeLoanId);
      loanClause += ` AND id <> $${params.length}`;
    }
    const { rows } = await db.query(
      `
      SELECT 1 FROM borrowers WHERE ${borrowerClause}
      UNION ALL
      SELECT 1 FROM loan_applications WHERE ${loanClause}
      LIMIT 1
      `,
      params,
    );
    if (!rows.length) return code;
  }

  return nextMtCode(db);
}

module.exports = {
  MT_CODE_RE,
  isMtCode,
  isLegacyMntCode,
  normalizeMtCode,
  nextMtCode,
  resolveMtCode,
};
