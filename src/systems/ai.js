/**
 * AI System
 * Logic for mob decision making.
 */

console.log('[System:AI] Module loaded');

/**
 * Calculate mob's next action for turn-based combat
 * For combat skills: damage = 1, armor/heal = 10% of max HP
 * @param {Object} skillState - Current skill state
 * @param {string} skillId - The skill ID
 * @returns {{type: 'damage'|'armor'|'heal', value: number}}
 */
export const calculateMobAction = (skillState, skillId = 'reading') => {
    if (!skillState) return { type: 'damage', value: 1 };

    const mobMaxHealth = skillState.mobMaxHealth || 60;
    const mobHealth = skillState.mobHealth || mobMaxHealth;
    const mobArmor = skillState.mobArmor || 0;
    const isAtFullHealth = mobHealth >= mobMaxHealth;
    const isAtMaxArmor = mobArmor >= mobMaxHealth; // Armor caps at max health

    // Calculate 10% of mobMaxHealth for heal/armor value (reduced from 20% for faster battles)
    const tenPercentValue = Math.ceil(mobMaxHealth * 0.1);

    const rand = Math.random();

    // If at full health AND max armor, can only choose damage
    if (isAtFullHealth && isAtMaxArmor) {
        console.log('[System:AI] Full HP + Max Armor -> damage');
        return { type: 'damage', value: 1 };
    }

    // If at max armor but not full health, choose damage or heal (not armor)
    if (isAtMaxArmor) {
        if (rand < 0.5) {
            console.log('[System:AI] Max Armor -> damage');
            return { type: 'damage', value: 1 };
        } else {
            console.log('[System:AI] Max Armor -> heal');
            return { type: 'heal', value: tenPercentValue };
        }
    }

    // If at full health but not max armor, choose damage or armor (not heal)
    if (isAtFullHealth) {
        if (rand < 0.5) {
            console.log('[System:AI] Full HP -> damage');
            return { type: 'damage', value: 1 };
        } else {
            console.log('[System:AI] Full HP -> armor');
            return { type: 'armor', value: tenPercentValue };
        }
    }

    // Normal case: Randomly choose damage, armor, or heal (equal probability - 33.3% each)
    if (rand < 0.333) {
        console.log('[System:AI] Action -> damage');
        return { type: 'damage', value: 1 };
    } else if (rand < 0.666) {
        console.log('[System:AI] Action -> armor');
        return { type: 'armor', value: tenPercentValue };
    } else {
        console.log('[System:AI] Action -> heal');
        return { type: 'heal', value: tenPercentValue };
    }
};
