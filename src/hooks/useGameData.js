import { useState, useEffect } from 'react';
import { loadSkills, loadTheme, loadStats, loadSkillsAsync, loadThemeAsync, loadStatsAsync, saveGameData } from '../utils/saveSystem';

export const useGameData = (currentProfile) => {
    // Initialize state from storage based on current profile
    // Start with sync version for immediate render, then load async version
    const [skills, setSkills] = useState(() => loadSkills(currentProfile));
    const [activeTheme, setActiveTheme] = useState(() => loadTheme(currentProfile));
    const [stats, setStats] = useState(() => loadStats(currentProfile));
    const [isLoading, setIsLoading] = useState(true);

    // Load data asynchronously on mount and profile change
    useEffect(() => {
        let isMounted = true;
        
        const loadData = async () => {
            try {
                const [loadedSkills, loadedTheme, loadedStats] = await Promise.all([
                    loadSkillsAsync(currentProfile),
                    loadThemeAsync(currentProfile),
                    loadStatsAsync(currentProfile)
                ]);
                
                if (isMounted) {
                    setSkills(loadedSkills);
                    setActiveTheme(loadedTheme);
                    setStats(loadedStats);
                    setIsLoading(false);
                }
            } catch (error) {
                console.warn('Failed to load game data:', error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        
        loadData();
        
        return () => {
            isMounted = false;
        };
    }, [currentProfile]);

    // Persist game data whenever it changes (debounced)
    useEffect(() => {
        if (isLoading) return; // Don't save during initial load
        
        const timeoutId = setTimeout(() => {
            saveGameData(currentProfile, skills, activeTheme, stats);
        }, 500); // Debounce saves by 500ms
        
        return () => clearTimeout(timeoutId);
    }, [skills, activeTheme, stats, currentProfile, isLoading]);

    return {
        skills,
        setSkills,
        activeTheme,
        setActiveTheme,
        stats,
        setStats,
        isLoading
    };
};
