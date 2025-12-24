/**
 * Platform Utilities
 * handles differences between Electron and Browser environments safely.
 */

/**
 * Check if the application is running in Electron
 * @returns {boolean}
 */
export const isElectron = () => {
    return typeof window !== 'undefined' &&
        window.electron &&
        window.electron.isElectron;
};

/**
 * Toggle fullscreen mode safely
 * @returns {Promise<boolean>} The new fullscreen state
 */
export const toggleFullscreenSafe = async () => {
    try {
        if (isElectron() && window.electron.toggleFullscreen) {
            console.log('[Platform] Using Electron IPC for fullscreen');
            return await window.electron.toggleFullscreen();
        } else {
            console.log('[Platform] Using Browser Fullscreen API');
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                return true;
            } else {
                await document.exitFullscreen();
                return false;
            }
        }
    } catch (error) {
        console.error('[Platform] Fullscreen toggle failed:', error);
        return false;
    }
};

/**
 * Save file content (Electron only, generic wrapper)
 * @param {string} filename 
 * @param {string|Object} content 
 */
export const saveFileSafe = async (filename, content) => {
    if (isElectron() && window.electron.saveFile) {
        return window.electron.saveFile(filename, content);
    }
    // Browser fallback (optional, maybe no-op or localStorage)
    console.warn('[Platform] saveFile not supported in browser');
};
