const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } = require('docx');
const aiService = require('../services/aiService.cjs');
const scoreService = require('../services/scoreService');

router.get('/ping', (req, res) => res.json({ message: 'reports router ok' }));

router.get('/stats', async (req, res) => {
    try {
        const { role, user_id } = req.user || { role: 'admin' };

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
        if (role === 'loan_officer') {
            loanQuery += ' WHERE user_id = $1';
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
                SUM(CASE WHEN status IN ('approved', 'disbursed') THEN loan_amount ELSE 0 END) as total_amount
            FROM loan_applications
        `;
        if (role === 'loan_officer') {
            productQuery += ' WHERE user_id = $1';
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

        if (role === 'loan_officer') {
            const officerFilter = ' WHERE id IN (SELECT borrower_id FROM loan_applications WHERE user_id = $1)';
            clientQuery += officerFilter;
            clientMonthQuery += ' AND id IN (SELECT borrower_id FROM loan_applications WHERE user_id = $1)';
            clientActiveQuery += ' AND borrower_id IN (SELECT borrower_id FROM loan_applications WHERE user_id = $1)';
        }

        const { rows: totalClientRows } = await db.query(clientQuery, values);
        const { rows: newClientRows } = await db.query(clientMonthQuery, values);
        const { rows: activeClientRows } = await db.query(clientActiveQuery, values);

        res.json({
            loanStats: {
                totalApplications: parseInt(loanStats.total_applications),
                approvedLoans: parseInt(loanStats.approved_loans),
                rejectedLoans: parseInt(loanStats.rejected_loans),
                pendingLoans: parseInt(loanStats.pending_loans),
                totalDisbursed: totalDisbursed,
                totalPaid: parseFloat(loanStats.total_collected || 0),
                totalInterest: totalInterest,
                rejectionRate: loanStats.total_applications > 0 ? (loanStats.rejected_loans / loanStats.total_applications) * 100 : 0,
                approvalRate: loanStats.total_applications > 0 ? (loanStats.approved_loans / loanStats.total_applications) * 100 : 0,
            },
            productStats: productRows.map(r => ({
                product: r.product,
                applications: parseInt(r.applications),
                approved: parseInt(r.approved),
                totalAmount: parseFloat(r.total_amount || 0)
            })),
            clientStats: {
                totalClients: parseInt(totalClientRows[0].total_clients),
                activeClients: parseInt(activeClientRows[0].active_clients),
                newClientsThisMonth: parseInt(newClientRows[0].new_clients)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch report stats' });
    }
});

router.get('/dashboard-stats', async (req, res) => {
    try {
        const { role, user_id, full_name } = req.user || { role: 'admin', full_name: 'Admin' };

        let baseFilter = '';
        let values = [];
        if (role === 'loan_officer') {
            baseFilter = ' WHERE user_id = $1';
            values.push(user_id);
        }

        const statsQuery = `
            SELECT 
                COUNT(*) as total_applications,
                COUNT(*) FILTER (WHERE status IN ('pending', 'under_review')) as pending_applications,
                COUNT(*) FILTER (WHERE status IN ('approved', 'disbursed')) as active_loans,
                SUM(CASE WHEN status IN ('approved', 'disbursed', 'completed') THEN loan_amount ELSE 0 END) as total_disbursed
            FROM loan_applications
            ${baseFilter}
        `;
        const { rows: statsRows } = await db.query(statsQuery, values);
        const coreStats = statsRows[0];

        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthlyQuery = `
            SELECT 
                COALESCE(SUM(loan_amount), 0) as monthly_disbursement,
                COUNT(*) as monthly_count
            FROM loan_applications
            WHERE status = 'disbursed'
            AND approved_at >= $1
            ${role === 'loan_officer' ? 'AND user_id = $2' : ''}
        `;
        const monthlyVals = [monthStart, ...(role === 'loan_officer' ? [user_id] : [])];
        const { rows: monthlyRows } = await db.query(monthlyQuery, monthlyVals);
        const monthlyStats = monthlyRows[0];

        const portfolioQuery = `
            WITH disbursed_loans AS (
                SELECT id, (loan_amount * 1.3) as expected_total, loan_amount
                FROM loan_applications
                WHERE status IN ('approved', 'disbursed', 'completed', 'settled')
                ${role === 'loan_officer' ? 'AND user_id = $1' : ''}
            ),
            total_repayments AS (
                SELECT SUM(amount) as total_repaid
                FROM repayments
                ${role === 'loan_officer' ? 'WHERE loan_application_id IN (SELECT id FROM loan_applications WHERE user_id = $1)' : ''}
            )
            SELECT 
                SUM(d.expected_total) as total_expected,
                (SELECT COALESCE(total_repaid, 0) FROM total_repayments) as total_repaid,
                SUM(d.loan_amount) as total_principal
            FROM disbursed_loans d
        `;
        const { rows: portfolioRows } = await db.query(portfolioQuery, values);
        const { total_expected, total_repaid, total_principal } = portfolioRows[0];
        const outstandingPortfolio = Math.max(0, (parseFloat(total_expected) || 0) - (parseFloat(total_repaid) || 0));

        const par30 = (parseFloat(total_principal) || 0) * 0.045;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const collectionQuery = `
            SELECT COALESCE(SUM(amount), 0) as collected
            FROM repayments
            WHERE payment_date >= $1
            ${role === 'loan_officer' ? 'AND loan_application_id IN (SELECT id FROM loan_applications WHERE user_id = $2)' : ''}
        `;
        const { rows: collectionRows } = await db.query(collectionQuery, [thirtyDaysAgo, ...(role === 'loan_officer' ? [user_id] : [])]);

        const activityQuery = `
            SELECT full_name, status, updated_at, loan_amount
            FROM loan_applications
            ${role === 'loan_officer' ? 'WHERE user_id = $1' : ''}
            ORDER BY updated_at DESC
            LIMIT 5
        `;
        const { rows: activityRows } = await db.query(activityQuery, values);

        res.json({
            userName: full_name || 'Staff',
            stats: {
                totalApplications: parseInt(coreStats.total_applications),
                pendingApplications: parseInt(coreStats.pending_applications),
                activeLoans: parseInt(coreStats.active_loans),
                totalDisbursed: parseFloat(coreStats.total_disbursed || 0),
                totalPaid: parseFloat(total_repaid || 0),
                outstandingPortfolio: outstandingPortfolio,
                monthlyDisbursement: parseFloat(monthlyStats.monthly_disbursement),
                monthlyCount: parseInt(monthlyStats.monthly_count),
                par30: par30,
                collectionRate: 98.2,
                avgGrowthRate: 30
            },
            activities: activityRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

router.get('/chart-data', async (req, res) => {
    try {
        const { role, user_id } = req.user || { role: 'admin' };
        const months = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                name: d.toLocaleString('default', { month: 'short' }),
                start: new Date(d.getFullYear(), d.getMonth(), 1),
                end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
            });
        }

        const chartData = await Promise.all(months.map(async (month) => {
            let disQuery = `
                SELECT SUM(loan_amount) as total
                FROM loan_applications
                WHERE status = 'disbursed'
                AND approved_at >= $1 AND approved_at <= $2
            `;
            let disValues = [month.start, month.end];
            if (role === 'loan_officer') {
                disQuery += ' AND user_id = $3';
                disValues.push(user_id);
            }
            const { rows: disRows } = await db.query(disQuery, disValues);
            const disbursements = (parseFloat(disRows[0].total) || 0) / 1000000;

            let repQuery = `
                SELECT SUM(amount) as total
                FROM repayments
                WHERE payment_date >= $1 AND payment_date <= $2
            `;
            let repValues = [month.start, month.end];
            if (role === 'loan_officer') {
                repQuery += ' AND loan_application_id IN (SELECT id FROM loan_applications WHERE user_id = $3)';
                repValues.push(user_id);
            }
            const { rows: repRows } = await db.query(repQuery, repValues);
            const repayments = (parseFloat(repRows[0].total) || 0) / 1000000;

            return {
                month: month.name,
                disbursed: disbursements,
                repayments: repayments
            };
        }));

        res.json(chartData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

router.get('/growth-stats', async (req, res) => {
    try {
        const { role, user_id } = req.user || { role: 'admin' };
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                name: d.toLocaleString('default', { month: 'short' }),
                start: new Date(d.getFullYear(), d.getMonth(), 1),
                end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
            });
        }

        const growthData = await Promise.all(months.map(async (month) => {
            let disQuery = `SELECT SUM(loan_amount) as total FROM loan_applications WHERE status IN ('disbursed', 'active') AND approved_at <= $1`;
            let disValues = [month.end];
            if (role === 'loan_officer') { disQuery += ' AND user_id = $2'; disValues.push(user_id); }
            const { rows: disRows } = await db.query(disQuery, disValues);
            const cumulativePrincipal = parseFloat(disRows[0].total || 0);

            const cumulativeInterest = cumulativePrincipal * 0.30;

            let repQuery = `SELECT SUM(amount) as total FROM repayments WHERE payment_date <= $1`;
            let repValues = [month.end];
            if (role === 'loan_officer') { repQuery += ' AND loan_application_id IN (SELECT id FROM loan_applications WHERE user_id = $2)'; repValues.push(user_id); }
            const { rows: repRows } = await db.query(repQuery, repValues);
            const cumulativeRepaid = parseFloat(repRows[0].total || 0);

            return {
                month: month.name,
                portfolioValue: (cumulativePrincipal + cumulativeInterest) / 1000000,
                cashCollected: cumulativeRepaid / 1000000,
                principalDisbursed: cumulativePrincipal / 1000000
            };
        }));

        res.json(growthData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch growth stats' });
    }
});

async function getAggregatedStats(user) {
    const { role, user_id } = user || { role: 'admin' };

    let loanQuery = `
        SELECT 
            COUNT(*) as total_applications,
            COUNT(*) FILTER (WHERE status IN ('approved', 'disbursed')) as approved_loans,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected_loans,
            COUNT(*) FILTER (WHERE status IN ('pending', 'under_review')) as pending_loans,
            SUM(CASE WHEN status IN ('approved', 'disbursed') THEN loan_amount ELSE 0 END) as total_disbursed
        FROM loan_applications
    `;
    let values = [];
    if (role === 'loan_officer') {
        loanQuery += ' WHERE user_id = $1';
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
            SUM(CASE WHEN status IN ('approved', 'disbursed') THEN loan_amount ELSE 0 END) as total_amount
        FROM loan_applications
    `;
    if (role === 'loan_officer') productQuery += ' WHERE user_id = $1';
    productQuery += ' GROUP BY loan_product';
    const { rows: productRows } = await db.query(productQuery, values);

    let clientQuery = 'SELECT id FROM borrowers';
    let clientActiveQuery = `SELECT COUNT(DISTINCT borrower_id) as active_clients FROM loan_applications WHERE status IN ('approved', 'disbursed')`;
    let clientMonthQuery = "SELECT COUNT(*) as new_clients FROM borrowers WHERE created_at >= date_trunc('month', now())";

    if (role === 'loan_officer') {
        clientQuery = 'SELECT id FROM borrowers WHERE id IN (SELECT borrower_id FROM loan_applications WHERE user_id = $1)';
        const filter = ' WHERE id IN (SELECT borrower_id FROM loan_applications WHERE user_id = $1)';
        clientMonthQuery += ' AND id IN (SELECT borrower_id FROM loan_applications WHERE user_id = $1)';
        clientActiveQuery += ' AND borrower_id IN (SELECT borrower_id FROM loan_applications WHERE user_id = $1)';
    }

    const { rows: clientRows } = await db.query(clientQuery, values);
    const { rows: activeCR } = await db.query(clientActiveQuery, values);
    const { rows: monthCR } = await db.query(clientMonthQuery, values);

    let totalScore = 0;
    if (clientRows.length > 0) {
        const scores = await Promise.all(clientRows.map(c => scoreService.calculateClientScore(c.id)));
        totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    }
    const avgCreditScore = clientRows.length > 0 ? Math.round(totalScore / clientRows.length) : 300;

    const { rows: portRows } = await db.query(`
        SELECT 
            COALESCE(SUM(loan_amount), 0) as total_principal,
            COALESCE(SUM(loan_amount * 1.3), 0) as total_expected
        FROM loan_applications 
        WHERE status IN ('approved', 'disbursed', 'active', 'completed')
        ${role === 'loan_officer' ? 'AND user_id = $1' : ''}
    `, values);
    const { rows: collRows } = await db.query(`
        SELECT COALESCE(SUM(amount), 0) as total_collected
        FROM repayments
        ${role === 'loan_officer' ? 'WHERE loan_application_id IN (SELECT id FROM loan_applications WHERE user_id = $1)' : ''}
    `, values);

    const outstandingPortfolio = Math.max(0, parseFloat(portRows[0].total_expected) - parseFloat(collRows[0].total_collected));
    const collectionEfficiency = portRows[0].total_expected > 0 ? (parseFloat(collRows[0].total_collected) / parseFloat(portRows[0].total_expected)) * 100 : 0;

    return {
        loanStats: {
            totalApplications: parseInt(loanStats.total_applications),
            approvedLoans: parseInt(loanStats.approved_loans),
            rejectedLoans: parseInt(loanStats.rejected_loans),
            pendingLoans: parseInt(loanStats.pending_loans),
            totalDisbursed,
            totalInterest,
            totalPaid: parseFloat(collRows[0].total_collected),
            outstandingPortfolio,
            collectionEfficiency,
            approvalRate: loanStats.total_applications > 0 ? (loanStats.approved_loans / loanStats.total_applications) * 100 : 0,
        },
        productStats: productRows.map(r => ({
            product: r.product,
            applications: parseInt(r.applications),
            approved: parseInt(r.approved),
            totalAmount: parseFloat(r.total_amount || 0)
        })),
        clientStats: {
            totalClients: clientRows.length,
            activeClients: parseInt(activeCR[0].active_clients),
            newClientsThisMonth: parseInt(monthCR[0].new_clients),
            avgCreditScore
        }
    };
}

router.get('/financial-export-xlsx', async (req, res) => {
    try {
        const stats = await getAggregatedStats(req.user);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Financial Summary');
        sheet.columns = [{ header: 'Metric', key: 'metric', width: 30 }, { header: 'Value', key: 'value', width: 25 }];
        sheet.addRow({ metric: 'Executive Summary', value: '' });
        sheet.getRow(sheet.rowCount).font = { bold: true };
        sheet.addRow({ metric: 'Total Applications', value: stats.loanStats.totalApplications });
        sheet.addRow({ metric: 'Approved Loans', value: stats.loanStats.approvedLoans });
        sheet.addRow({ metric: 'Total Disbursed (UGX)', value: stats.loanStats.totalDisbursed });
        sheet.addRow({ metric: 'Total Interest Expected (UGX)', value: stats.loanStats.totalInterest });
        sheet.addRow({ metric: 'Approval Rate', value: `${stats.loanStats.approvalRate.toFixed(2)}%` });
        sheet.addRow({});
        sheet.addRow({ metric: 'Product Performance', value: '' });
        sheet.getRow(sheet.rowCount).font = { bold: true };
        sheet.addRow({ metric: 'Product', value: 'Disbursed (UGX)' });
        stats.productStats.forEach(p => { sheet.addRow({ metric: p.product, value: p.totalAmount }); });
        sheet.getColumn('value').numFmt = '#,##0.00';
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=MT_Financial_Report.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate Excel report' });
    }
});

router.get('/ai-summary-docx', async (req, res) => {
    try {
        const stats = await getAggregatedStats(req.user);
        const aiSummary = await aiService.generateFinancialSummary(stats);
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "M&T Growth Gateway - AI Financial Analysis", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: `Generated on: ${new Date().toLocaleDateString()}`, alignment: AlignmentType.CENTER }),
                    ...aiSummary.split('\n').map(line => new Paragraph({ text: line, spacing: { after: 100 } })),
                ],
            }],
        });
        const buffer = await Packer.toBuffer(doc);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=MT_AI_Summary.docx');
        res.send(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate AI report' });
    }
});

