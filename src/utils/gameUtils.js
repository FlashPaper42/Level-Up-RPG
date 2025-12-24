/**
 * Game Utilities
 * 
 * This file re-exports functions from the new modular systems for backward compatibility.
 * New code should import directly from 'src/systems' instead.
 * 
 * @deprecated Import from '../systems' instead
 */

// Re-export from progression system
export {
    getDifficultyMultiplier,
    getExpectedDifficulty,
    calculateDamage,
    calculateMobHealth,
    calculateXPReward,
    calculateXPToLevel,
    getEncounterType
} from '../systems/progression';

// Re-export from mob system
export {
    getRandomMob,
    getRandomFriendlyMob,
    getRandomMiniboss,
    getRandomBoss,
    getMobForSkill
} from '../systems/mobs';

// Re-export from challenges system
export {
    getReadingWord,
    generateMathProblem,
    getWordForDifficulty,
    getItemsForLength
} from '../systems/challenges';