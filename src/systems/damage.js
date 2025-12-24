/**
 * Damage System
 * Pure functions for calculating damage interactions.
 */

console.log('[System:Damage] Module loaded');

/**
 * Calculate damage dealt to a target entity with armor
 * @param {number} baseDamage - Raw damage amount
 * @param {number} armor - Current armor points
 * @returns {{damageToHealth: number, armorDamage: number, remainingArmor: number}}
 */
export const calculateDamageAfterArmor = (baseDamage, armor) => {
    const armorDamage = Math.min(armor, baseDamage);
    const damageToHealth = Math.max(0, baseDamage - armor);
    const remainingArmor = Math.max(0, armor - baseDamage);

    return {
        damageToHealth,
        armorDamage,
        remainingArmor
    };
};

/**
 * Check if a hit will defeat the target
 * @param {number} health 
 * @param {number} armor 
 * @param {number} damage 
 * @returns {boolean}
 */
export const willHitDefeatTarget = (health, armor, damage) => {
    const { damageToHealth } = calculateDamageAfterArmor(damage, armor);
    return (health - damageToHealth) <= 0;
};

/**
 * Calculate player damage result (specific to player rules like death reset)
 * @param {number} currentHealth 
 * @param {number} damage 
 * @param {number} armor 
 * @returns {Object} Result
 */
export const calculatePlayerDamage = (currentHealth, damage, armor) => {
    const { damageToHealth, armorDamage, remainingArmor } = calculateDamageAfterArmor(damage, armor);
    const newHealth = Math.max(0, currentHealth - damageToHealth);
    const playerDied = newHealth <= 0;

    console.log(`[System:Damage] Player hit: ${damage} dmg vs ${armor} armor -> ${damageToHealth} HP dmg`);

    return {
        newHealth: playerDied ? 10 : newHealth, // Reset to 10 on death
        newArmor: remainingArmor,
        absorbed: armorDamage,
        actualDamage: damageToHealth,
        playerDied,
        fullyBlocked: armorDamage >= damage
    };
};
