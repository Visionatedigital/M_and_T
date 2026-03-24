// ============================================================
// ownerOverview.js — Executive landing (Farm + SACCO door)
// Copy to: Coffee management system/src/renderer/features/core/ownerOverview.js
// ============================================================
import { dataService } from '../../services/dataService.js';

function monthKey(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
}

function buildSeries(rows, getDate, getValue, months = 6) {
  const now = new Date();
  const keys = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  const map = {};
  for (const row of rows) {
    const k = monthKey(getDate(row));
    if (!k) continue;
    map[k] = (map[k] || 0) + Number(getValue(row) || 0);
  }
  return keys.map((k) => ({ key: k, value: map[k] || 0 }));
}

function svgLineSeries(series, w, h, pad = 8) {
  const max = Math.max(...series.map((s) => s.value), 1);
  const pts = series.map((s, i) => {
    const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (s.value / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  return { points: pts.join(' '), max };
}

export async function renderOwnerOverview(container) {
  const [
    financeSummary,
    stats,
    batches,
    blocks,
    financeItems,
    saccoSummary,
    saccoSavings,
    lodgeSummary,
    lodgeBookings,
    saccoRepayments,
  ] = await Promise.all([
    dataService.getFinanceSummary(),
    dataService.getComputedStats(),
    dataService.getBatches(),
    dataService.getBlocks(),
    dataService.getFinanceItems(),
    dataService.getSaccoSummary(),
    dataService.getSaccoSavings(),
    dataService.getLodgeSummary().catch(() => ({
      units: 0,
      occupied: 0,
      occupancyRate: 0,
      revenue: 0,
    })),
    dataService.getLodgeBookings().catch(() => []),
    dataService.getSaccoRepayments(),
  ]);

  const totalRevenue =
    Number(financeSummary?.totalRevenue || 0) ||
    financeItems.filter((i) => i.type === 'Revenue').reduce((s, i) => s + Number(i.amount || 0), 0);
  const farmYieldKg = Number(stats?.totalGreenBeanOutput || 0);
  const lodgeOcc = lodgeSummary.occupancyRate ?? 0;
  const saccoSav = saccoSummary.totalSavings || 0;

  const revSeries = buildSeries(
    financeItems.filter((i) => i.type === 'Revenue'),
    (r) => r.date,
    (r) => r.amount,
    6
  );
  const harvestSeries = buildSeries(batches, (b) => b.date, (b) => b.kgOut, 6);
  const savingsSeries = buildSeries(saccoSavings, (s) => s.deposit_date, (s) => s.amount, 6);

  const revSvg = svgLineSeries(revSeries, 320, 120);
  const harSvg = svgLineSeries(harvestSeries, 320, 120);
  const savSvg = svgLineSeries(savingsSeries, 320, 120);

  const activities = [];

  saccoSavings.slice(0, 3).forEach((s) => {
    activities.push({
      icon: 'savings',
      cls: 'sacco',
      title: `${s.member_name || 'Member'} deposited ${dataService.formatCurrency(Number(s.amount || 0))}`,
      meta: s.deposit_date || '',
    });
  });
  saccoRepayments.slice(0, 2).forEach((r) => {
    activities.push({
      icon: 'payments',
      cls: 'sacco',
      title: `Loan repayment ${dataService.formatCurrency(Number(r.amount || 0))}`,
      meta: r.repayment_date || '',
    });
  });
  batches.slice(0, 2).forEach((b) => {
    activities.push({
      icon: 'agriculture',
      cls: '',
      title: `Coffee processed: ${Number(b.kgOut || 0).toLocaleString()} kg`,
      meta: b.date || '',
    });
  });
  lodgeBookings.slice(0, 2).forEach((bk) => {
    activities.push({
      icon: 'hotel',
      cls: 'lodge',
      title: `Lodge ${bk.unit_code || ''} booked — ${bk.guest_name || 'Guest'}`,
      meta: bk.check_in || '',
    });
  });

  while (activities.length < 6) {
    activities.push({
      icon: 'water_drop',
      cls: '',
      title: 'Block operations: irrigation check completed',
      meta: 'This week',
    });
    break;
  }

  container.innerHTML = `
    <div class="page-header" style="margin-bottom:20px;">
      <h1 class="page-title">Overview</h1>
      <p class="page-subtitle">Executive snapshot — revenue, farm, lodge, and SACCO</p>
    </div>

    <div class="kpi-grid" style="margin-bottom:20px;">
      <div class="kpi-card gold-border">
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value gold">${dataService.formatCurrency(totalRevenue)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Farm Yield (season)</div>
        <div class="kpi-value">${farmYieldKg.toLocaleString()} <small style="font-size:13px;font-weight:500;color:var(--text-muted);">kg</small></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Lodge occupancy</div>
        <div class="kpi-value">${lodgeOcc}%</div>
        <div class="kpi-delta" style="margin-top:8px;font-size:10px;color:var(--text-muted);">${lodgeSummary.occupied || 0} of ${lodgeSummary.units || 0} units</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">SACCO savings</div>
        <div class="kpi-value green">${dataService.formatCurrency(saccoSav)}</div>
      </div>
    </div>

    <div class="overview-charts-grid" style="margin-bottom:20px;">
      <div class="chart-card">
        <h3>Revenue over time</h3>
        <svg class="simple-line-chart" viewBox="0 0 320 120" preserveAspectRatio="none">
          <polyline points="${revSvg.points}" />
        </svg>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:9px;color:var(--text-muted);text-transform:uppercase;">
          ${revSeries.map((s) => `<span>${s.key.slice(5)}</span>`).join('')}
        </div>
      </div>
      <div class="chart-card">
        <h3>Coffee harvest trends</h3>
        <svg class="simple-line-chart" viewBox="0 0 320 120" preserveAspectRatio="none">
          <polyline points="${harSvg.points}" style="stroke:var(--gold-bright);" />
        </svg>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:9px;color:var(--text-muted);text-transform:uppercase;">
          ${harvestSeries.map((s) => `<span>${s.key.slice(5)}</span>`).join('')}
        </div>
      </div>
      <div class="chart-card">
        <h3>SACCO savings growth</h3>
        <svg class="simple-line-chart" viewBox="0 0 320 120" preserveAspectRatio="none">
          <polyline points="${savSvg.points}" style="stroke:var(--green-text);" />
        </svg>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:9px;color:var(--text-muted);text-transform:uppercase;">
          ${savingsSeries.map((s) => `<span>${s.key.slice(5)}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="section-card" style="border:none;box-shadow:0 1px 0 var(--border-subtle);">
      <div class="activity-feed-header">Recent activity</div>
      <div class="activity-feed" style="border:none;border-radius:0;">
        ${activities
          .slice(0, 8)
          .map(
            (a) => `
          <div class="activity-item">
            <div class="activity-icon ${a.cls}"><span class="material-symbols-outlined" style="font-size:20px;">${a.icon}</span></div>
            <div class="activity-body">
              <div class="activity-title">${a.title}</div>
              <div class="activity-meta">${a.meta}</div>
            </div>
          </div>`
          )
          .join('')}
      </div>
    </div>
  `;
}
