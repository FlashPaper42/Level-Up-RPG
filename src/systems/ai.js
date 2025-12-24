/**
 * AI System
 * Logic for mob decision making.
 */

console.log('[System:AI] Module loaded');

/**
 * Calculate mob's next action for turn-based combat
 * For Reading skill: damage = 1, armor/heal = 20% of max HP
 * @param {Object} skillState - Current skill state
 * @param {string} skillId - The skill ID (to check if reading)
 * @returns {{type: 'damage'|'armor'|'heal', value: number}}
 */
export const calculateMobAction = (skillState, skillId = 'reading') => {
    if (!skillState) return { type: 'damage', value: 1 };

    const mobMaxHealth = skillState.mobMaxHealth || 60;
    const mobHealth = skillState.mobHealth || mobMaxHealth;
    const isAtFullHealth = mobHealth >= mobMaxHealth;

    // Calculate 20% of mobMaxHealth for heal/armor value
    const twentyPercentValue = Math.ceil(mobMaxHealth * 0.2);

    // Only use full action logic for Reading skill - other skills use default damage
    // UPDATE: User confirmed they want full AI for all skills (assuming balance is okay)
    // if (skillId !== 'reading') {
    //    return { type: 'damage', value: 1 };
    // }

    // Reading skill logic
    const rand = Math.random();

    // If at full health, only choose damage or armor (not heal)
    if (isAtFullHealth) {
        if (rand < 0.5) {
            console.log('[System:AI] Full HP -> damage');
            return { type: 'damage', value: 1 };
        } else {
            console.log('[System:AI] Full HP -> armor');
            return { type: 'armor', value: twentyPercentValue };
        }
    }

    // Randomly choose: 1 damage, armor (20% HP), or heal (20% HP) (equal probability - 33.3% each)
    if (rand < 0.333) {
        console.log('[System:AI] Action -> damage');
        return { type: 'damage', value: 1 };
    } else if (rand < 0.666) {
        console.log('[System:AI] Action -> armor');
        return { type: 'armor', value: twentyPercentValue };
    } else {
        console.log('[System:AI] Action -> heal');
        return { type: 'heal', value: twentyPercentValue };
    }
};
