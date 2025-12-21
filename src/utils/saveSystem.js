import { SKILL_DATA } from '../constants/gameData';
import {
    getRandomMob, getRandomFriendlyMob, getRandomMiniboss, getRandomBoss,
    calculateMobHealth
} from './gameUtils';
import { getRandomAura } from './mobDisplayUtils';
import { getDefaultStats } from './achievementUtils';

export const getStorageKey = (profileId) => `heroSkills_v23_p${profileId}`;

export const loadSkills = (profileId) => {
    const initial = {};
    SKILL_DATA.forEach(skill => {
        initial[skill.id] = {
            level: 1,
            xp: 0,
            xpToLevel: 10,
            mobHealth: 10,
            mobMaxHealth: 10,
            difficulty: 1, // Add difficulty tracking
            earnedBadges: [], // Track earned badges for this skill
            recoveryDifficulty: null, // Track difficulty before death for recovery
            lostLevel: false, // Track if level was lost due to death
            // Stable mobs for each skill
            currentMob: skill.id === 'cleaning' || skill.id === 'memory'
                ? getRandomFriendlyMob()
                : getRandomMob(null),
            // Mini-boss and boss tracking
            currentMiniboss: getRandomMiniboss(),
            currentBoss: getRandomBoss(),
            // Specific mobs for certain skills
            memoryMob: skill.id === 'memory' ? getRandomFriendlyMob() : null,
            patternMob: skill.id === 'patterns' ? getRandomMob(null) : null,
            mathMob: skill.id === 'math' ? getRandomMob(null) : null, // Stable mob for Math card display
            writingMob: skill.id === 'writing' ? getRandomMob(null) : null, // Stable mob for Writing card display
            // Auras for each mob type
            readingMobAura: skill.id === 'reading' ? getRandomAura() : null,
            mathMobAura: skill.id === 'math' ? getRandomAura() : null,
            writingMobAura: skill.id === 'writing' ? getRandomAura() : null,
            patternMobAura: skill.id === 'patterns' ? getRandomAura() : null,
            currentMinibossAura: getRandomAura(), // Aura for miniboss encounters
            currentBossAura: getRandomAura() // Aura for boss encounters
        };
    });
    let saved = localStorage.getItem(getStorageKey(profileId));
    if (!saved && profileId === 1) saved = localStorage.getItem('heroSkills_v23');
    try {
        if (saved) {
            const parsed = JSON.parse(saved);
            const data = parsed.skills || parsed;
            Object.keys(data).forEach(key => {
                initial[key] = { ...initial[key], ...data[key] };
                // Ensure difficulty exists (backward compatibility)
                if (typeof initial[key].difficulty !== 'number') {
                    initial[key].difficulty = 1;
                }
                // Ensure earnedBadges array exists (backward compatibility)
                if (!Array.isArray(initial[key].earnedBadges)) {
                    initial[key].earnedBadges = [];
                }
                // Ensure mobHealth exists (backward compatibility)
                if (typeof initial[key].mobHealth !== 'number') {
                    const diff = initial[key].difficulty || 1;
                    initial[key].mobHealth = calculateMobHealth(diff);
                    initial[key].mobMaxHealth = calculateMobHealth(diff);
                }
                // Ensure death/recovery state exists
                if (typeof initial[key].lostLevel !== 'boolean') {
                    initial[key].lostLevel = false;
                }
                if (initial[key].recoveryDifficulty === undefined) {
                    initial[key].recoveryDifficulty = null;
                }
                // Ensure memoryMob exists for memory skill (backward compatibility)
                if (key === 'memory' && !initial[key].memoryMob) {
                    initial[key].memoryMob = getRandomFriendlyMob();
                }
                // Ensure patternMob exists for patterns skill (backward compatibility)
                if (key === 'patterns' && !initial[key].patternMob) {
                    initial[key].patternMob = getRandomMob(null);
                }
                // Ensure combat skill mobs exist (backward compatibility)
                if (key === 'reading' && !initial[key].readingMob) {
                    initial[key].readingMob = getRandomMob(null);
                }
                if (key === 'math' && !initial[key].mathMob) {
                    initial[key].mathMob = getRandomMob(null);
                }
                if (key === 'writing' && !initial[key].writingMob) {
                    initial[key].writingMob = getRandomMob(null);
                }
                // Ensure auras exist for combat skill mobs (backward compatibility)
                if (key === 'reading' && !initial[key].readingMobAura) {
                    initial[key].readingMobAura = getRandomAura();
                }
                if (key === 'math' && !initial[key].mathMobAura) {
                    initial[key].mathMobAura = getRandomAura();
                }
                if (key === 'writing' && !initial[key].writingMobAura) {
                    initial[key].writingMobAura = getRandomAura();
                }
                if (key === 'patterns' && !initial[key].patternMobAura) {
                    initial[key].patternMobAura = getRandomAura();
                }
                // Ensure miniboss and boss mobs exist for combat skills (backward compatibility)
                // Only initialize for skills that use the encounter type system (not cleaning or memory)
                if (key !== 'cleaning' && key !== 'memory') {
                    if (!initial[key].currentMiniboss) {
                        initial[key].currentMiniboss = getRandomMiniboss();
                    }
                    if (!initial[key].currentBoss) {
                        initial[key].currentBoss = getRandomBoss();
                    }
                    if (!initial[key].currentMinibossAura) {
                        initial[key].currentMinibossAura = getRandomAura();
                    }
                    if (!initial[key].currentBossAura) {
                        initial[key].currentBossAura = getRandomAura();
                    }
                }
            });
            return initial;
        }
    } catch (e) {
        console.warn('Failed to parse saved skills:', e);
    }
    return initial;
};

