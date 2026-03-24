// ============================================================
// app.v2.js — Top bar (title · search · notifications · user) + Overview landing
// Replace: Coffee management system/src/renderer/app.js
// ============================================================
import { dataService } from './services/dataService.js';
import { renderOwnerOverview } from './features/core/ownerOverview.js';
import { renderFarmOverview } from './features/core/farmOverview.js';
import { renderFieldOps } from './features/ops/fieldOps.js';
import { renderCropHealth } from './features/ops/cropHealth.js';
import { renderHarvestProcessing } from './features/ops/harvestProcessing.js';
import { renderNursery } from './features/ops/nursery.js';
import { renderInventory } from './features/ops/inventory.js';
import { renderSalesFinance } from './features/biz/salesFinance.js';
import { renderAIInsights } from './features/core/aiinsights.js';
import { renderReports } from './features/core/reports.js';
import { renderSettings } from './features/core/settings.js';
import { renderSaccoHub } from './features/sacco/saccoHub.js';
import { renderLodgeDashboard } from './features/lodge/lodgeDashboard.js';
import { renderSaccoReports, renderLodgeReports } from './features/core/moduleReports.js';

const DOORS = {
  FARM_SACCO: 'farm-sacco',
  LODGE: 'lodge',
};

const FARM_SACCO_NAV = [
  { id: 'owner-overview', label: 'Overview', icon: 'home', render: renderOwnerOverview },
  { id: 'farm-overview', label: 'Farm Overview', icon: 'cottage', render: renderFarmOverview },
  { id: 'field-ops', label: 'Field Operations', icon: 'agriculture', render: renderFieldOps },
  { id: 'crop-health', label: 'Crop Health', icon: 'health_and_safety', render: renderCropHealth },
  { id: 'harvest-processing', label: 'Harvest & Processing', icon: 'grain', render: renderHarvestProcessing },
  { id: 'nursery', label: 'Nursery', icon: 'potted_plant', render: renderNursery },
  { id: 'inventory', label: 'Inventory', icon: 'inventory_2', render: renderInventory },
  { id: 'sales-finance', label: 'Farm Finance', icon: 'payments', render: renderSalesFinance },
  { id: 'sacco-dashboard', label: 'SACCO', icon: 'account_balance', render: renderSaccoHub },
  { id: 'aiinsights', label: 'AI Insights', icon: 'auto_awesome', render: renderAIInsights },
  { id: 'reports', label: 'Farm Reports', icon: 'description', render: renderReports },
  { id: 'sacco-reports', label: 'SACCO Reports', icon: 'query_stats', render: renderSaccoReports },
  { id: 'settings', label: 'Settings', icon: 'settings', render: renderSettings },
];

const LODGE_NAV = [
  { id: 'lodge-dashboard', label: 'Lodge Dashboard', icon: 'holiday_village', render: renderLodgeDashboard },
  { id: 'lodge-reports', label: 'Lodge Reports', icon: 'description', render: renderLodgeReports },
  { id: 'settings', label: 'Settings', icon: 'settings', render: renderSettings },
];

let currentDoor = null;
let currentPage = null;
let currentCurrency = 'UGX';

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem('estate_settings')) || {};
  } catch {
    return {};
  }
}

function saveSettings(data) {
  const existing = getSettings();
  localStorage.setItem('estate_settings', JSON.stringify({ ...existing, ...data }));
}

function applyTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function getNavForDoor() {
  if (currentDoor === DOORS.LODGE) return LODGE_NAV;
  if (currentDoor === DOORS.FARM_SACCO) return FARM_SACCO_NAV;
  return [];
}

function setShellVisibility(visible) {
  const sidebar = document.getElementById('sidebar');
  const toolbar = document.getElementById('toolbar');
  const mainArea = document.getElementById('main-area');
  const footer = document.querySelector('#main-area footer');
  if (!sidebar || !toolbar || !mainArea || !footer) return;
  sidebar.style.display = visible ? 'flex' : 'none';
  toolbar.style.display = visible ? 'flex' : 'none';
  footer.style.display = visible ? 'flex' : 'none';
  mainArea.style.marginLeft = visible ? '' : '0';
}

