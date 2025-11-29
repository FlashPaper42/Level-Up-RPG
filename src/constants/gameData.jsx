import { Circle, Square, Triangle, Hexagon } from 'lucide-react';
import React from 'react';

export const BASE_ASSETS = {
    skillIcons: { 'Reading': '/assets/skills/reading_icon.gif', 'Math': '/assets/skills/math_icon.png', 'Writing': '/assets/skills/writing_icon.png', 'Cleaning': '/assets/skills/cleaning_icon.gif', 'Memory': '/assets/skills/memory_icon.png', 'Patterns': '/assets/skills/patterns_icon.png' },
    badges: { 'Wood': '/assets/badges/wood_badge.png', 'Stone': '/assets/badges/stone_badge.png', 'Gold': '/assets/badges/gold_badge.png', 'Iron': '/assets/badges/iron_badge.png', 'Emerald': '/assets/badges/emerald_badge.png', 'Diamond': '/assets/badges/diamond_badge.png', 'Netherite': '/assets/badges/netherite_badge.png', 'Obsidian': '/assets/badges/obsidian_badge.png', 'Legendary': '/assets/badges/star_badge.png' },
    audio: { 'bgm': ['/assets/sounds/bgm_1.wav'], 'click': '/assets/sounds/click.wav', 'hit': ['/assets/sounds/hit_1.wav'], 'levelup': '/assets/sounds/levelup.wav', 'success': '/assets/sounds/success.wav', 'fail': '/assets/sounds/fail.wav', 'match': '/assets/sounds/match_success.wav', 'mismatch': '/assets/sounds/mismatch.wav', 'damage': '/assets/sounds/damage.wav', 'faint': '/assets/sounds/faint.wav' },
    axolotls: { 'Pink': '/assets/mobs/axolotl_pink.gif', 'Cyan': '/assets/mobs/axolotl_cyan.gif', 'Gold': '/assets/mobs/axolotl_gold.gif', 'Brown': '/assets/mobs/axolotl_brown.gif', 'Blue': '/assets/mobs/axolotl_blue.gif', 'Green': '/assets/mobs/axolotl_green.png', 'Purple': '/assets/mobs/axolotl_purple.png', 'Red': '/assets/mobs/axolotl_red.png' },
    items: { 'TNT': '/assets/items/tnt.png', 'BED': '/assets/items/bed.png', 'BOW': '/assets/items/bow.png', 'MAP': '/assets/items/map.png', 'EGG': '/assets/items/egg.png', 'ICE': '/assets/blocks/ice.png', 'AXE': '/assets/items/axe.gif', 'HOE': '/assets/items/hoe.gif', 'BOOK': '/assets/items/book.gif', 'CAKE': '/assets/items/cake.png', 'BOAT': '/assets/items/boat.png', 'DOOR': '/assets/blocks/door.png', 'WOOL': '/assets/blocks/wool.png', 'SAND': '/assets/blocks/sand.png', 'DIRT': '/assets/blocks/dirt.png', 'MILK': '/assets/items/milk.png' }
};