export const loadTheme = (profileId) => {
    let saved = localStorage.getItem(getStorageKey(profileId));
    if (!saved && profileId === 1) {
        saved = localStorage.getItem('heroSkills_v23');
    }
    try {
        return JSON.parse(saved).theme || 'minecraft';
    } catch (e) {
        console.warn('Failed to parse theme:', e);
    }
    return 'minecraft';
};

export const loadStats = (profileId) => {
    let saved = localStorage.getItem(getStorageKey(profileId));
    if (!saved && profileId === 1) {
        saved = localStorage.getItem('heroSkills_v23');
    }
    try {
        const data = JSON.parse(saved);
        if (data.stats) {
            // Merge with default stats to ensure all fields exist
            return { ...getDefaultStats(), ...data.stats };
        }
    } catch (e) {
        console.warn('Failed to parse stats:', e);
    }
    return getDefaultStats();
};

export const getProfileStats = (id, liveSkills = null, activeTheme = 'minecraft') => {
    const initial = {};
    SKILL_DATA.forEach(skill => { initial[skill.id] = { level: 1 }; });

    // Use live skills if provided (for current profile with pending state changes)
    if (liveSkills) {
        let totalLevel = 0;
        let highestLevel = 0;
        Object.values(liveSkills).forEach(s => {
            if (s && typeof s.level === 'number') {
                totalLevel += s.level;
                if (s.level > highestLevel) highestLevel = s.level;
            }
        });
        return { totalLevel, highestLevel, skills: liveSkills, theme: activeTheme };
    }

    const key = getStorageKey(id);
    let saved = localStorage.getItem(key);
    if (!saved && id === 1) saved = localStorage.getItem('heroSkills_v23');
    if (!saved) return null;
    try {
        const data = JSON.parse(saved);
        const skillsData = data.skills || data;
        const theme = data.theme || 'minecraft';
        let totalLevel = 0;
        let highestLevel = 0;
        Object.values(skillsData).forEach(s => {
            if (s && typeof s.level === 'number') {
                totalLevel += s.level;
                if (s.level > highestLevel) highestLevel = s.level;
            }
        });
        return { totalLevel, highestLevel, skills: skillsData, theme };
    } catch (e) {
        console.warn('Failed to parse profile stats:', e);
        return null;
    }
};
