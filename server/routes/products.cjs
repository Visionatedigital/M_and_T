const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { requireAdmin } = require('../lib/roles.cjs');

/** Parse numeric body; empty string → fallback */
function n(v, fallback = 0) {
    if (v === undefined || v === null || v === '') return fallback;
    const x = parseFloat(v);
    return Number.isFinite(x) ? x : fallback;
}

function ni(v, fallback = 0) {
    if (v === undefined || v === null || v === '') return fallback;
    const x = parseInt(v, 10);
    return Number.isFinite(x) ? x : fallback;
}

/** Normalize extra fees to a JSON string for jsonb storage */
function serializeCustomFees(p) {
    let arr = [];
    const raw = p?.custom_fees;
    if (Array.isArray(raw)) arr = raw;
    else if (typeof raw === 'string' && raw.trim()) {
        try {
            const j = JSON.parse(raw);
            arr = Array.isArray(j) ? j : [];
        } catch {
            arr = [];
        }
    }
    const cleaned = arr
        .filter((x) => x && String(x.label || '').trim())
        .map((x) => {
            const id = String(x.id || '').trim();
            return {
                ...(id ? { id } : {}),
                label: String(x.label).trim(),
                amount: n(x.amount),
            };
        });
    return JSON.stringify(cleaned);
}

/** DB may predate migration `20260319120000_add_custom_fees_to_loan_products.sql` — check each time so adding the column works without restart. */
async function hasCustomFeesColumn() {
    try {
        const { rows } = await db.query(
            `SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'loan_products' AND column_name = 'custom_fees' LIMIT 1`
        );
        return rows.length > 0;
    } catch (e) {
        console.warn('[products] could not check custom_fees column:', e.message);
        return false;
    }
}

router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM loan_products ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', requireAdmin, async (req, res) => {
    const p = req.body || {};
    try {
        const useCustom = await hasCustomFeesColumn();
        const baseVals = [
            p.name,
            p.code,
            p.description ?? null,
            n(p.min_amount),
            n(p.max_amount),
            ni(p.min_duration_months, 1),
            ni(p.max_duration_months, 60),
            n(p.base_interest_rate),
            p.status || 'active',
            n(p.processing_fee_percentage),
            n(p.late_payment_penalty_rate),
            n(p.application_fee),
            n(p.admission_fee),
            n(p.processing_fee),
            n(p.passbook_fee),
            n(p.insurance_rate),
            n(p.security_deposit_rate),
            n(p.monitoring_fee_rate, 3),
            n(p.late_payment_penalty),
            n(p.restructuring_fee_low),
            n(p.restructuring_fee_high),
            n(p.restructuring_threshold),
        ];
        const { rows } = useCustom
            ? await db.query(
                `INSERT INTO loan_products (
                    name, code, description, min_amount, max_amount, min_duration_months, max_duration_months,
                    base_interest_rate, status, processing_fee_percentage, late_payment_penalty_rate,
                    application_fee, admission_fee, processing_fee, passbook_fee, insurance_rate, security_deposit_rate,
                    monitoring_fee_rate, late_payment_penalty, restructuring_fee_low, restructuring_fee_high, restructuring_threshold,
                    custom_fees
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
                    $23::jsonb
                ) RETURNING *`,
                [...baseVals, serializeCustomFees(p)]
            )
            : await db.query(
                `INSERT INTO loan_products (
                    name, code, description, min_amount, max_amount, min_duration_months, max_duration_months,
                    base_interest_rate, status, processing_fee_percentage, late_payment_penalty_rate,
                    application_fee, admission_fee, processing_fee, passbook_fee, insurance_rate, security_deposit_rate,
                    monitoring_fee_rate, late_payment_penalty, restructuring_fee_low, restructuring_fee_high, restructuring_threshold
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
                ) RETURNING *`,
                baseVals
            );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const p = req.body || {};
    try {
        const useCustom = await hasCustomFeesColumn();
        const baseVals = [
            p.name,
            p.code,
            p.description ?? null,
            n(p.min_amount),
            n(p.max_amount),
            ni(p.min_duration_months, 1),
            ni(p.max_duration_months, 60),
            n(p.base_interest_rate),
            p.status || 'active',
            n(p.processing_fee_percentage),
            n(p.late_payment_penalty_rate),
            n(p.application_fee),
            n(p.admission_fee),
            n(p.processing_fee),
            n(p.passbook_fee),
            n(p.insurance_rate),
            n(p.security_deposit_rate),
            n(p.monitoring_fee_rate, 3),
            n(p.late_payment_penalty),
            n(p.restructuring_fee_low),
            n(p.restructuring_fee_high),
            n(p.restructuring_threshold),
        ];
        const { rows } = useCustom
            ? await db.query(
                `UPDATE loan_products SET
                    name = $1,
                    code = $2,
                    description = $3,
                    min_amount = $4,
                    max_amount = $5,
                    min_duration_months = $6,
                    max_duration_months = $7,
                    base_interest_rate = $8,
                    status = $9,
                    processing_fee_percentage = $10,
                    late_payment_penalty_rate = $11,
                    application_fee = $12,
                    admission_fee = $13,
                    processing_fee = $14,
                    passbook_fee = $15,
                    insurance_rate = $16,
                    security_deposit_rate = $17,
                    monitoring_fee_rate = $18,
                    late_payment_penalty = $19,
                    restructuring_fee_low = $20,
                    restructuring_fee_high = $21,
                    restructuring_threshold = $22,
                    custom_fees = $23::jsonb,
                    updated_at = now()
                WHERE id = $24
                RETURNING *`,
                [...baseVals, serializeCustomFees(p), id]
            )
            : await db.query(
                `UPDATE loan_products SET
                    name = $1,
                    code = $2,
                    description = $3,
                    min_amount = $4,
                    max_amount = $5,
                    min_duration_months = $6,
                    max_duration_months = $7,
                    base_interest_rate = $8,
                    status = $9,
                    processing_fee_percentage = $10,
                    late_payment_penalty_rate = $11,
                    application_fee = $12,
                    admission_fee = $13,
                    processing_fee = $14,
                    passbook_fee = $15,
                    insurance_rate = $16,
                    security_deposit_rate = $17,
                    monitoring_fee_rate = $18,
                    late_payment_penalty = $19,
                    restructuring_fee_low = $20,
                    restructuring_fee_high = $21,
                    restructuring_threshold = $22,
                    updated_at = now()
                WHERE id = $23
                RETURNING *`,
                [...baseVals, id]
            );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Failed to update product' });
    }
});

router.delete('/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await db.query('DELETE FROM loan_products WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ ok: true, id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Failed to delete product' });
    }
});

module.exports = router;
