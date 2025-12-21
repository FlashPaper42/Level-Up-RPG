import React from 'react';

const ProfilePicture = ({
    avatar = '👤',
    border = 'none',
    borderColor = '#FFD700',
    totalLevel = 0,
    size = 'large',
    skillColorStyle = null,
    onClickPicture = null,
    onClickLevel = null
}) => {
    // Size configurations
    const sizeConfig = {
        small: { container: 'w-14 h-14', emoji: 'text-2xl', level: 'text-xs', levelBadge: 'px-1.5 py-0.5' },
        medium: { container: 'w-20 h-20', emoji: 'text-4xl', level: 'text-sm', levelBadge: 'px-2 py-0.5' },
        large: { container: 'w-28 h-28', emoji: 'text-6xl', level: 'text-base', levelBadge: 'px-2.5 py-1' }
    };

    const config = sizeConfig[size] || sizeConfig.large;

    // Border effect classes
    let borderClass = 'border-4 border-stone-500';
    let borderStyle = {};

    if (border && border !== 'none') {
        if (border === 'solid' || border === 'solid-picker') {
            borderClass = 'border-4';
            const effectiveColor = border === 'solid' ? '#FFD700' : borderColor;
            borderStyle = {
                borderColor: effectiveColor,
                boxShadow: `0 0 15px ${effectiveColor}, 0 0 30px ${effectiveColor}`
            };
        } else {
            borderClass = `border-4 border-effect-${border}`;
            if (border === 'gradient' || border === 'sparkle') {
                borderStyle = { '--border-color': borderColor };
            }
        }
    }

    // Default colorful background if none provided
    const defaultColorStyle = {
        background: 'linear-gradient(to bottom, #7e22ce, #581c87)'
    };
    const backgroundStyle = skillColorStyle || defaultColorStyle;

    return (
        <div
            className={`relative ${config.container} ${borderClass} rounded-lg overflow-hidden ${onClickPicture ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
            style={{ ...borderStyle, ...backgroundStyle }}
            onClick={onClickPicture}
        >
            {/* Texture overlay like skill cards */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            {/* Avatar Emoji */}
            <div className={`relative z-10 ${config.emoji} select-none flex items-center justify-center h-full`}>
                {avatar}
            </div>

            {/* Total Level Badge */}
            {totalLevel > 0 && (
                <div
                    className={`absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-500 to-yellow-600 border-2 border-yellow-700 rounded-full ${config.levelBadge} shadow-lg z-20 ${onClickLevel ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                    onClick={(e) => {
                        if (onClickLevel) {
                            e.stopPropagation();
                            onClickLevel();
                        }
                    }}
                >
                    <span className={`${config.level} font-bold text-yellow-950`}>
                        {totalLevel}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProfilePicture;
