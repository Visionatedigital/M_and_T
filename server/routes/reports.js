const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const aiService = require('../services/aiService');

// Get report stats
router.get('/ping', (req, res) => res.json({ message: 'reports router ok' }));

router.get('/stats', async (req, res) => {
    try {
        const { role, user_id } = req.user; // Assumes auth middleware populates req.user

        // 1. Loan Statistics
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

        // Calculate interest (30% flat)
        const totalDisbursed = parseFloat(loanStats.total_disbursed || 0);
        const totalInterest = totalDisbursed * 0.30;

        // 2. Product Statistics
        let productQuery = `
            SELECT 
                loan_product as product,
                COUNT(*) as applications,
                COUNT(*) FILTER (WHERE status IN ('approved', 'disbursed')) as approved,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
                SUM(CASE WHEN status IN ('approved', 'disbursed') THEN loan_amount ELSE 0 END) as total_amount
            FROM loan_applications
        `;
        if (role === 'loan_officer') {
            productQuery += ' WHERE user_id = $1';
        }
        productQuery += ' GROUP BY loan_product';

        const { rows: productRows } = await db.query(productQuery, values);

        // 3. Client Statistics
        // If loan officer, only clients they have applications for
        let clientQuery = 'SELECT COUNT(*) as total_clients FROM profiles';
        let clientMonthQuery = "SELECT COUNT(*) as new_clients FROM profiles WHERE created_at >= date_trunc('month', now())";
        let clientActiveQuery = `
            SELECT COUNT(DISTINCT user_id) as active_clients 
            FROM loan_applications 
            WHERE status IN ('approved', 'disbursed')
        `;

        if (role === 'loan_officer') {
            const officerFilter = ' WHERE id IN (SELECT user_id FROM loan_applications WHERE user_id = $1)';
            clientQuery += officerFilter;
            clientMonthQuery += ' AND id IN (SELECT user_id FROM loan_applications WHERE user_id = $1)';
            clientActiveQuery += ' AND user_id IN (SELECT user_id FROM loan_applications WHERE user_id = $1)'; // wait, user_id in loan_applications is the client
            // Actually, in loan_applications, user_id IS the applicant. 
            // So if role is officer, they can only see clients they processed.
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
                totalInterest: totalInterest,
                rejectionRate: loanStats.total_applications > 0 ? (loanStats.rejected_loans / loanStats.total_applications) * 100 : 0,
                approvalRate: loanStats.total_applications > 0 ? (loanStats.approved_loans / loanStats.total_applications) * 100 : 0,
            },
            productStats: productRows.map(r => ({
                product: r.product,
                applications: parseInt(r.applications),
                approved: parseInt(r.approved),
                rejected: parseInt(r.rejected),
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

// Get dashboard stats
router.get('/dashboard-stats', async (req, res) => {
    try {
        const { role, user_id } = req.user;

        // Base filter for loan officer
        let filter = '';
        let values = [];
        if (role === 'loan_officer') {
            filter = ' WHERE user_id = $1';
            values.push(user_id);
        }

        // 1. Core Metrics
        const statsQuery = `
            SELECT 
                COUNT(*) as total_applications,
                COUNT(*) FILTER (WHERE status IN ('pending', 'under_review')) as pending_applications,
                COUNT(DISTINCT user_id) FILTER (WHERE status IN ('approved', 'disbursed')) as active_clients,
                SUM(CASE WHEN status = 'disbursed' THEN loan_amount ELSE 0 END) as total_disbursed
            FROM loan_applications
            ${filter}
        `;
        const { rows: statsRows } = await db.query(statsQuery, values);
        const stats = statsRows[0];

        // 2. Outstanding Portfolio
        // Principal + 30% Interest - Repayments
        const portfolioQuery = `
            WITH disbursed_loans AS (
                SELECT id, (loan_amount * 1.3) as expected_total
                FROM loan_applications
                WHERE status = 'disbursed'
                ${role === 'loan_officer' ? 'AND user_id = $1' : ''}
            ),
            total_repayments AS (
                SELECT loan_application_id, SUM(amount) as total_repaid
                FROM repayments
                WHERE loan_application_id IN (SELECT id FROM disbursed_loans)
                GROUP BY loan_application_id
            )
            SELECT 
                SUM(d.expected_total) as total_expected,
                SUM(COALESCE(r.total_repaid, 0)) as total_repaid
            FROM disbursed_loans d
            LEFT JOIN total_repayments r ON d.id = r.loan_application_id
        `;
        const { rows: portfolioRows } = await db.query(portfolioQuery, values);
        const { total_expected, total_repaid } = portfolioRows[0];
        const outstandingPortfolio = Math.max(0, (total_expected || 0) - (total_repaid || 0));

        // 3. Recent Activity (Loan Status Updates)
        const activityQuery = `
            SELECT full_name, status, updated_at
            FROM loan_applications
            ${filter}
            ORDER BY updated_at DESC
            LIMIT 5
        `;
        const { rows: activityRows } = await db.query(activityQuery, values);

        res.json({
            userName: req.user.full_name || 'Staff',
            stats: {
                totalApplications: parseInt(stats.total_applications),
                pendingApplications: parseInt(stats.pending_applications),
                activeClients: parseInt(stats.active_clients),
                totalDisbursed: parseFloat(stats.total_disbursed || 0),
                outstandingPortfolio: outstandingPortfolio
            },
            activities: activityRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Get 7-month chart data
router.get('/chart-data', async (req, res) => {
    try {
        const { role, user_id } = req.user;
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
            // 1. Disbursements
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

            // 2. Repayments
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

// Get Growth Stats (Money Multiplier)
router.get('/growth-stats', async (req, res) => {
    try {
        const { role, user_id } = req.user;

        // We want a 12-month trailing view or All Time?
        // Let's do 12 months for the chart
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                name: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                start: new Date(d.getFullYear(), d.getMonth(), 1),
                end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
            });
        }

        // 1. Calculate Cumulative Stats up to start of period? 
        // Or just monthly activity?
        // "Money Growth" implies Cumulative Value.
        // Value = (Total Disbursed + Total Interest) - (Written Off)
        // Check "Reinvestment": Cash Collected vs Cash Disbursed

        const growthData = await Promise.all(months.map(async (month) => {
            // Disbursed in this month
            let disQuery = `SELECT SUM(loan_amount) as total FROM loan_applications WHERE status IN ('disbursed', 'active') AND approved_at <= $1`;
            let disValues = [month.end];
            if (role === 'loan_officer') { disQuery += ' AND user_id = $2'; disValues.push(user_id); }
            const { rows: disRows } = await db.query(disQuery, disValues);
            const cumulativePrincipal = parseFloat(disRows[0].total || 0);

            // Interest (30% flat on disbursed)
            const cumulativeInterest = cumulativePrincipal * 0.30;

            // Repayments in this month
            let repQuery = `SELECT SUM(amount) as total FROM repayments WHERE payment_date <= $1`;
            let repValues = [month.end];
            if (role === 'loan_officer') { repQuery += ' AND loan_application_id IN (SELECT id FROM loan_applications WHERE user_id = $2)'; repValues.push(user_id); }
            const { rows: repRows } = await db.query(repQuery, repValues);
            const cumulativeRepaid = parseFloat(repRows[0].total || 0);

            // Portfolio Value = (Principal + Interest)
            // But if we want to show "Growth", we might want to show Net Value?
            // Let's show:
            // 1. Total Portfolio Value (The "Asset" size)
            // 2. Cash Collected (The "Liquid" part)

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

// Helper to get all stats for exports
async function getAggregatedStats(user) {
    const { role, user_id } = user;

    // ... (keep existing loan stats query)
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

    // ... (keep existing product stats query)
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

    // 3. Client Statistics & Average Credit Score
    let clientQuery = 'SELECT id FROM profiles'; // Need IDs to calc score
    // ... (rest of queries)
    let clientActiveQuery = `SELECT COUNT(DISTINCT user_id) as active_clients FROM loan_applications WHERE status IN ('approved', 'disbursed')`;
    let clientMonthQuery = "SELECT COUNT(*) as new_clients FROM profiles WHERE created_at >= date_trunc('month', now())";

    if (role === 'loan_officer') {
        clientQuery = 'SELECT id FROM profiles WHERE id IN (SELECT user_id FROM loan_applications WHERE user_id = $1)';
        // Note: The original query was COUNT(*), now we need IDs to calculate average score
        // Use a separate count query if performance is bad, but for <1000 clients it's fine.

        const filter = ' WHERE id IN (SELECT user_id FROM loan_applications WHERE user_id = $1)';
        clientMonthQuery += ' AND id IN (SELECT user_id FROM loan_applications WHERE user_id = $1)';
        clientActiveQuery += ' AND user_id IN (SELECT user_id FROM loan_applications WHERE user_id = $1)';
    }

    const { rows: clientRows } = await db.query(clientQuery, values);
    const { rows: activeCR } = await db.query(clientActiveQuery, values);
    const { rows: monthCR } = await db.query(clientMonthQuery, values);

    // Calculate Average Credit Score
    let totalScore = 0;
    // Limit to first 50 for performance if list is huge, or just all
    // For exports, we want accuracy. 
    // We can use Promise.all
    if (clientRows.length > 0) {
        const scores = await Promise.all(clientRows.map(c => require('../services/scoreService').calculateClientScore(c.id)));
        totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    }
    const avgCreditScore = clientRows.length > 0 ? Math.round(totalScore / clientRows.length) : 300;

    return {
        loanStats: {
            totalApplications: parseInt(loanStats.total_applications),
            approvedLoans: parseInt(loanStats.approved_loans),
            rejectedLoans: parseInt(loanStats.rejected_loans),
            pendingLoans: parseInt(loanStats.pending_loans),
            totalDisbursed,
            totalInterest,
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

// Full Financial Export (Excel)
router.get('/financial-export-xlsx', async (req, res) => {
    try {
        const stats = await getAggregatedStats(req.user);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Financial Summary');

        sheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 25 }
        ];

        // Add core metrics
        sheet.addRow({ metric: 'Executive Summary', value: '' });
        sheet.getRow(sheet.rowCount).font = { bold: true };
        sheet.addRow({ metric: 'Total Applications', value: stats.loanStats.totalApplications });
        sheet.addRow({ metric: 'Approved Loans', value: stats.loanStats.approvedLoans });
        sheet.addRow({ metric: 'Total Disbursed (UGX)', value: stats.loanStats.totalDisbursed });
        sheet.addRow({ metric: 'Total Interest Expected (UGX)', value: stats.loanStats.totalInterest });
        sheet.addRow({ metric: 'Approval Rate', value: `${stats.loanStats.approvalRate.toFixed(2)}%` });
        sheet.addRow({});

        // Add Product stats
        sheet.addRow({ metric: 'Product Performance', value: '' });
        sheet.getRow(sheet.rowCount).font = { bold: true };
        sheet.addRow({ metric: 'Product', value: 'Disbursed (UGX)' });
        stats.productStats.forEach(p => {
            sheet.addRow({ metric: p.product, value: p.totalAmount });
        });
        sheet.addRow({});

        // Add Client stats
        sheet.addRow({ metric: 'Client Metrics', value: '' });
        sheet.getRow(sheet.rowCount).font = { bold: true };
        sheet.addRow({ metric: 'Total Clients', value: stats.clientStats.totalClients });
        sheet.addRow({ metric: 'Active Clients', value: stats.clientStats.activeClients });
        sheet.addRow({ metric: 'New Clients This Month', value: stats.clientStats.newClientsThisMonth });

        // Formatting
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

// AI Financial Summary (Word)
router.get('/ai-summary-docx', async (req, res) => {
    try {
        const stats = await getAggregatedStats(req.user);
        const aiSummary = await aiService.generateFinancialSummary(stats);

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "M&T Growth Gateway - AI Financial Analysis",
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `Generated on: ${new Date().toLocaleDateString()}`,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({ text: "", spacing: { after: 400 } }),
                    ...aiSummary.split('\n').map(line => {
                        if (line.match(/^\d\./) || line.includes(':')) {
                            return new Paragraph({
                                children: [new TextRun({ text: line, bold: true })],
                                spacing: { before: 200, after: 100 }
                            });
                        }
                        return new Paragraph({
                            text: line,
                            spacing: { after: 100 }
                        });
                    }),
                    new Paragraph({ text: "", spacing: { before: 400 } }),
                    new Paragraph({
                        children: [new TextRun({ text: "Disclaimer: This summary is generated by AI based on branch performance data.", italic: true, size: 18 })],
                    }),
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

// Get ROI Stats (Product Performance)
router.get('/roi-stats', async (req, res) => {
    try {
        const { role, user_id } = req.user;

        let query = `
            SELECT 
                loan_product,
                SUM(loan_amount) as total_principal,
                COUNT(*) as loan_count,
                SUM(amount_paid) as total_repaid,
                SUM(loan_amount * 1.3) as total_expected
            FROM loan_applications
            LEFT JOIN (
                SELECT loan_application_id, SUM(amount) as amount_paid 
                FROM repayments 
                GROUP BY loan_application_id
            ) r ON loan_applications.id = r.loan_application_id
            WHERE status IN ('active', 'disbursed', 'completed')
        `;

        const values = [];
        if (role === 'loan_officer') {
            query += ' AND user_id = $1';
            values.push(user_id);
        }

        query += ' GROUP BY loan_product';

        const { rows } = await db.query(query, values);

        const roiStats = rows.map(row => {
            const principal = parseFloat(row.total_principal || 0);
            const repaid = parseFloat(row.total_repaid || 0);
            const expected = parseFloat(row.total_expected || 0);

            // ROI = (Net Profit / Cost of Investment) * 100
            // Net Profit (Realized so far) = Repaid - Principal? 
            // Or Expected ROI? 
            // Let's do "projected_yield" = 30% flat.
            // Let's do "efficiency" = (Repaid / Expected) * 100

            return {
                product: row.loan_product,
                principal: principal / 1000000, // In Millions
                revenue: (repaid - principal) > 0 ? (repaid - principal) / 1000000 : 0, // Realized Profit
                repaymentRate: expected > 0 ? (repaid / expected) * 100 : 0
            };
        });

        res.json(roiStats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch ROI stats' });
    }
});

// Get Forecast (12-month Projection)
router.get('/forecast', async (req, res) => {
    try {
        const { role, user_id } = req.user;

        // 1. Get historical monthly growth (last 6 months)
        // We'll look at "Total Portfolio Value" snapshot at end of each month
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d);
        }

        const historicalData = await Promise.all(months.map(async (date) => {
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

            let query = `
                SELECT SUM(loan_amount) as total 
                FROM loan_applications 
                WHERE status IN ('disbursed', 'active') 
                AND approved_at <= $1
            `;
            const values = [endOfMonth];
            if (role === 'loan_officer') {
                query += ' AND user_id = $2';
                values.push(user_id);
            }

            const { rows } = await db.query(query, values);
            const principal = parseFloat(rows[0].total || 0);
            return {
                date: endOfMonth,
                value: (principal * 1.3) / 1000000 // Portfolio Value (Principal + Interest)
            };
        }));

        // Calculate Avg Monthly Growth Rate (CAGR or simple avg)
        // Simple: (Last Value - First Value) / First Value / Months?
        // Let's use avg month-over-month growth
        let totalGrowthRate = 0;
        let count = 0;

        for (let i = 1; i < historicalData.length; i++) {
            const prev = historicalData[i - 1].value;
            const curr = historicalData[i].value;
            if (prev > 0) {
                const rate = (curr - prev) / prev;
                totalGrowthRate += rate;
                count++;
            }
        }

        const avgGrowthRate = count > 0 ? totalGrowthRate / count : 0.05; // Default 5% if no data?
        // Cap reasonable growth to avoid explosion? verify logic.

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
                month: d.date.toLocaleString('default', { month: 'short', year: '2-digit' }),
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

module.exports = router;