export const THEME_CONFIG = {
    'minecraft': {
        name: 'Minecraft',
        style: { backgroundColor: '#87CEEB', backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 60%, #5C9C54 60%)` },
        assets: {
            logo: '/assets/themes/minecraft_logo.png', cardBack: '/assets/ui/card_back.png',
            mobs: { 'Zombie': '/assets/mobs/zombie.png', 'Creeper': '/assets/mobs/creeper.png', 'Skeleton': '/assets/mobs/skeleton.png', 'Ender Dragon': '/assets/mobs/enderdragon.gif', 'Chest': '/assets/blocks/chest.gif', 'Axolotl': '/assets/mobs/axolotl_pink.gif' }
        },
        skills: { reading: { name: 'Enchanting', boss: 'Ender Dragon', mobType: 'Standard' }, math: { name: 'Redstone', boss: 'Wither', mobType: 'Creeper' }, writing: { name: 'Crafting', boss: 'Warden', mobType: 'Skeleton' }, cleaning: { name: 'Chest Mgmt', boss: 'Ender Chest', mobType: 'Chest' }, memory: { name: 'Axolotl Farm', boss: 'Axolotl', mobType: 'Mascot' }, patterns: { name: 'Building', boss: 'Iron Golem', mobType: 'Standard' } }
    },
    'scifi': {
        name: 'Sci-Fi', style: { backgroundColor: '#000022', backgroundImage: `radial-gradient(circle, #1a1a4a 10%, #000022 90%)` },
        assets: { logo: '/assets/themes/scifi_logo.png', cardBack: '/assets/themes/scifi_card.png', mobs: {} },
        skills: { reading: { name: 'Decryption', boss: 'Cyborg King' }, math: { name: 'Engineering', boss: 'Mecha-Brain' }, writing: { name: 'Hacking', boss: 'Mainframe' }, cleaning: { name: 'Waste Mgmt', boss: 'Trash Bot' }, memory: { name: 'Droid Repair', boss: 'Droid' }, patterns: { name: 'Navigation', boss: 'Star Map' } }
    },
    'fantasy': {
        name: 'Fantasy', style: { backgroundColor: '#2a1a0a', backgroundImage: `linear-gradient(to bottom, #2a1a0a, #4a3a2a)` },
        assets: { logo: '/assets/themes/fantasy_logo.png', cardBack: '/assets/themes/fantasy_card.png', mobs: {} },
        skills: { reading: { name: 'Spellcasting', boss: 'Lich King' }, math: { name: 'Alchemy', boss: 'Golem' }, writing: { name: 'Scribing', boss: 'Dragon' }, cleaning: { name: 'Looting', boss: 'Mimic' }, memory: { name: 'Runes', boss: 'Wisp' }, patterns: { name: 'Rituals', boss: 'Cultist' } }
    },
    'spy': {
        name: 'Spy', style: { backgroundColor: '#333', backgroundImage: `repeating-linear-gradient(45deg, #333 25%, #444 25%, #444 50%, #333 50%, #333 75%, #444 75%, #444 100%)`, backgroundSize: '20px 20px' },
        assets: { logo: '/assets/themes/spy_logo.png', cardBack: '/assets/themes/spy_card.png', mobs: {} },
        skills: { reading: { name: 'Intel Analysis', boss: 'Double Agent' }, math: { name: 'Gadgetry', boss: 'Mad Scientist' }, writing: { name: 'Forgery', boss: 'Bureaucrat' }, cleaning: { name: 'Evidence', boss: 'Safe' }, memory: { name: 'Identities', boss: 'Mole' }, patterns: { name: 'Code Breaking', boss: 'Hacker' } }
    }
};

export const THEMES_LIST = [ { id: 'minecraft', name: 'Minecraft', img: '/assets/themes/minecraft.png' }, { id: 'scifi', name: 'Sci-Fi', img: '/assets/themes/scifi.png' }, { id: 'fantasy', name: 'Fantasy', img: '/assets/themes/fantasy.png' }, { id: 'spy', name: 'Spy', img: '/assets/themes/spy.png' } ];
export const BADGE_TIERS = [ { level: 20, title: "Wood" }, { level: 40, title: "Stone" }, { level: 60, title: "Gold" }, { level: 80, title: "Iron" }, { level: 100, title: "Emerald" }, { level: 120, title: "Diamond" }, { level: 140, title: "Netherite" }, { level: 160, title: "Obsidian" } ];
export const SIGHT_WORDS = ["THE", "AND", "YOU", "THAT", "WAS", "FOR", "ON", "ARE", "WITH", "HIS", "THEY", "CAT", "DOG", "BAT", "RUN", "JUMP", "BIG", "RED", "FOX", "SUN", "MOM", "DAD", "PLAY", "SEE", "LOOK", "IT", "IS", "GO", "TO", "MY", "NO", "YES"];
export const SPELLING_ITEMS = [ { word: "TNT" }, { word: "BED" }, { word: "BOW" }, { word: "MAP" }, { word: "EGG" }, { word: "ICE" }, { word: "AXE" }, { word: "HOE" }, { word: "BOOK" }, { word: "CAKE" }, { word: "BOAT" }, { word: "DOOR" }, { word: "WOOL" }, { word: "SAND" }, { word: "DIRT" }, { word: "MILK" } ];
export const HOMOPHONES = { "SEE": ["SEA", "C"], "TO": ["TWO", "TOO", "2"], "FOR": ["FOUR", "4"], "SUN": ["SON"], "RED": ["READ"], "NO": ["KNOW"], "ARE": ["R", "OUR"], "YOU": ["U", "EWE"], "EYE": ["I"], "BEE": ["BE"], "ONE": ["WON", "1"] };
export const MOB_KEYS = Object.keys(THEME_CONFIG.minecraft.assets.mobs).filter(k => !['Ender Dragon', 'Chest', 'Axolotl'].includes(k));

export const SKILL_DATA = [
    { id: 'reading', name: 'Reading', class: 'Reading', fantasyName: 'Enchanting Table', actionName: 'Enchant!', taskDescription: "Read words into the microphone!", img: BASE_ASSETS.skillIcons['Reading'], color: 'from-purple-900 to-indigo-900', accent: 'text-purple-400', boss: 'Ender Dragon', hasChallenge: true, challengeType: 'reading', mobOffset: 0 },
    { id: 'math', name: 'Math', class: 'Math', fantasyName: 'Redstone', actionName: 'Calculate!', taskDescription: "Solve the math problem!", img: BASE_ASSETS.skillIcons['Math'], color: 'from-red-900 to-orange-900', accent: 'text-red-400', boss: 'The Wither', hasChallenge: true, challengeType: 'math', mobOffset: 4 },
    { id: 'writing', name: 'Writing', class: 'Spelling', fantasyName: 'Crafting Table', actionName: 'Craft!', taskDescription: "Type the letters to craft items!", img: BASE_ASSETS.skillIcons['Writing'], color: 'from-slate-800 to-gray-900', accent: 'text-cyan-400', boss: 'The Warden', hasChallenge: true, challengeType: 'writing', mobOffset: 8 },
    { id: 'cleaning', name: 'Cleaning', class: 'Cleaning', fantasyName: 'Chest Management', actionName: 'Organize!', taskDescription: "Clean one real-life room!", img: BASE_ASSETS.skillIcons['Cleaning'], color: 'from-emerald-900 to-green-900', accent: 'text-emerald-400', boss: 'Ender Chest', hasChallenge: true, challengeType: 'cleaning', mobOffset: 12 },
    { id: 'memory', name: 'Memory', class: 'Memory', fantasyName: 'Axolotl Farming', actionName: 'Match!', taskDescription: "Click cards to reveal Axolotls. Find pairs!", img: BASE_ASSETS.skillIcons['Memory'], color: 'from-pink-900 to-rose-900', accent: 'text-pink-400', boss: 'Axolotl Mascot', hasChallenge: true, challengeType: 'memory', mobOffset: 16 },
    { id: 'patterns', name: 'Patterns', class: 'Patterns', fantasyName: 'Logic Building', actionName: 'Solve!', taskDescription: "Complete the pattern!", img: BASE_ASSETS.skillIcons['Patterns'], color: 'from-blue-900 to-cyan-900', accent: 'text-blue-400', boss: 'Iron Golem', hasChallenge: true, challengeType: 'patterns', mobOffset: 20 },
];

export const SHAPE_COMPONENTS = {
    Circle: <Circle />,
    Square: <Square />,
    Triangle: <Triangle />,
    Hexagon: <Hexagon />
};