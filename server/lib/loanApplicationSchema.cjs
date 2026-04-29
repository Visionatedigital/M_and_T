/**
 * Runtime column detection for public.loan_applications — Supabase / manual DBs differ
 * (e.g. some installs never added branch_name).
 */
const db = require('../db.cjs');

let cachedSet = null;
let cachedAt = 0;
const TTL_MS = 5 * 60 * 1000;

/** @returns {Promise<Set<string>>} */
async function loanApplicationColumns() {
    const now = Date.now();
    if (cachedSet && now - cachedAt < TTL_MS) return cachedSet;
    const { rows } = await db.query(
        `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'loan_applications'
        `
    );
    cachedSet = new Set(rows.map((r) => r.column_name));
    cachedAt = now;
    return cachedSet;
}

module.exports = { loanApplicationColumns };
