'use strict';

/**
 * JWT / user payload may use `user_id` or `id` for the auth user UUID.
 * @param {object} ctx Express req or decoded JWT / { user }
 */
function officerUserId(ctx) {
    if (!ctx || typeof ctx !== 'object') return null;
    const u = ctx.user !== undefined ? ctx.user : ctx;
    if (!u || typeof u !== 'object') return null;
    return u.user_id || u.id || null;
}

/** UG-style phone compare: strip non-digits, +256 → 0 */
function sqlNormPhonePg(columnRef) {
    return `regexp_replace(regexp_replace(trim(${columnRef}), '^\\+256', '0'), '\\D', '', 'g')`;
}

/**
 * Predicate on loan_applications only (subqueries / dashboards). Same visibility as list + join scope.
 * Also matches legacy rows: borrower_id NULL, assigned_officer_id NULL, but application phone = a borrower in this officer's book.
 */
function sqlOfficerVisibleLoanApps(alias, param) {
    const a = alias ? `${alias}.` : '';
    const appPhone = sqlNormPhonePg(`${a}phone_number`);
    return `(
        ${a}borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = ${param})
        OR (${a}borrower_id IS NULL AND ${a}assigned_officer_id = ${param})
        OR (
            ${a}borrower_id IS NULL
            AND COALESCE(NULLIF(${appPhone}, ''), '') <> ''
            AND EXISTS (
                SELECT 1 FROM borrowers b_match
                WHERE b_match.assigned_officer_id = ${param}::uuid
                AND ${sqlNormPhonePg('b_match.phone_number')} = ${appPhone}
            )
        )
    )`;
}

/**
 * For `FROM loan_applications la LEFT JOIN borrowers b_scope ON b_scope.id = la.borrower_id`.
 */
function sqlOfficerLoanListScope(loanAlias, param) {
    const a = `${loanAlias}.`;
    const appPhone = sqlNormPhonePg(`${a}phone_number`);
    return `(
        b_scope.assigned_officer_id = ${param}
        OR (${a}borrower_id IS NULL AND ${a}assigned_officer_id = ${param})
        OR (
            ${a}borrower_id IS NULL
            AND COALESCE(NULLIF(${appPhone}, ''), '') <> ''
            AND EXISTS (
                SELECT 1 FROM borrowers b_match
                WHERE b_match.assigned_officer_id = ${param}::uuid
                AND ${sqlNormPhonePg('b_match.phone_number')} = ${appPhone}
            )
        )
    )`;
}

module.exports = { officerUserId, sqlOfficerVisibleLoanApps, sqlOfficerLoanListScope };
