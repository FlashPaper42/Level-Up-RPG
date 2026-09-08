// Mob display utilities for aura generation

// Available aura types
const AURA_TYPES = [
    'rainbow', 'frost', 'shadow', 'lava', 'gradient', 'sparkle', 'plasma', 'nature',
    'giant', 'tiny', 'electric'
];

// Presentation variants keep the visual treatment reusable while aura names
// remain stable in saved progression data.
export const AURA_PRESENTATION = {
    giant: 'giant',
    tiny: 'tiny',
    flaming: 'flame',
    electric: 'electric',
    volatile: 'electric',
    glimmering: 'glimmer',
    rainbow: 'prismatic',
    frost: 'frost',
    shadow: 'void',
    lava: 'flame',
    gradient: 'shifting',
    sparkle: 'glimmer',
    plasma: 'electric',
    nature: 'nature'
};

export const getAuraPresentation = (aura) => {
    const normalizedAura = String(aura || '').toLowerCase();
    return AURA_PRESENTATION[normalizedAura] || 'energy';
};

// Aura adjectives mapping
export const AURA_ADJECTIVES = {
    'giant': 'Giant',
    'tiny': 'Tiny',
    'flaming': 'Flaming',
    'electric': 'Electric',
    'volatile': 'Volatile',
    'glimmering': 'Glimmering',
    'frost': 'Frost',
    'lava': 'Flaming',
    'shadow': 'Shadow',
    'rainbow': 'Prismatic',
    'gradient': 'Shifting',
    'sparkle': 'Glimmering',
    'plasma': 'Volatile',
    'nature': 'Overgrown'
};

export const getAuraAdjective = (aura) => (
    AURA_ADJECTIVES[String(aura || '').toLowerCase()] || ''
);

/**
 * Get a random aura effect
 * @returns {string} Random aura type from AURA_TYPES
 */
export const getRandomAura = () => {
    return AURA_TYPES[Math.floor(Math.random() * AURA_TYPES.length)];
};

/**
 * Generate mob with aura for display
 * @param {string} mobName - Name of the mob
 * @param {string} mobSrc - Source path for mob image
 * @returns {object} Object with mobName, mobSrc, aura, and displayName
 */
export const generateMobWithAura = (mobName, mobSrc) => {
    const aura = getRandomAura();
    const displayName = AURA_ADJECTIVES[aura] 
        ? `${AURA_ADJECTIVES[aura]} ${mobName}` 
        : mobName;
    
    return {
        mobName,
        mobSrc,
        aura,
        displayName
    };
};
