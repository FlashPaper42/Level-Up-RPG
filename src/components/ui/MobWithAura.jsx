import React from 'react';
import SafeImage from './SafeImage';

/**
 * MobWithAura - Composite component that renders mob and aura as a single element
 * 
 * The aura is rendered as a CSS ::before pseudo-element on the container,
 * and the mob image is centered within the same container using flexbox.
 * This ensures perfect alignment because both elements share the exact same
 * positioning context by design.
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
    
    // Determine if we should fill the parent container (percentage-based sizing)
    const isFillContainer = normalizedSize.includes('%');
    
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
        >
            {/* Aura is rendered via CSS ::before pseudo-element in GlobalStyles.jsx */}
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
        </div>
    );
};

export default MobWithAura;
