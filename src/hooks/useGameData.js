import { useState, useEffect } from 'react';
import { loadSkills, loadTheme, loadStats, getStorageKey } from '../utils/saveSystem';

export const useGameData = (currentProfile) => {
    // Initialize state from storage based on current profile
    // Note: Assuming window.location.reload() functionality on profile switch, 
    // these initializers only run once per session effectively.

    const [skills, setSkills] = useState(() => loadSkills(currentProfile));
    const [activeTheme, setActiveTheme] = useState(() => loadTheme(currentProfile));
    const [stats, setStats] = useState(() => loadStats(currentProfile));

    // Persist game data whenever it changes
    useEffect(() => {
        const dataToSave = { skills, theme: activeTheme, stats };
        localStorage.setItem(getStorageKey(currentProfile), JSON.stringify(dataToSave));
    }, [skills, activeTheme, stats, currentProfile]);

    return {
        skills,
        setSkills,
        activeTheme,
        setActiveTheme,
        stats,
        setStats
    };
};
