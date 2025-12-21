import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AVATAR_CATEGORIES } from '../../constants/avatarData';

const AvatarCarousel = ({ selectedAvatar, setSelectedAvatar }) => {
    const [activeCategory, setActiveCategory] = useState('animals');
    const [scrollIndex, setScrollIndex] = useState(0);

    const AVATARS_PER_VIEW = 5;
    const currentAvatars = AVATAR_CATEGORIES[activeCategory] || [];
    const maxIndex = Math.max(0, currentAvatars.length - AVATARS_PER_VIEW);

    const visibleAvatars = currentAvatars.slice(scrollIndex, scrollIndex + AVATARS_PER_VIEW);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setScrollIndex(0); // Reset scroll when changing category
    };

    const handleScroll = (direction) => {
        if (direction === 'left') {
            setScrollIndex(Math.max(0, scrollIndex - 1));
        } else {
            setScrollIndex(Math.min(maxIndex, scrollIndex + 1));
        }
    };

    const categories = [
        { id: 'animals', label: 'Animals' },
        { id: 'people', label: 'People' },
        { id: 'objects', label: 'Objects' }
    ];

    return (
        <div className="bg-slate-800/50 rounded-lg border-2 border-slate-600 p-4">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-4">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold uppercase tracking-wider transition-all ${activeCategory === cat.id
                                ? 'bg-yellow-500 text-black'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Carousel Container */}
            <div className="flex items-center gap-3">
                {/* Left Arrow */}
                <button
                    onClick={() => handleScroll('left')}
                    disabled={scrollIndex === 0}
                    className={`p-2 rounded-lg transition-all ${scrollIndex === 0
                            ? 'bg-slate-700/50 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-700 text-white hover:bg-slate-600 hover:scale-110'
                        }`}
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Avatar Display */}
                <div className="flex-1 flex gap-3 justify-center">
                    {visibleAvatars.map((avatar) => {
                        const isSelected = selectedAvatar === avatar.id;
                        return (
                            <button
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar.id)}
                                className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${isSelected
                                        ? 'bg-yellow-900/30 border-yellow-400 ring-2 ring-yellow-400/20 scale-110'
                                        : 'bg-slate-800/70 border-slate-600 hover:border-yellow-400/50 hover:scale-105'
                                    }`}
                                title={avatar.name}
                            >
                                <div className="text-5xl select-none">
                                    {avatar.emoji}
                                </div>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                        ✓
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => handleScroll('right')}
                    disabled={scrollIndex >= maxIndex}
                    className={`p-2 rounded-lg transition-all ${scrollIndex >= maxIndex
                            ? 'bg-slate-700/50 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-700 text-white hover:bg-slate-600 hover:scale-110'
                        }`}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Page Indicator */}
            <div className="mt-3 text-center text-sm text-slate-400">
                {scrollIndex + 1}-{Math.min(scrollIndex + AVATARS_PER_VIEW, currentAvatars.length)} of {currentAvatars.length}
            </div>
        </div>
    );
};

export default AvatarCarousel;
