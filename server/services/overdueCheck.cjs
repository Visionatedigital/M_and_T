/**
 * Overdue loan check - sends SMS to borrowers with missed repayments.
 * Used by: POST /api/repayments/check-overdue (manual) and cron (automatic).
 */
const db = require('../db.cjs');
const notificationService = require('./notificationService');

async function runOverdueCheck() {
    try {
        const { rows: loans } = await db.query(`
            SELECT 
                la.*,
                COALESCE(la.full_name, p.full_name, b.full_name) as client_name,
                COALESCE(la.phone_number, p.phone_number, b.phone_number) as phone_number,
                p.email
            FROM loan_applications la
            LEFT JOIN profiles p ON la.user_id = p.id
            LEFT JOIN borrowers b ON la.borrower_id = b.id
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
            const numberOfInstallments = loan.group_id ? (loanDurationMonths * 4) : loanDurationMonths;
            const installmentAmount = totalAmount / numberOfInstallments;

            const approvedDate = new Date(loan.approved_at || loan.created_at);
            const now = new Date();
            const daysPassed = (now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24);
            const totalDurationDays = loanDurationMonths * 30;
            const expectedProgress = Math.min(1, Math.max(0, daysPassed / totalDurationDays));
            const expectedPaid = totalAmount * expectedProgress;

            const isMissedRepayment = (expectedPaid - paidAmount) > (installmentAmount * 1.5);

            if (isMissedRepayment && loan.phone_number) {
                await notificationService.sendSMS(
                    loan.phone_number,
                    `Dear ${loan.client_name || 'Customer'}, your ${loan.loan_product || 'loan'} repayment is overdue. Balance: UGX ${balance.toLocaleString()}. Please pay UGX ${installmentAmount.toLocaleString()} to avoid penalties.`
                );
            }

            if (isMissedRepayment && loan.user_id) {
                await notificationService.createNotification(
                    loan.user_id,
                    'Overdue Loan Alert',
                    `Loan for ${loan.client_name} (${loan.loan_product}) is overdue. Balance: UGX ${balance.toLocaleString()}`,
                    'warning'
                );
            }

            if (isMissedRepayment) {
                notificationsSent.push({ loan_id: loan.id, client: loan.client_name });
            }
        }

        return { count: notificationsSent.length, details: notificationsSent };
    } catch (err) {
        console.error('Overdue check error:', err);
        throw err;
    }
}

module.exports = { runOverdueCheck };
