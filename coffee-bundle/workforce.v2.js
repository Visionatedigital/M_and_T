// ============================================================
// workforce.v2.js — Payroll table: Salary | SACCO | Loan | Net + expand
// Replace: Coffee management system/src/renderer/features/biz/workforce.js
// ============================================================
import { dataService } from '../../services/dataService.js';

function splitPayroll(gross) {
  const g = Math.round(Number(gross) || 0);
  const sacco = Math.round(g * 0.12);
  const loan = Math.round(g * 0.08);
  const net = g - sacco - loan;
  return { g, sacco, loan, net };
}

function openAddWorkerModal(onSaved) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Add staff member</span>
        <button class="modal-close"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Full name</label>
          <input type="text" class="form-input" id="wf-name" placeholder="e.g. John Kamau">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Department</label>
            <select class="form-select" id="wf-dept">
              <option>Field Operations</option>
              <option>Processing</option>
              <option>Administration</option>
              <option>Logistics</option>
              <option>Security</option>
              <option>Maintenance</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Employment type</label>
            <select class="form-select" id="wf-type">
              <option value="Permanent">Permanent</option>
              <option value="Seasonal">Seasonal</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Monthly salary (UGX)</label>
            <input type="number" class="form-input" id="wf-payroll" placeholder="0" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Role / title</label>
            <input type="text" class="form-input" id="wf-role" placeholder="e.g. Field supervisor">
          </div>
        </div>
        <p id="wf-error" style="color:var(--red-text);font-size:11px;display:none;"></p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="wf-cancel">Cancel</button>
        <button class="btn btn-primary" id="wf-save">
          <span class="material-symbols-outlined">person_add</span> Add staff
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const close = () => document.body.removeChild(backdrop);
  backdrop.querySelector('.modal-close').addEventListener('click', close);
  backdrop.querySelector('#wf-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  backdrop.querySelector('#wf-save').addEventListener('click', async () => {
    const name = backdrop.querySelector('#wf-name').value.trim();
    const department = backdrop.querySelector('#wf-dept').value;
    const type = backdrop.querySelector('#wf-type').value;
    const payroll = parseFloat(backdrop.querySelector('#wf-payroll').value);
    const supervisor = backdrop.querySelector('#wf-role').value.trim();
    const errEl = backdrop.querySelector('#wf-error');

    if (!name || isNaN(payroll) || payroll < 0) {
      errEl.style.display = 'block';
      errEl.textContent = 'Please fill in all required fields.';
      return;
    }
    await dataService.addWorker({ name, department, payroll, type, supervisor });
    close();
    if (onSaved) onSaved();
  });
}

async function renderWorkforce(container) {
  const data = await dataService.getWorkforce();
  const workers = data.departments || [];
  const render = () => renderWorkforce(container);

  const rowsHtml = workers.length
    ? workers
        .map((w, idx) => {
          const { g, sacco, loan, net } = splitPayroll(w.payroll);
          const rid = `w-${w.id ?? idx}`;
          return `
        <tr class="payroll-row-expand payroll-row" data-row="${rid}">
          <td class="strong">${w.name}</td>
          <td class="tabular-nums">${dataService.formatCurrency(g)}</td>
          <td class="tabular-nums" style="color:hsl(152 65% 42%);">${dataService.formatCurrency(sacco)}</td>
          <td class="tabular-nums" style="color:var(--red-text);">${dataService.formatCurrency(loan)}</td>
          <td class="tabular-nums" style="font-weight:700;">${dataService.formatCurrency(net)}</td>
        </tr>
        <tr class="payroll-detail-row" data-detail="${rid}" style="display:none;">
          <td colspan="5">
            <div class="payroll-breakdown">
              <div class="line"><span>Gross</span><span>${dataService.formatCurrency(g)}</span></div>
              <div class="line"><span>− SACCO (12%)</span><span>${dataService.formatCurrency(sacco)}</span></div>
              <div class="line"><span>− Loan (8%)</span><span>${dataService.formatCurrency(loan)}</span></div>
              <div class="net-line"><span>= Net pay</span><span>${dataService.formatCurrency(net)}</span></div>
            </div>
          </td>
        </tr>`;
        })
        .join('')
    : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:28px;">No staff yet. Add staff to build payroll.</td></tr>`;

  container.innerHTML = `
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-end;">
      <div>
        <h1 class="page-title">Workers & payroll</h1>
        <p class="page-subtitle">Salary, SACCO, loan deductions — click a row for breakdown</p>
      </div>
      <button class="btn btn-primary" id="add-worker-btn">
        <span class="material-symbols-outlined">person_add</span> Add staff
      </button>
    </div>

    <div class="kpi-grid" style="margin-bottom:16px;">
      <div class="kpi-card"><div class="kpi-label">Headcount</div><div class="kpi-value">${workers.length || data.totalWorkers}</div></div>
      <div class="kpi-card"><div class="kpi-label">Permanent</div><div class="kpi-value green">${workers.filter((w) => w.type === 'Permanent').length || data.permanent}</div></div>
      <div class="kpi-card"><div class="kpi-label">Seasonal</div><div class="kpi-value">${workers.filter((w) => w.type === 'Seasonal').length || data.seasonal}</div></div>
      <div class="kpi-card gold-border"><div class="kpi-label">Payroll (gross)</div><div class="kpi-value gold">${dataService.formatCurrency(workers.reduce((s, w) => s + splitPayroll(w.payroll).g, 0))}</div></div>
    </div>

    <div class="section-card">
      <div class="card-header">
        <h2 class="card-title">Payroll</h2>
        <span style="font-size:11px;color:var(--text-muted);">${workers.length} rows</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Salary</th>
            <th>SACCO</th>
            <th>Loan</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody id="payroll-tbody">
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;

  container.querySelector('#add-worker-btn')?.addEventListener('click', () => {
    openAddWorkerModal(render);
  });

  container.querySelectorAll('tr.payroll-row').forEach((tr) => {
    tr.addEventListener('click', () => {
      const id = tr.dataset.row;
      const detail = container.querySelector(`tr[data-detail="${id}"]`);
      if (!detail) return;
      const open = detail.style.display === 'none';
      container.querySelectorAll('tr[data-detail]').forEach((r) => {
        r.style.display = 'none';
      });
      detail.style.display = open ? 'table-row' : 'none';
    });
  });
}

export { renderWorkforce };
