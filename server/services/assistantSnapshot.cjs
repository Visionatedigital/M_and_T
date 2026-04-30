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
                SELECT full_name, loan_product, status, loan_amount, updated_at
                FROM loan_applications la
            `;
            if (isLoanOfficer(role)) {
                q += ` WHERE ${sqlOfficerVisibleLoanApps('la', '$1')}`;
            }
            q += ' ORDER BY updated_at DESC NULLS LAST LIMIT 8';
            const { rows } = await db.query(q, values);
            return rows.map((r) => ({
                full_name: r.full_name,
                loan_product: r.loan_product,
                status: r.status,
                loan_amount_ugx: parseFloat(r.loan_amount || 0),
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
    ] = extensions;

    return {
        snapshot_generated_at: new Date().toISOString(),
        viewer_role: role || null,
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
        },
    };
}

module.exports = { buildAssistantSnapshot };
