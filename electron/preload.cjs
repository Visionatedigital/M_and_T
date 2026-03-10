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
});
