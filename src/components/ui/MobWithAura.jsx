import React from 'react';
import SafeImage from './SafeImage';
import { getAuraAdjective, getAuraPresentation } from '../../utils/mobDisplayUtils';

/**
 * MobWithAura - Composite component that renders mob and aura as a single element
 * 
 * The aura is rendered as a few composited CSS layers behind the mob image.
 * This keeps effects lightweight while ensuring every layer shares the same
 * positioning context as the mob.
 * 
 * @param {string} mobSrc - Source path for the mob image
 * @param {string} aura - Aura type (rainbow, frost, shadow, lava, gradient, sparkle, plasma, nature)
 * @param {string} displayName - Display name for the mob (with aura adjective)
 * @param {number|string} size - Size in pixels (e.g., 160), percentage (e.g., '100%'), or CSS value
 * @param {boolean} isHit - Whether the mob is being hit (for animation)
 * @param {boolean} bossHealing - Whether boss is healing (for animation)
 * @param {string} className - Additional CSS classes to apply
 */
const MobWithAura = ({ mobSrc, aura, displayName, size = '100%', isHit = false, bossHealing = false, className = '' }) => {
    // Normalize size - if it's a number, add 'px' suffix; otherwise use as-is
    const normalizedSize = typeof size === 'number' ? `${size}px` : size;
    const auraVariant = getAuraPresentation(aura);
    const auraAdjective = getAuraAdjective(aura);
    
    // Determine if we should fill the parent container (percentage-based sizing)
    
    return (
        <div 
            className={`mob-with-aura-container ${className}`}
            style={{ 
                width: normalizedSize,
                height: normalizedSize,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            data-aura={aura}
            data-aura-variant={auraVariant}
            data-aura-adjective={auraAdjective.toLowerCase()}
        >
            <span className="mob-aura-layer mob-aura-layer--one" aria-hidden="true" />
            <span className="mob-aura-layer mob-aura-layer--two" aria-hidden="true" />
            <span className="mob-aura-sparks" aria-hidden="true" />
            <span className="mob-image-scale">
                <SafeImage
                    src={mobSrc}
                    alt={displayName}
                    className={`
                        mob-image
                        relative z-10
                        max-w-full max-h-full
                        object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-transform duration-100
                        ${isHit ? 'animate-knockback' : bossHealing ? 'animate-shake' : 'animate-bob'}
                        ${bossHealing ? 'brightness-150 hue-rotate-90' : ''}
                    `}
                />
            </span>
        </div>
    );
};

export default MobWithAura;
