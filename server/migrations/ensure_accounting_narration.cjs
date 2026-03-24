/**
 * Ensures accounting_entries.narration exists (PostgreSQL).
 * Run: node server/migrations/ensure_accounting_narration.cjs
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const db = require('../db.cjs');

async function migrate() {
    try {
        await db.query(`
            ALTER TABLE accounting_entries ADD COLUMN IF NOT EXISTS narration text;
        `);
        console.log('✅ accounting_entries.narration ensured');
    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        process.exit(0);
    }
}

migrate();
