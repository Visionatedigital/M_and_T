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
    ],
    duplicates: ['duplicate'],
};

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

async function tableExists() {
    const { rows } = await db.query(`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'airtel_payment_messages'
        LIMIT 1
    `);
    return rows.length > 0;
}

function buildListQuery(req) {
    const scope = getOfficerScope(req, 'la', 1);
    const values = [...scope.values];
    const whereParts = [];

    if (scope.whereSql) {
        whereParts.push(scope.whereSql);
    }

    const tab = String(req.query.tab || 'processed').toLowerCase();
    const statuses = TAB_STATUS_MAP[tab] || TAB_STATUS_MAP.processed;
    values.push(statuses);
    whereParts.push(`apm.processing_status = ANY($${values.length}::text[])`);

    if (req.query.date_from) {
        values.push(req.query.date_from);
        whereParts.push(`apm.received_at >= $${values.length}::date`);
    }
    if (req.query.date_to) {
        values.push(req.query.date_to);
        whereParts.push(`apm.received_at < ($${values.length}::date + interval '1 day')`);
    }
    if (req.query.loan_reference) {
        values.push(`%${String(req.query.loan_reference).trim().toUpperCase()}%`);
        whereParts.push(`(
            UPPER(COALESCE(apm.loan_reference, '')) LIKE $${values.length}
            OR UPPER(COALESCE(la.loan_reference, '')) LIKE $${values.length}
        )`);
    }
    if (req.query.transaction_id) {
        values.push(`%${String(req.query.transaction_id).trim()}%`);
        whereParts.push(`apm.transaction_id ILIKE $${values.length}`);
    }
    if (req.query.processing_status) {
        values.push(String(req.query.processing_status).trim());
        whereParts.push(`apm.processing_status = $${values.length}`);
    }
    if (req.query.officer_id) {
        values.push(req.query.officer_id);
        whereParts.push(`COALESCE(la.assigned_officer_id, b.assigned_officer_id) = $${values.length}::uuid`);
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    const sql = `
        SELECT
            apm.id,
            apm.transaction_id,
            apm.raw_message,
            apm.sender_phone,
            apm.amount,
            apm.loan_reference,
            apm.matched_loan_application_id,
            apm.processing_status,
            apm.match_confidence,
            apm.parsing_status,
            apm.matching_notes,
            apm.payment_method,
            apm.previous_balance,
            apm.outstanding_balance,
            apm.repayment_id,
            apm.accounting_entry_id,
            apm.received_at,
            apm.processed_at,
            apm.created_at,
            apm.updated_at,
            la.full_name AS borrower_full_name,
            la.loan_reference AS matched_loan_reference,
            la.status AS loan_status,
            COALESCE(la.assigned_officer_id, b.assigned_officer_id) AS assigned_officer_id,
            COALESCE(officer_la.full_name, officer_b.full_name) AS assigned_officer_name,
            r.id AS linked_repayment_id,
            ae.id AS linked_accounting_entry_id
        FROM airtel_payment_messages apm
        LEFT JOIN loan_applications la ON la.id = apm.matched_loan_application_id
        LEFT JOIN borrowers b ON b.id = la.borrower_id
        LEFT JOIN profiles officer_la ON officer_la.id = la.assigned_officer_id
        LEFT JOIN profiles officer_b ON officer_b.id = b.assigned_officer_id
        LEFT JOIN repayments r ON r.external_transaction_id = apm.transaction_id
        LEFT JOIN accounting_entries ae ON ae.reference_id = r.id
        ${scope.joinSql}
        ${whereClause}
        ORDER BY apm.received_at DESC
        LIMIT 500
    `;

    return { sql, values };
}

function mapRow(row) {
    const isManualReview = TAB_STATUS_MAP.manual_review.includes(row.processing_status);
    const isDuplicate = row.processing_status === 'duplicate';
    const isProcessed = TAB_STATUS_MAP.processed.includes(row.processing_status);

    return {
        id: row.id,
        transaction_id: row.transaction_id,
        received_at: row.received_at,
        loan_reference: row.loan_reference || row.matched_loan_reference || null,
        borrower_full_name: row.borrower_full_name || null,
        sender_phone: maskPhone(row.sender_phone),
        sender_phone_raw: row.sender_phone || null,
        amount: parseFloat(row.amount) || 0,
        previous_balance: row.previous_balance != null ? parseFloat(row.previous_balance) : null,
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
        if (!(await tableExists())) {
            return res.json({ processed: 0, manual_review: 0, duplicates: 0 });
        }

        const scope = getOfficerScope(req, 'la', 1);
        const values = [...scope.values];
        const scopeWhere = scope.whereSql ? `AND ${scope.whereSql}` : '';

        const { rows } = await db.query(`
            SELECT apm.processing_status, COUNT(*)::int AS cnt
            FROM airtel_payment_messages apm
            LEFT JOIN loan_applications la ON la.id = apm.matched_loan_application_id
            ${scope.joinSql}
            WHERE 1=1 ${scopeWhere}
            GROUP BY apm.processing_status
        `, values);

        const counts = { processed: 0, manual_review: 0, duplicates: 0 };
        rows.forEach((r) => {
            const status = r.processing_status;
            const cnt = r.cnt || 0;
            if (TAB_STATUS_MAP.processed.includes(status)) counts.processed += cnt;
            else if (TAB_STATUS_MAP.duplicates.includes(status)) counts.duplicates += cnt;
            else if (TAB_STATUS_MAP.manual_review.includes(status)) counts.manual_review += cnt;
        });

        res.json(counts);
    } catch (err) {
        console.error('[airtel-payments/stats]', err);
        res.status(500).json({ error: 'Failed to fetch payment stats' });
    }
});

