import {
    Target, Trophy, Zap, Heart, Skull, Swords,
    Crown, Shield, Sparkles, Frame,
    CheckCircle, Timer, Calendar, TrendingUp, Award,
    Ghost, Users, Gem, Flame, Star, Moon
} from 'lucide-react';

/**
 * Achievement Definitions
 * Each achievement needs: id, name, description, icon, category
 * Tiered achievements have: tiers (array of tier objects with level, tierName)
 */

// Tier colors for visual progression
export const TIER_COLORS = {
    1: { border: '#8B4513', bg: '#8B4513/20', text: 'text-amber-700' }, // Bronze
    2: { border: '#C0C0C0', bg: '#C0C0C0/20', text: 'text-gray-400' },  // Silver
    3: { border: '#FFD700', bg: '#FFD700/20', text: 'text-yellow-400' }, // Gold
    4: { border: '#E5E4E2', bg: '#E5E4E2/20', text: 'text-gray-300' },  // Platinum
    5: { border: '#50C878', bg: '#50C878/20', text: 'text-emerald-400' }, // Emerald
    6: { border: '#B9F2FF', bg: '#B9F2FF/20', text: 'text-cyan-300' },  // Diamond
    7: { border: '#8B00FF', bg: '#8B00FF/20', text: 'text-purple-400' }, // Legendary
    8: { border: '#FF1493', bg: '#FF1493/20', text: 'text-pink-500' }   // Mythic
};

export const TIER_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Legendary', 'Mythic'];

// ============================================
// TIERED ACHIEVEMENTS
// ============================================

export const PHANTOM_HUNTER_TIERS = [
    { level: 5, tierName: 'Bronze Ghost Buster' },
    { level: 10, tierName: 'Silver Ghost Buster' },
    { level: 15, tierName: 'Gold Ghost Buster' },
    { level: 20, tierName: 'Platinum Ghost Buster' },
    { level: 25, tierName: 'Emerald Ghost Buster' },
    { level: 50, tierName: 'Diamond Ghost Buster' },
    { level: 75, tierName: 'Legendary Ghost Buster' },
    { level: 100, tierName: 'Mythic Ghost Buster' }
];

export const COMBINED_LEVEL_TIERS = [
    { level: 100, tierName: 'Bronze Power' },
    { level: 200, tierName: 'Silver Power' },
    { level: 300, tierName: 'Gold Power' },
    { level: 400, tierName: 'Platinum Power' },
    { level: 500, tierName: 'Emerald Power' },
    { level: 600, tierName: 'Diamond Power' },
    { level: 700, tierName: 'Legendary Power' },
    { level: 800, tierName: 'Mythic Power' }
];

export const SKILL_MASTERY_TIERS = [
    { level: 20, tierName: 'Bronze Apprentice' },
    { level: 40, tierName: 'Silver Journeyman' },
    { level: 60, tierName: 'Gold Adept' },
    { level: 80, tierName: 'Platinum Expert' },
    { level: 100, tierName: 'Emerald Master' },
    { level: 120, tierName: 'Diamond Grandmaster' },
    { level: 140, tierName: 'Legendary Sage' },
    { level: 160, tierName: 'Mythic Transcendent' }
];

export const DEDICATED_TIERS = [
    { level: 3, tierName: 'Bronze Dedication' },
    { level: 7, tierName: 'Silver Dedication' },
    { level: 14, tierName: 'Gold Dedication' },
    { level: 30, tierName: 'Platinum Dedication' },
    { level: 60, tierName: 'Emerald Dedication' },
    { level: 90, tierName: 'Diamond Dedication' },
    { level: 180, tierName: 'Legendary Dedication' },
    { level: 365, tierName: 'Mythic Dedication' }
];

// ============================================
// ALL ACHIEVEMENTS
// ============================================

