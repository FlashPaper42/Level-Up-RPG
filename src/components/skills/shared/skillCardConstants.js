// Shared constants for skill cards
export const PRESTIGE_LEVEL_THRESHOLD = 20;

// Voice recognition constants
export const MIN_SPOKEN_TEXT_LENGTH = 2;

// Tempo constants for pattern recognition
export const MAX_TEMPO_DELAY = 800; // Slowest tempo (difficulty 1, round 1)
export const MIN_TEMPO_DELAY = 200; // Fastest tempo (difficulty 7, always)

// Map axolotl colors to specific note files for consistent sound feedback
export const AXOLOTL_NOTE_MAP = {
    'Pink': 'c4',
    'Cyan': 'd4',
    'Gold': 'e4',
    'Brown': 'f4',
    'Blue': 'g4',
    'Red': 'a4',
    'Green': 'b4',
    'Black': 'g5'
};

// Level thresholds for border and text styling
export const LEVEL_STYLE_THRESHOLDS = [
    { level: 160, textColor: 'text-rainbow', borderClass: 'border-netherite' },
    { level: 140, textColor: 'text-gray-500', borderClass: 'border-netherite' },
    { level: 120, textColor: 'text-cyan-300', borderClass: 'border-diamond' },
    { level: 100, textColor: 'text-emerald-400', borderClass: 'border-emerald' },
    { level: 80, textColor: 'text-gray-200', borderClass: 'border-iron' },
    { level: 60, textColor: 'text-yellow-400', borderClass: 'border-gold' },
    { level: 40, textColor: 'text-stone-400', borderClass: 'border-stone' },
    { level: 20, textColor: 'text-amber-700', borderClass: 'border-wood' }
];
