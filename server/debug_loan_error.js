const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:Sundaylover12@localhost:5432/MandT',
});

async function debugLoan() {
    try {
        // Hardcoded failing ID
        const id = '27ba1b12-d4cf-4783-ab1d-f53b203d3839';
        console.log(`Testing with Application ID: ${id}`);

        console.log('Running route query...');
        const { rows } = await pool.query(`
            SELECT 
                la.*,
                p.full_name, p.email, p.phone_number,
                g.group_name
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            LEFT JOIN groups g ON la.group_id = g.id
            WHERE la.id = $1
        `, [id]);

        if (rows.length === 0) {
            console.error('Application not found (Join failed?)');
            // Check if it exists without join
            const raw = await pool.query('SELECT * FROM loan_applications WHERE id = $1', [id]);
            console.log('Raw application exists:', raw.rows.length > 0);
            if (raw.rows.length > 0) {
                console.log('User ID:', raw.rows[0].user_id);
                const user = await pool.query('SELECT * FROM profiles WHERE id = $1', [raw.rows[0].user_id]);
                console.log('Profile exists:', user.rows.length > 0);
            }
            return;
        }

        const loan = rows[0];
        console.log('Loan data fetched:', loan.id);

        console.log('Performing calculations...');
        const principal = parseFloat(loan.loan_amount);
        const interestRate = 0.30;
        const totalAmount = principal * (1 + interestRate);

        // Potential division by zero if duration is 0
        console.log(`Duration: ${loan.loan_duration_months}`);
        const monthlyPayment = totalAmount / loan.loan_duration_months;
        console.log(`Monthly Payment: ${monthlyPayment}`);

        const approvedDate = new Date(loan.approved_at || loan.created_at);
        const now = new Date();
        const monthsElapsed = Math.floor((now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const monthsRemaining = Math.max(0, loan.loan_duration_months - monthsElapsed);

        console.log('Fetching repayments...');
        const { rows: payments } = await pool.query('SELECT SUM(amount) as paid FROM repayments WHERE loan_application_id = $1', [id]);
        const amountPaid = parseFloat(payments[0].paid || 0);
        const remainingBalance = Math.max(0, totalAmount - amountPaid);
        const growthRate = interestRate * 100;

        console.log('Repayments fetched:', amountPaid);

        console.log('Final Result Object:', {
            ...loan,
            principal,
            total_amount: totalAmount,
            amount_paid: amountPaid,
            remaining_balance: remainingBalance,
            growth_rate: growthRate,
            months_elapsed: monthsElapsed,
            months_remaining: monthsRemaining,
            monthly_payment: monthlyPayment
        });

        console.log('SUCCESS: No errors encountered.');

    } catch (err) {
        console.error('ERROR CAUGHT:', err);
    } finally {
        await pool.end();
    }
}

debugLoan();
