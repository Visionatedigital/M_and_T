const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const notificationService = require('../services/notificationService');
const { runOverdueCheck } = require('../services/overdueCheck.cjs');

const ALLOWED_PAYMENT_METHODS = ['cash', 'bank_transfer', 'mobile_money'];
const normalizePaymentMethod = (value) => {
    if (!value) return null;
    const v = String(value).toLowerCase().trim();
    if (v === 'bank') return 'bank_transfer';
    if (v === 'mobile') return 'mobile_money';
    return v;
};

const getOfficerScope = (req, alias = 'la', paramIndex = 1) => {
    const role = String(req.user?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
    const userId = req.user?.user_id || req.user?.id;
    if (role !== 'loan_officer' || !userId) {
        return { joinSql: '', whereSql: '', values: [] };
    }
    return {
        joinSql: ` LEFT JOIN borrowers b_scope ON b_scope.id = ${alias}.borrower_id `,
        whereSql: ` b_scope.assigned_officer_id = $${paramIndex} `,
        values: [userId]
    };
};

// Get processed repayments/schedule
router.get('/', async (req, res) => {
    try {
        const scope = getOfficerScope(req, 'la', 1);
        const whereClause = scope.whereSql
            ? ` AND ${scope.whereSql} `
            : '';

        const { rows: loans } = await db.query(`
            SELECT 
                la.*,
                COALESCE(la.full_name, p.full_name) as full_name,
                COALESCE(la.phone_number, p.phone_number) as phone_number,
                g.group_name as groups_group_name
            FROM loan_applications la
            LEFT JOIN profiles p ON la.user_id = p.id
            LEFT JOIN groups g ON la.group_id = g.id
            ${scope.joinSql}
            WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
            ${whereClause}
            ORDER BY la.created_at DESC
        `, scope.values);

        const hasMemberBreakdownColumn = await db.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'repayments' AND column_name = 'member_breakdown'
        `).then(r => r.rows.length > 0).catch(() => false);

        const loanIds = loans.map((l) => l.id).filter(Boolean);
        const paymentSelect = hasMemberBreakdownColumn
            ? `SELECT loan_application_id, amount, member_breakdown FROM repayments`
            : `SELECT loan_application_id, amount FROM repayments`;
        const { rows: payments } = loanIds.length
            ? await db.query(`${paymentSelect} WHERE loan_application_id = ANY($1::uuid[])`, [loanIds])
            : { rows: [] };

        const paymentMap = {};
        const memberPaymentMap = {};
        payments.forEach(p => {
            const loanId = p.loan_application_id;
            const amt = parseFloat(p.amount || 0);
            paymentMap[loanId] = (paymentMap[loanId] || 0) + amt;

            if (!memberPaymentMap[loanId]) memberPaymentMap[loanId] = {};
            const breakdown = Array.isArray(p.member_breakdown) ? p.member_breakdown : [];
            breakdown.forEach((m) => {
                const nameKey = (m?.name || '').toString().trim().toLowerCase();
                const mAmount = parseFloat(m?.amount || 0);
                if (!nameKey || mAmount <= 0) return;
                memberPaymentMap[loanId][nameKey] = (memberPaymentMap[loanId][nameKey] || 0) + mAmount;
            });
        });

        const processed = loans.map(loan => {
            const principal = parseFloat(loan.loan_amount) || 0;
            const interest = principal * 0.30;
            const totalAmount = principal + interest;
            const paidAmount = paymentMap[loan.id] || 0;
            const paidByMember = memberPaymentMap[loan.id] || {};
            const balance = Math.max(0, totalAmount - paidAmount);

            const loanDurationMonths = parseInt(loan.loan_duration_months) || 4;
            const numberOfInstallments = loan.group_id ? Math.ceil(loanDurationMonths * 4.33) : loanDurationMonths;
            let installmentAmount = totalAmount / numberOfInstallments;

            const groupMembers = (loan.group_members && typeof loan.group_members === 'object')
                ? (Array.isArray(loan.group_members) ? loan.group_members : [])
                : [];
            const membersWithAmounts = groupMembers.filter(m => (m.amount || 0) > 0);
            const memberSchedules = membersWithAmounts.length > 0
                ? membersWithAmounts.map(m => {
                    const mPrincipal = parseFloat(m.amount) || 0;
                    const mTotal = mPrincipal * 1.30;
                    const mWeekly = mTotal / numberOfInstallments;
                    return { name: m.name || 'Member', amount: mPrincipal, total: mTotal, weekly: mWeekly };
                })
                : null;

            const approvedDate = new Date(loan.approved_at || loan.created_at);
            const installmentsPaid = Math.floor(paidAmount / installmentAmount);

            let nextDueDate = new Date(approvedDate);
            if (loan.group_id) {
                nextDueDate.setDate(nextDueDate.getDate() + ((installmentsPaid + 1) * 7));
            } else {
                nextDueDate.setMonth(nextDueDate.getMonth() + installmentsPaid + 1);
            }

            const maturityDate = new Date(approvedDate);
            maturityDate.setMonth(maturityDate.getMonth() + loanDurationMonths);

            const now = new Date();
            const isPastMaturity = now > maturityDate && balance > 0;
            const isDueToday = nextDueDate.toDateString() === now.toDateString() && balance > 0;

            const daysPassed = (now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24);
            const totalDurationDays = loanDurationMonths * 30;
            const expectedProgress = Math.min(1, Math.max(0, daysPassed / totalDurationDays));
            const expectedPaid = totalAmount * expectedProgress;
            const isMissedRepayment = (expectedPaid - paidAmount) > (installmentAmount * 1.5) && balance > 0 && !isPastMaturity;

            let status = "Active";
            if (balance <= 0) status = "Fully Paid";
            else if (isPastMaturity) status = "Past Maturity";
            else if (isDueToday) status = "Due Today";
            else if (isMissedRepayment) status = "Missed Repayment";

            const groupName = loan.groups_group_name || loan.group_name || null;
            const { groups_group_name, ...loanRest } = loan;
            return {
                ...loanRest,
                client_name: loan.full_name,
                group_name: groupName,
                groups: groupName ? { group_name: groupName } : null,
                installmentAmount,
                paidAmount,
                balance,
                nextDueDate: nextDueDate.toISOString(),
                status,
                member_schedules: memberSchedules,
                member_paid_map: paidByMember
            };
        });

        res.json(processed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch repayments' });
    }
});

/** Fallback if loan_products.late_payment_penalty is not set */
const LATE_PENALTY_AMOUNT = 5000;

/** Default security deposit % for group loans when product rate missing */
const DEFAULT_SECURITY_DEPOSIT_RATE_PCT = 10;

// Record a new payment
router.post('/', async (req, res) => {
    const { loan_application_id, amount, payment_date, payment_method, penalty_amount: clientPenalty, member_breakdown, notes } = req.body;
    const recorded_by = req.user?.user_id || '00000000-0000-0000-0000-000000000000';
    const payMethod = normalizePaymentMethod(payment_method);
    const effectiveDate = payment_date || new Date().toISOString().split('T')[0];

    if (!payMethod || !ALLOWED_PAYMENT_METHODS.includes(payMethod)) {
        return res.status(400).json({ error: 'Valid payment_method is required (cash, bank_transfer, mobile_money)' });
    }

    try {
        const accessScope = getOfficerScope(req, 'la', 2);
        if (accessScope.whereSql) {
            const { rows: accessRows } = await db.query(
                `
                SELECT la.id
                FROM loan_applications la
                ${accessScope.joinSql}
                WHERE la.id = $1 AND ${accessScope.whereSql}
                LIMIT 1
                `,
                [loan_application_id, ...accessScope.values]
            );
            if (accessRows.length === 0) {
                return res.status(404).json({ error: 'Loan not found' });
            }
        }

        await db.query('BEGIN');

        let penaltyAmount = parseFloat(clientPenalty) || 0;
        /** UGX of late fee absorbed by group security deposit (not collected in cash) */
        let penaltyCoveredByDeposit = 0;
        /** Principal × security deposit % — used to persist balance on loan */
        let initialSdForUpdate = null;
        let penaltyDueForMessage = 0;

        const hasPenaltyCoveredColumn = await db.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'repayments' AND column_name = 'penalty_covered_by_security_deposit'
        `).then(r => r.rows.length > 0).catch(() => false);

        const hasSdAmountColumn = await db.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'loan_applications' AND column_name = 'security_deposit_amount'
        `).then(r => r.rows.length > 0).catch(() => false);

        const hasSdBalanceColumn = await db.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'loan_applications' AND column_name = 'security_deposit_balance'
        `).then(r => r.rows.length > 0).catch(() => false);

        // Calculate if payment is late and apply penalty if not already provided
        if (penaltyAmount === 0) {
            const { rows: loanRows } = await db.query(
                `SELECT la.*, p.full_name, p.phone_number,
                        lp.late_payment_penalty, lp.security_deposit_rate
                 FROM loan_applications la
                 LEFT JOIN profiles p ON la.user_id = p.id
                 LEFT JOIN LATERAL (
                    SELECT late_payment_penalty, security_deposit_rate
                    FROM loan_products
                    WHERE name = la.loan_product
                    ORDER BY updated_at DESC NULLS LAST
                    LIMIT 1
                 ) lp ON true
                 WHERE la.id = $1`,
                [loan_application_id]
            );

            if (loanRows.length > 0) {
                const loan = loanRows[0];
                const { rows: payments } = await db.query(
                    `SELECT SUM(amount) as paid FROM repayments WHERE loan_application_id = $1`,
                    [loan_application_id]
                );
                const paidAmount = parseFloat(payments[0]?.paid || 0);
                const principal = parseFloat(loan.loan_amount) || 0;
                const totalAmount = principal * 1.30;
                const loanDurationMonths = parseInt(loan.loan_duration_months) || 4;
                // Group loan: linked to a group OR product name indicates group (security deposit rules)
                const isGroup = !!loan.group_id || /group/i.test(String(loan.loan_product || ''));
                const numberOfInstallments = isGroup ? Math.ceil(loanDurationMonths * 4.33) : loanDurationMonths;
                const installmentAmount = totalAmount / numberOfInstallments;
                const installmentsPaid = Math.floor(paidAmount / installmentAmount);

                const approvedDate = new Date(loan.approved_at || loan.created_at);
                let nextDueDate = new Date(approvedDate);
                if (isGroup) {
                    nextDueDate.setDate(nextDueDate.getDate() + ((installmentsPaid + 1) * 7));
                } else {
                    nextDueDate.setMonth(nextDueDate.getMonth() + installmentsPaid + 1);
                }

                const paymentDateObj = new Date(effectiveDate);
                const penaltyDue = Math.max(0, parseFloat(loan.late_payment_penalty) || LATE_PENALTY_AMOUNT);
                penaltyDueForMessage = penaltyDue;

                if (paymentDateObj > nextDueDate) {
                    if (isGroup) {
                        // Group loans: security deposit covers late penalty first; cash only if deposit exhausted
                        const sdRate = parseFloat(loan.security_deposit_rate);
                        const ratePct = Number.isFinite(sdRate) && sdRate > 0 ? sdRate : DEFAULT_SECURITY_DEPOSIT_RATE_PCT;
                        const initialSd = principal * (ratePct / 100);
                        initialSdForUpdate = initialSd;

                        if (!hasPenaltyCoveredColumn) {
                            // Cannot track forfeitures until repayments.penalty_covered_by_security_deposit exists
                            penaltyAmount = penaltyDue;
                            penaltyCoveredByDeposit = 0;
                        } else {
                            let sumCoveredPrior = 0;
                            const { rows: covRows } = await db.query(
                                `SELECT COALESCE(SUM(penalty_covered_by_security_deposit), 0) as s
                                 FROM repayments WHERE loan_application_id = $1`,
                                [loan_application_id]
                            );
                            sumCoveredPrior = parseFloat(covRows[0]?.s) || 0;

                            let remaining = Math.max(0, initialSd - sumCoveredPrior);
                            if (hasSdBalanceColumn && loan.security_deposit_balance != null) {
                                remaining = Math.max(0, parseFloat(loan.security_deposit_balance));
                            }

                            const covered = Math.min(penaltyDue, remaining);
                            penaltyCoveredByDeposit = covered;
                            penaltyAmount = Math.max(0, penaltyDue - covered);
                        }
                    } else {
                        penaltyAmount = penaltyDue;
                    }
                }
            }
        }

        const hasPenaltyColumn = await db.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'repayments' AND column_name = 'penalty_amount'
        `).then(r => r.rows.length > 0).catch(() => false);

        const { rows: availableColumns } = await db.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'repayments' AND column_name = ANY($1::text[])
        `, [['notes', 'member_breakdown']]);
        const hasNotesColumn = availableColumns.some(c => c.column_name === 'notes');
        const hasMemberBreakdownColumn = availableColumns.some(c => c.column_name === 'member_breakdown');

        const normalizedBreakdown = Array.isArray(member_breakdown)
            ? member_breakdown
                .map((m) => ({
                    name: (m?.name || '').toString().trim(),
                    amount: parseFloat(m?.amount || 0)
                }))
                .filter((m) => m.name && m.amount > 0)
            : [];

        const insertCols = ['loan_application_id', 'amount', 'payment_date', 'payment_method', 'recorded_by'];
        const insertVals = [loan_application_id, amount, effectiveDate, payMethod, recorded_by];
        if (hasPenaltyColumn) {
            insertCols.push('penalty_amount');
            insertVals.push(penaltyAmount);
        }
        if (hasPenaltyCoveredColumn) {
            insertCols.push('penalty_covered_by_security_deposit');
            insertVals.push(penaltyCoveredByDeposit);
        }
        if (hasNotesColumn) {
            insertCols.push('notes');
            insertVals.push(notes || null);
        }
        if (hasMemberBreakdownColumn) {
            insertCols.push('member_breakdown');
            insertVals.push(JSON.stringify(normalizedBreakdown));
        }
        const placeholders = insertVals.map((_, i) => `$${i + 1}`).join(', ');
        await db.query(
            `INSERT INTO repayments (${insertCols.join(', ')}) VALUES (${placeholders})`,
            insertVals
        );

        if (hasSdBalanceColumn && penaltyCoveredByDeposit > 0 && initialSdForUpdate != null) {
            await db.query(
                `UPDATE loan_applications SET
                    security_deposit_amount = COALESCE(security_deposit_amount, $1),
                    security_deposit_balance = GREATEST(0, COALESCE(security_deposit_balance, $1) - $2)
                 WHERE id = $3`,
                [initialSdForUpdate, penaltyCoveredByDeposit, loan_application_id]
            );
        }

        const { rows: loanRows } = await db.query(
            `SELECT full_name, loan_amount, loan_product FROM loan_applications WHERE id = $1`,
            [loan_application_id]
        );

        if (loanRows.length > 0) {
            const loan = loanRows[0];
            const paymentAmount = parseFloat(amount) || 0;
            const interestRate = 0.30;
            const interestPortion = Math.round(paymentAmount * (interestRate / (1 + interestRate)));
            const principalPortion = paymentAmount - interestPortion;

            if (interestPortion > 0) {
                await db.query(`
                    INSERT INTO accounting_entries
                        (entry_type, category, description, amount, entry_date, payment_method, reference_id, recorded_by)
                    VALUES ('revenue', 'Interest Income', $1, $2, $3, $4, $5, $6)
                `, [
                    `Loan Repayment - Interest (${loan.full_name} - ${loan.loan_product})`,
                    interestPortion,
                    effectiveDate,
                    payMethod,
                    loan_application_id,
                    recorded_by
                ]);
            }

            if (principalPortion > 0) {
                await db.query(`
                    INSERT INTO accounting_entries
                        (entry_type, category, description, amount, entry_date, payment_method, reference_id, recorded_by)
                    VALUES ('revenue', 'Principal Recovery', $1, $2, $3, $4, $5, $6)
                `, [
                    `Loan Repayment - Principal (${loan.full_name} - ${loan.loan_product})`,
                    principalPortion,
                    effectiveDate,
                    payMethod,
                    loan_application_id,
                    recorded_by
                ]);
            }

            if (penaltyAmount > 0) {
                await db.query(`
                    INSERT INTO accounting_entries
                        (entry_type, category, description, amount, entry_date, payment_method, reference_id, recorded_by)
                    VALUES ('revenue', 'Late Payment Penalties', $1, $2, $3, $4, $5, $6)
                `, [
                    `Late Payment Penalty (cash) - ${loan.full_name} (${loan.loan_product})`,
                    penaltyAmount,
                    effectiveDate,
                    payMethod,
                    loan_application_id,
                    recorded_by
                ]);
            }

            if (penaltyCoveredByDeposit > 0) {
                await db.query(`
                    INSERT INTO accounting_entries
                        (entry_type, category, description, amount, entry_date, payment_method, reference_id, recorded_by)
                    VALUES ('revenue', 'Late Payment Penalties', $1, $2, $3, $4, $5, $6)
                `, [
                    `Late Payment Penalty (security deposit applied) - ${loan.full_name} (${loan.loan_product})`,
                    penaltyCoveredByDeposit,
                    effectiveDate,
                    payMethod,
                    loan_application_id,
                    recorded_by
                ]);
            }
        }

        await db.query('COMMIT');

        try {
            const { rows: applicant } = await db.query(
                `SELECT 
                    COALESCE(la.phone_number, p.phone_number, b.phone_number) as phone_number,
                    COALESCE(la.full_name, p.full_name, b.full_name) as full_name,
                    la.loan_product, la.loan_amount
                 FROM loan_applications la
                 LEFT JOIN profiles p ON la.user_id = p.id
                 LEFT JOIN borrowers b ON la.borrower_id = b.id
                 WHERE la.id = $1`,
                [loan_application_id]
            );

            if (applicant.length > 0) {
                const { phone_number, full_name, loan_product, loan_amount } = applicant[0];
                if (phone_number) {
                    const { rows: sumRows } = await db.query(
                        `SELECT COALESCE(SUM(amount), 0) as paid FROM repayments WHERE loan_application_id = $1`,
                        [loan_application_id]
                    );
                    const paidAmount = parseFloat(sumRows[0]?.paid || 0);
                    const principal = parseFloat(loan_amount) || 0;
                    const totalAmount = principal * 1.30;
                    const balance = Math.max(0, totalAmount - paidAmount);
                    const message = `Hello ${full_name}, payment of UGX ${parseFloat(amount).toLocaleString()} for your ${loan_product} received. Balance: UGX ${balance.toLocaleString()}. Thank you!`;
                    await notificationService.sendSMS(phone_number, message);
                }
            }
        } catch (notifyErr) {
            console.error('Error sending SMS notification:', notifyErr);
        }

        let message = 'Repayment recorded successfully';
        if (penaltyCoveredByDeposit > 0 && penaltyAmount > 0) {
            message = `Repayment recorded. UGX ${penaltyCoveredByDeposit.toLocaleString()} of late penalty covered by security deposit; UGX ${penaltyAmount.toLocaleString()} penalty due in cash.`;
        } else if (penaltyCoveredByDeposit > 0) {
            message = `Repayment recorded. Late penalty of UGX ${penaltyCoveredByDeposit.toLocaleString()} covered by security deposit (no additional cash penalty).`;
        } else if (penaltyAmount > 0) {
            message = `Repayment recorded. Late payment penalty of UGX ${penaltyAmount.toLocaleString()} was applied.`;
        }

        res.json({
            message,
            penalty_applied: penaltyAmount > 0 || penaltyCoveredByDeposit > 0,
            penalty_amount: penaltyAmount,
            penalty_covered_by_security_deposit: penaltyCoveredByDeposit,
            penalty_scheduled: penaltyDueForMessage || penaltyAmount + penaltyCoveredByDeposit,
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to record repayment' });
    }
});

