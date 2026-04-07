const { app, BrowserWindow, Menu, shell, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) app.quit();

const isDev = !app.isPackaged;

const { setupAutoUpdater, registerUpdateIpc, getUpdater, ensureFeedConfigured, canCheckForUpdates } = require('./update.cjs');
registerUpdateIpc(isDev);

// App icon path — use public/ for the source
const iconPath = path.join(__dirname, '..', 'public', 'icon.png');

let mainWindow;
let splashWindow;
let serverInstance;

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 500,
        height: 350,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    splashWindow.loadFile(path.join(__dirname, 'splash.html'));
    splashWindow.on('closed', () => (splashWindow = null));
}

function createWindow() {
    const appIcon = nativeImage.createFromPath(iconPath);

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: 'M&T Growth Gateway',
        icon: appIcon,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        show: false,
        backgroundColor: '#0f172a',
        // titleBarStyle: 'hiddenInset', // Removed for better Windows compatibility
    });

    // Show window once ready to prevent flickering
    mainWindow.once('ready-to-show', () => {
        if (splashWindow) {
            splashWindow.close();
        }
        mainWindow.show();
        mainWindow.focus();
    });

    // In dev mode, load from Vite dev server
    if (isDev) {
        mainWindow.loadURL('http://localhost:8080');
        // Open DevTools in dev mode
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        // In production, load the built files
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Build application menu
function createMenu() {
    const template = [
        {
            label: 'M&T Gateway',
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                {
                    label: 'Check for Updates…',
                    click: async () => {
                        if (isDev || !app.isPackaged) {
                            dialog.showMessageBox(mainWindow || undefined, {
                                type: 'info',
                                title: 'Updates',
                                message: 'Automatic updates run in the installed desktop app. Use a release build to test updates.',
                            });
                            return;
                        }
                        if (!canCheckForUpdates()) {
                            dialog.showMessageBox(mainWindow || undefined, {
                                type: 'info',
                                title: 'Updates',
                                message:
                                    'No update feed is configured. Set UPDATE_BASE_URL to a full https:// URL (not a path like /app) or set GITHUB_OWNER and GITHUB_REPO in .env beside the app. Or rebuild with electron-builder publish so app-update.yml is included.',
                            });
                            return;
                        }
                        try {
                            ensureFeedConfigured();
                            await getUpdater().checkForUpdates();
                            dialog.showMessageBox(mainWindow || undefined, {
                                type: 'info',
                                title: 'Updates',
                                message: 'If a newer version exists, it will download in the background. You will be prompted when it is ready to install.',
                            });
                        } catch (e) {
                            dialog.showErrorBox('Update check failed', e.message || String(e));
                        }
                    },
                },
                { type: 'separator' },
                {
                    label: 'Database Location',
                    click: () => {
                        const dbPath = path.join(app.getPath('userData'), 'mt_growth.db');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Database Location',
                            message: `Your database is stored at:\n\n${dbPath}`,
                            buttons: ['OK', 'Open Folder'],
                        }).then(result => {
                            if (result.response === 1) {
                                shell.showItemInFolder(dbPath);
                            }
                        });
                    }
                },
                { type: 'separator' },
                { role: 'quit' },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
                ...(isDev ? [{ type: 'separator' }, { role: 'toggleDevTools' }] : []),
            ],
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { role: 'close' },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(async () => {
    console.log('🚀 Starting M&T Growth Gateway Desktop...');

    // Create splash screen immediately
    createSplashWindow();

    // Set Dock icon on macOS
    if (process.platform === 'darwin' && app.dock) {
        const dockIcon = nativeImage.createFromPath(iconPath);
        app.dock.setIcon(dockIcon);
    }

    // ── Load and parse .env early ──
    const envFileName = '.env';
    // Search paths:
    // 1. Resources folder (standard for asar)
    // 2. App root folder (beside the .exe - where extraFiles goes on Windows)
    // 3. Project root (for development)
    const resourcesEnvPath = path.join(process.resourcesPath, envFileName);
    const rootEnvPath = path.join(path.dirname(process.execPath), envFileName);
    const devEnvPath = path.join(__dirname, '..', envFileName);
    
    let envPath = devEnvPath;
    if (!isDev) {
        if (fs.existsSync(resourcesEnvPath)) {
            envPath = resourcesEnvPath;
        } else if (fs.existsSync(rootEnvPath)) {
            envPath = rootEnvPath;
        }
    }

    console.log(`📂 Loading environment from: ${envPath}`);
    
    // Explicitly load dotenv with the found path to populate process.env
    require('dotenv').config({ path: envPath });

    let useSupabase = process.env.VITE_USE_SUPABASE === 'true';

    // Must match src/services/api.ts (VITE_REMOTE_API_URL || http://localhost:5000) or login fails in the packaged app.
    function getRemoteApiPort() {
        const fromEnv = process.env.VITE_REMOTE_API_URL;
        if (fromEnv) {
            try {
                const p = new URL(fromEnv).port;
                if (p) return Number(p);
            } catch (_) { /* ignore */ }
        }
        const fromPort = Number(process.env.PORT);
        if (Number.isFinite(fromPort) && fromPort > 0) return fromPort;
        return 5000;
    }

    console.log(`🌐 Mode: ${useSupabase ? 'SUPABASE (Remote DB)' : 'LOCAL (SQLite)'}`);

    try {
        if (useSupabase) {
            // ── Connect directly to Supabase via server/index.cjs ──
            const remoteServer = require('../server/index.cjs');
            const remotePort = getRemoteApiPort();
            serverInstance = await remoteServer.startServer(remotePort);
            console.log(`✅ Remote (Supabase) backend server started on port ${remotePort} (must match VITE_REMOTE_API_URL / default in api.ts)`);
        } else {
            // ── Local Mode: Start embedded SQLite server (on port 3000) ──
            const { startServer: startLocalServer } = require('./server.cjs');
            serverInstance = await startLocalServer(app.getPath('userData'));
            console.log('✅ Local SQLite backend server started on port 3000');
        }
    } catch (err) {
        console.error('❌ Failed to start backend server:', err);
        dialog.showErrorBox('Server Error', `Failed to start the application server:\n${err.message}`);
        app.quit();
        return;
    }

    createMenu();
    createWindow();

    setupAutoUpdater({
        isDev,
        getMainWindow: () => mainWindow,
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    if (serverInstance && serverInstance.close) {
        serverInstance.close();
        console.log('🛑 Server stopped');
    }
});
