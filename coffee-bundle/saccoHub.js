// ============================================================
// saccoHub.js — Modern SACCO: Overview | Members | Loans
// Copy to: Coffee management system/src/renderer/features/sacco/saccoHub.js
// In app.js: import { renderSaccoHub } from './features/sacco/saccoHub.js';
// Replace renderSaccoDashboard with renderSaccoHub in FARM_SACCO_NAV
// ============================================================
import { dataService } from '../../services/dataService.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loanBalance(loan, repayments) {
  const paid = repayments.filter((r) => r.loan_id === loan.id).reduce((s, r) => s + Number(r.amount || 0), 0);
  return Math.max(Number(loan.amount || 0) - paid, 0);
}

function memberTotalSavings(memberId, savings) {
  return savings.filter((s) => s.member_id === memberId).reduce((s, x) => s + Number(x.amount || 0), 0);
}

function buildMemberTx(memberId, savings, loans, repayments) {
  const tx = [];
  savings
    .filter((s) => s.member_id === memberId)
    .forEach((s) => {
      tx.push({
        kind: 'deposit',
        label: 'Deposit',
        amount: Number(s.amount || 0),
        date: s.deposit_date || '',
        positive: true,
      });
    });
  loans
    .filter((l) => l.member_id === memberId)
    .forEach((l) => {
      tx.push({
        kind: 'loan',
        label: 'Loan issued',
        amount: Number(l.amount || 0),
        date: l.issue_date || '',
        positive: true,
      });
    });
  repayments
    .filter((r) => {
      const loan = loans.find((l) => l.id === r.loan_id);
      return loan && loan.member_id === memberId;
    })
    .forEach((r) => {
      tx.push({
        kind: 'repay',
        label: 'Loan repayment',
        amount: Number(r.amount || 0),
        date: r.repayment_date || '',
        positive: false,
      });
    });
  tx.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return tx;
}

function loanDistribution(loans, repayments) {
  const active = loans.filter((l) => (l.status || '').toLowerCase() === 'active');
  const bins = { under1: 0, m1to3: 0, m3to5: 0, over5: 0 };
  for (const l of active) {
    const bal = loanBalance(l, repayments);
    const m = bal / 1_000_000;
    if (m < 1) bins.under1++;
    else if (m < 3) bins.m1to3++;
    else if (m < 5) bins.m3to5++;
    else bins.over5++;
  }
  const max = Math.max(...Object.values(bins), 1);
  return { bins, max };
}

function savingsByMonth(savings, months = 6) {
  const now = new Date();
  const keys = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  const map = {};
  for (const s of savings) {
    const d = new Date(s.deposit_date);
    if (Number.isNaN(d.getTime())) continue;
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map[k] = (map[k] || 0) + Number(s.amount || 0);
  }
  return keys.map((k) => ({ key: k, value: map[k] || 0 }));
}

function closePanel() {
  document.querySelectorAll('.side-panel-backdrop').forEach((el) => el.remove());
}

