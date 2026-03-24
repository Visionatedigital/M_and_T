const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    isElectron: true,
    // File system operations for exports
    saveFile: (data) => ipcRenderer.invoke('save-file', data),
    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    // Database path
    getDbPath: () => ipcRenderer.invoke('get-db-path'),
    /** Desktop auto-update (packaged app only) */
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    /** Subscribe to auto-update UI events from main process */
    onUpdateStatus: (callback) => {
        if (typeof callback !== 'function') return () => {};
        const channel = 'update-status';
        const listener = (_event, data) => {
            try {
                callback(data);
            } catch (e) {
                console.error('onUpdateStatus callback', e);
            }
        };
        ipcRenderer.on(channel, listener);
        return () => ipcRenderer.removeListener(channel, listener);
    },
    /** Quit and install downloaded update (packaged app) */
    quitAndInstall: () => ipcRenderer.invoke('update-quit-and-install'),
});