function renderDoorSelector() {
  const workspace = document.getElementById('workspace');
  if (!workspace) return;
  setShellVisibility(false);
  workspace.innerHTML = `
    <div style="height:calc(100vh - 56px);display:flex;align-items:center;justify-content:center;">
      <div style="max-width:920px;width:100%;">
        <div style="text-align:center;margin-bottom:28px;">
          <h1 class="page-title" style="font-size:34px;">Nyakamenta Estate OS</h1>
          <p class="page-subtitle" style="font-size:14px;">Choose where you want to work today.</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <button class="section-card" id="door-farm-sacco" style="text-align:left;padding:26px;cursor:pointer;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
              <span class="material-symbols-outlined" style="font-size:30px;color:var(--green-text);">agriculture</span>
              <h2 style="font-size:20px;">Farm + SACCO</h2>
            </div>
            <p style="color:var(--text-secondary);font-size:12px;">Robusta operations, harvest/sales, and SACCO members/savings/loans.</p>
          </button>
          <button class="section-card" id="door-lodge" style="text-align:left;padding:26px;cursor:pointer;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
              <span class="material-symbols-outlined" style="font-size:30px;color:var(--gold-text);">holiday_village</span>
              <h2 style="font-size:20px;">Lodge</h2>
            </div>
            <p style="color:var(--text-secondary);font-size:12px;">Lodge occupancy, bookings, and lodge-only finance tracking.</p>
          </button>
        </div>
      </div>
    </div>
  `;
  workspace.querySelector('#door-farm-sacco')?.addEventListener('click', () => enterDoor(DOORS.FARM_SACCO));
  workspace.querySelector('#door-lodge')?.addEventListener('click', () => enterDoor(DOORS.LODGE));
}

function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  const items = getNavForDoor();
  const mainNav = items.filter((item) => !['reports', 'sacco-reports', 'lodge-reports', 'settings'].includes(item.id));
  const bottomNav = items.filter((item) => ['reports', 'sacco-reports', 'lodge-reports', 'settings'].includes(item.id));

  nav.innerHTML =
    mainNav
      .map(
        (item) => `
    <div class="nav-item ${item.id === currentPage ? 'active' : ''}" data-page="${item.id}">
      <span class="material-symbols-outlined">${item.icon}</span>
      <span>${item.label}</span>
    </div>
  `
      )
      .join('') +
    `
    <div style="height:1px;background:var(--border-subtle);margin:10px 0;"></div>
  ` +
    bottomNav
      .map(
        (item) => `
    <div class="nav-item ${item.id === currentPage ? 'active' : ''}" data-page="${item.id}">
      <span class="material-symbols-outlined">${item.icon}</span>
      <span>${item.label}</span>
    </div>
  `
      )
      .join('');

  nav.querySelectorAll('.nav-item[data-page]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });
}

function wireGlobalSearch(input) {
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('#sidebar-nav .nav-item[data-page]').forEach((el) => {
      const text = el.textContent.toLowerCase();
      el.style.display = !q || text.includes(q) ? '' : 'none';
    });
  });
}

async function buildToolbar() {
  const tb = document.getElementById('toolbar');
  if (!tb || !currentDoor) return;
  const settings = getSettings();
  const meta = await dataService.getMeta();
  const managerName = settings.managerName || meta.user?.name || 'S. Mbugua';
  const managerRole = settings.managerRole || meta.user?.role || 'Plant Manager';
  const initials = managerName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const isDark = (localStorage.getItem('theme') || 'dark') === 'dark';
  currentCurrency = 'UGX';
  const areaLabel = currentDoor === DOORS.FARM_SACCO ? 'Farm + SACCO' : 'Lodge';

  const navItems = getNavForDoor();
  const pageMeta = navItems.find((item) => item.id === currentPage);
  const pageTitle = pageMeta?.label || 'Dashboard';

  tb.className = 'top-bar';
  tb.innerHTML = `
    <div class="top-bar-title" title="${pageTitle}">${pageTitle}</div>
    <div class="top-bar-center">
      <div class="top-bar-search">
        <span class="material-symbols-outlined">search</span>
        <input type="search" id="global-search" placeholder="Filter sidebar modules…" autocomplete="off" />
      </div>
    </div>
    <div class="top-bar-right">
      <div class="toolbar-selector" title="Current area">
        <span class="sel-label">Area</span>
        <span class="sel-value">${areaLabel}</span>
      </div>
      <button class="btn btn-ghost btn-sm" id="switch-door-btn" type="button">
        <span class="material-symbols-outlined" style="font-size:14px;">door_open</span>
        Switch door
      </button>
      <button type="button" class="icon-btn has-dot" id="notif-btn" title="Notifications">
        <span class="material-symbols-outlined">notifications</span>
        <span class="notif-dot" aria-hidden="true"></span>
      </button>
      <button type="button" class="icon-btn" id="theme-toggle-btn" title="${isDark ? 'Light mode' : 'Dark mode'}">
        <span class="material-symbols-outlined">${isDark ? 'light_mode' : 'dark_mode'}</span>
      </button>
      <div class="toolbar-user" title="Current user">
        <div class="toolbar-user-avatar">${initials}</div>
        <div class="toolbar-user-info">
          <div class="tu-name">${managerName}</div>
          <div class="tu-role">${managerRole.toUpperCase().slice(0, 12)}</div>
        </div>
      </div>
    </div>
  `;

  wireGlobalSearch(tb.querySelector('#global-search'));

  tb.querySelector('#switch-door-btn')?.addEventListener('click', () => {
    currentDoor = null;
    currentPage = null;
    localStorage.removeItem('estate_last_door');
    tb.className = '';
    renderDoorSelector();
  });

  tb.querySelector('#notif-btn')?.addEventListener('click', () => {
    const el = tb.querySelector('#notif-btn .notif-dot');
    if (el) el.style.opacity = el.style.opacity === '0' ? '1' : '0';
  });

  tb.querySelector('#theme-toggle-btn')?.addEventListener('click', async () => {
    const html = document.documentElement;
    const nowDark = html.getAttribute('data-theme') !== 'light';
    const next = nowDark ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    await buildToolbar();
  });
}

