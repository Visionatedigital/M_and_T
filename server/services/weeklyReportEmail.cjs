/**
 * Weekly institutional report email (Excel + text summary).
 * Cron: WEEKLY_REPORT_CRON (default Monday 08:30). Disable with WEEKLY_REPORT_CRON=false.
 * Recipients: WEEKLY_REPORT_TO (comma-separated). Falls back to EMAIL_USER if unset.
 */
const ExcelJS = require('exceljs');
const db = require('../db.cjs');
const { sendEmail } = require('./notificationService');

function fmtUgx(n) {
  const v = Number(n) || 0;
  return `UGX ${v.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`;
}

function weekWindow() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end), label: `${iso(start)} → ${iso(end)}` };
}

async function gatherWeeklyStats() {
  const { start, end, label } = weekWindow();

  const { rows: loanRows } = await db.query(`
    SELECT
      COUNT(*)::int AS total_applications,
      COUNT(*) FILTER (WHERE status IN ('approved', 'disbursed', 'active', 'completed', 'settled'))::int AS approved_loans,
      COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_loans,
      COUNT(*) FILTER (WHERE status IN ('pending', 'under_review'))::int AS pending_loans,
      COALESCE(SUM(CASE WHEN status IN ('approved', 'disbursed', 'active', 'completed', 'settled') THEN loan_amount ELSE 0 END), 0)::float AS total_disbursed
    FROM loan_applications
  `);

  const { rows: weekApps } = await db.query(`
    SELECT COUNT(*)::int AS n
    FROM loan_applications
    WHERE created_at::date >= $1::date AND created_at::date <= $2::date
  `, [start, end]);

  const { rows: weekDisb } = await db.query(`
    SELECT COALESCE(SUM(loan_amount), 0)::float AS amount, COUNT(*)::int AS n
    FROM loan_applications
    WHERE status IN ('disbursed', 'completed', 'settled', 'approved', 'active')
      AND approved_at::date >= $1::date AND approved_at::date <= $2::date
  `, [start, end]);

  const { rows: weekRepay } = await db.query(`
    SELECT COALESCE(SUM(amount), 0)::float AS amount, COUNT(*)::int AS n
    FROM repayments
    WHERE payment_date::date >= $1::date AND payment_date::date <= $2::date
  `, [start, end]);

  const { rows: acct } = await db.query(`
    SELECT
      COALESCE(SUM(CASE WHEN entry_type = 'revenue' THEN amount ELSE 0 END), 0)::float AS revenue,
      COALESCE(SUM(CASE WHEN entry_type = 'expense' THEN amount ELSE 0 END), 0)::float AS expenses
    FROM accounting_entries
    WHERE entry_date >= $1::date AND entry_date <= $2::date
  `, [start, end]);

  const { rows: clients } = await db.query(`
    SELECT
      COUNT(*)::int AS total_clients,
      COUNT(*) FILTER (WHERE created_at::date >= $1::date AND created_at::date <= $2::date)::int AS new_clients_week
    FROM borrowers
  `, [start, end]);

  const { rows: products } = await db.query(`
    SELECT
      COALESCE(loan_product, 'Unspecified') AS product,
      COUNT(*)::int AS applications,
      COUNT(*) FILTER (WHERE status IN ('approved', 'disbursed', 'active', 'completed', 'settled'))::int AS approved,
      COALESCE(SUM(CASE WHEN status IN ('approved', 'disbursed', 'active', 'completed', 'settled') THEN loan_amount ELSE 0 END), 0)::float AS total_amount
    FROM loan_applications
    GROUP BY loan_product
    ORDER BY total_amount DESC
  `);

  const loan = loanRows[0] || {};
  const revenue = acct[0]?.revenue || 0;
  const expenses = acct[0]?.expenses || 0;

  return {
    period: { start, end, label },
    loanStats: {
      totalApplications: loan.total_applications || 0,
      approvedLoans: loan.approved_loans || 0,
      rejectedLoans: loan.rejected_loans || 0,
      pendingLoans: loan.pending_loans || 0,
      totalDisbursed: loan.total_disbursed || 0,
    },
    week: {
      newApplications: weekApps[0]?.n || 0,
      disbursementsCount: weekDisb[0]?.n || 0,
      disbursementsAmount: weekDisb[0]?.amount || 0,
      repaymentsCount: weekRepay[0]?.n || 0,
      repaymentsAmount: weekRepay[0]?.amount || 0,
      revenue,
      expenses,
      net: revenue - expenses,
    },
    clients: {
      total: clients[0]?.total_clients || 0,
      newThisWeek: clients[0]?.new_clients_week || 0,
    },
    products,
  };
}

