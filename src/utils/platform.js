/**
 * Toggle fullscreen mode safely
 * @returns {Promise<boolean>} The new fullscreen state
 */
export const toggleFullscreenSafe = async () => {
    try {
        if (!document.fullscreenEnabled) {
            return false;
        }

        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            return true;
        }

        await document.exitFullscreen();
        return false;
    } catch (error) {
        console.error('[Platform] Fullscreen toggle failed:', error);
        return false;
    }
};
