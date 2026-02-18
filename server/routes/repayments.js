const express = require('express');
const router = express.Router();
const db = require('../db');
const notificationService = require('../services/notificationService');

// Get processed repayments/schedule
router.get('/', async (req, res) => {
    try {
        const { rows: loans } = await db.query(`
            SELECT 
                la.*,
                p.full_name as client_name,
                g.group_name
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            LEFT JOIN groups g ON la.group_id = g.id
            WHERE la.status IN ('approved', 'disbursed')
            ORDER BY la.created_at DESC
        `);

        const { rows: payments } = await db.query(`
            SELECT loan_application_id, SUM(amount) as paid_amount
            FROM repayments
            GROUP BY loan_application_id
        `);

        const paymentMap = {};
        payments.forEach(p => {
            paymentMap[p.loan_application_id] = parseFloat(p.paid_amount);
        });

        const processed = loans.map(loan => {
            const principal = parseFloat(loan.loan_amount) || 0;
            const interest = principal * 0.30;
            const totalAmount = principal + interest;
            const paidAmount = paymentMap[loan.id] || 0;
            const balance = Math.max(0, totalAmount - paidAmount);

            const loanDurationMonths = parseInt(loan.loan_duration_months) || 4;
            // Weekly for groups, monthly for individuals
            const numberOfInstallments = loan.group_id ? (loanDurationMonths * 4) : loanDurationMonths;
            const installmentAmount = totalAmount / numberOfInstallments;

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

            return {
                ...loan,
                client_name: loan.client_name,
                group_name: loan.group_name,
                installmentAmount,
                paidAmount,
                balance,
                nextDueDate: nextDueDate.toISOString(),
                status
            };
        });

        res.json(processed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch repayments' });
    }
});

// Record a new payment
router.post('/', async (req, res) => {
    const { loan_application_id, amount, payment_date } = req.body;
    // Note: recorded_by would come from JWT middleware, using a placeholder for now
    const recorded_by = '00000000-0000-0000-0000-000000000000';

    try {
        await db.query(`
            INSERT INTO repayments (loan_application_id, amount, payment_date, recorded_by)
            VALUES ($1, $2, $3, $4)
        `, [loan_application_id, amount, payment_date, recorded_by]);

        // Send SMS Notification
        try {
            // Fetch applicant phone number
            const { rows: applicant } = await db.query(
                `SELECT p.phone_number, p.full_name, la.loan_product 
                 FROM loan_applications la
                 JOIN profiles p ON la.user_id = p.id
                 WHERE la.id = $1`,
                [loan_application_id]
            );

            if (applicant.length > 0) {
                const { phone_number, full_name, loan_product } = applicant[0];
                const message = `Hello ${full_name}, payment of UGX ${parseFloat(amount).toLocaleString()} for your ${loan_product} has been received. Thank you!`;
                await notificationService.sendSMS(phone_number, message);
            }
        } catch (notifyErr) {
            console.error('Error sending SMS notification:', notifyErr);
            // Don't fail the request if notification fails
        }

        res.json({ message: 'Repayment recorded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to record repayment' });
    }
});

// Check for overdue repayments and send notifications
router.post('/check-overdue', async (req, res) => {
    try {
        const { rows: loans } = await db.query(`
            SELECT 
                la.*,
                p.full_name as client_name,
                p.phone_number,
                p.email
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            WHERE la.status IN ('approved', 'disbursed')
        `);

        const { rows: payments } = await db.query(`
            SELECT loan_application_id, SUM(amount) as paid_amount
            FROM repayments
            GROUP BY loan_application_id
        `);

        const paymentMap = {};
        payments.forEach(p => {
            paymentMap[p.loan_application_id] = parseFloat(p.paid_amount);
        });

        const notificationsSent = [];

        for (const loan of loans) {
            const principal = parseFloat(loan.loan_amount) || 0;
            const interest = principal * 0.30;
            const totalAmount = principal + interest;
            const paidAmount = paymentMap[loan.id] || 0;
            const balance = Math.max(0, totalAmount - paidAmount);

            if (balance <= 0) continue;

            const loanDurationMonths = parseInt(loan.loan_duration_months) || 4;
            // Weekly for groups, monthly for individuals
            const numberOfInstallments = loan.group_id ? (loanDurationMonths * 4) : loanDurationMonths;
            const installmentAmount = totalAmount / numberOfInstallments;

            const approvedDate = new Date(loan.approved_at || loan.created_at);
            const now = new Date();
            const daysPassed = (now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24);
            const totalDurationDays = loanDurationMonths * 30;
            const expectedProgress = Math.min(1, Math.max(0, daysPassed / totalDurationDays));
            const expectedPaid = totalAmount * expectedProgress;

            // Logic for "Missed Repayment": Behind by more than 1.5 installments
            const isMissedRepayment = (expectedPaid - paidAmount) > (installmentAmount * 1.5);

            if (isMissedRepayment) {
                // Notify Applicant (SMS)
                if (loan.phone_number) {
                    await notificationService.sendSMS(
                        loan.phone_number,
                        `Dear ${loan.client_name}, your loan repayment is overdue. Please pay UGX ${installmentAmount.toLocaleString()} to avoid penalties.`
                    );
                }

                // Notify Loan Officer (In-app)
                // Assuming loan.user_id is the loan officer/client profile. 
                // If the system separates Loan Officer from Client, we'd need that ID. 
                // Based on previous files, 'user_id' in loan_applications seems to be the creator (Loan Officer) sometimes, 
                // or the Client profile linked to a user.
                // Re-reading LoanApplicationForm.tsx: "user_id: user.id" where user is logged in. 
                // So user_id IS the Loan Officer if the staff creates it?
                // Actually, step 267 says "user_id" is the "Loan Officer ID" in the comment.
                // So we are notifying the Loan Officer here.

                await notificationService.createNotification(
                    loan.user_id,
                    'Overdue Loan Alert',
                    `Loan for ${loan.client_name} (${loan.loan_product}) is overdue. Balance: ${balance.toLocaleString()}`,
                    'warning'
                );

                notificationsSent.push({ loan_id: loan.id, client: loan.client_name });
            }
        }

        res.json({ message: 'Overdue checks completed', notifications: notificationsSent.length, details: notificationsSent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to check overdue payments' });
    }
});

module.exports = router;
