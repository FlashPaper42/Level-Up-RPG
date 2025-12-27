import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './UserContext';
import { SKILL_DATA, BASE_ASSETS, FRIENDLY_MOBS, HOSTILE_MOBS, MINIBOSS_MOBS, BOSS_MOBS } from '../constants/gameData';
import { getRandomMob, getRandomFriendlyMob, getRandomMiniboss, getRandomBoss } from '../systems/mobs'; // You'll need to export these from specific systems or utils
import { calculateMobHealth, calculateXPReward, calculateXPToLevel, getEncounterType } from '../systems/progression';
import { getRandomAura } from '../utils/mobDisplayUtils';
import { getDefaultStats, checkAchievements as checkAchievementsUtil } from '../utils/achievementUtils';

const ProgressionContext = createContext();

export const useProgression = () => {
    const context = useContext(ProgressionContext);
    if (!context) {
        throw new Error('useProgression must be used within a ProgressionProvider');
    }
    return context;
};

// Helper: Generate Storage Key
const getStorageKey = (profileId) => `heroSkills_v23_p${profileId}`;

export const ProgressionProvider = ({ children }) => {
    const { currentProfile, activeTheme, setActiveTheme } = useUser();

    // --- State ---
    const [skills, setSkills] = useState({});
    const [stats, setStats] = useState(getDefaultStats());
    const [achievements, setAchievements] = useState([]); // This might be derived from stats/skills usually, but state is fine
    const [hasLoaded, setHasLoaded] = useState(false); // Prevent saving before initial load completes

    // --- Load Logic (Mirrored from App.jsx) ---
    const loadData = useCallback(() => {
        const key = getStorageKey(currentProfile);
        let saved = localStorage.getItem(key);
        // Fallback for profile 1 legacy
        if (!saved && currentProfile === 1) saved = localStorage.getItem('heroSkills_v23');

        // Initial Skill Setup
        const initialSkills = {};
        SKILL_DATA.forEach(skill => {
            const initialDifficulty = 1;
            initialSkills[skill.id] = {
                level: 1, xp: 0, currentMob: getRandomMob(null), difficulty: initialDifficulty, earnedBadges: [],
                mobHealth: calculateMobHealth(initialDifficulty), mobMaxHealth: calculateMobHealth(initialDifficulty),
                mobArmor: 0, lostLevel: false, recoveryDifficulty: null,
                memoryMob: skill.id === 'memory' ? getRandomFriendlyMob() : null,
                patternMob: skill.id === 'patterns' ? getRandomMob(null) : null,
                readingMob: skill.id === 'reading' ? getRandomMob(null) : null,
                mathMob: skill.id === 'math' ? getRandomMob(null) : null,
                writingMob: skill.id === 'writing' ? getRandomMob(null) : null,
                // Auras
                readingMobAura: skill.id === 'reading' ? getRandomAura() : null,
                mathMobAura: skill.id === 'math' ? getRandomAura() : null,
                writingMobAura: skill.id === 'writing' ? getRandomAura() : null,
                patternMobAura: skill.id === 'patterns' ? getRandomAura() : null,
                currentMiniboss: getRandomMiniboss(), currentBoss: getRandomBoss(),
                currentMinibossAura: getRandomAura(), currentBossAura: getRandomAura(),
            };
        });

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const skillsData = parsed.skills || parsed;

                // Merge Skills
                Object.keys(skillsData).forEach(k => {
                    if (initialSkills[k]) {
                        initialSkills[k] = { ...initialSkills[k], ...skillsData[k] };
                        // Backward compat checks would go here similar to App.jsx
                        // For brevity, assuming basic spread covers most, but critical fields like health/difficulty need checks?
                        // We can add the robust checks if needed.
                    }
                });

                // Set Skills
                setSkills(initialSkills);

                // Load Stats
                if (parsed.stats) {
                    setStats({ ...getDefaultStats(), ...parsed.stats });
                }

                // Load Theme (Update UserContext)
                if (parsed.theme) {
                    setActiveTheme(parsed.theme);
                }
                
                // Mark as loaded to enable persistence
                setHasLoaded(true);
            } catch (e) {
                console.error("Failed to load progression data:", e);
                setSkills(initialSkills);
                setHasLoaded(true);
            }
        } else {
            setSkills(initialSkills);
            setStats(getDefaultStats());
            setActiveTheme('minecraft');
            setHasLoaded(true);
        }
    }, [currentProfile, setActiveTheme]);

    // Reload when profile changes
    // Reset hasLoaded when profile changes to prevent stale saves
    useEffect(() => {
        setHasLoaded(false);
        loadData();
    }, [loadData]);


    // --- Persistence ---
    // Only save AFTER initial load completes to prevent overwriting saved data with empty state
    useEffect(() => {
        if (!currentProfile || !hasLoaded) return;
        
        // Don't save if skills is empty (shouldn't happen after load, but safety check)
        if (Object.keys(skills).length === 0) return;

        const dataToSave = {
            skills,
            stats,
            theme: activeTheme // Saving theme here as it's part of the blob
        };

        localStorage.setItem(getStorageKey(currentProfile), JSON.stringify(dataToSave));

        // Legacy fallback for profile 1
        if (currentProfile === 1) {
            localStorage.setItem('heroSkills_v23', JSON.stringify(dataToSave));
        }
    }, [skills, stats, activeTheme, currentProfile, hasLoaded]);


    // --- Actions ---
    const updateSkill = useCallback((skillId, updates) => {
        setSkills(prev => ({
            ...prev,
            [skillId]: { ...prev[skillId], ...updates }
        }));
    }, []);

    const updateStats = useCallback((updateFn) => {
        setStats(prev => {
            const newStats = updateFn(prev);
            // Check achievements could trigger here or via effect?
            // App.jsx did it in setTimeout. 
            // We can expose a checkAchievements helper.
            return newStats;
        });
    }, []);

    // Achievement Toast State
    const [achievementToast, setAchievementToast] = useState(null);

    // Check achievements wrapper
    const checkAchievements = useCallback((prevStats, newStats, oldSkills, newSkills) => {
        const result = checkAchievementsUtil(prevStats, newStats, oldSkills || skills, newSkills || skills);

        if (result.newlyUnlocked.length > 0) {
            setAchievementToast({ achievementId: result.newlyUnlocked[0], tierIndex: null });
        } else if (result.newTiers.length > 0) {
            setAchievementToast({
                achievementId: result.newTiers[0].achievementId,
                tierIndex: result.newTiers[0].tierIndex
            });
        }

        return result;
    }, [skills]);


    const value = {
        skills,
        stats,
        setSkills, // Low level setter if needed, mainly for bulk updates
        setStats, // Expose setStats for App.jsx compatibility
        updateSkill,
        updateStats,
        checkAchievements,
        achievementToast, // Expose toast state
        setAchievementToast // Expose setter if needed
    };

    return (
        <ProgressionContext.Provider value={value}>
            {children}
        </ProgressionContext.Provider>
    );
};

export default ProgressionContext;
