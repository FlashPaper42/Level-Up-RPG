/**
 * Progression System
 * 
 * Pure functions for calculating game progression:
 * - Damage and health calculations
 * - XP rewards and level requirements
 * - Difficulty scaling
 * - Encounter type determination
 */

// ===== Constants =====

// Progression scaling constants
const LEVEL_SCALING_FACTOR = 1.035; // Exponential growth per level (3.5% per level)
const DIFFICULTY_PENALTY_FACTOR = 0.3; // Penalty per difficulty level below expected (70% reduction)

// Base values for difficulty 1 (designed for 5 hits to kill, 1 kill = 1 level)
const BASE_DAMAGE = 12;      // 5 hits to kill at any level
const BASE_MOB_HEALTH = 60;  // 5 * BASE_DAMAGE
const BASE_XP_REWARD = 100;  // 1 kill = 1 level
const BASE_XP_TO_LEVEL = 100;

// ===== Difficulty Calculations =====

/**
 * Get difficulty multiplier (3^(difficulty-1))
 * Difficulty 1 = 1×, Difficulty 2 = 3×, Difficulty 3 = 9×, etc.
 */
export const getDifficultyMultiplier = (difficulty) => {
    return Math.pow(3, difficulty - 1);
};

/**
 * Calculate expected difficulty based on player level
 * Difficulty unlocks every 20 levels: 1-20 → Diff 1, 21-40 → Diff 2, etc.
 */
export const getExpectedDifficulty = (playerLevel) => {
    return Math.min(7, Math.floor((playerLevel - 1) / 20) + 1);
};

// ===== Combat Calculations =====

/**
 * Calculate damage per correct answer based on difficulty
 * Player level no longer affects damage to ensure consistent 5-hit battles
 */
export const calculateDamage = (playerLevel, difficulty) => {
    const multiplier = getDifficultyMultiplier(difficulty);
    return BASE_DAMAGE * multiplier;
};

/**
 * Calculate mob max HP - always 5x player damage for consistent 5-hit battles
 */
export const calculateMobHealth = (difficulty) => {
    const multiplier = getDifficultyMultiplier(difficulty);
    return BASE_MOB_HEALTH * multiplier;
};

// ===== XP Calculations =====

/**
 * Calculate XP reward for defeating a mob
 * Scales with difficulty played, but with diminishing returns when playing below expected difficulty
 */
export const calculateXPReward = (difficulty, playerLevel) => {
    // If playerLevel is not provided, return base reward (backward compatibility)
    if (playerLevel === undefined) {
        const baseDifficultyReward = getDifficultyMultiplier(difficulty) * BASE_XP_REWARD;
        return baseDifficultyReward;
    }

    const expectedDifficulty = getExpectedDifficulty(playerLevel);

    // Base XP scales with player level (same as XP to level)
    const baseXPScaled = BASE_XP_REWARD * Math.pow(LEVEL_SCALING_FACTOR, playerLevel - 1);

    // Apply difficulty multiplier
    const difficultyMultiplier = getDifficultyMultiplier(difficulty);
    const fullReward = Math.floor(baseXPScaled * difficultyMultiplier);

    // If playing at or above expected difficulty, full reward
    if (difficulty >= expectedDifficulty) {
        return fullReward;
    }

    // If playing below expected difficulty, apply exponential penalty
    // The penalty increases dramatically as the gap widens
    const difficultyGap = expectedDifficulty - difficulty;
    const penaltyFactor = Math.pow(DIFFICULTY_PENALTY_FACTOR, difficultyGap);

    return Math.floor(fullReward * penaltyFactor);
};

/**
 * Calculate XP required to level up
 * Scales exponentially with player level to ensure high-level players need many kills at low difficulties
 */
export const calculateXPToLevel = (difficulty, playerLevel) => {
    // If playerLevel is not provided, use old formula (backward compatibility)
    if (playerLevel === undefined) {
        const multiplier = getDifficultyMultiplier(difficulty);
        return BASE_XP_TO_LEVEL * multiplier;
    }

    const expectedDifficulty = getExpectedDifficulty(playerLevel);

    // Base XP requirement grows exponentially with player level
    const baseXPForLevel = BASE_XP_TO_LEVEL * Math.pow(LEVEL_SCALING_FACTOR, playerLevel - 1);

    // At expected difficulty, the XP to level should equal the XP from one mob kill
    // This maintains the "1 kill = 1 level" progression on the optimal path
    const expectedDifficultyMultiplier = getDifficultyMultiplier(expectedDifficulty);

    return Math.floor(baseXPForLevel * expectedDifficultyMultiplier);
};

// ===== Encounter System =====

/**
 * Determines encounter type based on level cycle pattern
 * Level cycle: 1-9 = hostile, 10 = miniboss, 11-19 = hostile, 20 = boss (repeats)
 */
export const getEncounterType = (level) => {
    const levelInCycle = ((level - 1) % 20) + 1; // 1-20
    if (levelInCycle === 20) return 'boss';
    if (levelInCycle === 10) return 'miniboss';
    return 'hostile';
};

// ===== Exported Constants (for external use) =====

export const PROGRESSION_CONSTANTS = {
    LEVEL_SCALING_FACTOR,
    DIFFICULTY_PENALTY_FACTOR,
    BASE_DAMAGE,
    BASE_MOB_HEALTH,
    BASE_XP_REWARD,
    BASE_XP_TO_LEVEL
};
