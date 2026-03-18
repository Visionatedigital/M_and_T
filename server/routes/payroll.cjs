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

// Get all staff contracts (salaries)
router.get('/contracts', async (req, res) => {
    try {
        const query = `
            SELECT c.*, p.full_name, p.email 
            FROM staff_contracts c
            JOIN profiles p ON c.user_id = p.id
            ORDER BY p.full_name ASC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch staff contracts' });
    }
});

// Upsert staff contract
router.post('/contracts', async (req, res) => {
    const { user_id, base_salary, allowances, nssf_contribution, paye_tax } = req.body;
    try {
        const query = `
            INSERT INTO staff_contracts (user_id, base_salary, allowances, nssf_contribution, paye_tax)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id) DO UPDATE SET
                base_salary = EXCLUDED.base_salary,
                allowances = EXCLUDED.allowances,
                nssf_contribution = EXCLUDED.nssf_contribution,
                paye_tax = EXCLUDED.paye_tax,
                updated_at = now()
            RETURNING *
        `;
        const values = [user_id, base_salary, allowances, nssf_contribution, paye_tax];
        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save staff contract' });
    }
});

// Get payroll history
router.get('/history', async (req, res) => {
    try {
        const query = `
            SELECT r.*, p.full_name 
            FROM payroll_records r
            JOIN profiles p ON r.user_id = p.id
            ORDER BY r.period_year DESC, r.period_month DESC, p.full_name ASC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch payroll history' });
    }
});

// Process payroll for a specific month
router.post('/process', async (req, res) => {
    const { month, year } = req.body;
    const processed_by = req.user?.user_id || '00000000-0000-0000-0000-000000000000';

    try {
        await db.query('BEGIN');

        const { rows: contracts } = await db.query("SELECT * FROM staff_contracts WHERE status = 'active'");

        const processed = [];
        for (const contract of contracts) {
            const gross = parseFloat(contract.base_salary) + parseFloat(contract.allowances || 0);
            const net = gross - parseFloat(contract.nssf_contribution || 0) - parseFloat(contract.paye_tax || 0);

            const insQuery = `
                INSERT INTO payroll_records (user_id, contract_id, period_month, period_year, gross_salary, net_salary, processed_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (user_id, period_month, period_year) DO NOTHING
                RETURNING *
            `;
            const values = [contract.user_id, contract.id, month, year, gross, net, processed_by];
            const { rows } = await db.query(insQuery, values);
            if (rows[0]) processed.push(rows[0]);
        }

        await db.query('COMMIT');
        res.json({ message: `Processed payroll for ${processed.length} staff members`, processed });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to process payroll' });
    }
});

// Mark payroll record as paid
router.patch('/records/:id/pay', async (req, res) => {
    const { id } = req.params;
    const processed_by = req.user?.user_id || '00000000-0000-0000-0000-000000000000';
    const paymentMethod = normalizePaymentMethod(req.body?.payment_method);

    if (!paymentMethod || !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
        return res.status(400).json({ error: 'Valid payment_method is required (cash, bank_transfer, mobile_money)' });
    }

    try {
        await db.query('BEGIN');

        const { rows: records } = await db.query('SELECT r.*, p.full_name FROM payroll_records r JOIN profiles p ON r.user_id = p.id WHERE r.id = $1', [id]);
        if (records.length === 0) {
            throw new Error('Record not found');
        }
        const record = records[0];

        const updateQuery = `
            UPDATE payroll_records 
            SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP, processed_by = $2
            WHERE id = $1 AND payment_status = 'pending'
            RETURNING *
        `;
        const { rows: updatedRows } = await db.query(updateQuery, [id, processed_by]);

        if (updatedRows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'Record is already paid or could not be updated' });
        }

        await db.query(
            'INSERT INTO accounting_entries (entry_type, category, description, amount, entry_date, payment_method, reference_id, recorded_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            ['expense', 'Salary & Wages', `Salary payment for ${record.full_name} (${record.period_month}/${record.period_year})`, record.net_salary, new Date().toISOString().split('T')[0], paymentMethod, id, processed_by]
        );

        await db.query('COMMIT');
        res.json(updatedRows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message || 'Failed to record payment' });
    }
});

// Delete payroll record
router.delete('/records/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM payroll_records WHERE id = $1 AND payment_status = 'pending'", [id]);
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete record' });
    }
});

module.exports = router;
