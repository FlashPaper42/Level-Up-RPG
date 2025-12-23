import { BASE_ASSETS } from '../../../constants/gameData';
import { getSfxVolume } from '../../../utils/soundManager';
import { MAX_TEMPO_DELAY, MIN_TEMPO_DELAY, LEVEL_STYLE_THRESHOLDS } from './skillCardConstants';

// Helper: clamp a value between min and max
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Helper: linearly interpolate between two values
export const lerp = (start, end, t) => start + (end - start) * clamp(t, 0, 1);

// Calculate tempo delays based on completed rounds and difficulty
// Difficulty scales both the starting delay and the acceleration runway
export const getTempoDelays = (completedRounds, currentDifficulty) => {
    // Use 1-based round number
    const round = completedRounds + 1;

    // Calculate starting delay based on difficulty
    // Difficulty 1: 800ms, Difficulty 7: 200ms
    const startingDelay = lerp(MAX_TEMPO_DELAY, MIN_TEMPO_DELAY, (currentDifficulty - 1) / 6);

    // Calculate acceleration runway based on difficulty
    // Difficulty 1: ~10 rounds, Difficulty 7: 1 round (essentially no acceleration)
    const maxRunwayRounds = lerp(10, 1, (currentDifficulty - 1) / 6);

    // Calculate current tempo with acceleration
    // Progress through the runway: 0 at round 1, 1 at maxRunwayRounds
    // Handle edge case where maxRunwayRounds is 1 (no acceleration)
    const runwayProgress = maxRunwayRounds > 1 ? (round - 1) / (maxRunwayRounds - 1) : 1;
    const rawOnDelay = lerp(startingDelay, MIN_TEMPO_DELAY, runwayProgress);
    const onDelay = clamp(rawOnDelay, MIN_TEMPO_DELAY, MAX_TEMPO_DELAY);

    // offDelay scaled to ~35% of onDelay with a 100ms floor
    const offDelay = Math.max(100, Math.round(onDelay * 0.35));

    return { onDelay, offDelay };
};

// Single unified function for action animation logic (handles both taking damage and dealing damage)
export const getActionAnimation = (isHit, mobAttacking, configId, bossHealing) => {
    const isMobAttacking = mobAttacking && (typeof mobAttacking === 'object' ? mobAttacking.skillId === configId : mobAttacking === configId);
    const mobActionType = typeof mobAttacking === 'object' && mobAttacking ? mobAttacking.type : null;
    let animationClass = 'animate-bob';
    let actionStyle = {};

    if (isHit) {
        // Takes damage: shrink, flash red
        animationClass = 'animate-action animate-shake';
        actionStyle = {
            '--action-scale': '0.85',
            '--action-hue': '-50deg',
            '--action-brightness': '0.8'
        };
    } else if (isMobAttacking) {
        // Mob is performing an action - animate based on action type
        animationClass = 'animate-action';
        if (mobActionType === 'heal') {
            // Heal: scale up, green glow (hue-rotate to green)
            actionStyle = {
                '--action-scale': '1.2',
                '--action-hue': '90deg',
                '--action-brightness': '1.5'
            };
        } else if (mobActionType === 'armor') {
            // Armor: scale up, blue glow (hue-rotate to cyan/blue)
            actionStyle = {
                '--action-scale': '1.2',
                '--action-hue': '200deg',
                '--action-brightness': '1.5'
            };
        } else {
            // Damage (default): scale up, red glow
            actionStyle = {
                '--action-scale': '1.2',
                '--action-hue': '0deg',
                '--action-brightness': '1.5'
            };
        }
    } else if (bossHealing) {
        animationClass = 'animate-shake brightness-150 hue-rotate-90';
    }

    return { animationClass, actionStyle };
};

// Get level-based styling (border class and text color)
export const getLevelStyling = (level) => {
    for (const threshold of LEVEL_STYLE_THRESHOLDS) {
        if (level >= threshold.level) {
            return { borderClass: threshold.borderClass, levelTextColor: threshold.textColor };
        }
    }
    return { borderClass: 'border-stone-500', levelTextColor: 'text-white' };
};

// Extract button colors from config.colorStyle to match card background
export const getButtonStyle = (colorStyle) => {
    const gradientMatch = colorStyle?.background?.match(/#([a-fA-F0-9]{6})/g);
    if (gradientMatch && gradientMatch.length >= 2) {
        const fromColor = gradientMatch[0];
        const toColor = gradientMatch[1];
        // Create a darker shadow color from the 'to' color
        const darkenColor = (hex) => {
            const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40);
            const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40);
            const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        };
        const shadowColor = darkenColor(toColor);
        return {
            background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
            boxShadow: `0 6px 0 ${shadowColor}`,
            borderColor: fromColor
        };
    }
    return {
        background: 'linear-gradient(to bottom, #7e22ce, #581c87)',
        boxShadow: '0 6px 0 #581c87',
        borderColor: '#a855f7'
    };
};

// Helper function to play mismatch sound with proper volume
export const playMismatch = () => {
    const audio = new Audio(BASE_ASSETS.audio.mismatch);
    audio.volume = getSfxVolume();
    audio.play().catch(() => { });
};

// Get border effect styling based on selected border and color
export const getBorderEffect = (isCenter, selectedBorder, borderColor) => {
    let appliedBorderEffect = '';
    let borderStyle = {};

    if (isCenter && selectedBorder) {
        if (selectedBorder === 'solid' || selectedBorder === 'solid-picker') {
            appliedBorderEffect = '';
            // For 'solid', use locked yellow color; for 'solid-picker', use custom color
            const effectiveColor = selectedBorder === 'solid' ? '#FFD700' : (borderColor || '#FFD700');
            borderStyle = {
                borderColor: effectiveColor,
                boxShadow: `0 0 20px ${effectiveColor}, 0 0 40px ${effectiveColor}`
            };
        } else {
            appliedBorderEffect = `border-effect-${selectedBorder}`;
            if (selectedBorder === 'gradient' || selectedBorder === 'sparkle') {
                borderStyle = { '--border-color': borderColor || '#FFD700' };
            }
        }
    }

    return { appliedBorderEffect, borderStyle };
};
