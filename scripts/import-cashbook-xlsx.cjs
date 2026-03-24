/**
 * Import cashbook Excel (public/Cash book 2025- 2026.xlsx) into accounting_entries.
 * Sheets: 2025, 2026 — both processed unless --sheet is passed.
 *
 * Defaults: payment_method = mobile_money (per business preference).
 * Usage:
 *   node scripts/import-cashbook-xlsx.cjs --dry-run
 *   node scripts/import-cashbook-xlsx.cjs --replace
 *   node scripts/import-cashbook-xlsx.cjs --replace --sheet 2025
 *
 * Requires DATABASE_URL / .env and dependencies: xlsx, pg (via server/db.cjs).
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const XLSX = require('xlsx');

/** Legacy rows (old imports) — deleted on --replace */
const LEGACY_DESC_PREFIX = 'Cashbook Import |';

const DEFAULT_PAYMENT = 'mobile_money';

/** Clean line text for Details (no “import” prefix; date/sheet context is in the row date + narration). */
function normalizeLineDescription(original) {
    return String(original ?? '')
        .trim()
        .replace(/\s+/g, ' ');
}

/** Excel serial (days since 1899-12-30) → YYYY-MM-DD */
function serialToDate(serial) {
    if (serial == null || serial === '') return null;
    if (typeof serial === 'number' && serial > 20000 && serial < 80000) {
        const utc = Math.round((serial - 25569) * 86400 * 1000);
        const d = new Date(utc);
        if (Number.isNaN(d.getTime())) return null;
        return d.toISOString().slice(0, 10);
    }
    return null;
}

function parseDisplayDate(s) {
    if (s == null || s === '') return null;
    const t = String(s).trim();
    const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
        const d = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10);
        const y = parseInt(m[3], 10);
        return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return null;
}

function cellDate(cell) {
    if (cell == null || cell === '') return null;
    if (cell instanceof Date && !Number.isNaN(cell.getTime())) {
        return cell.toISOString().slice(0, 10);
    }
    if (typeof cell === 'number') return serialToDate(cell);
    return parseDisplayDate(cell);
}

function num(v) {
    if (v == null || v === '') return 0;
    const n = parseFloat(String(v).replace(/,/g, ''));
    return Number.isFinite(n) ? Math.abs(n) : 0;
}

/**
 * Map free-text description → expense category (accounting.cjs EXPENSE_CATEGORIES).
 */
function categorizeExpense(description) {
    const d = String(description || '').toLowerCase();

    if (/grand total|opening balance/.test(d)) return null;

    /** Refunds / reversals before rent (avoids “Nakasero” in refund text → Office Rent). */
    if (/refund|security fees refund/.test(d)) return 'Other Expenses';

    if (/varlon|technology|software|system payment|payment to varlon/.test(d)) return 'Direct Fee Costs';
    if (/subscription|loan disk|disk subscription/.test(d)) return 'Internet & Communications';

    if ((/rent|kasangati|nakasero/.test(d) && /rent|office/.test(d)) || /payment for rent|rent payment|rent for the month/.test(d)) {
        return 'Office Rent';
    }
    if (/electricity|water payment|umeme|liquid soap/.test(d)) return 'Utilities';
    if (/nssf/.test(d)) return 'Other Expenses';
    if (/ura|penalty.*ura/.test(d)) return 'Other Expenses';
    if (/disbursement.*client|disbursements.*client/.test(d)) return 'Loan Disbursement';
    if (/transport|fuel/.test(d) && !/field recovery to loan officer/.test(d)) return 'Transport';
    if (
        /salary|wages|facilitation|meal and field|field transportation|voice bundle|cleaner|manager|payment to staff|musimenta|bukenya|benon|mutendwa|keza|elizabeth|junior|liz|recovery to loan officer|loan officer|december payment to liz|payment to liz|payment to field recovery|field recovery to loan officer/.test(
            d
        )
    ) {
        return 'Salary & Wages';
    }
    if (/bank charge|withdraw charge|transaction charge|bulk charge|transaction fees|deposit charge|airtel deposit|mobile money charge|wallet charge|bulk interest from airtel/.test(d)) {
        return 'Bank Charges';
    }
    if (/motorcycle|repair/.test(d)) return 'Repairs & Maintenance';
    if (/legal|umra|ursb|lawyer|joselyn|renewal|filing|annual return/.test(d)) return 'Legal & Professional Fees';

    return 'Other Expenses';
}

/**
 * Map receipt line → revenue category.
 */
function categorizeRevenue(description) {
    const d = String(description || '').toLowerCase();
    if (/grand total|opening balance/.test(d)) return null;
    if (/interest/.test(d) && !/charge/.test(d)) return 'Interest Income';
    if (/repayment|principal|collection account|cash withdraw from bulk|bank to wallet|withdraw from.*cheque|borrowed cash/.test(d)) {
        return 'Principal Recovery';
    }
    if (/deposit|transfer from|transfer.*account/.test(d)) return 'Other Income';
    return 'Other Income';
}

function shouldSkipRow(desc) {
    const d = String(desc || '').trim().toLowerCase();
    if (!d) return true;
    if (d.includes('grand total')) return true;
    if (d.includes('opening balance')) return true;
    return false;
}


async function getRecordedBy(db) {
    try {
        const { rows } = await db.query(`
            SELECT ur.user_id::text AS id
            FROM user_roles ur
            WHERE ur.role::text = 'admin'
            LIMIT 1
        `);
        return rows[0]?.id || null;
    } catch {
        return null;
    }
}

