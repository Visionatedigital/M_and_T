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

/**
 * Predicate on loan_applications (optionally aliased).
 * Officers see: linked borrower in their book, OR no borrower link yet but the app is assigned to them.
 * @param {string} alias Table alias without dot, or '' for no prefix
 * @param {string} param Placeholder e.g. '$1'
 */
function sqlOfficerVisibleLoanApps(alias, param) {
    const a = alias ? `${alias}.` : '';
    return `(
        ${a}borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = ${param})
        OR (${a}borrower_id IS NULL AND ${a}assigned_officer_id = ${param})
    )`;
}

module.exports = { officerUserId, sqlOfficerVisibleLoanApps };
