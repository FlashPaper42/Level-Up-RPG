/**
 * Systems Index
 * 
 * Re-exports all game systems for convenient importing.
 * 
 * Usage:
 *   import { calculateDamage, getRandomMob, generateChallenge } from '../systems';
 */

// Progression System
export {
    getDifficultyMultiplier,
    getExpectedDifficulty,
    calculateDamage,
    calculateMobHealth,
    calculateXPReward,
    calculateXPToLevel,
    getEncounterType,
    PROGRESSION_CONSTANTS
} from './progression';

// Mob System
export {
    getRandomMob,
    getRandomFriendlyMob,
    getRandomMiniboss,
    getRandomBoss,
    getMobForSkill
} from './mobs';

// Challenges System
export {
    getReadingWord,
    generateMathProblem,
    getWordForDifficulty,
    getItemsForLength,
    generateChallenge
} from './challenges';

// Combat System
export {
    calculateDamageAfterArmor,
    willHitDefeatMob,
    calculateMobAction,
    processXPGain,
    applyDamageToMob,
    generateNewMobData,
    calculatePlayerDamage,
    isCombatSkill,
    getSkillConfig
} from './combat';