// Reallocate historical group payment amounts to a specific member (without changing total paid)
router.post('/reallocate-history', async (req, res) => {
    const { loan_application_id, member_name, amount } = req.body || {};

    const targetAmount = parseFloat(amount || 0);
    if (!loan_application_id || !member_name || targetAmount <= 0) {
        return res.status(400).json({ error: 'loan_application_id, member_name and amount (> 0) are required' });
    }

    try {
        const accessScope = getOfficerScope(req, 'la', 2);
        if (accessScope.whereSql) {
            const { rows: accessRows } = await db.query(
                `
                SELECT la.id
                FROM loan_applications la
                ${accessScope.joinSql}
                WHERE la.id = $1 AND ${accessScope.whereSql}
                LIMIT 1
                `,
                [loan_application_id, ...accessScope.values]
            );
            if (accessRows.length === 0) {
                return res.status(404).json({ error: 'Loan not found' });
            }
        }

        const hasMemberBreakdownColumn = await db.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'repayments' AND column_name = 'member_breakdown'
        `).then(r => r.rows.length > 0).catch(() => false);

        if (!hasMemberBreakdownColumn) {
            return res.status(400).json({ error: 'member_breakdown column is missing. Please run latest migrations.' });
        }

        await db.query('BEGIN');

        const { rows: repaymentRows } = await db.query(`
            SELECT id, amount, COALESCE(member_breakdown, '[]'::jsonb) as member_breakdown
            FROM repayments
            WHERE loan_application_id = $1
            ORDER BY payment_date ASC, created_at ASC, id ASC
            FOR UPDATE
        `, [loan_application_id]);

        if (repaymentRows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'No repayments found for this loan' });
        }

        let remaining = targetAmount;
        let updatedRows = 0;
        const targetKey = String(member_name).trim().toLowerCase();

        for (const row of repaymentRows) {
            if (remaining <= 0) break;

            const rowAmount = parseFloat(row.amount || 0);
            const breakdown = Array.isArray(row.member_breakdown) ? [...row.member_breakdown] : [];
            const allocated = breakdown.reduce((s, m) => s + (parseFloat(m?.amount || 0) || 0), 0);
            const unallocated = Math.max(0, rowAmount - allocated);
            if (unallocated <= 0) continue;

            const take = Math.min(unallocated, remaining);
            const existingIdx = breakdown.findIndex((m) => String(m?.name || '').trim().toLowerCase() === targetKey);
            if (existingIdx >= 0) {
                breakdown[existingIdx].amount = (parseFloat(breakdown[existingIdx].amount || 0) || 0) + take;
            } else {
                breakdown.push({ name: member_name, amount: take });
            }

            await db.query(
                `UPDATE repayments SET member_breakdown = $1::jsonb, updated_at = NOW() WHERE id = $2`,
                [JSON.stringify(breakdown), row.id]
            );

            remaining -= take;
            updatedRows += 1;
        }

        if (remaining > 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({
                error: `Only UGX ${(targetAmount - remaining).toLocaleString()} could be reallocated. Not enough unallocated historical payments for this loan.`
            });
        }

        await db.query('COMMIT');
        res.json({
            message: `UGX ${targetAmount.toLocaleString()} reallocated to ${member_name}`,
            loan_application_id,
            member_name,
            reallocated_amount: targetAmount,
            rows_updated: updatedRows
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to reallocate historical payment' });
    }
});

// Check for overdue repayments (manual trigger or called by cron)
router.post('/check-overdue', async (req, res) => {
    try {
        const result = await runOverdueCheck();
        res.json({ message: 'Overdue checks completed', notifications: result.count, details: result.details });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to check overdue payments' });
    }
});

module.exports = router;
