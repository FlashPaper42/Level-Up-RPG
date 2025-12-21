const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    isElectron: true,
    saveData: (filename, data) => ipcRenderer.invoke('save-data', filename, data),
    loadData: (filename) => ipcRenderer.invoke('load-data', filename),
    toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
    // Profile data operations
    saveProfileData: (profileId, data) => ipcRenderer.invoke('save-profile-data', profileId, data),
    loadProfileData: (profileId) => ipcRenderer.invoke('load-profile-data', profileId),
    // Profile settings (names, current profile, parent status)
    saveProfileSettings: (data) => ipcRenderer.invoke('save-profile-settings', data),
    loadProfileSettings: () => ipcRenderer.invoke('load-profile-settings'),
    // Get data directory path (for parent editor)
    getDataDirectory: () => ipcRenderer.invoke('get-data-directory')
});