function openMemberPanel(member, savings, loans, repayments, onRefresh) {
  closePanel();
  const totalSav = memberTotalSavings(member.id, savings);
  const memberLoans = loans.filter((l) => l.member_id === member.id);
  let activeLoanBal = 0;
  memberLoans.forEach((l) => {
    activeLoanBal += loanBalance(l, repayments);
  });

  const backdrop = document.createElement('div');
  backdrop.className = 'side-panel-backdrop';
  backdrop.innerHTML = `
    <div class="side-panel" role="dialog" aria-label="Member profile">
      <div class="side-panel-header">
        <div>
          <div class="member-hero-name">${member.full_name}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${member.member_no} · ${member.phone || 'No phone'}</div>
          <div class="member-hero-stats">
            <div class="member-stat-pill">
              <div class="lbl">Savings</div>
              <div class="val">${dataService.formatCurrency(totalSav)}</div>
            </div>
            <div class="member-stat-pill">
              <div class="lbl">Loan outstanding</div>
              <div class="val">${dataService.formatCurrency(activeLoanBal)}</div>
            </div>
          </div>
        </div>
        <button type="button" class="side-panel-close" aria-label="Close"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="member-inner-tabs" id="member-inner-tabs"></div>
      <div class="side-panel-body" id="member-panel-body"></div>
    </div>
  `;

  const tabs = ['Overview', 'Transactions', 'Loans', 'Savings'];
  let innerTab = 'Transactions';

  const tabEl = backdrop.querySelector('#member-inner-tabs');
  const bodyEl = backdrop.querySelector('#member-panel-body');

  function renderInner() {
    tabEl.innerHTML = tabs
      .map(
        (t) => `
      <button type="button" class="member-inner-tab ${innerTab === t ? 'active' : ''}" data-t="${t}">${t}</button>
    `
      )
      .join('');

    tabEl.querySelectorAll('.member-inner-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        innerTab = btn.dataset.t;
        renderInner();
      });
    });

    if (innerTab === 'Overview') {
      bodyEl.innerHTML = `
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
          Member since <strong>${member.join_date || '—'}</strong>. Status: <span class="badge ${(member.status || '').toLowerCase() === 'active' ? 'green' : 'muted'}">${member.status || '—'}</span>
        </p>
        <div class="mt-16">
          <div class="section-title">Active loans</div>
          ${
            memberLoans.length === 0
              ? '<p style="color:var(--text-muted);font-size:12px;">No loans.</p>'
              : memberLoans
                  .map((l) => {
                    const bal = loanBalance(l, repayments);
                    return `<div class="txn-row"><div><div class="txn-label">Loan #${l.id}</div><div class="txn-date">${l.issue_date || ''}</div></div><div class="txn-amount outflow">${dataService.formatCurrency(bal)} due</div></div>`;
                  })
                  .join('')
          }
        </div>
      `;
    }

    if (innerTab === 'Transactions') {
      const tx = buildMemberTx(member.id, savings, loans, repayments);
      bodyEl.innerHTML =
        tx.length === 0
          ? '<p style="color:var(--text-muted);font-size:12px;">No transactions yet.</p>'
          : tx
              .map((t) => {
                const sign = t.positive ? '+' : '−';
                const cls = t.positive ? 'inflow' : 'outflow';
                const amt = dataService.formatCurrency(t.amount);
                return `
            <div class="txn-row">
              <div class="txn-amount ${cls}">${sign}${amt.replace(/^UGX\s/, '')}</div>
              <div class="txn-detail">
                <div class="txn-label">${t.label}</div>
                <div class="txn-date">${t.date}</div>
              </div>
            </div>`;
              })
              .join('');
    }

    if (innerTab === 'Loans') {
      bodyEl.innerHTML =
        memberLoans.length === 0
          ? '<p style="color:var(--text-muted);font-size:12px;">No loans.</p>'
          : memberLoans
              .map((l) => {
                const bal = loanBalance(l, repayments);
                const pct = Number(l.amount) > 0 ? Math.round(((Number(l.amount) - bal) / Number(l.amount)) * 100) : 0;
                return `
            <div class="section-card" style="margin-bottom:12px;">
              <div style="padding:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="txn-label">Loan #${l.id}</span>
                  <span class="badge ${(l.status || '').toLowerCase() === 'active' ? 'amber' : 'muted'}">${l.status || ''}</span>
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin:6px 0;">Issued ${l.issue_date || ''}</div>
                <div class="loan-progress-track"><div class="loan-progress-fill" style="width:${pct}%;"></div></div>
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:8px;">
                  <span>Remaining</span>
                  <strong>${dataService.formatCurrency(bal)}</strong>
                </div>
              </div>
            </div>`;
              })
              .join('');
    }

    if (innerTab === 'Savings') {
      const rows = savings.filter((s) => s.member_id === member.id);
      bodyEl.innerHTML =
        rows.length === 0
          ? '<p style="color:var(--text-muted);font-size:12px;">No savings records.</p>'
          : rows
              .map(
                (s) => `
          <div class="txn-row">
            <div class="txn-amount inflow">+${dataService.formatCurrency(Number(s.amount)).replace(/^UGX\s/, '')}</div>
            <div class="txn-detail">
              <div class="txn-label">Deposit</div>
              <div class="txn-date">${s.deposit_date || ''}</div>
            </div>
          </div>`
              )
              .join('');
    }
  }

  backdrop.querySelector('.side-panel-close').addEventListener('click', closePanel);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closePanel();
  });

  document.body.appendChild(backdrop);
  renderInner();
}

function openLoanPanel(loan, repayments, onRefresh) {
  closePanel();
  const bal = loanBalance(loan, repayments);
  const principal = Number(loan.amount || 0);
  const pct = principal > 0 ? Math.round(((principal - bal) / principal) * 100) : 0;
  const paid = principal - bal;
  const nextPay = Math.min(bal, Math.max(Math.round(bal / 6), 50000));

  const backdrop = document.createElement('div');
  backdrop.className = 'side-panel-backdrop';
  backdrop.innerHTML = `
    <div class="side-panel">
      <div class="side-panel-header">
        <div>
          <div class="member-hero-name">Loan #${loan.id}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:6px;">${loan.member_name || 'Member'}</div>
          <div class="member-hero-stats" style="margin-top:14px;">
            <div class="member-stat-pill">
              <div class="lbl">Principal</div>
              <div class="val">${dataService.formatCurrency(principal)}</div>
            </div>
            <div class="member-stat-pill">
              <div class="lbl">Remaining</div>
              <div class="val">${dataService.formatCurrency(bal)}</div>
            </div>
          </div>
        </div>
        <button type="button" class="side-panel-close"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="side-panel-body">
        <div class="loan-progress-track"><div class="loan-progress-fill" style="width:${pct}%;"></div></div>
        <p style="font-size:12px;color:var(--text-muted);margin-top:8px;">${pct}% repaid · ${dataService.formatCurrency(paid)} paid to date</p>
        <div class="member-stat-pill" style="margin-top:20px;">
          <div class="lbl">Suggested next payment</div>
          <div class="val">${dataService.formatCurrency(nextPay)}</div>
        </div>
        <div class="section-title mt-16">Repayment history</div>
        ${repayments
          .filter((r) => r.loan_id === loan.id)
          .map(
            (r) => `
          <div class="txn-row">
            <div class="txn-amount outflow">−${dataService.formatCurrency(Number(r.amount)).replace(/^UGX\s/, '')}</div>
            <div class="txn-detail">
              <div class="txn-label">Repayment</div>
              <div class="txn-date">${r.repayment_date || ''}</div>
            </div>
          </div>`
          )
          .join('') || '<p style="color:var(--text-muted);font-size:12px;">No repayments yet.</p>'}
      </div>
    </div>
  `;
  backdrop.querySelector('.side-panel-close').addEventListener('click', closePanel);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closePanel();
  });
  document.body.appendChild(backdrop);
}

let hubTab = 'overview';

async function renderOverviewTab(container, data, refresh) {
  const { summary, members, loans, savings, repayments } = data;
  const dist = loanDistribution(loans, repayments);
  const savSeries = savingsByMonth(savings);
  const maxSav = Math.max(...savSeries.map((s) => s.value), 1);
  const formsHtml = quickFormsHtml(members, loans);

  const activities = [];
  savings.slice(0, 4).forEach((s) => {
    activities.push({ t: `${s.member_name || 'Member'} deposited ${dataService.formatCurrency(Number(s.amount))}`, d: s.deposit_date });
  });
  loans.slice(0, 2).forEach((l) => {
    activities.push({ t: `${l.member_name || 'Member'} — loan ${dataService.formatCurrency(Number(l.amount))}`, d: l.issue_date });
  });
  repayments.slice(0, 4).forEach((r) => {
    activities.push({ t: `Repayment ${dataService.formatCurrency(Number(r.amount))}`, d: r.repayment_date });
  });

  container.innerHTML = `
    <div class="kpi-grid" style="margin-bottom:20px;">
      <div class="kpi-card"><div class="kpi-label">Total savings</div><div class="kpi-value green">${dataService.formatCurrency(summary.totalSavings)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Active loans</div><div class="kpi-value">${loans.filter((l) => (l.status || '').toLowerCase() === 'active').length}</div></div>
      <div class="kpi-card red-border"><div class="kpi-label">Outstanding balance</div><div class="kpi-value red">${dataService.formatCurrency(summary.outstandingLoans)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Members</div><div class="kpi-value">${summary.members}</div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;" class="sacco-mid-grid">
      <div class="chart-card">
        <h3>Savings growth</h3>
        <div class="chart-bars-row" style="height:140px;padding:0 8px;">
          ${savSeries
            .map((s) => {
              const h = Math.round((s.value / maxSav) * 100);
              return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;"><div class="chart-bar" style="height:${h}%;min-height:${s.value > 0 ? 4 : 0}px;width:100%;max-width:36px;"></div><div class="chart-bar-label">${s.key.slice(5)}</div></div>`;
            })
            .join('')}
        </div>
      </div>
      <div class="chart-card">
        <h3>Loan distribution (active)</h3>
        <div style="padding:12px 8px;">
          ${['<1M', '1–3M', '3–5M', '5M+']
            .map((label, i) => {
              const v = [dist.bins.under1, dist.bins.m1to3, dist.bins.m3to5, dist.bins.over5][i];
              const h = Math.round((v / dist.max) * 100);
              return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span style="width:48px;font-size:10px;color:var(--text-muted);">${label}</span><div style="flex:1;height:10px;background:var(--bg-overlay);border-radius:99px;overflow:hidden;"><div class="chart-bar secondary" style="height:100%;width:${h}%;min-width:${v ? 8 : 0}px;border-radius:99px;"></div></div><span style="font-size:11px;font-weight:700;width:20px;">${v}</span></div>`;
            })
            .join('')}
        </div>
      </div>
    </div>

    <div class="section-card" style="margin-bottom:20px;">
      <div class="activity-feed-header">Recent transactions</div>
      <div class="activity-feed" style="border:none;">
        ${activities
          .slice(0, 10)
          .map(
            (a) => `
          <div class="activity-item">
            <div class="activity-icon sacco"><span class="material-symbols-outlined" style="font-size:18px;">swap_horiz</span></div>
            <div class="activity-body"><div class="activity-title">${a.t}</div><div class="activity-meta">${a.d || ''}</div></div>
          </div>`
          )
          .join('')}
      </div>
    </div>

    <details class="section-card" style="margin-bottom:0;">
      <summary class="card-header" style="cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;">
        <span class="material-symbols-outlined" style="font-size:18px;">add_circle</span>
        <h2 class="card-title" style="margin:0;">Quick add records</h2>
      </summary>
      <div style="padding:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px;" class="sacco-forms-grid">
        ${formsHtml}
      </div>
    </details>
  `;

  bindQuickForms(container, refresh);
}

async function quickFormsHtml(members, loans) {
  return `
        <form id="add-member-form" style="display:flex;flex-direction:column;gap:8px;">
          <div class="kpi-label">New member</div>
          <input class="form-input" name="member_no" placeholder="Member No" required />
          <input class="form-input" name="full_name" placeholder="Full name" required />
          <input class="form-input" name="phone" placeholder="Phone" />
          <button class="btn btn-primary" type="submit">Add member</button>
        </form>
        <form id="add-saving-form" style="display:flex;flex-direction:column;gap:8px;">
          <div class="kpi-label">Record saving</div>
          <select class="form-input" name="member_id" required><option value="">Select member</option>${members.map((m) => `<option value="${m.id}">${m.member_no} — ${m.full_name}</option>`).join('')}</select>
          <input class="form-input" name="amount" type="number" min="0" step="0.01" placeholder="Amount" required />
          <input class="form-input" name="deposit_date" type="date" value="${today()}" required />
          <button class="btn btn-primary" type="submit">Add saving</button>
        </form>
        <form id="add-loan-form" style="display:flex;flex-direction:column;gap:8px;">
          <div class="kpi-label">Issue loan</div>
          <select class="form-input" name="member_id" required><option value="">Select member</option>${members.map((m) => `<option value="${m.id}">${m.member_no} — ${m.full_name}</option>`).join('')}</select>
          <input class="form-input" name="amount" type="number" min="0" step="0.01" placeholder="Amount" required />
          <input class="form-input" name="interest_rate" type="number" min="0" step="0.1" placeholder="Interest %" value="12" />
          <button class="btn btn-primary" type="submit">Create loan</button>
        </form>
        <form id="add-repayment-form" style="display:flex;flex-direction:column;gap:8px;">
          <div class="kpi-label">Repayment</div>
          <select class="form-input" name="loan_id" required><option value="">Select loan</option>${loans.map((l) => `<option value="${l.id}">#${l.id} — ${l.member_name || ''}</option>`).join('')}</select>
          <input class="form-input" name="amount" type="number" min="0" step="0.01" required />
          <input class="form-input" name="repayment_date" type="date" value="${today()}" required />
          <button class="btn btn-primary" type="submit">Add repayment</button>
        </form>`;
}

function bindQuickForms(container, refresh) {
  const bind = (sel, fn) => {
    const form = container.querySelector(sel);
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      await fn(data);
      await refresh();
    });
  };

  bind('#add-member-form', async (data) => {
    await dataService.addSaccoMember({
      member_no: data.member_no,
      full_name: data.full_name,
      phone: data.phone,
      join_date: today(),
      status: 'Active',
    });
  });
  bind('#add-saving-form', async (data) => {
    await dataService.addSaccoSaving({
      member_id: Number(data.member_id),
      amount: Number(data.amount),
      deposit_date: data.deposit_date,
      method: 'Cash',
    });
  });
  bind('#add-loan-form', async (data) => {
    const due = new Date();
    due.setMonth(due.getMonth() + 12);
    await dataService.addSaccoLoan({
      member_id: Number(data.member_id),
      amount: Number(data.amount),
      interest_rate: Number(data.interest_rate || 0),
      term_months: 12,
      issue_date: today(),
      due_date: due.toISOString().slice(0, 10),
      status: 'Active',
    });
  });
  bind('#add-repayment-form', async (data) => {
    await dataService.addSaccoRepayment({
      loan_id: Number(data.loan_id),
      amount: Number(data.amount),
      repayment_date: data.repayment_date,
      method: 'Cash',
    });
  });
}

async function renderMembersTab(container, data, refresh) {
  const { members, savings, loans, repayments } = data;

  if (!members.length) {
    container.innerHTML = `
      <div class="section-card" style="padding:40px;text-align:center;color:var(--text-muted);">
        No members yet. Open <strong>Overview</strong> tab and use <em>Quick add records</em> to add a member.
      </div>`;
    return;
  }

  const rows = members.map((m) => {
    const sav = memberTotalSavings(m.id, savings);
    const mLoans = loans.filter((l) => l.member_id === m.id && (l.status || '').toLowerCase() === 'active');
    let loanBal = 0;
    mLoans.forEach((l) => {
      loanBal += loanBalance(l, repayments);
    });
    return { m, sav, loanBal };
  });

  container.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:16px;">
      <div class="top-bar-search" style="max-width:320px;flex:1;min-width:200px;">
        <span class="material-symbols-outlined">search</span>
        <input type="search" id="member-filter" placeholder="Search name or member no…" />
      </div>
      <select class="form-input" id="member-status-filter" style="width:140px;padding:8px 10px;">
        <option value="">All status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
    </div>
    <div class="section-card">
      <table class="data-table" id="members-table">
        <thead><tr><th>Name</th><th>Savings</th><th>Loan</th><th>Status</th></tr></thead>
        <tbody>
          ${rows
            .map(
              ({ m, sav, loanBal }) => `
            <tr class="member-row" data-id="${m.id}" data-name="${(m.full_name || '').toLowerCase()}" data-no="${(m.member_no || '').toLowerCase()}" data-status="${m.status || ''}">
              <td class="strong">${m.full_name}<div style="font-size:10px;color:var(--text-muted);font-weight:500;">${m.member_no}</div></td>
              <td class="tabular-nums">${dataService.formatCurrency(sav)}</td>
              <td class="tabular-nums">${loanBal > 0 ? dataService.formatCurrency(loanBal) : '—'}</td>
              <td><span class="badge ${(m.status || '').toLowerCase() === 'active' ? 'green' : 'muted'}">${m.status || '—'}</span></td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  const filter = () => {
    const q = (container.querySelector('#member-filter')?.value || '').toLowerCase();
    const st = container.querySelector('#member-status-filter')?.value || '';
    container.querySelectorAll('.member-row').forEach((tr) => {
      const ok =
        (!q || tr.dataset.name.includes(q) || tr.dataset.no.includes(q)) && (!st || tr.dataset.status === st);
      tr.style.display = ok ? '' : 'none';
    });
  };
  container.querySelector('#member-filter')?.addEventListener('input', filter);
  container.querySelector('#member-status-filter')?.addEventListener('change', filter);

  container.querySelectorAll('.member-row').forEach((tr) => {
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => {
      const id = Number(tr.dataset.id);
      const member = members.find((x) => x.id === id);
      if (member) openMemberPanel(member, savings, loans, repayments, refresh);
    });
  });
}

async function renderLoansTab(container, data, refresh) {
  const { loans, repayments } = data;

  container.innerHTML = `
    <div class="section-card">
      <table class="data-table">
        <thead><tr><th>Member</th><th>Amount</th><th>Balance</th><th>Status</th></tr></thead>
        <tbody>
          ${loans
            .map((l) => {
              const bal = loanBalance(l, repayments);
              return `
            <tr class="loan-row" data-loan-id="${l.id}" style="cursor:pointer;">
              <td class="strong">${l.member_name || '—'}</td>
              <td class="tabular-nums">${dataService.formatCurrency(Number(l.amount || 0))}</td>
              <td class="tabular-nums">${dataService.formatCurrency(bal)}</td>
              <td><span class="badge ${(l.status || '').toLowerCase() === 'active' ? 'amber' : 'muted'}">${l.status || '—'}</span></td>
            </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('.loan-row').forEach((tr) => {
    tr.addEventListener('click', () => {
      const id = Number(tr.dataset.loanId);
      const loan = loans.find((x) => x.id === id);
      if (loan) openLoanPanel(loan, repayments, refresh);
    });
  });
}

export async function renderSaccoHub(container) {
  const load = async () => {
    const [summary, members, loans, savings, repayments] = await Promise.all([
      dataService.getSaccoSummary(),
      dataService.getSaccoMembers(),
      dataService.getSaccoLoans(),
      dataService.getSaccoSavings(),
      dataService.getSaccoRepayments(),
    ]);
    return { summary, members, loans, savings, repayments };
  };

  const refresh = async () => {
    const data = await load();
    const shell = container.querySelector('#sacco-hub-root');
    if (!shell) return;
    const body = shell.querySelector('#sacco-hub-body');
    if (hubTab === 'overview') await renderOverviewTab(body, data, refresh);
    if (hubTab === 'members') await renderMembersTab(body, data, refresh);
    if (hubTab === 'loans') await renderLoansTab(body, data, refresh);
  };

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">SACCO</h1>
      <p class="page-subtitle">Savings, loans, and members — modern workspace</p>
    </div>
    <div id="sacco-hub-root">
      <div class="sacco-hub-tabs">
        ${[
          { id: 'overview', icon: 'dashboard', label: 'Overview' },
          { id: 'members', icon: 'groups', label: 'Members' },
          { id: 'loans', icon: 'account_balance', label: 'Loans' },
        ]
          .map(
            (t) => `
        <button type="button" class="sacco-hub-tab ${hubTab === t.id ? 'active' : ''}" data-hub-tab="${t.id}">
          <span class="material-symbols-outlined" style="font-size:18px;">${t.icon}</span>${t.label}
        </button>`
          )
          .join('')}
      </div>
      <div id="sacco-hub-body"></div>
    </div>
  `;

  container.querySelectorAll('.sacco-hub-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      hubTab = btn.dataset.hubTab;
      container.querySelectorAll('.sacco-hub-tab').forEach((b) => b.classList.toggle('active', b.dataset.hubTab === hubTab));
      refresh();
    });
  });

  await refresh();
}