async function importSheet(sheetName, data, options) {
    const { dryRun, recordedBy, db } = options;
    let headerRow = -1;
    for (let i = 0; i < Math.min(data.length, 30); i++) {
        const row = data[i] || [];
        const joined = row.map((c) => String(c || '').toLowerCase()).join('|');
        if (joined.includes('payments') && joined.includes('balance')) {
            headerRow = i;
            break;
        }
    }
    if (headerRow < 0) {
        console.warn(`Sheet ${sheetName}: header not found, assuming row 0`);
        headerRow = 0;
    }

    let lastDate = null;
    const inserts = [];

    for (let i = headerRow + 1; i < data.length; i++) {
        const row = data[i] || [];
        const rawDesc = row[1];
        const desc = rawDesc != null ? String(rawDesc).trim() : '';
        if (shouldSkipRow(desc)) continue;

        const dCell = row[0];
        const parsed = cellDate(dCell);
        if (parsed) lastDate = parsed;
        const entryDate = lastDate || new Date().toISOString().slice(0, 10);

        const receipt = num(row[3]);
        const payment = num(row[4]);

        if (receipt <= 0 && payment <= 0) continue;

        if (receipt > 0) {
            const cat = categorizeRevenue(desc);
            if (!cat) continue;
            inserts.push({
                entry_type: 'revenue',
                category: cat,
                description: normalizeLineDescription(desc),
                narrationTag: `Sheet ${sheetName}`,
                amount: receipt,
                entry_date: entryDate,
            });
        }
        if (payment > 0) {
            const cat = categorizeExpense(desc);
            if (!cat) continue;
            inserts.push({
                entry_type: 'expense',
                category: cat,
                description: normalizeLineDescription(desc),
                narrationTag: `Sheet ${sheetName}`,
                amount: payment,
                entry_date: entryDate,
            });
        }
    }

    const rev = inserts.filter((x) => x.entry_type === 'revenue').length;
    const exp = inserts.filter((x) => x.entry_type === 'expense').length;
    console.log(`Sheet ${sheetName}: ${inserts.length} entries (revenue ${rev}, expense ${exp})`);

    if (dryRun) {
        inserts.slice(0, 15).forEach((r, j) => console.log(`  [${j + 1}]`, r.entry_date, r.entry_type, r.category, r.amount, String(r.description).slice(0, 80)));
        if (inserts.length > 15) console.log(`  ... +${inserts.length - 15} more`);
        return inserts.length;
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        for (const r of inserts) {
            await client.query(
                `INSERT INTO accounting_entries (entry_type, category, description, narration, amount, entry_date, payment_method, recorded_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [r.entry_type, r.category, r.description, r.narrationTag, r.amount, r.entry_date, DEFAULT_PAYMENT, recordedBy]
            );
        }
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

    return inserts.length;
}

/**
 * Remove prior import runs: legacy description prefix and/or rows tagged narration "Sheet YYYY".
 * @param {string | null} sheetOnly — if set, only remove that sheet’s tag (and legacy once).
 */
async function deletePreviousImports(db, sheetOnly) {
    const { rowCount: legacyCount } = await db.query(
        `DELETE FROM accounting_entries WHERE description ILIKE $1`,
        [`${LEGACY_DESC_PREFIX}%`]
    );
    console.log(`Removed ${legacyCount} legacy import rows (old "${LEGACY_DESC_PREFIX}…" descriptions).`);

    if (sheetOnly) {
        const tag = `Sheet ${sheetOnly}`;
        const { rowCount } = await db.query(`DELETE FROM accounting_entries WHERE narration = $1`, [tag]);
        console.log(`Removed ${rowCount} rows tagged "${tag}".`);
    } else {
        const { rowCount } = await db.query(
            `DELETE FROM accounting_entries WHERE narration LIKE 'Sheet %'`
        );
        console.log(`Removed ${rowCount} rows from previous sheet-tagged imports (narration "Sheet …").`);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const replace = args.includes('--replace');
    const sheetArg = args.find((a) => a.startsWith('--sheet='));
    const sheetOnly = sheetArg ? sheetArg.split('=')[1] : null;

    const xlsxPath = path.join(__dirname, '..', 'public', 'Cash book 2025- 2026.xlsx');
    const wb = XLSX.readFile(xlsxPath, { cellDates: true });

    const sheets = sheetOnly ? [sheetOnly] : ['2025', '2026'];
    for (const name of sheets) {
        if (!wb.SheetNames.includes(name)) {
            console.error(`Sheet "${name}" not found. Available:`, wb.SheetNames);
            process.exit(1);
        }
    }

    let db;
    let recordedBy = null;
    if (!dryRun) {
        db = require('../server/db.cjs');
        recordedBy = await getRecordedBy(db);
        if (!recordedBy) {
            console.warn('Warning: no admin user_id for recorded_by — using NULL if allowed.');
        }
        if (replace) {
            await deletePreviousImports(db, sheetOnly);
        }
    } else if (replace) {
        console.log('[dry-run] Would delete legacy "Cashbook Import |…" rows and prior "Sheet …" tagged rows before import.');
    }

    let total = 0;
    for (const sheetName of sheets) {
        const data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null });
        const n = await importSheet(sheetName, data, { dryRun, recordedBy, db });
        total += n;
    }

    console.log(
        dryRun
            ? `\nDry run complete. ${total} rows would be inserted (payment_method=${DEFAULT_PAYMENT}).`
            : `\nDone. Imported ${total} accounting entries (payment_method=${DEFAULT_PAYMENT}).`
    );

    if (!dryRun && db) await db.pool.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