async function buildWorkbookBuffer(stats) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'M-T Growth Gateway';
  workbook.created = new Date();

  const summary = workbook.addWorksheet('Weekly Summary');
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 40 },
    { header: 'Value', key: 'value', width: 28 },
  ];
  summary.addRow({ metric: 'Report period', value: stats.period.label });
  summary.addRow({ metric: 'Generated at', value: new Date().toISOString() });
  summary.addRow({});
  summary.addRow({ metric: 'This week', value: '' }).font = { bold: true };
  summary.addRow({ metric: 'New loan applications', value: stats.week.newApplications });
  summary.addRow({ metric: 'Disbursements (count)', value: stats.week.disbursementsCount });
  summary.addRow({ metric: 'Disbursements (UGX)', value: stats.week.disbursementsAmount });
  summary.addRow({ metric: 'Repayments (count)', value: stats.week.repaymentsCount });
  summary.addRow({ metric: 'Repayments collected (UGX)', value: stats.week.repaymentsAmount });
  summary.addRow({ metric: 'Accounting revenue (UGX)', value: stats.week.revenue });
  summary.addRow({ metric: 'Accounting expenses (UGX)', value: stats.week.expenses });
  summary.addRow({ metric: 'Net (revenue − expenses) (UGX)', value: stats.week.net });
  summary.addRow({ metric: 'New clients', value: stats.clients.newThisWeek });
  summary.addRow({});
  summary.addRow({ metric: 'Institution totals', value: '' }).font = { bold: true };
  summary.addRow({ metric: 'Total applications', value: stats.loanStats.totalApplications });
  summary.addRow({ metric: 'Approved / active loans', value: stats.loanStats.approvedLoans });
  summary.addRow({ metric: 'Pending applications', value: stats.loanStats.pendingLoans });
  summary.addRow({ metric: 'Total disbursed (UGX)', value: stats.loanStats.totalDisbursed });
  summary.addRow({ metric: 'Total clients', value: stats.clients.total });

  const products = workbook.addWorksheet('Products');
  products.columns = [
    { header: 'Product', key: 'product', width: 28 },
    { header: 'Applications', key: 'applications', width: 14 },
    { header: 'Approved', key: 'approved', width: 12 },
    { header: 'Disbursed (UGX)', key: 'total_amount', width: 18 },
  ];
  stats.products.forEach((p) => products.addRow(p));

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}

function buildEmailBody(stats) {
  const w = stats.week;
  return [
    `M-T Growth Gateway — Weekly Report`,
    `Period: ${stats.period.label}`,
    ``,
    `This week`,
    `• New applications: ${w.newApplications}`,
    `• Disbursements: ${w.disbursementsCount} (${fmtUgx(w.disbursementsAmount)})`,
    `• Repayments collected: ${w.repaymentsCount} (${fmtUgx(w.repaymentsAmount)})`,
    `• Accounting revenue: ${fmtUgx(w.revenue)}`,
    `• Accounting expenses: ${fmtUgx(w.expenses)}`,
    `• Net: ${fmtUgx(w.net)}`,
    `• New clients: ${stats.clients.newThisWeek}`,
    ``,
    `Institution totals`,
    `• Total clients: ${stats.clients.total}`,
    `• Approved / active loans: ${stats.loanStats.approvedLoans}`,
    `• Pending applications: ${stats.loanStats.pendingLoans}`,
    `• Lifetime disbursed: ${fmtUgx(stats.loanStats.totalDisbursed)}`,
    ``,
    `Full detail is in the attached Excel file.`,
    `— Automated report from M-T Growth Gateway`,
  ].join('\n');
}

function resolveRecipients() {
  const raw = process.env.WEEKLY_REPORT_TO || process.env.EMAIL_USER || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Build and email the weekly report.
 * @returns {{ sent: boolean, mocked?: boolean, recipients: string[], period: string, error?: string }}
 */
async function runWeeklyReportEmail() {
  const recipients = resolveRecipients();
  if (recipients.length === 0) {
    console.warn('[weekly-report] No WEEKLY_REPORT_TO / EMAIL_USER configured — skipped');
    return { sent: false, recipients: [], period: '', error: 'No recipients configured' };
  }

  const stats = await gatherWeeklyStats();
  const xlsx = await buildWorkbookBuffer(stats);
  const filename = `MT_Weekly_Report_${stats.period.end}.xlsx`;
  const subject = `M-T Weekly Report — ${stats.period.label}`;
  const text = buildEmailBody(stats);

  const result = await sendEmail(recipients.join(', '), subject, text, {
    attachments: [
      {
        filename,
        content: xlsx,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  });

  if (result?.error) {
    return { sent: false, recipients, period: stats.period.label, error: result.error };
  }

  return {
    sent: true,
    mocked: result?.status === 'mocked',
    recipients,
    period: stats.period.label,
  };
}

module.exports = {
  runWeeklyReportEmail,
  gatherWeeklyStats,
  weekWindow,
};
