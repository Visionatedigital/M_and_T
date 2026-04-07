/**
 * Auto-update via electron-updater (NSIS/AppImage/dmg publish metadata from electron-builder).
 *
 * Configure ONE of:
 * - UPDATE_BASE_URL — full HTTPS URL to a folder containing latest.yml (and installers). Example:
 *   https://github.com/Visionatedigital/M_and_T/releases/latest/download/
 *   Must NOT be a bare path like /app — that becomes file:/// and breaks updates.
 * - GITHUB_OWNER + GITHUB_REPO — GitHub Releases provider (set GH_TOKEN when running electron-builder publish).
 *
 * If neither is set, electron-updater falls back to resources/app-update.yml (only when built with publish).
 *
 * Packaged app reads the same vars from .env next to the executable (see main.cjs).
 */

const fs = require('fs');
const path = require('path');
const { ipcMain, app } = require('electron');

const UPDATE_CHANNEL = 'update-status';

/** Generic feed must be http(s); paths like /app resolve to file:// and break updates. */
function isValidHttpUpdateUrl(s) {
    if (!s || typeof s !== 'string') return false;
    try {
        const u = new URL(s.trim());
        return u.protocol === 'https:' || u.protocol === 'http:';
    } catch {
        return false;
    }
}

function getEmbeddedAppUpdatePath() {
    return path.join(process.resourcesPath, 'app-update.yml');
}

function hasEmbeddedUpdateConfig() {
    return app.isPackaged && fs.existsSync(getEmbeddedAppUpdatePath());
}

/**
 * electron-updater sometimes puts the full HTTP body + headers in err.message (e.g. GitHub 404 HTML/plain).
 * Only send a short, user-safe string to the renderer toast.
 * @param {Error & { statusCode?: number }} err
 */
function sanitizeUpdaterError(err) {
    const code = err && (err.statusCode ?? err.status);
    const raw = String(err?.message || err || 'Unknown error');
    const firstLine = raw.split(/\n/)[0].trim();

    if (code === 404 || /\b404\b/i.test(firstLine) || /Not Found/i.test(raw)) {
        return 'No update metadata (latest.yml) found on the server. Publish a release that includes latest.yml and the installer, or fix UPDATE_BASE_URL / GITHUB_OWNER + GITHUB_REPO.';
    }
    if (code === 403 || /\b403\b/i.test(raw)) {
        return 'Update check was refused (403). For private repos, configure access; for GitHub, confirm the release exists.';
    }
    // Huge blob with response headers / stack — don't surface to UI
    if (
        raw.length > 350 ||
        /^(GET|HTTP\/|content-type:|server:|x-github-)/im.test(raw) ||
        /createHttpError|httpExecutor|SimpleURLLoaderWrapper/i.test(raw)
    ) {
        return code
            ? `Update check failed (HTTP ${code}). Ensure GitHub Releases has latest.yml and the Windows installer, or set GITHUB_OWNER + GITHUB_REPO correctly in .env.`
            : 'Update check failed. Ensure the latest release includes latest.yml and the installer, or correct your .env update settings.';
    }
    return raw.length > 280 ? `${raw.slice(0, 277)}…` : raw;
}

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
/** True if setFeedURL was called with GitHub or a valid generic URL */
let lastEnvFeedOk = false;

/** @param {import('electron-updater').AppUpdater} autoUpdater */
function configureFeedUrl(autoUpdater) {
    lastEnvFeedOk = false;
    const generic = process.env.UPDATE_BASE_URL;
    const ghOwner = process.env.GITHUB_OWNER;
    const ghRepo = process.env.GITHUB_REPO;

    if (ghOwner && ghRepo) {
        autoUpdater.setFeedURL({ provider: 'github', owner: ghOwner, repo: ghRepo });
        console.log(`[updater] Feed URL (github): ${ghOwner}/${ghRepo}`);
        lastEnvFeedOk = true;
        return;
    }
    if (generic && isValidHttpUpdateUrl(generic)) {
        const url = generic.replace(/\/?$/, '/');
        autoUpdater.setFeedURL({ provider: 'generic', url });
        console.log(`[updater] Feed URL (generic): ${url}`);
        lastEnvFeedOk = true;
        return;
    }
    if (generic && String(generic).trim()) {
        console.warn(
            '[updater] UPDATE_BASE_URL must be a full URL starting with https:// or http:// (invalid values resolve to file:// and break updates). Ignoring.'
        );
    } else if (!ghOwner || !ghRepo) {
        console.warn('[updater] No GITHUB_OWNER/GITHUB_REPO or valid UPDATE_BASE_URL — will use embedded app-update.yml if present.');
    }
}

function ensureFeedConfigured() {
    if (feedConfigured) return;
    configureFeedUrl(getUpdater());
    feedConfigured = true;
}

/**
 * Packaged app can check for updates if env feed is valid or builder embedded app-update.yml exists.
 */
function canCheckForUpdates() {
    if (!app.isPackaged) return false;
    ensureFeedConfigured();
    return lastEnvFeedOk || hasEmbeddedUpdateConfig();
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

    if (!lastEnvFeedOk && !hasEmbeddedUpdateConfig()) {
        console.log('[updater] Skipped: no valid UPDATE_BASE_URL / GitHub env and no resources/app-update.yml (build with publish or fix .env).');
        return;
    }

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
        console.error('[updater] Error (full):', err);
        sendUpdateStatus(getMainWindow(), { phase: 'error', message: sanitizeUpdaterError(err) });
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
        autoUpdater.checkForUpdates().catch((e) => console.error('[updater] checkForUpdates:', e));
    }, 8000);
}

function registerUpdateIpc(isDev) {
    ipcMain.handle('check-for-updates', async () => {
        if (isDev || !app.isPackaged) {
            return { ok: false, skipped: true, message: 'Updates run in packaged app only' };
        }
        if (!canCheckForUpdates()) {
            return {
                ok: false,
                skipped: true,
                message:
                    'No update feed configured. Set UPDATE_BASE_URL to a full https:// URL in .env, or GITHUB_OWNER and GITHUB_REPO, or rebuild with electron-builder publish so app-update.yml is shipped.',
            };
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
            return { ok: false, error: sanitizeUpdaterError(e) };
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

module.exports = { setupAutoUpdater, registerUpdateIpc, getUpdater, ensureFeedConfigured, canCheckForUpdates };
