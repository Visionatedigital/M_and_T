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

// Logging middleware for accounting routes
router.use((req, res, next) => {
    console.log(`📂 Accounting API: ${req.method} ${req.url}`);
    next();
});

router.use((req, res, next) => {
    const role = String(req.user?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
    if (role === 'loan_officer') {
        return res.status(403).json({ error: 'Accounting is restricted to admin users.' });
    }
    next();
});

// ──────────────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────────────
const REVENUE_CATEGORIES = [
    'Interest Income',
    'Principal Recovery',
    'Processing Fees',
    'Late Payment Penalties',
    'Commission Income',
    'Fee Income (Valuation/Tracking)',
    'Other Income',
];

const EXPENSE_CATEGORIES = [
    'Loan Disbursement',
    'Salary & Wages',
    'Office Rent',
    'Utilities',
    'Internet & Communications',
    'Transport',
    'Stationery & Supplies',
    'Marketing',
    'Repairs & Maintenance',
    'Legal & Professional Fees',
    'Bad Debt Write-Off',
    'Bank Charges',
    'Direct Fee Costs',
    'Other Expenses',
];

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/categories
// ──────────────────────────────────────────────────────────────
router.get('/categories', (req, res) => {
    res.json({
        revenue: REVENUE_CATEGORIES,
        expense: EXPENSE_CATEGORIES,
    });
});

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/entries
// Query params: type (revenue|expense|all), from, to, category
// ──────────────────────────────────────────────────────────────
router.get('/entries', async (req, res) => {
    try {
        const { type, from, to, category, limit = 100, offset = 0 } = req.query;

        let conditions = [];
        let values = [];
        let paramIdx = 1;

        if (type && type !== 'all') {
            conditions.push(`entry_type = $${paramIdx++}`);
            values.push(type);
        }
        if (from) {
            conditions.push(`entry_date >= $${paramIdx++}`);
            values.push(from);
        }
        if (to) {
            conditions.push(`entry_date <= $${paramIdx++}`);
            values.push(to);
        }
        if (category) {
            conditions.push(`category = $${paramIdx++}`);
            values.push(category);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const query = `
            SELECT 
                ae.*,
                p.full_name as recorded_by_name
            FROM accounting_entries ae
            LEFT JOIN profiles p ON ae.recorded_by = p.id
            ${whereClause}
            ORDER BY ae.entry_date DESC, ae.created_at DESC
            LIMIT $${paramIdx++} OFFSET $${paramIdx++}
        `;
        values.push(parseInt(limit), parseInt(offset));

        const { rows } = await db.query(query, values);

        // Total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM accounting_entries ${whereClause}`;
        const { rows: countRows } = await db.query(countQuery, values.slice(0, -2));

        res.json({
            entries: rows,
            total: parseInt(countRows[0].total),
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (err) {
        console.error('Accounting entries error:', err);
        res.status(500).json({ error: 'Failed to fetch accounting entries' });
    }
});

// ──────────────────────────────────────────────────────────────
// POST /api/accounting/entries
// Body: { entry_type, category, description, amount, entry_date, payment_method }
// ──────────────────────────────────────────────────────────────
router.post('/entries', async (req, res) => {
    try {
        const { entry_type, category, description, amount, entry_date, payment_method, reference_id } = req.body;
        const recorded_by = req.user.user_id;
        const normalizedMethod = normalizePaymentMethod(payment_method);

        if (!entry_type || !category || !amount || !entry_date) {
            return res.status(400).json({ error: 'entry_type, category, amount, and entry_date are required' });
        }
        if (!['revenue', 'expense'].includes(entry_type)) {
            return res.status(400).json({ error: 'entry_type must be "revenue" or "expense"' });
        }
        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }
        if (!normalizedMethod || !ALLOWED_PAYMENT_METHODS.includes(normalizedMethod)) {
            return res.status(400).json({ error: 'Valid payment_method is required (cash, bank_transfer, mobile_money)' });
        }

        const { rows } = await db.query(
            `INSERT INTO accounting_entries
             (entry_type, category, description, amount, entry_date, payment_method, reference_id, recorded_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [entry_type, category, description || null, amount, entry_date, normalizedMethod, reference_id || null, recorded_by]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Create accounting entry error:', err);
        res.status(500).json({ error: 'Failed to create accounting entry' });
    }
});

// ──────────────────────────────────────────────────────────────
// DELETE /api/accounting/entries/:id
// ──────────────────────────────────────────────────────────────
router.delete('/entries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete accounting entries' });
        }

        const { rows } = await db.query(
            'DELETE FROM accounting_entries WHERE id = $1 RETURNING id',
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Entry not found' });

        res.json({ success: true, deleted_id: id });
    } catch (err) {
        console.error('Delete accounting entry error:', err);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/pl-summary
// Returns monthly P&L for the last 13 months
// ──────────────────────────────────────────────────────────────
router.get('/pl-summary', async (req, res) => {
    try {
        const months = [];
        for (let i = 12; i >= 0; i--) {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            months.push({
                label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0],
            });
        }

        const summaryData = await Promise.all(months.map(async (month) => {
            const { rows: revRows } = await db.query(
                `SELECT COALESCE(SUM(amount), 0) as total, entry_type
                 FROM accounting_entries
                 WHERE entry_date >= $1 AND entry_date <= $2
                 GROUP BY entry_type`,
                [month.start, month.end]
            );

            let revenue = 0;
            let expenses = 0;
            revRows.forEach(r => {
                if (r.entry_type === 'revenue') revenue = parseFloat(r.total);
                if (r.entry_type === 'expense') expenses = parseFloat(r.total);
            });

            return {
                month: month.label,
                revenue: Math.round(revenue),
                expenses: Math.round(expenses),
                netProfit: Math.round(revenue - expenses),
            };
        }));

        // Category breakdown for expenses (current month)
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        const { rows: expCatRows } = await db.query(
            `SELECT category, SUM(amount) as total
             FROM accounting_entries
             WHERE entry_type = 'expense'
             AND entry_date >= $1
             GROUP BY category
             ORDER BY total DESC`,
            [currentMonthStart.toISOString().split('T')[0]]
        );

        // Category breakdown for revenue (current month)
        const { rows: revCatRows } = await db.query(
            `SELECT category, SUM(amount) as total
             FROM accounting_entries
             WHERE entry_type = 'revenue'
             AND entry_date >= $1
             GROUP BY category
             ORDER BY total DESC`,
            [currentMonthStart.toISOString().split('T')[0]]
        );

        // YTD totals
        const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
        const { rows: ytdRows } = await db.query(
            `SELECT entry_type, COALESCE(SUM(amount), 0) as total
             FROM accounting_entries
             WHERE entry_date >= $1
             GROUP BY entry_type`,
            [yearStart]
        );
        let ytdRevenue = 0, ytdExpenses = 0;
        ytdRows.forEach(r => {
            if (r.entry_type === 'revenue') ytdRevenue = parseFloat(r.total);
            if (r.entry_type === 'expense') ytdExpenses = parseFloat(r.total);
        });

        res.json({
            monthly: summaryData,
            expenseCategories: expCatRows.map(r => ({
                category: r.category,
                amount: parseFloat(r.total),
            })),
            revenueCategories: revCatRows.map(r => ({
                category: r.category,
                amount: parseFloat(r.total),
            })),
            ytd: {
                revenue: Math.round(ytdRevenue),
                expenses: Math.round(ytdExpenses),
                netProfit: Math.round(ytdRevenue - ytdExpenses),
            },
        });
    } catch (err) {
        console.error('P&L summary error:', err);
        res.status(500).json({ error: 'Failed to fetch P&L summary' });
    }
});

// ──────────────────────────────────────────────────────────────
// HELPER: Build date filter from query params
// ──────────────────────────────────────────────────────────────
function getDateRange(req) {
    const { from, to, period } = req.query;
    let start, end;
    if (from && to) {
        start = from;
        end = to;
    } else if (period === 'ytd') {
        start = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
    } else if (period === 'month') {
        const d = new Date();
        start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
    } else {
        // Default: current month
        const d = new Date();
        start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
    }
    return { start, end };
}

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/income-statement
// Income Statement (P&L) with microfinance line items
// ──────────────────────────────────────────────────────────────
router.get('/income-statement', async (req, res) => {
    try {
        const { start, end } = getDateRange(req);

        // --- 1. Average Portfolio Calculation ---
        // (Portfolio at Start + Portfolio at End) / 2
        const getPortfolioAt = async (date) => {
            const { rows } = await db.query(`
                SELECT COALESCE(SUM(la.loan_amount), 0) - COALESCE(SUM(p_sub.total_principal_paid), 0) as portfolio
                FROM loan_applications la
                LEFT JOIN (
                    SELECT loan_application_id, SUM(amount * (1/1.30)) as total_principal_paid
                    FROM repayments
                    WHERE payment_date::date <= $1
                    GROUP BY loan_application_id
                ) p_sub ON la.id = p_sub.loan_application_id
                WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
                AND la.approved_at::date <= $1
            `, [date]);
            return parseFloat(rows[0]?.portfolio || 0);
        };

        const portfolioStart = await getPortfolioAt(start);
        const portfolioEnd = await getPortfolioAt(end);
        const avgPortfolio = (portfolioStart + portfolioEnd) / 2;

        // --- 2. Revenue & Financial Income ---
        const { rows: revRows } = await db.query(
            `SELECT category, COALESCE(SUM(amount), 0) as total
             FROM accounting_entries
             WHERE entry_type = 'revenue' AND entry_date >= $1 AND entry_date <= $2
             GROUP BY category`,
            [start, end]
        );

        let manual_interest_income = 0;
        let principal_recovery = 0;
        let other_income_categories = {
            'Processing Fees': 0,
            'Late Payment Penalties': 0,
            'Commission Income': 0,
            'Other Income': 0
        };

        revRows.forEach(r => {
            const val = parseFloat(r.total);
            if (r.category === 'Interest Income') {
                manual_interest_income += val;
            } else if (r.category === 'Principal Recovery') {
                principal_recovery += val; // tracked separately, not in P&L income
            } else {
                if (!other_income_categories.hasOwnProperty(r.category)) {
                    other_income_categories[r.category] = 0;
                }
                other_income_categories[r.category] += val;
            }
        });

        // Derived interest from loan repayments 
        const { rows: loanRepRows } = await db.query(
            `SELECT la.id, la.loan_amount, la.loan_product,
                    COALESCE(SUM(r.amount), 0) as total_repaid
             FROM loan_applications la
             LEFT JOIN repayments r ON r.loan_application_id = la.id
                 AND r.payment_date::date >= $1 AND r.payment_date::date <= $2
             WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
             GROUP BY la.id, la.loan_amount, la.loan_product`,
            [start, end]
        );

        let derivedInterestByProduct = {};
        let totalDerivedInterest = 0;

        loanRepRows.forEach(row => {
            const repaid = parseFloat(row.total_repaid) || 0;
            if (repaid > 0) {
                const interestPortion = repaid * (0.30 / 1.30);
                totalDerivedInterest += interestPortion;
                const product = row.loan_product || 'Standard Loan';
                derivedInterestByProduct[product] = (derivedInterestByProduct[product] || 0) + interestPortion;
            }
        });

        // Use the greater of manual vs derived
        let financial_income_categories = {};
        if (manual_interest_income > totalDerivedInterest) {
            financial_income_categories['Interest Income (Manual)'] = manual_interest_income;
        } else {
            Object.keys(derivedInterestByProduct).forEach(prod => {
                financial_income_categories[`Interest Income - ${prod}`] = derivedInterestByProduct[prod];
            });
        }

        const total_financial_income = Object.values(financial_income_categories).reduce((a, b) => a + b, 0);
        const total_other_income = Object.values(other_income_categories).reduce((a, b) => a + b, 0);

        // --- 3. Expenses (Financial & Administrative) ---
        const { rows: expRows } = await db.query(
            `SELECT category, COALESCE(SUM(amount), 0) as total
             FROM accounting_entries
             WHERE entry_type = 'expense' AND entry_date >= $1 AND entry_date <= $2
             GROUP BY category`,
            [start, end]
        );

        let financial_expense_categories = {
            'Interest Expense': 0,
            'Bank Charges': 0
        };

        let administrative_expense_categories = {
            'Salary & Wages': 0,
            'Office Rent': 0,
            'Utilities': 0,
            'Internet & Communications': 0,
            'Transport': 0,
            'Stationery & Supplies': 0,
            'Marketing': 0,
            'Repairs & Maintenance': 0,
            'Legal & Professional Fees': 0,
            'Bad Debt Write-Off': 0,
            'Other Expenses': 0
        };

        expRows.forEach(r => {
            const val = parseFloat(r.total);
            if (r.category === 'Loan Disbursement' || r.category === 'Creditor Liability Repayment') {
                // Disbursements and Principal Repayments are investing/financing activity, exclude from P&L opex
                return;
            } else if (financial_expense_categories.hasOwnProperty(r.category)) {
                financial_expense_categories[r.category] += val;
            } else {
                if (!administrative_expense_categories.hasOwnProperty(r.category)) {
                    administrative_expense_categories[r.category] = 0;
                }
                administrative_expense_categories[r.category] += val;
            }
        });

        const total_financial_expense = Object.values(financial_expense_categories).reduce((a, b) => a + b, 0);
        const total_administrative_expenses = Object.values(administrative_expense_categories).reduce((a, b) => a + b, 0);

        // --- 4. Subtotals ---
        const net_interest_income = total_financial_income - total_financial_expense;
        const net_operational_income = net_interest_income + total_other_income - total_administrative_expenses;
        const net_income = net_operational_income;

        // --- 5. Ratios ---
        const calcRatio = (value) => avgPortfolio > 0 ? (value / avgPortfolio) * 100 : 0;

        res.json({
            period: { start, end },
            sections: [
                {
                    title: 'Financial Income',
                    categories: financial_income_categories,
                    total: Math.round(total_financial_income)
                },
                {
                    title: 'Financial Expense',
                    categories: financial_expense_categories,
                    total: Math.round(total_financial_expense)
                },
                {
                    title: 'Net Interest Income',
                    isSubtotal: true,
                    total: Math.round(net_interest_income)
                },
                {
                    title: 'Other Income',
                    categories: other_income_categories,
                    total: Math.round(total_other_income)
                },
                {
                    title: 'Administrative Expenses',
                    categories: administrative_expense_categories,
                    total: Math.round(total_administrative_expenses)
                },
                {
                    title: 'Net Operational Income',
                    isSubtotal: true,
                    total: Math.round(net_operational_income)
                },
                {
                    title: 'Net Income',
                    isSubtotal: true,
                    total: Math.round(net_income)
                }
            ],
            kpis: {
                avg_portfolio: Math.round(avgPortfolio),
                net_financial_income_ratio: calcRatio(net_interest_income).toFixed(2),
                net_operational_income_ratio: calcRatio(net_operational_income).toFixed(2),
                net_income_ratio: calcRatio(net_income).toFixed(2)
            },
        });
    } catch (err) {
        console.error('Income statement error:', err);
        res.status(500).json({ error: 'Failed to fetch income statement' });
    }
});


// ──────────────────────────────────────────────────────────────
// GET /api/accounting/balance-sheet
// Statement of Financial Position (as of date)
// ──────────────────────────────────────────────────────────────
router.get('/balance-sheet', async (req, res) => {
    try {
        const { to } = req.query;
        const asOf = to || new Date().toISOString().split('T')[0];

        // Assets
        const { rows: cashRows } = await db.query(
            `SELECT COALESCE(SUM(CASE WHEN entry_type = 'revenue' THEN amount ELSE -amount END), 0) as net
             FROM accounting_entries
             WHERE entry_date <= $1 AND (payment_method = 'cash' OR payment_method = 'bank_transfer')`,
            [asOf]
        );
        const cashAtBank = Math.max(0, parseFloat(cashRows[0]?.net || 0));

        const { rows: mmRows } = await db.query(
            `SELECT COALESCE(SUM(CASE WHEN entry_type = 'revenue' THEN amount ELSE -amount END), 0) as net
             FROM accounting_entries
             WHERE entry_date <= $1 AND payment_method = 'mobile_money'`,
            [asOf]
        );
        const mobileMoneyFloat = Math.max(0, parseFloat(mmRows[0]?.net || 0));

        const { rows: loanRows } = await db.query(`
            SELECT la.id, la.loan_amount, la.loan_duration_months, la.approved_at,
                   COALESCE(SUM(r.amount), 0) as total_repaid
             FROM loan_applications la
             LEFT JOIN repayments r ON r.loan_application_id = la.id
                 AND r.payment_date::date <= $1
             WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
             GROUP BY la.id, la.loan_amount, la.loan_duration_months, la.approved_at
        `, [asOf]);

        let loansReceivable = 0, accruedInterest = 0;
        loanRows.forEach(row => {
            const principal = parseFloat(row.loan_amount) || 0;
            const total = principal * 1.30;
            const repaid = parseFloat(row.total_repaid) || 0;
            const outstanding = Math.max(0, total - repaid);
            if (outstanding > 0) {
                const principalPaid = repaid * (1 / 1.30);
                const principalOutstanding = Math.max(0, principal - principalPaid);
                loansReceivable += principalOutstanding;
                accruedInterest += Math.max(0, outstanding - principalOutstanding);
            }
        });

        const { rows: fixedRows } = await db.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM accounting_entries
             WHERE entry_type = 'expense' AND entry_date <= $1
             AND category IN ('Repairs & Maintenance', 'Office Rent')
             AND description ILIKE '%asset%'`,
            [asOf]
        );
        const fixedAssets = 0; // placeholder - would need asset register

        const fixedAssetsManual = 0;
        const prepaidExpenses = 0;

        const totalAssets = cashAtBank + mobileMoneyFloat + loansReceivable + accruedInterest + fixedAssets + fixedAssetsManual + prepaidExpenses;

        // Liabilities
        const clientDeposits = 0;
        const borrowedFunds = 0;
        const { rows: payRows } = await db.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM accounting_entries
             WHERE entry_type = 'expense' AND entry_date > $1
             AND category IN ('Office Rent', 'Utilities')`,
            [asOf]
        );
        const payables = 0;
        const accruedExpenses = 0;
        const totalLiabilities = clientDeposits + borrowedFunds + payables + accruedExpenses;

        // Equity
        const shareCapital = 0;
        const { rows: ytdRows } = await db.query(
            `SELECT entry_type, COALESCE(SUM(amount), 0) as total
             FROM accounting_entries
             WHERE entry_date >= $1 AND entry_date <= $2
             GROUP BY entry_type`,
            [new Date(new Date(asOf).getFullYear(), 0, 1).toISOString().split('T')[0], asOf]
        );
        let ytdRevenue = 0, ytdExpenses = 0;
        ytdRows.forEach(r => {
            if (r.entry_type === 'revenue') ytdRevenue = parseFloat(r.total);
            if (r.entry_type === 'expense') ytdExpenses = parseFloat(r.total);
        });
        const currentYearProfit = ytdRevenue - ytdExpenses;
        const retainedEarnings = 0;
        const totalEquity = shareCapital + retainedEarnings + currentYearProfit;

        res.json({
            as_of: asOf,
            assets: {
                cash_at_bank: Math.round(cashAtBank),
                mobile_money_float: Math.round(mobileMoneyFloat),
                loans_receivable: Math.round(loansReceivable),
                accrued_interest: Math.round(accruedInterest),
                fixed_assets: Math.round(fixedAssets + fixedAssetsManual),
                prepaid_expenses: Math.round(prepaidExpenses),
                total: Math.round(totalAssets),
            },
            liabilities: {
                client_deposits: Math.round(clientDeposits),
                borrowed_funds: Math.round(borrowedFunds),
                payables: Math.round(payables),
                accrued_expenses: Math.round(accruedExpenses),
                total: Math.round(totalLiabilities),
            },
            equity: {
                share_capital: Math.round(shareCapital),
                retained_earnings: Math.round(retainedEarnings),
                current_year_profit: Math.round(currentYearProfit),
                total: Math.round(totalEquity),
            },
        });
    } catch (err) {
        console.error('Balance sheet error:', err);
        res.status(500).json({ error: 'Failed to fetch balance sheet' });
    }
});

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/cash-flow
// Cash Flow Statement (Operating, Investing, Financing)
// ──────────────────────────────────────────────────────────────
router.get('/cash-flow', async (req, res) => {
    try {
        const { start, end } = getDateRange(req);

        // Operating: loan repayments (from repayments), interest portion, expenses
        const { rows: repRows } = await db.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM repayments
             WHERE payment_date::date >= $1 AND payment_date::date <= $2`,
            [start, end]
        );
        const cashFromRepayments = parseFloat(repRows[0]?.total || 0);

        const { rows: revRows } = await db.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM accounting_entries
             WHERE entry_type = 'revenue' AND entry_date >= $1 AND entry_date <= $2
             AND category NOT IN ('Interest Income')`,
            [start, end]
        );
        const otherOperatingInflows = parseFloat(revRows[0]?.total || 0);

        const { rows: revIntRows } = await db.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM accounting_entries
             WHERE entry_type = 'revenue' AND entry_date >= $1 AND entry_date <= $2
             AND category = 'Interest Income'`,
            [start, end]
        );
        let interestCollected = parseFloat(revIntRows[0]?.total || 0);
        const { rows: loanRepRows } = await db.query(
            `SELECT la.loan_amount, COALESCE(SUM(r.amount), 0) as total_repaid
             FROM loan_applications la
             LEFT JOIN repayments r ON r.loan_application_id = la.id
                 AND r.payment_date::date >= $1 AND r.payment_date::date <= $2
             WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
             GROUP BY la.id, la.loan_amount`,
            [start, end]
        );
        let derivedInterest = 0;
        loanRepRows.forEach(row => {
            const principal = parseFloat(row.loan_amount) || 0;
            const total = principal * 1.30;
            const repaid = parseFloat(row.total_repaid) || 0;
            if (total > 0) derivedInterest += repaid * (0.30 / 1.30);
        });
        interestCollected = Math.max(interestCollected, derivedInterest);

        const { rows: expRows } = await db.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM accounting_entries
             WHERE entry_type = 'expense' AND entry_date >= $1 AND entry_date <= $2`,
            [start, end]
        );
        const operatingOutflows = parseFloat(expRows[0]?.total || 0);

        const netOperating = cashFromRepayments + otherOperatingInflows + interestCollected - operatingOutflows;

        // Investing: asset purchases (placeholder)
        const investingInflows = 0;
        const investingOutflows = 0;
        const netInvesting = investingInflows - investingOutflows;

        // Financing: capital injections, loans taken (placeholder)
        const financingInflows = 0;
        const financingOutflows = 0;
        const netFinancing = financingInflows - financingOutflows;

        const netCashFlow = netOperating + netInvesting + netFinancing;

        res.json({
            period: { start, end },
            operating: {
                cash_from_loan_repayments: Math.round(cashFromRepayments),
                interest_collected: Math.round(interestCollected),
                other_operating_inflows: Math.round(otherOperatingInflows),
                operating_expenses_paid: Math.round(operatingOutflows),
                net: Math.round(netOperating),
            },
            investing: {
                inflows: Math.round(investingInflows),
                outflows: Math.round(investingOutflows),
                net: Math.round(netInvesting),
            },
            financing: {
                inflows: Math.round(financingInflows),
                outflows: Math.round(financingOutflows),
                net: Math.round(netFinancing),
            },
            net_cash_flow: Math.round(netCashFlow),
        });
    } catch (err) {
        console.error('Cash flow error:', err);
        res.status(500).json({ error: 'Failed to fetch cash flow' });
    }
});

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/loan-portfolio
// Loan Portfolio Report
// ──────────────────────────────────────────────────────────────
router.get('/loan-portfolio', async (req, res) => {
    try {
        const asOf = req.query.to || new Date().toISOString().split('T')[0];

        const { rows: loans } = await db.query(`
            SELECT la.id, la.full_name, la.loan_amount, la.loan_duration_months,
                   la.approved_at, la.status, la.loan_product, la.group_id,
                   COALESCE(SUM(r.amount), 0) as total_repaid
             FROM loan_applications la
             LEFT JOIN repayments r ON r.loan_application_id = la.id AND r.payment_date::date <= $1
             WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
             GROUP BY la.id, la.full_name, la.loan_amount, la.loan_duration_months,
                      la.approved_at, la.status, la.loan_product, la.group_id
        `, [asOf]);

        let totalIssued = 0, activeCount = 0, closedCount = 0;
        const aging = { '0': 0, '1_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 };
        let totalPortfolio = 0, par30 = 0, par60 = 0, par90 = 0;

        const portfolioRows = [];

        for (const row of loans) {
            const principal = parseFloat(row.loan_amount) || 0;
            const total = principal * 1.30;
            const repaid = parseFloat(row.total_repaid) || 0;
            const outstanding = Math.max(0, total - repaid);
            const approvedAt = row.approved_at ? new Date(row.approved_at) : new Date();
            const durationMonths = parseInt(row.loan_duration_months) || 4;
            const hasGroup = !!row.group_id;
            const numberOfInstallments = hasGroup ? durationMonths * 4 : durationMonths;
            const installmentAmount = total / numberOfInstallments;
            const installmentsPaid = Math.floor(repaid / (installmentAmount || 1));
            let nextDue = new Date(approvedAt);
            if (hasGroup) {
                nextDue.setDate(nextDue.getDate() + (installmentsPaid + 1) * 7);
            } else {
                nextDue.setMonth(nextDue.getMonth() + installmentsPaid + 1);
            }
            const now = new Date(asOf);
            const daysOverdue = Math.floor((now - nextDue) / (1000 * 60 * 60 * 24));

            totalIssued += principal;
            if (outstanding > 0) {
                activeCount++;
                totalPortfolio += outstanding;
                if (daysOverdue >= 90) {
                    aging['90_plus'] += outstanding;
                    par90 += outstanding;
                } else if (daysOverdue >= 61) {
                    aging['61_90'] += outstanding;
                    par60 += outstanding;
                    par90 += outstanding;
                } else if (daysOverdue >= 31) {
                    aging['31_60'] += outstanding;
                    par30 += outstanding;
                    par60 += outstanding;
                    par90 += outstanding;
                } else if (daysOverdue >= 0) {
                    aging['1_30'] += outstanding;
                    par30 += outstanding;
                    par60 += outstanding;
                    par90 += outstanding;
                } else {
                    aging['0'] += outstanding;
                }
            } else {
                closedCount++;
            }

            portfolioRows.push({
                id: row.id,
                client_name: row.full_name,
                loan_product: row.loan_product,
                principal: Math.round(principal),
                total_outstanding: Math.round(outstanding),
                days_overdue: daysOverdue > 0 ? daysOverdue : 0,
                status: outstanding > 0 ? 'active' : 'closed',
            });
        }

        const par30Pct = totalPortfolio > 0 ? (par30 / totalPortfolio) * 100 : 0;
        const par60Pct = totalPortfolio > 0 ? (par60 / totalPortfolio) * 100 : 0;
        const par90Pct = totalPortfolio > 0 ? (par90 / totalPortfolio) * 100 : 0;

        res.json({
            as_of: asOf,
            summary: {
                total_loans_issued: Math.round(totalIssued),
                active_loans: activeCount,
                closed_loans: closedCount,
                total_portfolio: Math.round(totalPortfolio),
                par_30: Math.round(par30),
                par_30_pct: Math.round(par30Pct * 100) / 100,
                par_60: Math.round(par60),
                par_60_pct: Math.round(par60Pct * 100) / 100,
                par_90: Math.round(par90),
                par_90_pct: Math.round(par90Pct * 100) / 100,
            },
            aging: {
                current: Math.round(aging['0']),
                days_1_30: Math.round(aging['1_30']),
                days_31_60: Math.round(aging['31_60']),
                days_61_90: Math.round(aging['61_90']),
                days_90_plus: Math.round(aging['90_plus']),
            },
            loans: portfolioRows,
        });
    } catch (err) {
        console.error('Loan portfolio error:', err);
        res.status(500).json({ error: 'Failed to fetch loan portfolio' });
    }
});

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/delinquency
// Delinquency Report
// ──────────────────────────────────────────────────────────────
router.get('/delinquency', async (req, res) => {
    try {
        const asOf = req.query.to || new Date().toISOString().split('T')[0];

        const { rows: loans } = await db.query(`
            SELECT la.id, la.full_name, la.phone_number, la.loan_amount,
                   la.loan_duration_months, la.approved_at, la.loan_product, la.group_id,
                   COALESCE(SUM(r.amount), 0) as total_repaid
             FROM loan_applications la
             LEFT JOIN repayments r ON r.loan_application_id = la.id AND r.payment_date::date <= $1
             WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
             GROUP BY la.id, la.full_name, la.phone_number, la.loan_amount,
                      la.loan_duration_months, la.approved_at, la.loan_product, la.group_id
        `, [asOf]);

        const lateBorrowers = [];
        let totalOverdue = 0, totalPortfolio = 0;

        for (const row of loans) {
            const principal = parseFloat(row.loan_amount) || 0;
            const total = principal * 1.30;
            const repaid = parseFloat(row.total_repaid) || 0;
            const outstanding = Math.max(0, total - repaid);
            if (outstanding <= 0) continue;

            const approvedAt = row.approved_at ? new Date(row.approved_at) : new Date();
            const durationMonths = parseInt(row.loan_duration_months) || 4;
            const hasGroup = !!row.group_id;
            const numberOfInstallments = hasGroup ? durationMonths * 4 : durationMonths;
            const installmentAmount = total / numberOfInstallments;
            const installmentsPaid = Math.floor(repaid / (installmentAmount || 1));
            let nextDue = new Date(approvedAt);
            if (hasGroup) {
                nextDue.setDate(nextDue.getDate() + (installmentsPaid + 1) * 7);
            } else {
                nextDue.setMonth(nextDue.getMonth() + installmentsPaid + 1);
            }
            const now = new Date(asOf);
            const daysOverdue = Math.floor((now - nextDue) / (1000 * 60 * 60 * 24));

            if (daysOverdue > 0) {
                totalOverdue += outstanding;
                totalPortfolio += outstanding;
                const penaltyRate = 0.02; // 2% per month placeholder
                const accruedPenalty = outstanding * (daysOverdue / 30) * penaltyRate;

                lateBorrowers.push({
                    id: row.id,
                    client_name: row.full_name,
                    phone: row.phone_number,
                    loan_product: row.loan_product,
                    outstanding: Math.round(outstanding),
                    days_overdue: daysOverdue,
                    accrued_penalty: Math.round(accruedPenalty),
                    restructured: false,
                });
            } else {
                totalPortfolio += outstanding;
            }
        }

        const defaultRate = totalPortfolio > 0 ? (totalOverdue / totalPortfolio) * 100 : 0;

        res.json({
            as_of: asOf,
            summary: {
                late_borrowers_count: lateBorrowers.length,
                total_overdue_amount: Math.round(totalOverdue),
                total_portfolio: Math.round(totalPortfolio),
                default_rate_pct: Math.round(defaultRate * 100) / 100,
            },
            late_borrowers: lateBorrowers,
        });
    } catch (err) {
        console.error('Delinquency error:', err);
        res.status(500).json({ error: 'Failed to fetch delinquency report' });
    }
});

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/repayment-collection
// Repayment Collection Report (channel breakdown)
// ──────────────────────────────────────────────────────────────
router.get('/repayment-collection', async (req, res) => {
    try {
        const { start, end } = getDateRange(req);

        const { rows: rows } = await db.query(
            `SELECT payment_method, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
             FROM repayments
             WHERE payment_date::date >= $1 AND payment_date::date <= $2
             GROUP BY payment_method`,
            [start, end]
        );

        const byChannel = {};
        let total = 0;
        rows.forEach(r => {
            const method = r.payment_method || 'cash';
            byChannel[method] = { total: parseFloat(r.total), count: parseInt(r.count) };
            total += parseFloat(r.total);
        });

        const mtn = byChannel['mtn_mobile_money'] || byChannel['mobile_money'] || { total: 0, count: 0 };
        const airtel = byChannel['airtel_money'] || { total: 0, count: 0 };
        const manual = byChannel['cash'] || { total: 0, count: 0 };

        res.json({
            period: { start, end },
            daily_collections: total,
            by_channel: {
                mtn: { total: Math.round(mtn.total), count: mtn.count },
                airtel: { total: Math.round(airtel.total), count: airtel.count },
                manual: { total: Math.round(manual.total), count: manual.count },
                bank: Math.round((byChannel['bank_transfer'] || { total: 0 }).total),
            },
            total_collected: Math.round(total),
        });
    } catch (err) {
        console.error('Repayment collection error:', err);
        res.status(500).json({ error: 'Failed to fetch repayment collection' });
    }
});

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/trial-balance
// Trial Balance (simplified from accounting_entries)
// ──────────────────────────────────────────────────────────────
router.get('/trial-balance', async (req, res) => {
    try {
        const asOf = req.query.to || new Date().toISOString().split('T')[0];
        const endDate = new Date(asOf);
        endDate.setHours(23, 59, 59, 999);

        const lines = [];

        // 1. Assets: Loans Receivable & Accrued Interest
        const { rows: loanRows } = await db.query(`
            SELECT la.loan_amount, (la.loan_amount * 1.3) as total_expected,
                   COALESCE(SUM(r.amount), 0) as total_repaid
             FROM loan_applications la
             LEFT JOIN repayments r ON r.loan_application_id = la.id AND r.payment_date::date <= $1
             WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
             AND la.approved_at::date <= $1
             GROUP BY la.id, la.loan_amount
        `, [asOf]);

        let principalOutstanding = 0;
        let interestOutstanding = 0;
        loanRows.forEach(row => {
            const principal = parseFloat(row.loan_amount);
            const total = parseFloat(row.total_expected);
            const repaid = parseFloat(row.total_repaid);
            const outstanding = Math.max(0, total - repaid);
            if (outstanding > 0) {
                const principalPaid = repaid * (1 / 1.30);
                const pOut = Math.max(0, principal - principalPaid);
                principalOutstanding += pOut;
                interestOutstanding += Math.max(0, outstanding - pOut);
            }
        });
        if (principalOutstanding > 0) lines.push({ account: "Loans Receivable", debit: principalOutstanding, credit: 0 });
        if (interestOutstanding > 0) lines.push({ account: "Accrued Interest", debit: interestOutstanding, credit: 0 });

        // 2. Assets: Fixed Assets
        const { rows: assetRows } = await db.query(`SELECT category, SUM(value) as total FROM assets WHERE purchase_date <= $1 GROUP BY category`, [asOf]);
        assetRows.forEach(r => {
            lines.push({ account: `Fixed Asset - ${r.category}`, debit: parseFloat(r.total), credit: 0 });
        });

        // 3. Liabilities: Creditors
        const { rows: credRows } = await db.query(`SELECT name, SUM(amount_borrowed) as total FROM creditors WHERE created_at <= $1 GROUP BY name`, [asOf]);
        credRows.forEach(r => {
            lines.push({ account: `Liability - ${r.name}`, debit: 0, credit: parseFloat(r.total) });
        });

        // 4. Equity: Share Capital
        const { rows: capRows } = await db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM accounting_entries WHERE category = 'Share Capital' AND entry_date <= $1`, [asOf]);
        if (parseFloat(capRows[0].total) > 0) {
            lines.push({ account: "Share Capital", debit: 0, credit: parseFloat(capRows[0].total) });
        }

        // 5. Revenue & Expenses
        const { rows: ledgerRows } = await db.query(`
            SELECT category, entry_type, SUM(amount) as total
            FROM accounting_entries 
            WHERE entry_date <= $1 AND category != 'Share Capital'
            GROUP BY category, entry_type
        `, [asOf]);

        let totalRevenue = 0;
        let totalExpense = 0;

        ledgerRows.forEach(r => {
            const val = parseFloat(r.total);
            if (r.entry_type === 'revenue') {
                lines.push({ account: `Revenue - ${r.category}`, debit: 0, credit: val });
                totalRevenue += val;
            } else {
                lines.push({ account: `Expense - ${r.category}`, debit: val, credit: 0 });
                totalExpense += val;
            }
        });

        // 6. Cash Proxy (Total Inflows - Outflows)
        // Simplified cash balance: (ShareCap + Creditors + Revenue + Repayments) - (Expenses + Principal Disbursed + Asset Purchases)
        const totalShareCap = parseFloat(capRows[0].total);
        const totalCreditors = credRows.reduce((s, r) => s + parseFloat(r.total), 0);
        const totalAssetsValue = assetRows.reduce((s, r) => s + parseFloat(r.total), 0);
        const { rows: totalRepayRows } = await db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM repayments WHERE payment_date <= $1`, [asOf]);
        const { rows: totalDisbRows } = await db.query(`SELECT COALESCE(SUM(loan_amount), 0) as total FROM loan_applications WHERE status IN ('approved', 'disbursed', 'completed', 'settled') AND approved_at <= $1`, [asOf]);

        const totalRepaid = parseFloat(totalRepayRows[0].total);
        const totalDisbursed = parseFloat(totalDisbRows[0].total);

        const cashBalance = totalShareCap + totalCreditors + totalRevenue + totalRepaid - totalExpense - totalDisbursed - totalAssetsValue;
        if (cashBalance !== 0) {
            if (cashBalance > 0) lines.push({ account: "Bank / Cash Balance", debit: cashBalance, credit: 0 });
            else lines.push({ account: "Bank Overdraft", debit: 0, credit: Math.abs(cashBalance) });
        }

        res.json({
            as_of: asOf,
            lines,
            total_debits: lines.reduce((s, l) => s + l.debit, 0),
            total_credits: lines.reduce((s, l) => s + l.credit, 0),
        });
    } catch (err) {
        console.error('Trial balance error:', err);
        res.status(500).json({ error: 'Failed to fetch trial balance' });
    }
});

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/dashboard-kpis
// Dashboard KPIs for home screen
// ──────────────────────────────────────────────────────────────
router.get('/dashboard-kpis', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date();
        monthStart.setDate(1);
        const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

        const { rows: portfolioRows } = await db.query(`
            SELECT COALESCE(SUM(la.loan_amount * 1.3), 0) - COALESCE(SUM(r.amount), 0) as outstanding
             FROM loan_applications la
             LEFT JOIN repayments r ON r.loan_application_id = la.id
             WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
        `);
        const totalActivePortfolio = Math.max(0, parseFloat(portfolioRows[0]?.outstanding || 0));

        const { rows: parRows } = await db.query(`
            SELECT la.id, la.loan_amount, la.loan_duration_months, la.approved_at,
                   COALESCE(SUM(r.amount), 0) as total_repaid
             FROM loan_applications la
             LEFT JOIN repayments r ON r.loan_application_id = la.id
             WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
             GROUP BY la.id, la.loan_amount, la.loan_duration_months, la.approved_at
        `);
        let par30Amount = 0;
        parRows.forEach(row => {
            const principal = parseFloat(row.loan_amount) || 0;
            const total = principal * 1.30;
            const repaid = parseFloat(row.total_repaid) || 0;
            const outstanding = Math.max(0, total - repaid);
            if (outstanding <= 0) return;
            const approvedAt = row.approved_at ? new Date(row.approved_at) : new Date();
            const durationMonths = parseInt(row.loan_duration_months) || 4;
            const numberOfInstallments = row.group_id ? durationMonths * 4 : durationMonths;
            const installmentAmount = total / numberOfInstallments;
            const installmentsPaid = Math.floor(repaid / (installmentAmount || 1));
            let nextDue = new Date(approvedAt);
            if (row.group_id) nextDue.setDate(nextDue.getDate() + (installmentsPaid + 1) * 7);
            else nextDue.setMonth(nextDue.getMonth() + installmentsPaid + 1);
            const now = new Date();
            const daysOverdue = Math.floor((now - nextDue) / (1000 * 60 * 60 * 24));
            if (daysOverdue >= 30) par30Amount += outstanding;
        });

        const { rows: disbRows } = await db.query(
            `SELECT COALESCE(SUM(loan_amount), 0) as total
             FROM loan_applications
             WHERE status = 'disbursed' AND approved_at >= $1`,
            [monthStart.toISOString().split('T')[0]]
        );
        const totalDisbursedThisMonth = parseFloat(disbRows[0]?.total || 0);

        const { rows: todayRows } = await db.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM repayments
             WHERE payment_date::date = $1`,
            [today]
        );
        const totalCollectedToday = parseFloat(todayRows[0]?.total || 0);

        const { rows: ytdRows } = await db.query(
            `SELECT entry_type, COALESCE(SUM(amount), 0) as total
             FROM accounting_entries
             WHERE entry_date >= $1
             GROUP BY entry_type`,
            [yearStart]
        );
        let ytdRevenue = 0, ytdExpenses = 0;
        ytdRows.forEach(r => {
            if (r.entry_type === 'revenue') ytdRevenue = parseFloat(r.total);
            if (r.entry_type === 'expense') ytdExpenses = parseFloat(r.total);
        });
        const netProfitYtd = ytdRevenue - ytdExpenses;

        const { rows: cashRows } = await db.query(
            `SELECT COALESCE(SUM(CASE WHEN entry_type = 'revenue' THEN amount ELSE -amount END), 0) as net
             FROM accounting_entries
             WHERE entry_date <= $1`,
            [today]
        );
        const cashPosition = Math.max(0, parseFloat(cashRows[0]?.net || 0));

        const totalLoans = parRows.length;
        const overdueCount = parRows.filter(r => {
            const principal = parseFloat(r.loan_amount) || 0;
            const total = principal * 1.30;
            const repaid = parseFloat(r.total_repaid) || 0;
            const outstanding = Math.max(0, total - repaid);
            if (outstanding <= 0) return false;
            const approvedAt = r.approved_at ? new Date(r.approved_at) : new Date();
            const durationMonths = parseInt(r.loan_duration_months) || 4;
            const numberOfInstallments = r.group_id ? durationMonths * 4 : durationMonths;
            const installmentAmount = total / numberOfInstallments;
            const installmentsPaid = Math.floor(repaid / (installmentAmount || 1));
            let nextDue = new Date(approvedAt);
            if (r.group_id) nextDue.setDate(nextDue.getDate() + (installmentsPaid + 1) * 7);
            else nextDue.setMonth(nextDue.getMonth() + installmentsPaid + 1);
            const now = new Date();
            const daysOverdue = Math.floor((now - nextDue) / (1000 * 60 * 60 * 24));
            return daysOverdue > 0;
        }).length;
        const defaultRatePct = totalLoans > 0 ? (overdueCount / totalLoans) * 100 : 0;

        res.json({
            total_active_portfolio: Math.round(totalActivePortfolio),
            par_30: Math.round(par30Amount),
            par_30_pct: totalActivePortfolio > 0 ? Math.round((par30Amount / totalActivePortfolio) * 10000) / 100 : 0,
            total_disbursed_this_month: Math.round(totalDisbursedThisMonth),
            total_collected_today: Math.round(totalCollectedToday),
            net_profit_ytd: Math.round(netProfitYtd),
            cash_position: Math.round(cashPosition),
            default_rate_pct: Math.round(defaultRatePct * 100) / 100,
        });
    } catch (err) {
        console.error('Dashboard KPIs error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard KPIs' });
    }
});