export const ACHIEVEMENTS = {
    // Tiered Achievements
    phantom_hunter: {
        id: 'phantom_hunter',
        name: 'Ghost Buster',
        description: 'Catch Phantoms',
        icon: Ghost,
        category: 'combat',
        isTiered: true,
        tiers: PHANTOM_HUNTER_TIERS,
        getProgress: (stats) => stats.phantomsCaught || 0
    },

    combined_levels: {
        id: 'combined_levels',
        name: 'Power Overwhelming',
        description: 'Reach high combined levels',
        icon: TrendingUp,
        category: 'progression',
        isTiered: true,
        tiers: COMBINED_LEVEL_TIERS,
        getProgress: (stats, skills) => {
            return Object.values(skills).reduce((sum, skill) => sum + (skill.level || 0), 0);
        }
    },

    skill_mastery: {
        id: 'skill_mastery',
        name: 'Jack of All Trades',
        description: 'Level all skills evenly',
        icon: Award,
        category: 'progression',
        isTiered: true,
        tiers: SKILL_MASTERY_TIERS,
        getProgress: (stats, skills) => {
            const levels = Object.values(skills).map(s => s.level || 0);
            return Math.min(...levels); // Minimum level across all skills
        },
        getProgressText: (stats, skills) => {
            const levels = Object.values(skills).map(s => s.level || 0);
            const minLevel = Math.min(...levels);
            const count = levels.filter(l => l >= minLevel).length;
            return `${count}/6 skills at level ${minLevel}+`;
        }
    },

    dedicated: {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Play on multiple days',
        icon: Calendar,
        category: 'engagement',
        isTiered: true,
        tiers: DEDICATED_TIERS,
        getProgress: (stats) => {
            const loginDates = stats.loginDates || [];
            return loginDates.length;
        },
        getProgressText: (stats) => {
            const loginDates = stats.loginDates || [];
            return `${loginDates.length} days played`;
        }
    },

    // One-Time Achievements
    first_steps: {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Defeat your first enemy',
        icon: Target,
        category: 'combat',
        isTiered: false,
        checkUnlock: (stats) => (stats.totalMobsDefeated || 0) >= 1
    },

    level_up: {
        id: 'level_up',
        name: 'Level Up!',
        description: 'Reach Level 2 in any skill',
        icon: Zap,
        category: 'progression',
        isTiered: false,
        checkUnlock: (stats, skills) => {
            return Object.values(skills).some(s => (s.level || 0) >= 2);
        }
    },

    special_attacker: {
        id: 'special_attacker',
        name: 'Special Attack!',
        description: 'Use the Special action for the first time',
        icon: Zap,
        category: 'combat',
        isTiered: false,
        checkUnlock: (stats) => (stats.specialAttacksUsed || 0) >= 1
    },

    framed: {
        id: 'framed',
        name: 'Framed!',
        description: 'Change your border effect for the first time',
        icon: Frame,
        category: 'customization',
        isTiered: false,
        checkUnlock: (stats) => (stats.borderChanges || 0) >= 1
    },

    ouch: {
        id: 'ouch',
        name: 'Ouch!',
        description: 'Die for the first time',
        icon: Skull,
        category: 'combat',
        isTiered: false,
        checkUnlock: (stats) => (stats.totalDeaths || 0) >= 1
    },

    dragon_slayer: {
        id: 'dragon_slayer',
        name: 'Dragon Slayer',
        description: 'Defeat your first boss',
        icon: Crown,
        category: 'combat',
        isTiered: false,
        checkUnlock: (stats) => (stats.totalBossesDefeated || 0) >= 1
    },

    mini_menace: {
        id: 'mini_menace',
        name: 'Mini Menace',
        description: 'Defeat your first mini-boss',
        icon: Shield,
        category: 'combat',
        isTiered: false,
        checkUnlock: (stats) => (stats.totalMinibossesDefeated || 0) >= 1
    },

    mini_master: {
        id: 'mini_master',
        name: 'Mini Master',
        description: 'Defeat all mini-bosses at least once',
        icon: Swords,
        category: 'completion',
        isTiered: false,
        checkUnlock: (stats) => {
            // 4 minibosses: Creaking, Elder Guardian, Ravager, Wither Skeleton
            const requiredMinibosses = ['Creaking', 'Elder Guardian', 'Ravager', 'Wither Skeleton'];
            const defeated = stats.uniqueMinibossesDefeated || [];
            return requiredMinibosses.every(mb => defeated.includes(mb));
        }
    },

    world_ender: {
        id: 'world_ender',
        name: 'World Ender',
        description: 'Defeat all bosses at least once',
        icon: Trophy,
        category: 'completion',
        isTiered: false,
        checkUnlock: (stats) => {
            // 4 bosses: Ender Dragon, Herobrine, Warden, Wither
            const requiredBosses = ['Ender Dragon', 'Herobrine', 'Warden', 'Wither'];
            const defeated = stats.uniqueBossesDefeated || [];
            return requiredBosses.every(b => defeated.includes(b));
        }
    },

    monster_manual: {
        id: 'monster_manual',
        name: 'Monster Manual',
        description: 'Defeat all regular mobs at least once',
        icon: Users,
        category: 'completion',
        isTiered: false,
        checkUnlock: (stats) => {
            // 20 hostile mobs from HOSTILE_MOBS
            const requiredMobs = [
                'Blaze', 'Bogged', 'Breeze', 'Creeper', 'Drowned', 'Enderman',
                'Evoker', 'Ghast', 'Guardian', 'Hoglin', 'Magma Cube', 'Parched',
                'Phantom', 'Piglin', 'Pillager', 'Skeleton', 'Slime', 'Spider',
                'Witch', 'Zombie'
            ];
            const defeated = stats.uniqueMobsDefeated || [];
            return requiredMobs.every(m => defeated.includes(m));
        }
    },

    perfectionist: {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete a memory game without any mismatches',
        icon: CheckCircle,
        category: 'skill',
        isTiered: false,
        checkUnlock: (stats) => (stats.perfectMemoryGames || 0) >= 1
    },

    speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete 10 battles in a single session',
        icon: Timer,
        category: 'skill',
        isTiered: false,
        checkUnlock: (stats) => (stats.battlesThisSession || 0) >= 10
    },

    high_roller: {
        id: 'high_roller',
        name: 'High Roller',
        description: 'Reach difficulty 7 on any skill',
        icon: Sparkles,
        category: 'progression',
        isTiered: false,
        checkUnlock: (stats, skills) => {
            return Object.values(skills).some(s => (s.difficulty || 1) >= 7);
        }
    },

    badge_collector: {
        id: 'badge_collector',
        name: 'Badge Collector',
        description: 'Earn your first badge (any tier)',
        icon: Gem,
        category: 'progression',
        isTiered: false,
        checkUnlock: (stats, skills) => {
            return Object.values(skills).some(s =>
                (s.earnedBadges && s.earnedBadges.length > 0)
            );
        }
    },

    full_set: {
        id: 'full_set',
        name: 'Full Set',
        description: 'Earn all 8 badge tiers on a single skill',
        icon: Heart,
        category: 'progression',
        isTiered: false,
        checkUnlock: (stats, skills) => {
            return Object.values(skills).some(s =>
                (s.earnedBadges && s.earnedBadges.length >= 8)
            );
        }
    },

    // NEW ACHIEVEMENTS
    nightmare_conqueror: {
        id: 'nightmare_conqueror',
        name: 'Nightmare Conqueror',
        description: 'Complete a Nightmare difficulty challenge',
        icon: Moon,
        category: 'combat',
        isTiered: false,
        checkUnlock: (stats) => (stats.nightmareVictories || 0) >= 1
    },

    nightmare_master: {
        id: 'nightmare_master',
        name: 'Nightmare Master',
        description: 'Complete Nightmare difficulty on all minigame skills',
        icon: Flame,
        category: 'completion',
        isTiered: false,
        checkUnlock: (stats) => {
            // Patterns and Memory are minigames
            const minigameVictories = stats.nightmareMinigameVictories || [];
            const requiredMinigames = ['patterns', 'memory'];
            return requiredMinigames.every(m => minigameVictories.includes(m));
        }
    },

    streak_master: {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Reach a 10-round streak in Pattern Recognition',
        icon: Star,
        category: 'skill',
        isTiered: false,
        checkUnlock: (stats) => (stats.maxPatternStreak || 0) >= 10
    },

    memory_master: {
        id: 'memory_master',
        name: 'Memory Master',
        description: 'Complete a memory game in under 30 seconds',
        icon: Timer,
        category: 'skill',
        isTiered: false,
        checkUnlock: (stats) => (stats.fastMemoryGames || 0) >= 1
    },

    clean_champion: {
        id: 'clean_champion',
        name: 'Clean Champion',
        description: 'Complete 10 chores total',
        icon: CheckCircle,
        category: 'engagement',
        isTiered: false,
        checkUnlock: (stats) => (stats.totalChoresCompleted || 0) >= 10
    }
};

// Helper to get all achievements as array
export const getAllAchievements = () => Object.values(ACHIEVEMENTS);

// Helper to get achievements by category
export const getAchievementsByCategory = (category) => {
    return getAllAchievements().filter(a => a.category === category);
};