router.get('/statuses', async (_req, res) => {
    try {
        if (!(await tableExists())) {
            return res.json([]);
        }
        const { rows } = await db.query(`
            SELECT DISTINCT processing_status
            FROM airtel_payment_messages
            ORDER BY processing_status
        `);
        res.json(rows.map((r) => r.processing_status));
    } catch (err) {
        console.error('[airtel-payments/statuses]', err);
        res.status(500).json({ error: 'Failed to fetch statuses' });
    }
});

router.get('/', async (req, res) => {
    try {
        if (!(await tableExists())) {
            return res.json([]);
        }

        const { sql, values } = buildListQuery(req);
        const { rows } = await db.query(sql, values);
        res.json(rows.map(mapRow));
    } catch (err) {
        console.error('[airtel-payments/list]', err);
        res.status(500).json({ error: 'Failed to fetch mobile money payments' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!(await tableExists())) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const scope = getOfficerScope(req, 'la', 2);
        const values = [req.params.id, ...scope.values];
        const scopeWhere = scope.whereSql ? `AND ${scope.whereSql}` : '';

        const { rows } = await db.query(`
            SELECT
                apm.*,
                la.full_name AS borrower_full_name,
                la.loan_reference AS matched_loan_reference,
                la.status AS loan_status,
                COALESCE(la.assigned_officer_id, b.assigned_officer_id) AS assigned_officer_id,
                COALESCE(officer_la.full_name, officer_b.full_name) AS assigned_officer_name,
                r.id AS linked_repayment_id,
                ae.id AS linked_accounting_entry_id
            FROM airtel_payment_messages apm
            LEFT JOIN loan_applications la ON la.id = apm.matched_loan_application_id
            LEFT JOIN borrowers b ON b.id = la.borrower_id
            LEFT JOIN profiles officer_la ON officer_la.id = la.assigned_officer_id
            LEFT JOIN profiles officer_b ON officer_b.id = b.assigned_officer_id
            LEFT JOIN repayments r ON r.external_transaction_id = apm.transaction_id
            LEFT JOIN accounting_entries ae ON ae.reference_id = r.id
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
        console.error('[airtel-payments/detail]', err);
        res.status(500).json({ error: 'Failed to fetch payment details' });
    }
});

module.exports = router;