async function enterDoor(door) {
  currentDoor = door;
  localStorage.setItem('estate_last_door', door);
  currentPage = door === DOORS.LODGE ? 'lodge-dashboard' : 'owner-overview';
  setShellVisibility(true);
  buildSidebar();
  await buildToolbar();
  await renderPage();
}

async function navigate(pageId) {
  currentPage = pageId;
  buildSidebar();
  await buildToolbar();
  await renderPage();
  const workspace = document.getElementById('workspace');
  if (workspace) workspace.scrollTop = 0;
}

async function renderPage() {
  const workspace = document.getElementById('workspace');
  if (!workspace) return;
  const nav = getNavForDoor();
  const page = nav.find((item) => item.id === currentPage);

  if (!page) {
    workspace.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Module Not Found</h1>
        <p class="page-subtitle">The selected module is not available.</p>
      </div>
    `;
    return;
  }

  workspace.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);">Loading...</div>';
  await page.render(workspace);
}

function initFooter() {
  const footer = document.getElementById('footer-time');
  if (footer) {
    const tick = () => {
      const now = new Date();
      footer.textContent = 'System Online · ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };
    tick();
    setInterval(tick, 30000);
  }

  const syncBtn = document.getElementById('sync-btn');
  if (!syncBtn) return;
  syncBtn.addEventListener('click', async () => {
    const icon = syncBtn.querySelector('.material-symbols-outlined');
    if (icon) icon.classList.add('spinning');
    const result = await dataService.sync();
    if (icon) icon.classList.remove('spinning');
    syncBtn.style.color = result.success ? 'var(--green-bright)' : 'var(--red-text)';
    setTimeout(() => {
      syncBtn.style.color = '';
    }, 2000);
  });
}

async function init() {
  applyTheme();
  saveSettings({ currency: 'UGX' });
  initFooter();

  if (window.electronAPI?.onNavigate) {
    window.electronAPI.onNavigate((pageId) => {
      if (currentDoor) navigate(pageId);
    });
  }

  if (window.electronAPI?.onInitError) {
    window.electronAPI.onInitError((err) => {
      const workspace = document.getElementById('workspace');
      if (!workspace) return;
      workspace.innerHTML = `
        <div style="padding:40px; color:var(--red-text); border:1px solid var(--red); border-radius:8px; background:var(--red-bg); margin:20px;">
          <h2 style="margin-bottom:10px;">Backend Initialization Failed</h2>
          <p style="font-size:13px; margin-bottom:15px;">The database or system failed to start correctly.</p>
          <pre style="background:rgba(0,0,0,0.3); padding:10px; border-radius:4px; font-size:11px; overflow-x:auto;">${err}</pre>
        </div>
      `;
    });
  }

  const lastDoor = localStorage.getItem('estate_last_door');
  if (lastDoor && [DOORS.FARM_SACCO, DOORS.LODGE].includes(lastDoor)) {
    await enterDoor(lastDoor);
  } else {
    renderDoorSelector();
  }
}

document.addEventListener('DOMContentLoaded', init);
