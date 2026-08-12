'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { requireStaff } = require('../lib/roles.cjs');
const { sqlOfficerLoanListScope } = require('../lib/officerLoanScope.cjs');

router.use(requireStaff);

const TAB_STATUS_MAP = {
    processed: ['processed', 'posted', 'success', 'matched'],
    manual_review: [
        'manual_review',
        'unknown_reference',
        'inactive_loan',
        'fully_paid',
        'overpayment',
        'unmatched',
        'no_match',
        'pending',
        'failed',
        'received',
    ],
    duplicates: ['duplicate'],
};

function normalizeStatus(value) {
    return String(value || '').toLowerCase().trim();
}

function statusInTab(status, tabKey) {
    const normalized = normalizeStatus(status);
    return (TAB_STATUS_MAP[tabKey] || []).includes(normalized);
}

/** Cached column names per table — refreshed every 5 minutes */
let schemaCache = { at: 0, tables: {} };
const SCHEMA_TTL_MS = 5 * 60 * 1000;

async function getTableColumns(tableName) {
    const now = Date.now();
    if (schemaCache.at && now - schemaCache.at < SCHEMA_TTL_MS && schemaCache.tables[tableName]) {
        return schemaCache.tables[tableName];
    }
    const { rows } = await db.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1`,
        [tableName]
    );
    const cols = new Set(rows.map((r) => r.column_name));
    schemaCache.tables[tableName] = cols;
    schemaCache.at = now;
    return cols;
}

async function tableExists(tableName) {
    const cols = await getTableColumns(tableName);
    return cols.size > 0;
}

function pickColumn(columns, candidates, fallback = null) {
    for (const name of candidates) {
        if (columns.has(name)) return name;
    }
    return fallback;
}

/** SELECT fragment — NULL if column missing */
function colSelect(tableCols, tableAlias, colName, alias = colName) {
    if (tableCols.has(colName)) {
        return `${tableAlias}.${colName} AS ${alias}`;
    }
    return `NULL::text AS ${alias}`;
}

function colSelectTyped(tableCols, tableAlias, colName, pgType, alias = colName) {
    if (tableCols.has(colName)) {
        return `${tableAlias}.${colName} AS ${alias}`;
    }
    return `NULL::${pgType} AS ${alias}`;
}

async function getAirtelSchema() {
    const apmCols = await getTableColumns('airtel_payment_messages');
    if (!apmCols.size) return null;

    const laCols = await getTableColumns('loan_applications');
    const repCols = await getTableColumns('repayments');
    const aeCols = await getTableColumns('accounting_entries');

    const rawMessageCol = pickColumn(apmCols, ['raw_message', 'raw_sms', 'message_body', 'sms_body', 'original_message']);
    const receivedAtCol = pickColumn(apmCols, ['received_at', 'created_at'], 'created_at');
    const statusCol = pickColumn(apmCols, ['processing_status', 'status'], 'processing_status');
    const transactionIdCol = pickColumn(apmCols, ['transaction_id', 'external_id', 'txn_id'], 'transaction_id');
    const loanReferenceCol = pickColumn(apmCols, ['loan_reference', 'reference_normalized', 'reference_raw']);
    const parsingStatusCol = pickColumn(apmCols, ['parsing_status', 'parse_status']);
    const matchingNotesCol = pickColumn(apmCols, ['matching_notes', 'match_notes']);

    return {
        apmCols,
        laCols,
        repCols,
        aeCols,
        rawMessageCol,
        receivedAtCol,
        statusCol,
        transactionIdCol,
        loanReferenceCol,
        parsingStatusCol,
        matchingNotesCol,
        hasLoanReferenceOnLa: laCols.has('loan_reference'),
        hasExternalTxnOnRepayments: repCols.has('external_transaction_id'),
        hasAccountingEntries: aeCols.size > 0,
        hasRepaymentIdOnApm: apmCols.has('repayment_id'),
        hasAccountingEntryIdOnApm: apmCols.has('accounting_entry_id'),
    };
}

function maskPhone(phone) {
    if (!phone) return '—';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length < 4) return '***';
    const visible = digits.slice(-3);
    const prefix = digits.length > 6 ? digits.slice(0, 3) : digits.slice(0, 2);
    return `${prefix}***${visible}`;
}

function formatPaymentMethod(method) {
    if (!method) return 'Mobile money';
    const m = String(method).toLowerCase().replace(/_/g, ' ');
    if (m.includes('airtel')) return 'Airtel Money';
    if (m.includes('mtn')) return 'MTN Mobile Money';
    if (m === 'mobile money' || m === 'mobile') return 'Mobile Money';
    return m.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getOfficerScope(req, loanAlias = 'la', paramIndex = 1) {
    const role = String(req.user?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
    const userId = req.user?.user_id || req.user?.id;
    if (role !== 'loan_officer' || !userId) {
        return { joinSql: '', whereSql: '', values: [] };
    }
    const p = `$${paramIndex}`;
    return {
        joinSql: ` LEFT JOIN borrowers b_scope ON b_scope.id = ${loanAlias}.borrower_id `,
        whereSql: `(
            apm.matched_loan_application_id IS NOT NULL
            AND ${sqlOfficerLoanListScope(loanAlias, p)}
        )`,
        values: [userId],
    };
}

function sqlErrorResponse(res, err, context) {
    console.error(`[airtel-payments/${context}]`, err.message || err);
    const payload = { error: 'Failed to fetch mobile money payments' };
    if (process.env.NODE_ENV !== 'production') {
        payload.detail = err.message;
        payload.hint = 'Run MANUAL_MIGRATIONS.sql section 20 in Supabase if airtel_payment_messages or loan_reference is missing.';
    }
    return res.status(500).json(payload);
}

function loanReferenceSelect(schema) {
    const parts = [];
    for (const col of ['loan_reference', 'reference_normalized', 'reference_raw']) {
        if (schema.apmCols.has(col)) parts.push(`apm.${col}`);
    }
    if (!parts.length) return 'NULL::text AS loan_reference';
    return `COALESCE(${parts.join(', ')}) AS loan_reference`;
}

function parsingStatusSelect(schema) {
    if (schema.parsingStatusCol) {
        return `apm.${schema.parsingStatusCol} AS parsing_status`;
    }
    return 'NULL::text AS parsing_status';
}

function matchingNotesSelect(schema) {
    if (schema.matchingNotesCol) {
        return `apm.${schema.matchingNotesCol} AS matching_notes`;
    }
    return 'NULL::text AS matching_notes';
}

function buildRepaymentParts(schema) {
    let repaymentJoin = '';
    let repaymentSelect = 'NULL::uuid AS linked_repayment_id';
    if (schema.hasExternalTxnOnRepayments) {
        repaymentJoin = `LEFT JOIN repayments r ON r.external_transaction_id = apm.${schema.transactionIdCol}`;
        repaymentSelect = schema.hasRepaymentIdOnApm
            ? 'COALESCE(apm.repayment_id, r.id) AS linked_repayment_id'
            : 'r.id AS linked_repayment_id';
    } else if (schema.hasRepaymentIdOnApm) {
        repaymentSelect = 'apm.repayment_id AS linked_repayment_id';
    }
    return { repaymentJoin, repaymentSelect };
}

function buildAccountingParts(schema) {
    let accountingJoin = '';
    let accountingSelect = 'NULL::uuid AS linked_accounting_entry_id';
    if (schema.hasAccountingEntries && schema.hasExternalTxnOnRepayments) {
        accountingJoin = 'LEFT JOIN accounting_entries ae ON ae.reference_id = r.id';
        accountingSelect = schema.hasAccountingEntryIdOnApm
            ? 'COALESCE(apm.accounting_entry_id, ae.id) AS linked_accounting_entry_id'
            : 'ae.id AS linked_accounting_entry_id';
    } else if (schema.hasAccountingEntryIdOnApm) {
        accountingSelect = 'apm.accounting_entry_id AS linked_accounting_entry_id';
    }
    return { accountingJoin, accountingSelect };
}

function buildListQuery(req, schema) {
    const scope = getOfficerScope(req, 'la', 1);
    const values = [...scope.values];
    const whereParts = [];

    if (scope.whereSql) {
        whereParts.push(scope.whereSql);
    }

    const tab = String(req.query.tab || 'processed').toLowerCase();
    const statuses = TAB_STATUS_MAP[tab] || TAB_STATUS_MAP.processed;
    values.push(statuses.map((s) => s.toLowerCase()));
    whereParts.push(`LOWER(apm.${schema.statusCol}) = ANY($${values.length}::text[])`);

    const receivedExpr = `apm.${schema.receivedAtCol}`;

    if (req.query.date_from) {
        values.push(req.query.date_from);
        whereParts.push(`${receivedExpr} >= $${values.length}::date`);
    }
    if (req.query.date_to) {
        values.push(req.query.date_to);
        whereParts.push(`${receivedExpr} < ($${values.length}::date + interval '1 day')`);
    }
    if (req.query.loan_reference) {
        values.push(`%${String(req.query.loan_reference).trim().toUpperCase()}%`);
        const refParts = [];
        for (const col of ['loan_reference', 'reference_normalized', 'reference_raw']) {
            if (schema.apmCols.has(col)) {
                refParts.push(`UPPER(COALESCE(apm.${col}, '')) LIKE $${values.length}`);
            }
        }
        if (schema.hasLoanReferenceOnLa) {
            refParts.push(`UPPER(COALESCE(la.loan_reference, '')) LIKE $${values.length}`);
        }
        if (refParts.length) {
            whereParts.push(`(${refParts.join(' OR ')})`);
        }
    }
    if (req.query.transaction_id) {
        values.push(`%${String(req.query.transaction_id).trim()}%`);
        whereParts.push(`apm.${schema.transactionIdCol} ILIKE $${values.length}`);
    }
    if (req.query.processing_status) {
        values.push(String(req.query.processing_status).trim());
        whereParts.push(`apm.${schema.statusCol} = $${values.length}`);
    }
    if (req.query.officer_id) {
        values.push(req.query.officer_id);
        whereParts.push(`COALESCE(la.assigned_officer_id, b.assigned_officer_id) = $${values.length}::uuid`);
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    const rawSelect = schema.rawMessageCol ? `apm.${schema.rawMessageCol} AS raw_message` : 'NULL::text AS raw_message';
    const matchedLoanRefSelect = schema.hasLoanReferenceOnLa
        ? 'la.loan_reference AS matched_loan_reference'
        : 'NULL::text AS matched_loan_reference';

    const { repaymentJoin, repaymentSelect } = buildRepaymentParts(schema);
    const { accountingJoin, accountingSelect } = buildAccountingParts(schema);

    const sql = `
        SELECT
            apm.id,
            ${colSelect(schema.apmCols, 'apm', schema.transactionIdCol, 'transaction_id')},
            ${rawSelect},
            ${colSelect(schema.apmCols, 'apm', 'sender_phone')},
            ${colSelectTyped(schema.apmCols, 'apm', 'amount', 'numeric')},
            ${loanReferenceSelect(schema)},
            ${colSelectTyped(schema.apmCols, 'apm', 'matched_loan_application_id', 'uuid')},
            apm.${schema.statusCol} AS processing_status,
            ${colSelectTyped(schema.apmCols, 'apm', 'match_confidence', 'numeric')},
            ${parsingStatusSelect(schema)},
            ${matchingNotesSelect(schema)},
            ${colSelect(schema.apmCols, 'apm', 'payment_method', 'payment_method')},
            ${colSelectTyped(schema.apmCols, 'apm', 'previous_balance', 'numeric')},
            ${colSelectTyped(schema.apmCols, 'apm', 'outstanding_balance', 'numeric')},
            ${colSelectTyped(schema.apmCols, 'apm', 'wallet_balance', 'numeric', 'previous_balance_alt')},
            ${colSelectTyped(schema.apmCols, 'apm', 'repayment_id', 'uuid')},
            ${colSelectTyped(schema.apmCols, 'apm', 'accounting_entry_id', 'uuid')},
            ${receivedExpr} AS received_at,
            ${colSelectTyped(schema.apmCols, 'apm', 'processed_at', 'timestamptz')},
            ${colSelectTyped(schema.apmCols, 'apm', 'created_at', 'timestamptz')},
            ${colSelectTyped(schema.apmCols, 'apm', 'updated_at', 'timestamptz')},
            la.full_name AS borrower_full_name,
            ${matchedLoanRefSelect},
            la.status AS loan_status,
            COALESCE(la.assigned_officer_id, b.assigned_officer_id) AS assigned_officer_id,
            COALESCE(officer_la.full_name, officer_b.full_name) AS assigned_officer_name,
            ${repaymentSelect},
            ${accountingSelect}
        FROM airtel_payment_messages apm
        LEFT JOIN loan_applications la ON la.id = apm.matched_loan_application_id
        LEFT JOIN borrowers b ON b.id = la.borrower_id
        LEFT JOIN profiles officer_la ON officer_la.id = la.assigned_officer_id
        LEFT JOIN profiles officer_b ON officer_b.id = b.assigned_officer_id
        ${repaymentJoin}
        ${accountingJoin}
        ${scope.joinSql}
        ${whereClause}
        ORDER BY ${receivedExpr} DESC NULLS LAST
        LIMIT 500
    `;

    return { sql, values };
}

function mapRow(row) {
    const status = row.processing_status;
    const isManualReview = statusInTab(status, 'manual_review');
    const isDuplicate = statusInTab(status, 'duplicates');
    const isProcessed = statusInTab(status, 'processed');

    return {
        id: row.id,
        transaction_id: row.transaction_id,
        received_at: row.received_at,
        loan_reference: row.loan_reference || row.matched_loan_reference || null,
        borrower_full_name: row.borrower_full_name || null,
        sender_phone: maskPhone(row.sender_phone),
        sender_phone_raw: row.sender_phone || null,
        amount: parseFloat(row.amount) || 0,
        previous_balance: row.previous_balance != null
            ? parseFloat(row.previous_balance)
            : (row.previous_balance_alt != null ? parseFloat(row.previous_balance_alt) : null),
        outstanding_balance: row.outstanding_balance != null ? parseFloat(row.outstanding_balance) : null,
        processing_status: row.processing_status,
        match_confidence: row.match_confidence != null ? parseFloat(row.match_confidence) : null,
        payment_method: formatPaymentMethod(row.payment_method),
        assigned_officer_id: row.assigned_officer_id || null,
        assigned_officer_name: row.assigned_officer_name || 'Unassigned',
        matched_loan_application_id: row.matched_loan_application_id || null,
        loan_status: row.loan_status || null,
        repayment_id: row.repayment_id || row.linked_repayment_id || null,
        accounting_entry_id: row.accounting_entry_id || row.linked_accounting_entry_id || null,
        parsing_status: row.parsing_status || null,
        matching_notes: row.matching_notes || null,
        raw_message: row.raw_message || null,
        processed_at: row.processed_at || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_manual_review: isManualReview,
        is_duplicate: isDuplicate,
        is_posted: isProcessed && !isManualReview && !isDuplicate,
    };
}

router.get('/stats', async (req, res) => {
    try {
        const schema = await getAirtelSchema();
        if (!schema) {
            return res.json({ processed: 0, manual_review: 0, duplicates: 0, setup_required: true });
        }

        const scope = getOfficerScope(req, 'la', 1);
        const values = [...scope.values];
        const scopeWhere = scope.whereSql ? `AND ${scope.whereSql}` : '';

        const { rows } = await db.query(`
            SELECT apm.${schema.statusCol} AS processing_status, COUNT(*)::int AS cnt
            FROM airtel_payment_messages apm
            LEFT JOIN loan_applications la ON la.id = apm.matched_loan_application_id
            ${scope.joinSql}
            WHERE 1=1 ${scopeWhere}
            GROUP BY apm.${schema.statusCol}
        `, values);

        const counts = { processed: 0, manual_review: 0, duplicates: 0 };
        rows.forEach((r) => {
            const status = r.processing_status;
            const cnt = r.cnt || 0;
            if (statusInTab(status, 'processed')) counts.processed += cnt;
            else if (statusInTab(status, 'duplicates')) counts.duplicates += cnt;
            else if (statusInTab(status, 'manual_review')) counts.manual_review += cnt;
        });

        res.json(counts);
    } catch (err) {
        return sqlErrorResponse(res, err, 'stats');
    }
});

router.get('/statuses', async (_req, res) => {
    try {
        const schema = await getAirtelSchema();
        if (!schema) {
            return res.json([]);
        }
        const { rows } = await db.query(`
            SELECT DISTINCT ${schema.statusCol} AS processing_status
            FROM airtel_payment_messages
            ORDER BY 1
        `);
        res.json(rows.map((r) => r.processing_status));
    } catch (err) {
        return sqlErrorResponse(res, err, 'statuses');
    }
});

router.get('/', async (req, res) => {
    try {
        const schema = await getAirtelSchema();
        if (!schema) {
            return res.json([]);
        }

        const { sql, values } = buildListQuery(req, schema);
        const { rows } = await db.query(sql, values);
        res.json(rows.map(mapRow));
    } catch (err) {
        return sqlErrorResponse(res, err, 'list');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const schema = await getAirtelSchema();
        if (!schema) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const scope = getOfficerScope(req, 'la', 2);
        const values = [req.params.id, ...scope.values];
        const scopeWhere = scope.whereSql ? `AND ${scope.whereSql}` : '';

        const rawSelect = schema.rawMessageCol ? `apm.${schema.rawMessageCol} AS raw_message` : 'NULL::text AS raw_message';
        const matchedLoanRefSelect = schema.hasLoanReferenceOnLa
            ? 'la.loan_reference AS matched_loan_reference'
            : 'NULL::text AS matched_loan_reference';

        const { repaymentJoin, repaymentSelect } = buildRepaymentParts(schema);
        const { accountingJoin, accountingSelect } = buildAccountingParts(schema);

        const { rows } = await db.query(`
            SELECT
                apm.id,
                ${colSelect(schema.apmCols, 'apm', schema.transactionIdCol, 'transaction_id')},
                ${rawSelect},
                ${colSelect(schema.apmCols, 'apm', 'sender_phone')},
                ${colSelectTyped(schema.apmCols, 'apm', 'amount', 'numeric')},
                ${loanReferenceSelect(schema)},
                ${colSelectTyped(schema.apmCols, 'apm', 'matched_loan_application_id', 'uuid')},
                apm.${schema.statusCol} AS processing_status,
                ${colSelectTyped(schema.apmCols, 'apm', 'match_confidence', 'numeric')},
                ${parsingStatusSelect(schema)},
                ${matchingNotesSelect(schema)},
                ${colSelect(schema.apmCols, 'apm', 'payment_method', 'payment_method')},
                ${colSelectTyped(schema.apmCols, 'apm', 'previous_balance', 'numeric')},
                ${colSelectTyped(schema.apmCols, 'apm', 'outstanding_balance', 'numeric')},
                ${colSelectTyped(schema.apmCols, 'apm', 'wallet_balance', 'numeric', 'previous_balance_alt')},
                ${colSelectTyped(schema.apmCols, 'apm', 'repayment_id', 'uuid')},
                ${colSelectTyped(schema.apmCols, 'apm', 'accounting_entry_id', 'uuid')},
                ${schema.receivedAtCol ? `apm.${schema.receivedAtCol}` : 'NULL::timestamptz'} AS received_at,
                ${colSelectTyped(schema.apmCols, 'apm', 'processed_at', 'timestamptz')},
                ${colSelectTyped(schema.apmCols, 'apm', 'created_at', 'timestamptz')},
                ${colSelectTyped(schema.apmCols, 'apm', 'updated_at', 'timestamptz')},
                la.full_name AS borrower_full_name,
                ${matchedLoanRefSelect},
                la.status AS loan_status,
                COALESCE(la.assigned_officer_id, b.assigned_officer_id) AS assigned_officer_id,
                COALESCE(officer_la.full_name, officer_b.full_name) AS assigned_officer_name,
                ${repaymentSelect},
                ${accountingSelect}
            FROM airtel_payment_messages apm
            LEFT JOIN loan_applications la ON la.id = apm.matched_loan_application_id
            LEFT JOIN borrowers b ON b.id = la.borrower_id
            LEFT JOIN profiles officer_la ON officer_la.id = la.assigned_officer_id
            LEFT JOIN profiles officer_b ON officer_b.id = b.assigned_officer_id
            ${repaymentJoin}
            ${accountingJoin}
            ${scope.joinSql}
            WHERE apm.id = $1::uuid
            ${scopeWhere}
            LIMIT 1
        `, values);

        if (!rows.length) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json(mapRow(rows[0]));
    } catch (err) {
        return sqlErrorResponse(res, err, 'detail');
    }
});

module.exports = router;
