const { app, BrowserWindow, Menu, shell, dialog, nativeImage } = require('electron');
const path = require('path');
const { startServer } = require('./server.cjs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) app.quit();

const isDev = !app.isPackaged;

// App icon path — use build/ for the high-res version
const iconPath = path.join(__dirname, '..', 'build', 'icon.png');

let mainWindow;
let serverInstance;

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
        titleBarStyle: 'hiddenInset',
    });

    // Show window once ready to prevent flickering
    mainWindow.once('ready-to-show', () => {
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
    console.log(`📁 User data path: ${app.getPath('userData')}`);

    // Set Dock icon on macOS (critical for dev mode — production builds use electron-builder)
    if (process.platform === 'darwin' && app.dock) {
        const dockIcon = nativeImage.createFromPath(iconPath);
        app.dock.setIcon(dockIcon);
        console.log('🎨 Dock icon set');
    }

    // ── Read .env to determine mode ──
    // Parse .env manually (no dotenv dependency needed)
    const fs = require('fs');
    let remoteMode = false;
    try {
        const envPath = path.join(__dirname, '..', '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/VITE_REMOTE_MODE\s*=\s*(\w+)/);
        remoteMode = match && match[1] === 'true';
    } catch (e) {
        // No .env file — default to local mode
    }

    console.log(`🌐 Mode: ${remoteMode ? 'REMOTE (shared server)' : 'LOCAL (SQLite)'}`);

    if (!remoteMode) {
        // ── Local Mode: Start embedded Express + SQLite server ──
        try {
            serverInstance = await startServer(app.getPath('userData'));
            console.log('✅ Local backend server started successfully');
        } catch (err) {
            console.error('❌ Failed to start backend server:', err);
            dialog.showErrorBox('Server Error', `Failed to start the application server:\n${err.message}`);
            app.quit();
            return;
        }
    } else {
        // ── Remote Mode: No local server needed ──
        console.log('☁️  Remote mode — desktop app will connect to shared server');
        console.log('   The local SQLite server will NOT be started.');
    }

    createMenu();
    createWindow();
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
