/**
 * Combat System (Orchestrator)
 * 
 * Composes logic from specialized sub-systems (damage, leveling, AI, mobs).
 * Holds "Transaction Scripts" for complex state updates.
 */

import { SKILL_DATA } from '../constants/gameData';
import { calculateXPReward, calculateMobHealth, getEncounterType } from './progression';

// Import sub-systems
import * as DamageSystem from './damage';
import * as LevelingSystem from './leveling';
import * as AISystem from './ai';
import * as MobSystem from './mobs';

console.log('[System:Combat] Module loaded');

// Re-export specific helpers for backward compatibility or convenience if needed
// But ideally, consumers import directly.
export {
    calculateDamageAfterArmor,
    willHitDefeatTarget as willHitDefeatMob, // Alias for back-compat
    calculatePlayerDamage
} from './damage';

export { processXPGain } from './leveling';
export { calculateMobAction } from './ai';
export { generateNewMobData } from './mobs';

// ===== Orchestration Logic =====

/**
 * Apply damage to a mob and return the new skill state
 * Coordinates Damage + XP/Leveling
 */
export const applyDamageToMob = (currentSkillState, damage, skillConfig, customXPMultiplier = null) => {
    const { mobHealth, mobArmor = 0, mobMaxHealth, difficulty = 1, level } = currentSkillState;

    // 1. Calculate Damage
    const { damageToHealth, remainingArmor } = DamageSystem.calculateDamageAfterArmor(damage, mobArmor);
    const newMobHealth = Math.max(0, mobHealth - damageToHealth);
    const mobDefeated = newMobHealth <= 0;

    // 2. Calculate XP
    const isInstantDefeat = skillConfig.id === 'cleaning' || skillConfig.id === 'memory' ||
        (getEncounterType(level) === 'miniboss' && skillConfig.id !== 'cleaning');
    const effectiveDamage = isInstantDefeat ? mobMaxHealth : damage;
    const hitsToKill = Math.ceil(mobMaxHealth / effectiveDamage);

    const baseXPReward = calculateXPReward(difficulty, level);
    const totalXPReward = customXPMultiplier !== null
        ? Math.floor(baseXPReward * customXPMultiplier)
        : baseXPReward;
    const xpPerHit = Math.floor(totalXPReward / hitsToKill);

    // Award XP based on whether this hit kills
    let xpGained = 0;
    if (!mobDefeated) {
        xpGained = xpPerHit;
    } else {
        // Award remaining XP on kill
        const hitsDealt = Math.ceil((mobMaxHealth - mobHealth) / effectiveDamage);
        const xpAlreadyAwarded = hitsDealt * xpPerHit;
        xpGained = totalXPReward - xpAlreadyAwarded;
    }

    console.log(`[System:Combat] Mob Hit: ${damage} dmg -> ${newMobHealth} HP, XP: ${xpGained}`);

    return {
        newMobHealth,
        newMobArmor: remainingArmor,
        mobDefeated,
        damageDealt: damageToHealth,
        armorDamage: damage - damageToHealth,
        xpGained
    };
};

/**
 * Apply a mob's counter-attack action to the player and/or update mob state
 * Coordinates AI Action + Player Damage
 */
export const applyMobCounterAttack = (currentSkillState, playerState, mobAction) => {
    const { playerHealth, armorPoints } = playerState;
    const { mobHealth, mobArmor = 0, mobMaxHealth } = currentSkillState;

    // Default return structure
    const result = {
        type: mobAction.type,
        value: mobAction.value,
        newSkillState: { ...currentSkillState },
        playerState: { playerHealth, armorPoints },
        effectInfo: { blocked: false, isHeal: false, damageTaken: 0, playerDied: false }
    };

    if (mobAction.type === 'armor') {
        // Mob gains armor (capped at max health)
        const newMobArmor = Math.min(mobMaxHealth, (mobArmor || 0) + mobAction.value);
        result.newSkillState.mobArmor = newMobArmor;
        result.effectInfo.blocked = true;
        result.effectInfo.isHeal = true;
    }
    else if (mobAction.type === 'heal') {
        // Mob heals self
        const newMobHealth = Math.min(mobMaxHealth, (mobHealth || 0) + mobAction.value);
        result.newSkillState.mobHealth = newMobHealth;
        result.effectInfo.blocked = true;
        result.effectInfo.isHeal = true;
    }
    else {
        // Damage (default)
        const damageResult = DamageSystem.calculatePlayerDamage(playerHealth, mobAction.value, armorPoints);
        result.playerState.playerHealth = damageResult.newHealth;
        result.playerState.armorPoints = damageResult.newArmor;
        result.effectInfo.blocked = damageResult.fullyBlocked;
        result.effectInfo.damageTaken = damageResult.actualDamage;
        result.effectInfo.playerDied = damageResult.playerDied;
    }

    return result;
};

/**
 * Check if a skill uses turn-based combat
 */
export const isCombatSkill = (skillId) => {
    return ['reading', 'math', 'writing'].includes(skillId);
};
