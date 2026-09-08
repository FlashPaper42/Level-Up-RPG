// Fixed hero titles are earned through achievements rather than typed by players.
export const DEFAULT_HERO_TITLE = 'Apprentice';

export const HERO_TITLE_REWARDS = {
    first_steps: 'Trailblazer',
    level_up: 'Rising Hero',
    special_attacker: 'Spellblade',
    framed: 'Style Smith',
    ouch: 'Battle Scarred',
    dragon_slayer: 'Dragon Slayer',
    mini_menace: 'Mini-Boss Hunter',
    mini_master: 'Mini Master',
    world_ender: 'World Ender',
    monster_manual: 'Monster Scholar',
    perfectionist: 'Perfect',
    speed_demon: 'Speed Demon',
    high_roller: 'High Roller',
    badge_collector: 'Badge Collector',
    full_set: 'Set Master',
    nightmare_conqueror: 'Nightmare Conqueror',
    nightmare_master: 'Nightmare Master',
    streak_master: 'Pattern Sage',
    memory_master: 'Memory Keeper',
    clean_champion: 'Clean Champion',
    mob_slayer: 'Mob Slayer',
    mob_collector: 'Monster Scout',
    boss_bane: 'Boss Bane',
    phantom_pack: 'Phantom Catcher',
    skill_triad: 'Skill Adept',
    precision_player: 'Precision Player',
    nightmare_veteran: 'Nightmare Veteran',
    profile_stylist: 'Style Champion'
};

export const HERO_TITLE_OPTIONS = [
    DEFAULT_HERO_TITLE,
    ...Object.values(HERO_TITLE_REWARDS)
];

export const getUnlockedHeroTitles = (unlockedAchievements = []) => [
    DEFAULT_HERO_TITLE,
    ...unlockedAchievements
        .map(achievementId => HERO_TITLE_REWARDS[achievementId])
        .filter(Boolean)
        .filter((title, index, titles) => titles.indexOf(title) === index)
];

export const sanitizeHeroTitle = (title) => (
    HERO_TITLE_OPTIONS.includes(title) ? title : DEFAULT_HERO_TITLE
);
