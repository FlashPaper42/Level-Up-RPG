import { useState, useEffect, useCallback } from 'react';
import {
    getBGMManager, setSfxVolume, playClick
} from '../utils/soundManager';

export const useAudio = () => {
    // Initialize volume from local storage or default to 0.3
    const [bgmVol, setBgmVol] = useState(() => {
        const saved = localStorage.getItem('heroBgmVol');
        return saved ? parseFloat(saved) : 0.3;
    });

    const [sfxVol, setSfxVol] = useState(() => {
        const saved = localStorage.getItem('heroSfxVol');
        return saved ? parseFloat(saved) : 0.3;
    });

    // Initialize sound manager on mount
    useEffect(() => {
        getBGMManager().setVolume(bgmVol);
        setSfxVolume(sfxVol);
    }, []); // Run once on mount

    // Update BGM volume when state changes
    useEffect(() => {
        getBGMManager().setVolume(bgmVol);
        localStorage.setItem('heroBgmVol', bgmVol);
    }, [bgmVol]);

    // Custom setter for SFX volume to update sound manager immediately
    const setSfxVolState = useCallback((val) => {
        setSfxVol(val);
        setSfxVolume(val);
        localStorage.setItem('heroSfxVol', val);
        if (val > 0) playClick();
    }, []);

    // Ensure SFX volume is synced on mount/updates (redundant but safe)
    useEffect(() => {
        setSfxVolume(sfxVol);
        localStorage.setItem('heroSfxVol', sfxVol);
    }, [sfxVol]);

    return {
        bgmVol,
        setBgmVol,
        sfxVol,
        setSfxVol: setSfxVolState
    };
};
