/**
 * Rich, read-only JSON for the staff AI so answers match /reports/stats and operational reality.
 */
const db = require('../db.cjs');
const { fetchReportStats } = require('../lib/reportStats.cjs');
const { isLoanOfficer } = require('../lib/roles.cjs');
const { officerUserId, sqlOfficerVisibleLoanApps } = require('../lib/officerLoanScope.cjs');

const SYSTEM_USER_UUID = '00000000-0000-0000-0000-000000000000';

async function safe(label, fn) {
    try {
        return await fn();
    } catch (e) {
        console.warn('[assistantSnapshot]', label, e.message);
        return null;
    }
}

function monthBounds(monthsBack = 12) {
    const months = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        d.setMonth(d.getMonth() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const short = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        months.push({ label, short, start, end });
    }
    return months;
}

/** Local calendar YYYY-MM-DD (avoid UTC shift from toISOString). */
function localDateIso(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Extra aggregates for admins — scoped automatically if req.user is a loan officer (same as report stats).
 */
async function buildAssistantSnapshot(req) {
    const user = req.user || {};
    const role = user.role;
    const user_id = officerUserId(req);
    const values = [];
    let loanScoped = '';
    if (isLoanOfficer(role)) {
        loanScoped = sqlOfficerVisibleLoanApps('', '$1');
        values.push(user_id);
    }

    const reportBlock = await fetchReportStats(req);

    const repayScope = isLoanOfficer(role)
        ? `AND r.loan_application_id IN (SELECT id FROM loan_applications la WHERE ${sqlOfficerVisibleLoanApps('la', '$1')})`
        : '';

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartIso = localDateIso(monthStart);
    const todayIso = localDateIso(now);
    const yearStartIso = localDateIso(new Date(now.getFullYear(), 0, 1));
    const currentMonthLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthShort = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const extensions = await Promise.all([
        safe('groupsCount', async () => {
            const { rows } = await db.query('SELECT COUNT(*)::int AS c FROM groups');
            return rows[0]?.c ?? 0;
        }),
        safe('loanStructure', async () => {
            const cond = loanScoped ? `WHERE ${loanScoped}` : '';
            const { rows } = await db.query(
                `
                SELECT
                    COUNT(*) FILTER (WHERE group_id IS NOT NULL)::int AS group_loans,
                    COUNT(*) FILTER (WHERE group_id IS NULL)::int AS individual_loans
                FROM loan_applications
                ${cond}
                `,
                values
            );
            return rows[0] || { group_loans: 0, individual_loans: 0 };
        }),
        safe('borrowerCredit', async () => {
            let q =
                'SELECT ROUND(AVG(credit_score)::numeric, 1) AS avg_stored, COUNT(*) FILTER (WHERE credit_score IS NOT NULL)::int AS with_score FROM borrowers';
            if (isLoanOfficer(role)) q += ' WHERE assigned_officer_id = $1';
            const { rows } = await db.query(q, values);
            return {
                avg_stored_credit_score: rows[0]?.avg_stored != null ? parseFloat(rows[0].avg_stored) : null,
                borrowers_with_stored_score: parseInt(rows[0]?.with_score || 0, 10),
            };
        }),
        safe('repaymentRows', async () => {
            const { rows } = await db.query(
                `SELECT COUNT(*)::int AS cnt, COALESCE(SUM(amount), 0)::numeric AS total_ugx FROM repayments r WHERE 1=1 ${repayScope}`,
                isLoanOfficer(role) ? [user_id] : []
            );
            return {
                repayment_records_total: parseInt(rows[0]?.cnt || 0, 10),
                repayment_cash_total_ugx: parseFloat(rows[0]?.total_ugx || 0),
            };
        }),
        safe('repaymentMethods', async () => {
            const { rows } = await db.query(
                `
                SELECT COALESCE(NULLIF(TRIM(payment_method), ''), 'unknown') AS method,
                    COUNT(*)::int AS cnt,
                    COALESCE(SUM(amount), 0)::numeric AS total_ugx
                FROM repayments r
                WHERE 1=1 ${repayScope}
                GROUP BY 1 ORDER BY total_ugx DESC NULLS LAST
                `,
                isLoanOfficer(role) ? [user_id] : []
            );
            return rows.map((r) => ({
                method: r.method,
                count: parseInt(r.cnt, 10),
                total_ugx: parseFloat(r.total_ugx || 0),
            }));
        }),
        safe('last7Days', async () => {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            const from = d.toISOString().slice(0, 10);
            if (isLoanOfficer(role)) {
                const { rows } = await db.query(
                    `
                    SELECT COALESCE(SUM(amount), 0)::numeric AS v
                    FROM repayments r
                    WHERE payment_date >= $1::date
                      AND r.loan_application_id IN (
                          SELECT id FROM loan_applications la WHERE ${sqlOfficerVisibleLoanApps('la', '$2')}
                      )
                    `,
                    [from, user_id]
                );
                return { period_days: 7, repayments_total_ugx: parseFloat(rows[0]?.v || 0) };
            }
            const { rows } = await db.query(
                `SELECT COALESCE(SUM(amount), 0)::numeric AS v FROM repayments r WHERE payment_date >= $1::date`,
                [from]
            );
            return { period_days: 7, repayments_total_ugx: parseFloat(rows[0]?.v || 0) };
        }),
        safe('collector90dTop', async () => {
            const today = new Date().toISOString().slice(0, 10);
            const from = new Date();
            from.setDate(from.getDate() - 90);
            const dateFrom = from.toISOString().slice(0, 10);
            if (isLoanOfficer(role)) {
                const { rows } = await db.query(
                    `
                    SELECT
                        CASE
                            WHEN r.recorded_by IS NULL OR r.recorded_by = $4::uuid
                                THEN 'Legacy / unspecified'
                            WHEN COALESCE(NULLIF(TRIM(officer.full_name), ''), NULL) IS NOT NULL
                                THEN TRIM(officer.full_name)
                            ELSE 'Unknown profile'
                        END AS officer_label,
                        COUNT(*)::int AS repayment_count,
                        COALESCE(SUM(r.amount), 0)::numeric AS total_amount_ugx
                    FROM repayments r
                    LEFT JOIN profiles officer ON officer.id = r.recorded_by
                    WHERE r.payment_date >= $1::date AND r.payment_date <= $2::date
                      AND r.loan_application_id IN (
                          SELECT id FROM loan_applications la WHERE ${sqlOfficerVisibleLoanApps('la', '$3')}
                      )
                    GROUP BY 1
                    ORDER BY total_amount_ugx DESC NULLS LAST
                    LIMIT 12
                    `,
                    [dateFrom, today, user_id, SYSTEM_USER_UUID]
                );
                return { date_from: dateFrom, date_to: today, rows };
            }
            const { rows } = await db.query(
                `
                SELECT
                    (
                        CASE
                            WHEN r.recorded_by IS NULL OR r.recorded_by = $3::uuid
                                THEN 'Legacy / unspecified'
                            WHEN COALESCE(NULLIF(TRIM(officer.full_name), ''), NULL) IS NOT NULL
                                THEN TRIM(officer.full_name)
                            ELSE 'Unknown profile'
                        END
                    ) AS officer_label,
                    COUNT(*)::int AS repayment_count,
                    COALESCE(SUM(r.amount), 0)::numeric AS total_amount_ugx
                FROM repayments r
                LEFT JOIN profiles officer ON officer.id = r.recorded_by
                WHERE r.payment_date >= $1::date AND r.payment_date <= $2::date
                GROUP BY 1
                ORDER BY total_amount_ugx DESC NULLS LAST
                LIMIT 12
                `,
                [dateFrom, today, SYSTEM_USER_UUID]
            );
            return { date_from: dateFrom, date_to: today, rows };
        }),
        safe('profilesStaff', async () => {
            const { rows } = await db.query(`
                SELECT COUNT(DISTINCT ur.user_id)::int AS staff_count
                FROM user_roles ur
                WHERE ur.role IS NOT NULL
            `);
            return { user_roles_defined: parseInt(rows[0]?.staff_count || 0, 10) };
        }),
        safe('recentApplications', async () => {
            let q = `
                SELECT full_name, loan_product, status, loan_amount, updated_at, approved_at
                FROM loan_applications la
            `;
            if (isLoanOfficer(role)) {
                q += ` WHERE ${sqlOfficerVisibleLoanApps('la', '$1')}`;
            }
            q += ' ORDER BY updated_at DESC NULLS LAST LIMIT 15';
            const { rows } = await db.query(q, values);
            return rows.map((r) => ({
                full_name: r.full_name,
                loan_product: r.loan_product,
                status: r.status,
                loan_amount_ugx: parseFloat(r.loan_amount || 0),
                updated_at: r.updated_at,
                approved_at: r.approved_at,
            }));
        }),
        safe('monthlySeries', async () => {
            const months = monthBounds(12);
            const series = [];
            for (const month of months) {
                // Align with reportStats lifetime principal: approved / disbursed / completed
                // (many books never flip status to 'disbursed' after approval).
                let disQuery = `
                    SELECT
                        COALESCE(SUM(loan_amount), 0)::numeric AS total,
                        COUNT(*)::int AS cnt
                    FROM loan_applications
                    WHERE status IN ('approved', 'disbursed', 'completed')
                      AND approved_at >= $1 AND approved_at <= $2
                `;
                const disVals = [month.start, month.end];
                if (isLoanOfficer(role)) {
                    disQuery += ` AND ${sqlOfficerVisibleLoanApps('', '$3')}`;
                    disVals.push(user_id);
                }
                const { rows: disRows } = await db.query(disQuery, disVals);

                let repQuery = `
                    SELECT
                        COALESCE(SUM(amount), 0)::numeric AS total,
                        COUNT(*)::int AS cnt
                    FROM repayments
                    WHERE payment_date >= $1 AND payment_date <= $2
                `;
                const repVals = [month.start, month.end];
                if (isLoanOfficer(role)) {
                    repQuery += ` AND loan_application_id IN (
                        SELECT id FROM loan_applications la WHERE ${sqlOfficerVisibleLoanApps('la', '$3')}
                    )`;
                    repVals.push(user_id);
                }
                const { rows: repRows } = await db.query(repQuery, repVals);

                series.push({
                    month: month.label,
                    month_label: month.short,
                    disbursed_ugx: parseFloat(disRows[0]?.total || 0),
                    disbursed_count: parseInt(disRows[0]?.cnt || 0, 10),
                    repayments_ugx: parseFloat(repRows[0]?.total || 0),
                    repayment_count: parseInt(repRows[0]?.cnt || 0, 10),
                });
            }
            return series;
        }),
        safe('currentMonthOps', async () => {
            const officerDisb = isLoanOfficer(role)
                ? `AND ${sqlOfficerVisibleLoanApps('', '$2')}`
                : '';
            const disbVals = isLoanOfficer(role) ? [monthStartIso, user_id] : [monthStartIso];
            const { rows: disbRows } = await db.query(
                `
                SELECT
                    COALESCE(SUM(loan_amount), 0)::numeric AS total,
                    COUNT(*)::int AS cnt
                FROM loan_applications
                WHERE status IN ('approved', 'disbursed', 'completed')
                  AND approved_at >= $1::date
                  ${officerDisb}
                `,
                disbVals
            );

            const officerRep = isLoanOfficer(role)
                ? `AND loan_application_id IN (SELECT id FROM loan_applications la WHERE ${sqlOfficerVisibleLoanApps('la', '$2')})`
                : '';
            const repVals = isLoanOfficer(role) ? [monthStartIso, user_id] : [monthStartIso];
            const { rows: monthRepRows } = await db.query(
                `
                SELECT COALESCE(SUM(amount), 0)::numeric AS total, COUNT(*)::int AS cnt
                FROM repayments
                WHERE payment_date >= $1::date
                ${officerRep}
                `,
                repVals
            );

            const todayVals = isLoanOfficer(role) ? [todayIso, user_id] : [todayIso];
            const { rows: todayRepRows } = await db.query(
                `
                SELECT COALESCE(SUM(amount), 0)::numeric AS total, COUNT(*)::int AS cnt
                FROM repayments
                WHERE payment_date::date = $1::date
                ${officerRep}
                `,
                todayVals
            );

            const thirtyAgo = new Date();
            thirtyAgo.setDate(thirtyAgo.getDate() - 30);
            const thirtyIso = thirtyAgo.toISOString().slice(0, 10);
            const last30Vals = isLoanOfficer(role) ? [thirtyIso, user_id] : [thirtyIso];
            const { rows: last30Rows } = await db.query(
                `
                SELECT COALESCE(SUM(amount), 0)::numeric AS total
                FROM repayments
                WHERE payment_date >= $1::date
                ${officerRep}
                `,
                last30Vals
            );

            return {
                calendar_month: currentMonthLabel,
                calendar_month_label: currentMonthShort,
                month_start: monthStartIso,
                as_of_date: todayIso,
                disbursed_this_month_ugx: parseFloat(disbRows[0]?.total || 0),
                disbursed_this_month_count: parseInt(disbRows[0]?.cnt || 0, 10),
                collections_this_month_ugx: parseFloat(monthRepRows[0]?.total || 0),
                collections_this_month_count: parseInt(monthRepRows[0]?.cnt || 0, 10),
                collections_today_ugx: parseFloat(todayRepRows[0]?.total || 0),
                collections_today_count: parseInt(todayRepRows[0]?.cnt || 0, 10),
                collections_last_30_days_ugx: parseFloat(last30Rows[0]?.total || 0),
                note: 'Disbursements/booked principal counted when status is approved, disbursed, or completed and approved_at falls in the period (same pathway as lifetime totalDisbursed). Lifetime totalDisbursed in reportStats is still NOT the same as this month.',
            };
        }),
        safe('statusPipeline', async () => {
            const cond = loanScoped ? `WHERE ${loanScoped}` : '';
            const { rows } = await db.query(
                `
                SELECT
                    COALESCE(status, 'unknown') AS status,
                    COUNT(*)::int AS count,
                    COALESCE(SUM(loan_amount), 0)::numeric AS principal_ugx
                FROM loan_applications
                ${cond}
                GROUP BY 1
                ORDER BY count DESC
                `,
                values
            );
            return rows.map((r) => ({
                status: r.status,
                count: parseInt(r.count, 10),
                principal_ugx: parseFloat(r.principal_ugx || 0),
            }));
        }),
        safe('portfolioHealth', async () => {
            const officerLoan = isLoanOfficer(role)
                ? `AND ${sqlOfficerVisibleLoanApps('la', '$1')}`
                : '';
            const vals = isLoanOfficer(role) ? [user_id] : [];

            const { rows: bookRows } = await db.query(
                `
                WITH per_loan AS (
                    SELECT
                        la.id,
                        la.loan_amount::numeric AS principal,
                        (la.loan_amount * 1.3)::numeric AS expected_total,
                        COALESCE((SELECT SUM(r.amount) FROM repayments r WHERE r.loan_application_id = la.id), 0)::numeric AS repaid
                    FROM loan_applications la
                    WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
                    ${officerLoan}
                )
                SELECT
                    COUNT(*)::int AS book_count,
                    COALESCE(SUM(principal), 0)::numeric AS principal_book_ugx,
                    COALESCE(SUM(expected_total), 0)::numeric AS expected_total_ugx,
                    COALESCE(SUM(repaid), 0)::numeric AS repaid_ugx,
                    COALESCE(SUM(GREATEST(0, expected_total - repaid)), 0)::numeric AS outstanding_ugx,
                    COUNT(*) FILTER (WHERE repaid >= expected_total - 0.0001)::int AS fully_paid_count,
                    COUNT(*) FILTER (WHERE repaid < expected_total - 0.0001)::int AS open_with_balance_count
                FROM per_loan
                `,
                vals
            );

            // Approximate PAR / overdue from installment schedule (same model as accounting KPIs)
            const { rows: parRows } = await db.query(
                `
                SELECT
                    la.id,
                    la.loan_amount,
                    la.loan_duration_months,
                    la.approved_at,
                    la.group_id,
                    COALESCE(SUM(r.amount), 0)::numeric AS total_repaid
                FROM loan_applications la
                LEFT JOIN repayments r ON r.loan_application_id = la.id
                WHERE la.status IN ('approved', 'disbursed')
                ${officerLoan}
                GROUP BY la.id, la.loan_amount, la.loan_duration_months, la.approved_at, la.group_id
                `,
                vals
            );

            let par30Amount = 0;
            let overdueCount = 0;
            let overdueAmount = 0;
            const nowMs = Date.now();
            for (const row of parRows) {
                const principal = parseFloat(row.loan_amount) || 0;
                const total = principal * 1.3;
                const repaid = parseFloat(row.total_repaid) || 0;
                const outstanding = Math.max(0, total - repaid);
                if (outstanding <= 0) continue;
                const approvedAt = row.approved_at ? new Date(row.approved_at) : new Date();
                const durationMonths = parseInt(row.loan_duration_months, 10) || 4;
                const numberOfInstallments = row.group_id ? durationMonths * 4 : durationMonths;
                const installmentAmount = total / (numberOfInstallments || 1);
                const installmentsPaid = Math.floor(repaid / (installmentAmount || 1));
                const nextDue = new Date(approvedAt);
                if (row.group_id) nextDue.setDate(nextDue.getDate() + (installmentsPaid + 1) * 7);
                else nextDue.setMonth(nextDue.getMonth() + installmentsPaid + 1);
                const daysOverdue = Math.floor((nowMs - nextDue.getTime()) / (1000 * 60 * 60 * 24));
                if (daysOverdue > 0) {
                    overdueCount += 1;
                    overdueAmount += outstanding;
                }
                if (daysOverdue >= 30) par30Amount += outstanding;
            }

            const outstanding = parseFloat(bookRows[0]?.outstanding_ugx || 0);
            const expected = parseFloat(bookRows[0]?.expected_total_ugx || 0);
            const repaid = parseFloat(bookRows[0]?.repaid_ugx || 0);

            return {
                book_loan_count: parseInt(bookRows[0]?.book_count || 0, 10),
                principal_book_ugx: parseFloat(bookRows[0]?.principal_book_ugx || 0),
                expected_contractual_ugx: expected,
                repaid_ugx: repaid,
                outstanding_portfolio_ugx: outstanding,
                fully_paid_count: parseInt(bookRows[0]?.fully_paid_count || 0, 10),
                open_with_balance_count: parseInt(bookRows[0]?.open_with_balance_count || 0, 10),
                collection_vs_contractual_pct: expected > 0 ? Math.min(100, (repaid / expected) * 100) : 0,
                loans_with_overdue_installment_count: overdueCount,
                overdue_outstanding_ugx: overdueAmount,
                par_30_amount_ugx: par30Amount,
                par_30_pct_of_outstanding:
                    outstanding > 0 ? Math.round((par30Amount / outstanding) * 10000) / 100 : 0,
                methodology:
                    'Outstanding = sum(max(0, principal×1.3 − repayments)). PAR-30 / overdue use installment schedule from approved_at (weekly for group loans, monthly for individual).',
            };
        }),
        safe('accountingKpis', async () => {
            // Ledger KPIs are institution-wide (not officer-scoped); skip noise for officers
            if (isLoanOfficer(role)) {
                return {
                    scoped: false,
                    note: 'Accounting ledger KPIs are admin/institution-wide; not included for loan-officer views.',
                };
            }
            const { rows: ytdRows } = await db.query(
                `
                SELECT entry_type, COALESCE(SUM(amount), 0)::numeric AS total
                FROM accounting_entries
                WHERE entry_date >= $1::date
                GROUP BY entry_type
                `,
                [yearStartIso]
            );
            let ytdRevenue = 0;
            let ytdExpenses = 0;
            for (const r of ytdRows) {
                if (r.entry_type === 'revenue') ytdRevenue = parseFloat(r.total);
                if (r.entry_type === 'expense') ytdExpenses = parseFloat(r.total);
            }
            const { rows: cashRows } = await db.query(
                `
                SELECT COALESCE(SUM(CASE WHEN entry_type = 'revenue' THEN amount ELSE -amount END), 0)::numeric AS net
                FROM accounting_entries
                WHERE entry_date <= $1::date
                `,
                [todayIso]
            );
            return {
                scoped: true,
                year_start: yearStartIso,
                ytd_revenue_ugx: ytdRevenue,
                ytd_expenses_ugx: ytdExpenses,
                net_profit_ytd_ugx: ytdRevenue - ytdExpenses,
                cash_position_ugx: Math.max(0, parseFloat(cashRows[0]?.net || 0)),
            };
        }),
        safe('pendingQueue', async () => {
            let q = `
                SELECT full_name, loan_product, status, loan_amount, created_at, updated_at
                FROM loan_applications la
                WHERE status IN ('pending', 'under_review')
            `;
            if (isLoanOfficer(role)) {
                q += ` AND ${sqlOfficerVisibleLoanApps('la', '$1')}`;
            }
            q += ' ORDER BY updated_at DESC NULLS LAST LIMIT 12';
            const { rows } = await db.query(q, values);
            return rows.map((r) => ({
                full_name: r.full_name,
                loan_product: r.loan_product,
                status: r.status,
                loan_amount_ugx: parseFloat(r.loan_amount || 0),
                created_at: r.created_at,
                updated_at: r.updated_at,
            }));
        }),
    ]);

    const [
        groupsCount,
        loanStructure,
        borrowerCredit,
        repaymentRows,
        repaymentMethods,
        last7Days,
        collector90dTop,
        profilesStaff,
        recentApplications,
        monthlySeries,
        currentMonthOps,
        statusPipeline,
        portfolioHealth,
        accountingKpis,
        pendingQueue,
    ] = extensions;

    const coverage = [
        'Lifetime portfolio totals (reportStats.loanStats) — do NOT treat totalDisbursed as "this month"',
        'Current calendar month MTD disbursements & collections (extensions.current_month)',
        'Last 12 calendar months disbursed vs repayments with year-month keys (extensions.monthly_series)',
        'Today / last 7 / last 30 days collections',
        'Status pipeline counts and pending/under_review queue samples',
        'Outstanding, PAR-30 estimate, overdue installment counts (extensions.portfolio_health)',
        'Product / branch / category mix from reportStats',
        'Payment method mix and top collectors (90 days)',
        'Recent application activity (15) and pending queue (12)',
        'Accounting YTD P&L and cash position (admins only)',
    ];

    return {
        snapshot_generated_at: new Date().toISOString(),
        viewer_role: role || null,
        snapshot_coverage: coverage,
        how_to_read_money: {
            currency: 'UGX',
            lifetime_vs_mtd:
                'reportStats.loanStats.totalDisbursed is lifetime (approved/disbursed/completed principals). For "August" / "this month" use extensions.current_month or the matching row in extensions.monthly_series.',
            monthly_series_key: 'month is YYYY-MM; month_label is human-readable.',
        },
        reportStats: reportBlock,
        extensions: {
            groups_registered: groupsCount ?? null,
            applications_by_structure: loanStructure ?? null,
            borrower_credit_scores: borrowerCredit ?? null,
            repayments: repaymentRows ?? null,
            repayment_methods_breakdown: repaymentMethods ?? null,
            last_7_days: last7Days ?? null,
            officer_collections_last_90_days: collector90dTop ?? null,
            staff_directory_hint: profilesStaff ?? null,
            recent_application_activity: recentApplications ?? null,
            monthly_series: monthlySeries ?? null,
            current_month: currentMonthOps ?? null,
            status_pipeline: statusPipeline ?? null,
            portfolio_health: portfolioHealth ?? null,
            accounting_ledger: accountingKpis ?? null,
            pending_under_review_queue: pendingQueue ?? null,
        },
    };
}

module.exports = { buildAssistantSnapshot };