// ──────────────────────────────────────────────────────────────
// GET /api/accounting/cash-book
// Unified ledger of all movements across accounts
// ──────────────────────────────────────────────────────────────
router.get('/cash-book', async (req, res) => {
    try {
        const { start, end } = getDateRange(req);
        const { account } = req.query; // optional filter by payment_method

        // 1. Fetch Manual Entries
        let entriesQuery = `
            SELECT 
                id, entry_date as date, description, category, 
                amount, entry_type, payment_method, 'manual' as source
            FROM accounting_entries 
            WHERE entry_date >= $1 AND entry_date <= $2
        `;
        let entriesParams = [start, end];
        if (account) {
            entriesQuery += ` AND payment_method = $3`;
            entriesParams.push(account);
        }
        const { rows: manualEntries } = await db.query(entriesQuery, entriesParams);

        // 2. Fetch Repayments (Inflows)
        let repaymentsQuery = `
            SELECT 
                r.id, r.payment_date::date as date, 
                'Loan Repayment - ' || la.full_name as description, 
                'Interest & Principal' as category,
                r.amount, 'revenue' as entry_type, r.payment_method, 'repayment' as source
            FROM repayments r
            JOIN loan_applications la ON r.loan_application_id = la.id
            WHERE r.payment_date::date >= $1 AND r.payment_date::date <= $2
        `;
        let repaymentsParams = [start, end];
        if (account) {
            repaymentsQuery += ` AND r.payment_method = $3`;
            repaymentsParams.push(account);
        }
        const { rows: repayments } = await db.query(repaymentsQuery, repaymentsParams);

        let disbursementsQuery = `
            SELECT 
                id, approved_at::date as date, 
                'Loan Disbursement - ' || full_name as description, 
                'Loan Issue' as category,
                loan_amount as amount, 'expense' as entry_type, 'cash' as payment_method, 'disbursement' as source
            FROM loan_applications
            WHERE status IN ('disbursed', 'completed', 'settled')
            AND approved_at::date >= $1 AND approved_at::date <= $2
        `;
        let disbursementsParams = [start, end];

        let disbursements = [];
        if (!account || account === 'cash') {
            const { rows } = await db.query(disbursementsQuery, disbursementsParams);
            disbursements = rows;
        }

        // 4. Combine and Sort
        const allTransactions = [...manualEntries, ...repayments, ...disbursements]
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // 5. Calculate Balances by Account
        const accounts = ['cash', 'mobile_money', 'bank_transfer'];
        const summaries = {};

        for (const acc of accounts) {
            // Opening balance (Total historical before 'start')
            const { rows: openManual } = await db.query(
                `SELECT SUM(CASE WHEN entry_type = 'revenue' THEN amount ELSE -amount END) as total FROM accounting_entries WHERE entry_date < $1 AND payment_method = $2`,
                [start, acc]
            );
            const { rows: openRep } = await db.query(
                `SELECT SUM(amount) as total FROM repayments WHERE payment_date::date < $1 AND payment_method = $2`,
                [start, acc]
            );

            let openDis = 0;
            if (acc === 'cash') {
                const { rows: openDisRows } = await db.query(
                    `SELECT SUM(loan_amount) as total FROM loan_applications WHERE status IN ('disbursed', 'completed', 'settled') AND approved_at::date < $1`,
                    [start]
                );
                openDis = parseFloat(openDisRows[0]?.total || 0);
            }

            const opening = parseFloat(openManual[0]?.total || 0) + parseFloat(openRep[0]?.total || 0) - openDis;

            // Movements in period
            const periodIn = allTransactions.filter(t => t.payment_method === acc && t.entry_type === 'revenue').reduce((s, t) => s + parseFloat(t.amount), 0);
            const periodOut = allTransactions.filter(t => t.payment_method === acc && t.entry_type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);

            summaries[acc] = {
                opening: Math.round(opening),
                inflow: Math.round(periodIn),
                outflow: Math.round(periodOut),
                closing: Math.round(opening + periodIn - periodOut)
            };
        }

        res.json({
            transactions: allTransactions,
            summaries,
            period: { start, end }
        });
    } catch (err) {
        console.error('Cash book error:', err);
        res.status(500).json({ error: 'Failed to fetch cash book data' });
    }
});

module.exports = router;
