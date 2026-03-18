const db = require('../db.cjs');

/**
 * Calculate Credit Score for a Client (300 - 850)
 * @param {string} clientId - The ID of the client (profile)
 * @returns {Promise<Object>} - The score and breakdown
 */
const calculateClientScore = async (clientId) => {
    try {
        // Fetch Client Profile (for longevity)
        const { rows: profileRows } = await db.query('SELECT created_at FROM profiles WHERE id = $1', [clientId]);
        if (profileRows.length === 0) return { score: 300, breakdown: {} };
        const profile = profileRows[0];

        // Fetch Loan History
        const { rows: loans } = await db.query(`
            SELECT id, status, loan_amount, approved_at, loan_duration_months
            FROM loan_applications 
            WHERE user_id = $1 AND status != 'pending'
        `, [clientId]);

        // Fetch Repayments
        const { rows: repayments } = await db.query(`
            SELECT loan_application_id, SUM(amount) as total_paid
            FROM repayments
            WHERE loan_application_id IN (SELECT id FROM loan_applications WHERE user_id = $1)
            GROUP BY loan_application_id
        `, [clientId]);

        const repaymentMap = {};
        repayments.forEach(r => repaymentMap[r.loan_application_id] = parseFloat(r.total_paid || 0));

        let score = 300; // Base Score
        const breakdown = {
            base: 300,
            history: 0,
            performance: 0,
            longevity: 0
        };

        // 1. Longevity (+2 points per month)
        const joinDate = new Date(profile.created_at);
        const now = new Date();
        const monthsSinceJoin = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24 * 30));
        const longevityPoints = Math.min(100, monthsSinceJoin * 2); // Cap at 100
        score += longevityPoints;
        breakdown.longevity = longevityPoints;

        // 2. Loan History
        loans.forEach(loan => {
            if (loan.status === 'fully_paid') {
                score += 50;
                breakdown.history += 50;
            } else if (loan.status === 'rejected') {
                score -= 10;
                breakdown.history -= 10;
            }
        });

        // 3. Repayment Performance (Active & Past approved loans)
        let totalExpectedAll = 0;
        let totalPaidAll = 0;

        loans.forEach(loan => {
            if (['approved', 'disbursed', 'fully_paid'].includes(loan.status)) {
                const principal = parseFloat(loan.loan_amount);
                const interest = principal * 0.30;
                const totalDue = principal + interest;
                const paid = repaymentMap[loan.id] || 0;

                totalExpectedAll += totalDue;
                totalPaidAll += paid;

                // Check for missed payments (simple logic: current progress)
                if (loan.status === 'disbursed') {
                    const approvedDate = new Date(loan.approved_at);
                    const monthsElapsed = Math.max(1, Math.floor((now - approvedDate) / (1000 * 60 * 60 * 24 * 30)));
                    const monthlyDue = totalDue / loan.loan_duration_months;
                    const expectedToDate = monthlyDue * monthsElapsed;

                    if (paid >= expectedToDate) {
                        score += 10; // Good standing bonus per active loan
                        breakdown.performance += 10;
                    } else if (paid < (expectedToDate * 0.8)) {
                        score -= 20; // Falling behind penalty
                        breakdown.performance -= 20;
                    }
                }
            }
        });

        // Overall Repayment Ratio Bonus
        if (totalExpectedAll > 0) {
            const ratio = totalPaidAll / totalExpectedAll;
            if (ratio >= 1.0) {
                score += 50; // Perfect completion record
                breakdown.performance += 50;
            } else if (ratio > 0.9) {
                score += 20;
                breakdown.performance += 20;
            }
        }

        // Clamp Score
        score = Math.max(300, Math.min(850, Math.round(score)));

        return { score, breakdown };

    } catch (error) {
        console.error('Error calculating score:', error);
        return { score: 300, error: 'Calculation Failed' };
    }
};

module.exports = { calculateClientScore };
