const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    isElectron: true,
    saveData: (filename, data) => ipcRenderer.invoke('save-data', filename, data),
    loadData: (filename) => ipcRenderer.invoke('load-data', filename),
    toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen')
});
