/**
 * Auto-update via electron-updater (NSIS/AppImage/dmg publish metadata from electron-builder).
 *
 * Configure ONE of:
 * - UPDATE_BASE_URL — generic HTTPS folder containing latest.yml (and installers). Trailing slash optional.
 * - GITHUB_OWNER + GITHUB_REPO — publish to GitHub Releases (set GH_TOKEN when running electron-builder publish).
 *
 * Packaged app reads the same vars from .env next to the executable (see main.cjs).
 */

const { ipcMain, app } = require('electron');

const UPDATE_CHANNEL = 'update-status';

/** @param {import('electron').BrowserWindow | null | undefined} win */
function sendUpdateStatus(win, payload) {
    if (!win || win.isDestroyed()) return;
    try {
        win.webContents.send(UPDATE_CHANNEL, payload);
    } catch (e) {
        console.warn('[updater] send to renderer failed:', e.message);
    }
}

function getUpdater() {
    return require('electron-updater').autoUpdater;
}

let feedConfigured = false;

/** @param {import('electron-updater').AppUpdater} autoUpdater */
function configureFeedUrl(autoUpdater) {
    const generic = process.env.UPDATE_BASE_URL;
    const ghOwner = process.env.GITHUB_OWNER;
    const ghRepo = process.env.GITHUB_REPO;

    if (generic) {
        const url = generic.replace(/\/?$/, '/');
        autoUpdater.setFeedURL({ provider: 'generic', url });
        console.log(`[updater] Feed URL (generic): ${url}`);
    } else if (ghOwner && ghRepo) {
        autoUpdater.setFeedURL({ provider: 'github', owner: ghOwner, repo: ghRepo });
        console.log(`[updater] Feed URL (github): ${ghOwner}/${ghRepo}`);
    } else {
        console.warn('[updater] No UPDATE_BASE_URL or GITHUB_OWNER/GITHUB_REPO — set in .env for auto-update');
    }
    feedConfigured = true;
}

function ensureFeedConfigured() {
    if (feedConfigured) return;
    configureFeedUrl(getUpdater());
}

/**
 * @param {{ isDev: boolean, getMainWindow: () => import('electron').BrowserWindow | null }} opts
 */
function setupAutoUpdater(opts) {
    const { isDev, getMainWindow } = opts;

    if (isDev || !app.isPackaged) {
        console.log('[updater] Skipped (development or unpackaged)');
        return;
    }

    const autoUpdater = getUpdater();
    ensureFeedConfigured();

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = false;

    let lastProgressPct = -1;

    autoUpdater.on('checking-for-update', () => {
        console.log('[updater] Checking for update…');
        sendUpdateStatus(getMainWindow(), { phase: 'checking' });
    });

    autoUpdater.on('update-available', (info) => {
        console.log('[updater] Update available:', info.version);
        const notes =
            typeof info.releaseNotes === 'string'
                ? info.releaseNotes
                : Array.isArray(info.releaseNotes) && info.releaseNotes[0]?.note
                  ? String(info.releaseNotes[0].note)
                  : undefined;
        sendUpdateStatus(getMainWindow(), {
            phase: 'available',
            version: info.version,
            releaseNotes: notes,
        });
    });

    autoUpdater.on('update-not-available', () => {
        console.log('[updater] App is up to date');
        sendUpdateStatus(getMainWindow(), { phase: 'not-available' });
    });

    autoUpdater.on('error', (err) => {
        console.error('[updater] Error:', err.message);
        sendUpdateStatus(getMainWindow(), { phase: 'error', message: err.message || String(err) });
    });

    autoUpdater.on('download-progress', (p) => {
        const pct = Math.round(p.percent ?? 0);
        if (pct !== lastProgressPct && (pct % 5 === 0 || pct >= 95 || pct === 0)) {
            lastProgressPct = pct;
            console.log(`[updater] Download ${pct}%`);
        }
        sendUpdateStatus(getMainWindow(), {
            phase: 'downloading',
            percent: p.percent,
            transferred: p.transferred,
            total: p.total,
        });
    });

    autoUpdater.on('update-downloaded', (info) => {
        console.log('[updater] Update downloaded:', info.version);
        sendUpdateStatus(getMainWindow(), {
            phase: 'downloaded',
            version: info.version,
        });
    });

    setTimeout(() => {
        autoUpdater.checkForUpdates().catch((e) => console.error('[updater] checkForUpdates:', e.message));
    }, 8000);
}

function registerUpdateIpc(isDev) {
    ipcMain.handle('check-for-updates', async () => {
        if (isDev || !app.isPackaged) {
            return { ok: false, skipped: true, message: 'Updates run in packaged app only' };
        }
        try {
            ensureFeedConfigured();
            const autoUpdater = getUpdater();
            const result = await autoUpdater.checkForUpdates();
            return {
                ok: true,
                version: result?.updateInfo?.version,
                releaseDate: result?.updateInfo?.releaseDate,
            };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    });

    ipcMain.handle('update-quit-and-install', () => {
        if (isDev || !app.isPackaged) return { ok: false };
        try {
            getUpdater().quitAndInstall(false, true);
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    });
}

module.exports = { setupAutoUpdater, registerUpdateIpc, getUpdater, ensureFeedConfigured };
