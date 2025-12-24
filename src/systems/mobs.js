/**
 * Mob System
 * 
 * Pure functions for mob spawning and selection:
 * - Random mob generation
 * - Skill-specific mob selection
 * - Boss and miniboss spawning
 */

import {
    HOSTILE_MOBS,
    FRIENDLY_MOBS,
    CHEST_BLOCKS,
    SPECIAL_CHESTS,
    MINIBOSS_MOBS,
    BOSS_MOBS
} from '../constants/gameData';
import { getEncounterType, calculateMobHealth } from './progression';
import { getRandomAura } from '../utils/mobDisplayUtils';

// ===== Random Mob Generation =====

/**
 * Get a random hostile mob, optionally excluding a specific mob
 */
export const getRandomMob = (exclude) => {
    const pool = Object.keys(HOSTILE_MOBS).filter(m => m !== exclude);
    return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'Zombie';
};

/**
 * Get a random friendly mob key for the Memory skill
 */
export const getRandomFriendlyMob = () => {
    const friendlyMobKeys = Object.keys(FRIENDLY_MOBS);
    return friendlyMobKeys.length > 0 ? friendlyMobKeys[Math.floor(Math.random() * friendlyMobKeys.length)] : 'Allay';
};

/**
 * Get a random miniboss
 */
export const getRandomMiniboss = () => {
    const minibossKeys = Object.keys(MINIBOSS_MOBS);
    return minibossKeys.length > 0 ? minibossKeys[Math.floor(Math.random() * minibossKeys.length)] : 'Wither Skeleton';
};

/**
 * Get a random boss
 */
export const getRandomBoss = () => {
    const bossKeys = Object.keys(BOSS_MOBS);
    return bossKeys.length > 0 ? bossKeys[Math.floor(Math.random() * bossKeys.length)] : 'Wither';
};

// ===== Skill-Specific Mob Selection =====

/**
 * Get the appropriate mob for a skill based on current state
 * Handles special cases like cleaning (chests), memory (friendly mobs), bosses, and minibosses
 */
export const getMobForSkill = (skillConfig, userSkill) => {
    // Cleaning skill is exempt from miniboss cycles - uses original logic
    if (skillConfig.id === 'cleaning') {
        if (userSkill.level % 20 === 0) return 'Ender Chest';
        if (userSkill.level % 5 === 0) return 'Shulker Box';
        const standardChests = Object.keys(CHEST_BLOCKS).filter(k => !SPECIAL_CHESTS.includes(k));
        return standardChests[(userSkill.level - 1) % standardChests.length];
    }

    // Memory skill: Return stored memoryMob to prevent random changes on re-render
    if (skillConfig.id === 'memory') {
        return userSkill.memoryMob || getRandomFriendlyMob();
    }

    // Determine encounter type based on level cycle
    const encounterType = getEncounterType(userSkill.level);

    if (encounterType === 'boss') {
        // Return stored boss to prevent random changes on re-render
        return userSkill.currentBoss || getRandomBoss();
    }

    if (encounterType === 'miniboss') {
        // Return stored miniboss to prevent random changes on re-render
        return userSkill.currentMiniboss || getRandomMiniboss();
    }

    // Combat skills (reading, math, writing, patterns) at hostile mob levels:
    // Return stored mob to prevent random changes on re-render
    const combatSkillMobs = {
        'reading': userSkill.readingMob,
        'math': userSkill.mathMob,
        'writing': userSkill.writingMob,
        'patterns': userSkill.patternMob
    };

    if (skillConfig.id in combatSkillMobs) {
        return combatSkillMobs[skillConfig.id] || getRandomMob(null);
    }

    // Fallback for any other skills
    // Normal hostile mob
    const hostileMobKeys = Object.keys(HOSTILE_MOBS);
    const currentMobIsValid = userSkill.currentMob && hostileMobKeys.includes(userSkill.currentMob);
    return currentMobIsValid ? userSkill.currentMob : (hostileMobKeys.length > 0 ? hostileMobKeys[Math.floor(Math.random() * hostileMobKeys.length)] : 'Zombie');
};

// ===== Mob Generation Logic =====

/**
 * Generate new mob data when a mob is defeated
 * @param {Object} currentSkillState 
 * @param {Object} skillConfig 
 * @returns {Object} Updates for the skill state
 */
export const generateNewMobData = (currentSkillState, skillConfig) => {
    const encounterType = getEncounterType(currentSkillState.level);
    const newDifficulty = currentSkillState.difficulty || 1;

    const updates = {
        mobMaxHealth: calculateMobHealth(newDifficulty),
        mobArmor: 0
    };
    updates.mobHealth = updates.mobMaxHealth;

    // Generate new mob based on skill type
    if (skillConfig.id === 'memory') {
        updates.memoryMob = getRandomFriendlyMob();
    } else if (skillConfig.id === 'patterns') {
        updates.patternMob = getRandomMob(currentSkillState.patternMob);
        updates.patternMobAura = getRandomAura();
    } else if (skillConfig.id === 'reading') {
        updates.readingMob = getRandomMob(currentSkillState.readingMob);
        updates.readingMobAura = getRandomAura();
    } else if (skillConfig.id === 'math') {
        updates.mathMob = getRandomMob(currentSkillState.mathMob);
        updates.mathMobAura = getRandomAura();
    } else if (skillConfig.id === 'writing') {
        updates.writingMob = getRandomMob(currentSkillState.writingMob);
        updates.writingMobAura = getRandomAura();
    }

    // Update miniboss/boss if that's what was defeated
    if (encounterType === 'miniboss') {
        updates.currentMiniboss = getRandomMiniboss();
        updates.currentMinibossAura = getRandomAura();
    } else if (encounterType === 'boss') {
        updates.currentBoss = getRandomBoss();
        updates.currentBossAura = getRandomAura();
    }

    // Also get a new regular mob
    updates.currentMob = getRandomMob(currentSkillState.currentMob);

    return updates;
};
