const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

const ALLOWED_PAYMENT_METHODS = ['cash', 'bank_transfer', 'mobile_money'];
const normalizePaymentMethod = (value) => {
    if (!value) return null;
    const v = String(value).toLowerCase().trim();
    if (v === 'bank') return 'bank_transfer';
    if (v === 'mobile') return 'mobile_money';
    return v;
};

const blockLoanOfficerAccess = (req, res, next) => {
    const role = String(req.user?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
    if (role === 'loan_officer') {
        return res.status(403).json({ error: 'Creditors is restricted to admin users.' });
    }
    next();
};

router.use(blockLoanOfficerAccess);

// Get all creditors with balance
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT c.*, 
                   COALESCE((SELECT SUM(amount) FROM creditor_repayments WHERE creditor_id = c.id), 0) as total_repaid,
                   (c.amount_borrowed - COALESCE((SELECT SUM(amount) FROM creditor_repayments WHERE creditor_id = c.id), 0)) as current_balance
            FROM creditors c
            ORDER BY c.created_at DESC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch creditors' });
    }
});

// Create creditor
router.post('/', async (req, res) => {
    const { name, amount_borrowed, interest_rate, start_date, maturity_date, payment_method } = req.body;
    const recorded_by = req.user?.user_id || '00000000-0000-0000-0000-000000000000';
    const method = normalizePaymentMethod(payment_method);
    if (!method || !ALLOWED_PAYMENT_METHODS.includes(method)) {
        return res.status(400).json({ error: 'Valid payment_method is required (cash, bank_transfer, mobile_money)' });
    }
    try {
        const query = `
            INSERT INTO creditors (name, amount_borrowed, interest_rate, start_date, maturity_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [name, amount_borrowed, interest_rate, start_date, maturity_date];
        const { rows } = await db.query(query, values);

        await db.query(
            `INSERT INTO accounting_entries (entry_type, category, description, amount, entry_date, payment_method, reference_id, recorded_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            ['revenue', 'Other Income', `Loan from ${name}`, amount_borrowed, start_date, method, rows[0].id, recorded_by]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create creditor' });
    }
});

// Update creditor
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, amount_borrowed, interest_rate, start_date, maturity_date } = req.body;
    try {
        const updates = [];
        const values = [];
        let idx = 1;
        if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name); }
        if (amount_borrowed !== undefined) { updates.push(`amount_borrowed = $${idx++}`); values.push(amount_borrowed); }
        if (interest_rate !== undefined) { updates.push(`interest_rate = $${idx++}`); values.push(interest_rate); }
        if (start_date !== undefined) { updates.push(`start_date = $${idx++}`); values.push(start_date); }
        if (maturity_date !== undefined) { updates.push(`maturity_date = $${idx++}`); values.push(maturity_date); }
        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
        values.push(id);
        const query = `UPDATE creditors SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
        const { rows } = await db.query(query, values);
        if (rows.length === 0) return res.status(404).json({ error: 'Creditor not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update creditor' });
    }
});

// Record repayment to creditor
router.post('/:id/repayments', async (req, res) => {
    const { id } = req.params;
    const { amount, payment_date, payment_method, reference } = req.body;
    const recorded_by = req.user?.user_id || '00000000-0000-0000-0000-000000000000';
    const method = normalizePaymentMethod(payment_method);
    if (!method || !ALLOWED_PAYMENT_METHODS.includes(method)) {
        return res.status(400).json({ error: 'Valid payment_method is required (cash, bank_transfer, mobile_money)' });
    }

    try {
        await db.query('BEGIN');

        const repaymentQuery = `
            INSERT INTO creditor_repayments (creditor_id, amount, payment_date, payment_method, reference, recorded_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const { rows: repaymentRows } = await db.query(repaymentQuery, [id, amount, payment_date, method, reference, recorded_by]);

        await db.query(
            `INSERT INTO accounting_entries (entry_type, category, description, amount, entry_date, payment_method, reference_id, recorded_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            ['expense', 'Bank Charges', `Repayment to Creditor (ID: ${id})`, amount, payment_date, method, repaymentRows[0].id, recorded_by]
        );

        await db.query('COMMIT');

        res.status(201).json(repaymentRows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to record repayment' });
    }
});

module.exports = router;
