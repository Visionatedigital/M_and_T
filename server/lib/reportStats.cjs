/**
 * Portfolio / report statistics used by Reports UI and the staff AI assistant snapshot.
 * Kept in sync with GET /reports/stats responses.
 */
const db = require('../db.cjs');
const { isLoanOfficer } = require('./roles.cjs');
const { loanApplicationColumns } = require('./loanApplicationSchema.cjs');

/**
 * @param {import('express').Request} req authenticated request with req.user.role / user_id
 */
async function fetchReportStats(req) {
    const { role, user_id } = req.user || {};

    let loanQuery = `
            SELECT 
                COUNT(*) as total_applications,
                COUNT(*) FILTER (WHERE status IN ('approved', 'disbursed')) as approved_loans,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected_loans,
                COUNT(*) FILTER (WHERE status IN ('pending', 'under_review')) as pending_loans,
                SUM(CASE WHEN status IN ('approved', 'disbursed', 'completed') THEN loan_amount ELSE 0 END) as total_disbursed,
                (SELECT SUM(amount) FROM repayments) as total_collected
            FROM loan_applications
        `;
    let values = [];
    if (isLoanOfficer(role)) {
        loanQuery += ' WHERE borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $1)';
        values.push(user_id);
    }

    const { rows: loanRows } = await db.query(loanQuery, values);
    const loanStats = loanRows[0];

    const totalDisbursed = parseFloat(loanStats.total_disbursed || 0);
    const totalInterest = totalDisbursed * 0.30;

    let productQuery = `
            SELECT 
                loan_product as product,
                COUNT(*) as applications,
                COUNT(*) FILTER (WHERE status IN ('approved', 'disbursed')) as approved,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
                SUM(CASE WHEN status IN ('approved', 'disbursed') THEN loan_amount ELSE 0 END) as total_amount
            FROM loan_applications
        `;
    if (isLoanOfficer(role)) {
        productQuery += ' WHERE borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $1)';
    }
    productQuery += ' GROUP BY loan_product';

    const { rows: productRows } = await db.query(productQuery, values);

    let clientQuery = 'SELECT COUNT(*) as total_clients FROM borrowers';
    let clientMonthQuery = "SELECT COUNT(*) as new_clients FROM borrowers WHERE created_at >= date_trunc('month', now())";
    let clientActiveQuery = `
            SELECT COUNT(DISTINCT borrower_id) as active_clients 
            FROM loan_applications 
            WHERE status IN ('approved', 'disbursed')
        `;

    if (isLoanOfficer(role)) {
        const officerFilter = ' WHERE assigned_officer_id = $1';
        clientQuery += officerFilter;
        clientMonthQuery += ' AND assigned_officer_id = $1';
        clientActiveQuery += ' AND borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $1)';
    }

    const { rows: totalClientRows } = await db.query(clientQuery, values);
    const { rows: newClientRows } = await db.query(clientMonthQuery, values);
    const { rows: activeClientRows } = await db.query(clientActiveQuery, values);

    const totalPaid = parseFloat(loanStats.total_collected || 0);

    let statusDetailQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE status = 'disbursed') AS disbursed_count,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
                COUNT(*) FILTER (WHERE status = 'settled') AS settled_count,
                COUNT(*) FILTER (WHERE status = 'under_review') AS under_review_count,
                COALESCE(AVG(loan_duration_months) FILTER (WHERE status IN ('approved','disbursed','completed','settled')), 0)::float AS avg_duration_months
            FROM loan_applications
        `;
    if (isLoanOfficer(role)) {
        statusDetailQuery += ' WHERE borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $1)';
    }
    const { rows: statusDetailRows } = await db.query(statusDetailQuery, values);

    let outstandingQuery = `
            WITH per_loan AS (
                SELECT la.id,
                    (la.loan_amount * 1.3)::numeric AS expected_total,
                    COALESCE((SELECT SUM(r.amount) FROM repayments r WHERE r.loan_application_id = la.id), 0)::numeric AS repaid
                FROM loan_applications la
                WHERE la.status IN ('approved','disbursed','completed','settled')
                ${isLoanOfficer(role) ? 'AND la.borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $1)' : ''}
            )
            SELECT COALESCE(SUM(GREATEST(0, expected_total - repaid)), 0)::numeric AS outstanding_estimate
            FROM per_loan
        `;
    const { rows: outRows } = await db.query(outstandingQuery, values);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let rep30Query = `
            SELECT COALESCE(SUM(amount), 0)::numeric AS repaid_30d
            FROM repayments WHERE payment_date >= $1
        `;
    const rep30Vals = [thirtyDaysAgo];
    if (isLoanOfficer(role)) {
        rep30Query +=
            ' AND loan_application_id IN (SELECT id FROM loan_applications WHERE borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $2))';
        rep30Vals.push(user_id);
    }
    const { rows: rep30Rows } = await db.query(rep30Query, rep30Vals);

    const laCols = await loanApplicationColumns();
    const branchGroupExpr = laCols.has('branch_name')
        ? `COALESCE(NULLIF(TRIM(branch_name), ''), 'Unassigned')`
        : `'Unassigned'`;
    let branchQuery = `
            SELECT ${branchGroupExpr} AS branch,
                COUNT(*)::int AS applications,
                COALESCE(SUM(CASE WHEN status IN ('approved','disbursed','completed','settled') THEN loan_amount ELSE 0 END), 0)::numeric AS principal_booked
            FROM loan_applications
            ${isLoanOfficer(role) ? 'WHERE borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $1)' : ''}
            GROUP BY 1 ORDER BY principal_booked DESC NULLS LAST
        `;
    const { rows: branchRows } = await db.query(branchQuery, values);

    const categoryGroupExpr = laCols.has('loan_category')
        ? `COALESCE(NULLIF(TRIM(loan_category), ''), 'Uncategorized')`
        : laCols.has('loan_product')
          ? `COALESCE(NULLIF(TRIM(loan_product),''), 'Uncategorized')`
          : `'Uncategorized'`;
    let categoryQuery = `
            SELECT ${categoryGroupExpr} AS category,
                COUNT(*)::int AS applications,
                COALESCE(SUM(loan_amount), 0)::numeric AS total_principal
            FROM loan_applications
            ${isLoanOfficer(role) ? 'WHERE borrower_id IN (SELECT id FROM borrowers WHERE assigned_officer_id = $1)' : ''}
            GROUP BY 1 ORDER BY total_principal DESC NULLS LAST
        `;
    const { rows: categoryRows } = await db.query(categoryQuery, values);

    const sd = statusDetailRows[0] || {};
    const outstandingEstimate = parseFloat(outRows[0]?.outstanding_estimate || 0);
    const repaid30d = parseFloat(rep30Rows[0]?.repaid_30d || 0);
    const collectionEfficiencyPct =
        totalDisbursed > 0 ? Math.min(100, (totalPaid / (totalDisbursed * 1.3)) * 100) : 0;

    return {
        loanStats: {
            totalApplications: parseInt(loanStats.total_applications),
            approvedLoans: parseInt(loanStats.approved_loans),
            rejectedLoans: parseInt(loanStats.rejected_loans),
            pendingLoans: parseInt(loanStats.pending_loans),
            totalDisbursed,
            totalPaid,
            totalInterest,
            rejectionRate: loanStats.total_applications > 0 ? (loanStats.rejected_loans / loanStats.total_applications) * 100 : 0,
            approvalRate: loanStats.total_applications > 0 ? (loanStats.approved_loans / loanStats.total_applications) * 100 : 0,
            disbursedCount: parseInt(sd.disbursed_count || 0),
            completedCount: parseInt(sd.completed_count || 0),
            settledCount: parseInt(sd.settled_count || 0),
            underReviewCount: parseInt(sd.under_review_count || 0),
            avgDurationMonths: parseFloat(sd.avg_duration_months || 0),
            outstandingEstimate,
            repaymentsLast30Days: repaid30d,
            collectionEfficiencyPct,
        },
        productStats: productRows.map(r => ({
            product: r.product,
            applications: parseInt(r.applications),
            approved: parseInt(r.approved),
            rejected: parseInt(r.rejected),
            totalAmount: parseFloat(r.total_amount || 0),
        })),
        clientStats: {
            totalClients: parseInt(totalClientRows[0].total_clients),
            activeClients: parseInt(activeClientRows[0].active_clients),
            newClientsThisMonth: parseInt(newClientRows[0].new_clients),
        },
        branchStats: branchRows.map(r => ({
            branch: r.branch,
            applications: parseInt(r.applications),
            principalBooked: parseFloat(r.principal_booked || 0),
        })),
        categoryStats: categoryRows.map(r => ({
            category: r.category,
            applications: parseInt(r.applications),
            totalPrincipal: parseFloat(r.total_principal || 0),
        })),
    };
}

module.exports = { fetchReportStats };
