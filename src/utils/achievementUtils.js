import { ACHIEVEMENTS } from '../constants/achievements';

/**
 * Achievement Utilities
 * Helper functions for managing achievements, progress tracking, and unlocks
 */

/**
 * Initialize default stats structure
 */
export const getDefaultStats = () => ({
    phantomsCaught: 0,
    totalMobsDefeated: 0,
    totalBossesDefeated: 0,
    totalMinibossesDefeated: 0,
    totalDeaths: 0,
    uniqueMobsDefeated: [],
    uniqueBossesDefeated: [],
    uniqueMinibossesDefeated: [],
    themeChanges: 0,
    borderChanges: 0,
    battlesThisSession: 0,
    loginDates: [],
    perfectMemoryGames: 0,
    achievementsUnlocked: []
});

/**
 * Check if an achievement is unlocked
 * @param {string} achievementId - The achievement ID
 * @param {object} stats - Current player stats
 * @param {object} skills - Current player skills
 * @returns {boolean} - Whether the achievement is unlocked
 */
export const isAchievementUnlocked = (achievementId, stats, skills) => {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return false;

    if (achievement.isTiered) {
        // For tiered achievements, check if at least tier 1 is reached
        const progress = achievement.getProgress(stats, skills);
        return progress >= achievement.tiers[0].level;
    } else {
        // For one-time achievements, use checkUnlock function
        return achievement.checkUnlock(stats, skills);
    }
};

/**
 * Get current tier for a tiered achievement
 * @param {string} achievementId - The achievement ID
 * @param {object} stats - Current player stats
 * @param {object} skills - Current player skills
 * @returns {number} - Current tier index (0-based), or -1 if none
 */
export const getCurrentTier = (achievementId, stats, skills) => {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement || !achievement.isTiered) return -1;

    const progress = achievement.getProgress(stats, skills);

    // Find the highest tier that has been reached
    for (let i = achievement.tiers.length - 1; i >= 0; i--) {
        if (progress >= achievement.tiers[i].level) {
            return i;
        }
    }

    return -1; // No tier reached yet
};

/**
 * Get next tier for a tiered achievement
 * @param {string} achievementId - The achievement ID
 * @param {object} stats - Current player stats
 * @param {object} skills - Current player skills
 * @returns {object|null} - Next tier object or null if at max tier
 */
export const getNextTier = (achievementId, stats, skills) => {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement || !achievement.isTiered) return null;

    const currentTierIndex = getCurrentTier(achievementId, stats, skills);
    const nextTierIndex = currentTierIndex + 1;

    if (nextTierIndex >= achievement.tiers.length) {
        return null; // At max tier
    }

    return achievement.tiers[nextTierIndex];
};

/**
 * Get progress percentage for a tiered achievement
 * @param {string} achievementId - The achievement ID
 * @param {object} stats - Current player stats
 * @param {object} skills - Current player skills
 * @returns {number} - Progress percentage (0-100)
 */
export const getTierProgress = (achievementId, stats, skills) => {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement || !achievement.isTiered) return 0;

    const progress = achievement.getProgress(stats, skills);
    const currentTierIndex = getCurrentTier(achievementId, stats, skills);
    const nextTier = getNextTier(achievementId, stats, skills);

    if (!nextTier) {
        return 100; // At max tier
    }

    const currentTierLevel = currentTierIndex >= 0 ? achievement.tiers[currentTierIndex].level : 0;
    const nextTierLevel = nextTier.level;

    const progressInTier = progress - currentTierLevel;
    const tierRange = nextTierLevel - currentTierLevel;

    return Math.min(100, Math.floor((progressInTier / tierRange) * 100));
};

/**
 * Check which achievements were just unlocked (for toast notifications)
 * @param {object} oldStats - Previous stats
 * @param {object} newStats - New stats
 * @param {object} oldSkills - Previous skills
 * @param {object} newSkills - New skills
 * @returns {array} - Array of newly unlocked achievement IDs
 */
export const getNewlyUnlockedAchievements = (oldStats, newStats, oldSkills, newSkills) => {
    const newlyUnlocked = [];

    Object.keys(ACHIEVEMENTS).forEach(achievementId => {
        // Check if was locked before and is now unlocked
        const wasUnlocked = isAchievementUnlocked(achievementId, oldStats, oldSkills);
        const isNowUnlocked = isAchievementUnlocked(achievementId, newStats, newSkills);

        if (!wasUnlocked && isNowUnlocked) {
            newlyUnlocked.push(achievementId);
        }
    });

    return newlyUnlocked;
};

/**
 * Check which tiered achievements advanced to a new tier
 * @param {object} oldStats - Previous stats
 * @param {object} newStats - New stats
 * @param {object} oldSkills - Previous skills
 * @param {object} newSkills - New skills
 * @returns {array} - Array of objects with achievementId and new tier index
 */
export const getNewTierAchievements = (oldStats, newStats, oldSkills, newSkills) => {
    const newTiers = [];

    Object.keys(ACHIEVEMENTS).forEach(achievementId => {
        const achievement = ACHIEVEMENTS[achievementId];
        if (!achievement.isTiered) return;

        const oldTier = getCurrentTier(achievementId, oldStats, oldSkills);
        const newTier = getCurrentTier(achievementId, newStats, newSkills);

        if (newTier > oldTier) {
            newTiers.push({ achievementId, tierIndex: newTier });
        }
    });

    return newTiers;
};

/**
 * Aggregate check for any achievements/tiers gained
 */
export const checkAchievements = (oldStats, newStats, oldSkills, newSkills) => {
    const newlyUnlocked = getNewlyUnlockedAchievements(oldStats, newStats, oldSkills, newSkills);
    const newTiers = getNewTierAchievements(oldStats, newStats, oldSkills, newSkills);
    return { newlyUnlocked, newTiers };
};

/**
 * Add a unique value to an array stat if not already present
 * @param {array} arr - The array to add to
 * @param {string} value - The value to add
 * @returns {array} - Updated array
 */
export const addUniqueToArray = (arr, value) => {
    if (!arr.includes(value)) {
        return [...arr, value];
    }
    return arr;
};

/**
 * Record a login date (only once per day)
 * @param {array} loginDates - Array of date strings
 * @returns {array} - Updated login dates
 */
export const recordLoginDate = (loginDates) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    if (!loginDates.includes(today)) {
        return [...loginDates, today];
    }
    return loginDates;
};

/**
 * Get achievement display name with tier
 * @param {string} achievementId - The achievement ID
 * @param {object} stats - Current player stats
 * @param {object} skills - Current player skills
 * @returns {string} - Display name
 */
export const getAchievementDisplayName = (achievementId, stats, skills) => {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return '';

    if (achievement.isTiered) {
        const tierIndex = getCurrentTier(achievementId, stats, skills);
        if (tierIndex >= 0) {
            return achievement.tiers[tierIndex].tierName;
        }
        return achievement.name; // Not yet at tier 1
    }

    return achievement.name;
};
