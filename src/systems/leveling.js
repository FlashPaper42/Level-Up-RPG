/**
 * Leveling System
 * Handles XP, Levels, and Difficulty scaling.
 */

import { calculateXPToLevel } from './progression'; // Keeping basic math in progression.js for now or move here?
// basic math like calculateXPToLevel is in progression.js. 
// We should probably move it here eventually, but for now we import it to avoid circular deps if progression.js imports this.
// progression.js currently has `calculateXPToLevel`. 

console.log('[System:Leveling] Module loaded');

/**
 * Process XP gain and level ups
 * @param {Object} currentState - Current skill state
 * @param {number} xpGained - XP to add
 * @param {Object} skillConfig - Skill configuration
 * @returns {Object} Updated state with new XP/level/badges
 */
export const processXPGain = (currentState, xpGained, skillConfig) => {
    let newLevel = currentState.level;
    let newXp = currentState.xp + xpGained;
    let newDifficulty = currentState.difficulty || 1;
    let newBadges = [...(currentState.earnedBadges || [])];
    let leveledUp = false;
    let badgesEarned = [];

    // Process level ups
    const xpToLevel = calculateXPToLevel(newDifficulty, newLevel);

    if (newXp >= xpToLevel) {
        const levelsGained = Math.floor(newXp / xpToLevel);
        const oldLevel = newLevel;
        newLevel += levelsGained;
        newXp = newXp % xpToLevel;
        leveledUp = true;

        console.log(`[System:Leveling] Level Up! ${oldLevel} -> ${newLevel} (XP: ${newXp}/${xpToLevel})`);

        // Check for difficulty increments and badges (cleaning is exempt)
        if (skillConfig.id !== 'cleaning') {
            for (let lvl = oldLevel; lvl < newLevel; lvl++) {
                if (lvl % 20 === 0 && lvl > 0) {
                    const newTier = Math.floor(lvl / 20);
                    if (newDifficulty < 7) {
                        newDifficulty++;
                        console.log(`[System:Leveling] Difficulty increased to ${newDifficulty}`);
                    }
                    if (!newBadges.includes(newTier) && newTier <= 7) {
                        newBadges.push(newTier);
                        badgesEarned.push(newTier);
                        console.log(`[System:Leveling] Badge earned: Tier ${newTier}`);
                    }
                }
            }
        }
    }

    return {
        level: newLevel,
        xp: newXp,
        difficulty: newDifficulty,
        earnedBadges: newBadges,
        leveledUp,
        badgesEarned
    };
};