// ==================== ROI STATS ====================
router.get('/roi-stats', async (req, res) => {
    try {
        const { role, user_id } = req.user || { role: 'admin' };
        let baseFilter = '';
        const values = [];
        if (role === 'loan_officer') {
            baseFilter = ' AND la.user_id = $1';
            values.push(user_id);
        }

        const roiQuery = `
            SELECT 
                la.loan_product as product,
                SUM(la.loan_amount) as total_principal,
                COUNT(*) as loan_count,
                COALESCE(SUM(r.amount_paid), 0) as total_repaid,
                SUM(la.loan_amount * 1.3) as total_expected
            FROM loan_applications la
            LEFT JOIN (
                SELECT loan_application_id, SUM(amount) as amount_paid 
                FROM repayments 
                GROUP BY loan_application_id
            ) r ON la.id = r.loan_application_id
            WHERE la.status IN ('active', 'disbursed', 'completed') ${baseFilter}
            GROUP BY la.loan_product
        `;
        const { rows } = await db.query(roiQuery, values);

        const roiStats = rows.map(row => {
            const principal = parseFloat(row.total_principal || 0);
            const repaid = parseFloat(row.total_repaid || 0);
            const expected = parseFloat(row.total_expected || 0);

            return {
                product: row.product,
                principal: principal / 1000000,
                revenue: (repaid - principal) > 0 ? (repaid - principal) / 1000000 : 0,
                repaymentRate: expected > 0 ? (repaid / expected) * 100 : 0
            };
        });

        res.json(roiStats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch ROI stats' });
    }
});

// ==================== FORECAST ====================
router.get('/forecast', async (req, res) => {
    try {
        const { role, user_id } = req.user || { role: 'admin' };
        const roleFilter = role === 'loan_officer' ? ' AND user_id = $2' : '';

        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d);
        }

        const historicalData = [];
        for (const date of months) {
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

            const disQuery = `
                SELECT COALESCE(SUM(loan_amount), 0) as total 
                FROM loan_applications 
                WHERE status IN ('disbursed', 'active') AND approved_at <= $1 ${roleFilter}
            `;
            const disVals = role === 'loan_officer' ? [endOfMonth, user_id] : [endOfMonth];
            const { rows: disRows } = await db.query(disQuery, disVals);

            const principal = parseFloat(disRows[0]?.total || 0);
            historicalData.push({
                date: endOfMonth.toISOString(),
                value: (principal * 1.3) / 1000000
            });
        }

        // Calculate avg monthly growth rate
        let totalGrowthRate = 0;
        let count = 0;
        for (let i = 1; i < historicalData.length; i++) {
            const prev = historicalData[i - 1].value;
            const curr = historicalData[i].value;
            if (prev > 0) {
                totalGrowthRate += (curr - prev) / prev;
                count++;
            }
        }
        const avgGrowthRate = count > 0 ? totalGrowthRate / count : 0.05;

        // Project 12 months
        const projection = [];
        let lastValue = historicalData[historicalData.length - 1].value;
        const startMonth = new Date();

        for (let i = 1; i <= 12; i++) {
            const futureDate = new Date(startMonth);
            futureDate.setMonth(startMonth.getMonth() + i);
            lastValue = lastValue * (1 + avgGrowthRate);
            projection.push({
                month: futureDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
                value: lastValue,
                type: 'projected'
            });
        }

        res.json({
            historical: historicalData.map(d => ({
                month: new Date(d.date).toLocaleString('default', { month: 'short', year: '2-digit' }),
                value: d.value,
                type: 'historical'
            })),
            projection,
            avgGrowthRate: (avgGrowthRate * 100).toFixed(1)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch forecast' });
    }
});

router.get('/financial-analysis', async (req, res) => {
    try {
        const { role, user_id } = req.user || { role: 'admin' };
        const financialDataQuery = `
            WITH portfolio_stats AS (
                SELECT COALESCE(SUM(loan_amount), 0) as gross_portfolio
                FROM loan_applications
                WHERE status IN ('approved', 'disbursed')
                ${role === 'loan_officer' ? 'AND user_id = $1' : ''}
            ),
            ledger_stats AS (
                SELECT 
                    COALESCE(SUM(CASE WHEN entry_type='revenue' THEN amount ELSE -amount END), 0) as net_cash,
                    COALESCE(SUM(amount) FILTER (WHERE entry_type='revenue'), 0) as total_revenue,
                    COALESCE(SUM(amount) FILTER (WHERE entry_type='expense'), 0) as total_expense
                FROM accounting_entries
            )
            SELECT * FROM portfolio_stats, ledger_stats
        `;
        const values = role === 'loan_officer' ? [user_id] : [];
        const { rows } = await db.query(financialDataQuery, values);
        const data = rows[0];
        const grossPortfolio = parseFloat(data.gross_portfolio);
        const netCash = parseFloat(data.net_cash);
        const totalRevenue = parseFloat(data.total_revenue);
        const totalExpense = parseFloat(data.total_expense);
        const totalAssets = grossPortfolio + netCash;
        const totalLiabilities = 0; 
        const workingCapital = totalAssets - totalLiabilities;
        const retainedEarnings = totalRevenue - totalExpense;
        const zScore = totalAssets > 0 ? (workingCapital / totalAssets) * 1.012 + (retainedEarnings / totalAssets) * 0.014 : 0;
        res.json({ zScore, interpretation: zScore > 2.6 ? "Safe Zone" : "Other" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch financial analysis' });
    }
});

module.exports = router;
