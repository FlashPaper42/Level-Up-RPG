import React, { useState } from 'react';
import { Sparkles, Flame, Snowflake, Zap, Skull, Star, Activity, Atom, Droplet, Grid3x3, Gem, Info } from 'lucide-react';
import SafeImage from '../ui/SafeImage';
import { ACHIEVEMENTS } from '../../constants/achievements';

const BORDER_EFFECTS = [
    { id: 'solid', name: 'Default', badge: null, description: 'Eternal golden radiance', icon: Star },
    { id: 'solid-picker', name: 'Default', badge: 'Wood', description: 'Customizable eternal glow', icon: Star },
    { id: 'gradient', name: 'Copper', badge: 'Stone', description: 'Mesmerizing arcane rotation', icon: Atom },
    { id: 'sparkle', name: 'Cloudy', badge: 'Gold', description: 'Celestial stardust shimmer', icon: Sparkles },
    { id: 'electric', name: 'Lightning Rod', badge: 'Iron', description: 'Thunderous plasma surge', icon: Zap },
    { id: 'lifestream', name: 'Lifestream', badge: 'Emerald', description: 'Flowing ethereal energy', icon: Activity },
    { id: 'frost', name: 'Frost', badge: 'Diamond', description: 'Glacial crystal majesty', icon: Snowflake },
    { id: 'fire', name: 'Lava', badge: 'Netherite', description: 'Infernal blazing fury', icon: Flame },
    { id: 'shadow', name: 'Nether Portal', badge: 'Obsidian', description: 'Abyssal void whispers', icon: Skull },
    { id: 'rainbow', name: 'Legendary!', badge: 'Star', description: 'Prismatic legendary aura', icon: Gem }
];

// Achievement-unlocked border effects
const ACHIEVEMENT_EFFECTS = [
    { id: 'livewire', name: 'Live Wire', achievement: 'speed_demon', description: 'Volatile electric arcs', icon: Zap },
    { id: 'void', name: 'Cosmic Void', achievement: 'world_ender', description: 'Infinite starlit expanse', icon: Atom },
    { id: 'toxic', name: 'Toxin', achievement: 'monster_manual', description: 'Caustic acid drip', icon: Droplet },
    { id: 'holo', name: 'Hologram', achievement: 'perfectionist', description: 'Digital reality glitch', icon: Grid3x3 },
    { id: 'crystal', name: 'Crystalline', achievement: 'full_set', description: 'Prismatic shard array', icon: Gem }
];

const CosmeticsDrawer = ({
    isOpen,
    activeTheme,
    setActiveTheme,
    selectedBorder,
    setSelectedBorder,
    borderColor,
    setBorderColor,
    unlockedBorders,
    unlockedAchievements = [] // New prop for unlocked achievements
}) => {
    const [showColorPicker, setShowColorPicker] = useState(false);

    const isBorderUnlocked = (badge) => {
        // Default (locked on yellow) is always unlocked
        if (badge === null) return true;
        // Check if the badge is unlocked
        return unlockedBorders.includes(badge);
    };

    const isAchievementEffectUnlocked = (achievementId) => {
        return unlockedAchievements.includes(achievementId);
    };

    return (
        <div
            className={`fixed h-full w-[85%] md:w-[60%] bg-[#0f172a]/95 backdrop-blur-xl z-50 border-r-4 border-slate-700 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ top: 0, left: 0 }}
        >
            <div className="p-6 h-full flex flex-col justify-start gap-6 overflow-y-auto scrollbar-hide text-slate-200 font-sans">
                <div className="flex justify-between items-center border-b-2 border-slate-700 pb-4 shrink-0">
                    <h2 className="text-4xl text-yellow-400 font-bold uppercase tracking-widest drop-shadow-md" style={{ fontFamily: '"VT323", monospace' }}>
                        Themes & Cosmetics
                    </h2>
                </div>

                {/* Border Effect Selection - Optimized Grid Layout */}
                <div>
                    <h3 className="text-xl text-blue-300 mb-4 font-bold flex items-center gap-3 uppercase tracking-wider">
                        <Sparkles size={20} /> Border Effects
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {/* All border effects (badge-unlocked and achievement-unlocked) */}
                        {BORDER_EFFECTS.map((effect, index) => {
                            const unlocked = isBorderUnlocked(effect.badge);
                            const isSelected = selectedBorder === effect.id;
                            const isSolid = effect.id === 'solid' || effect.id === 'solid-picker';
                            const showPicker = effect.id === 'solid-picker' && isSelected && showColorPicker;
                            const IconComponent = effect.icon;
                            const columnIndex = index % 3; // 0 = first column, 1 = middle, 2 = third column
                            const tooltipPosition = columnIndex === 2 ? 'right-full mr-2' : 'left-full ml-2';

                            return (
                                <div key={effect.id} className="relative group">
                                    <button
                                        onClick={() => {
                                            if (unlocked) {
                                                if (effect.id === 'solid-picker' && isSelected) {
                                                    setShowColorPicker(!showColorPicker);
                                                } else {
                                                    setSelectedBorder(effect.id);
                                                    setShowColorPicker(false);
                                                }
                                            }
                                        }}
                                        disabled={!unlocked}
                                        className={`relative p-3 rounded-lg border-2 transition-all duration-300 w-full ${!unlocked
                                            ? 'bg-slate-800/50 border-slate-600 opacity-70 cursor-not-allowed'
                                            : isSelected
                                                ? 'bg-yellow-900/30 border-yellow-400 ring-2 ring-yellow-400/20'
                                                : 'bg-slate-800/70 border-slate-600 hover:border-yellow-400/50 hover:scale-105'
                                            }`}
                                    >
                                        <div className="flex flex-col gap-2 items-center">
                                            {/* Effect Preview with Info Icon */}
                                            <div className="flex items-center justify-center gap-2">
                                                <div
                                                    className={`w-24 h-24 rounded border-4 flex items-center justify-center ${!isSolid ? `border-effect-${effect.id}` : ''
                                                        }`}
                                                    style={
                                                        isSolid
                                                            ? { borderColor: effect.id === 'solid' ? '#FFD700' : borderColor, boxShadow: `0 0 20px ${effect.id === 'solid' ? '#FFD700' : borderColor}` }
                                                            : (effect.id === 'gradient' || effect.id === 'sparkle')
                                                                ? { '--border-color': borderColor }
                                                                : {}
                                                    }
                                                >
                                                    <IconComponent
                                                        size={32}
                                                        className={`${!unlocked ? 'text-slate-600' : 'text-slate-300'}`}
                                                    />
                                                </div>
                                                {!unlocked && (
                                                    <Info size={16} className="text-slate-500" />
                                                )}
                                            </div>
                                            {/* Name and Description - Center Aligned */}
                                            <div className="text-center">
                                                <div className={`text-sm font-bold ${!unlocked ? 'text-slate-500' : 'text-yellow-400'}`}>
                                                    {effect.name}
                                                </div>
                                                <div className={`text-xs ${!unlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {effect.description}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                    ACTIVE
                                                </div>
                                            )}

                                            {/* Inline Color Picker for Solid Color with Picker */}
                                            {showPicker && (
                                                <div className="mt-2 p-2 bg-slate-900/80 rounded border border-slate-600 w-full">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={borderColor}
                                                            onChange={(e) => setBorderColor(e.target.value)}
                                                            className="w-10 h-10 rounded cursor-pointer border-2 border-slate-600"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="text-[9px] text-slate-400 mb-0.5">Color</div>
                                                            <div className="text-[11px] font-mono text-white">{borderColor.toUpperCase()}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                    {/* Badge Info Popup - CSS hover/focus based */}
                                    {!unlocked && effect.badge && (
                                        <div className={`absolute z-50 ${tooltipPosition} top-0 w-48 bg-slate-900 border-2 border-yellow-400 rounded-lg shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 pointer-events-none`}>
                                            <div className="flex items-start gap-2 mb-2">
                                                <div className="p-1.5 rounded bg-slate-700">
                                                    <IconComponent
                                                        size={20}
                                                        className="text-slate-400"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-slate-300">
                                                        {effect.badge} Badge Required
                                                    </h4>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Earn the {effect.badge} badge to unlock this effect
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400">
                                                ✗ Locked
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Achievement-unlocked effects */}
                        {ACHIEVEMENT_EFFECTS.map((effect, index) => {
                            const unlocked = isAchievementEffectUnlocked(effect.achievement);
                            const isSelected = selectedBorder === effect.id;
                            const IconComponent = effect.icon;
                            const achievement = ACHIEVEMENTS[effect.achievement];
                            // Calculate column index considering BORDER_EFFECTS come first
                            const totalIndex = BORDER_EFFECTS.length + index;
                            const columnIndex = totalIndex % 3; // 0 = first column, 1 = middle, 2 = third column
                            const tooltipPosition = columnIndex === 2 ? 'right-full mr-2' : 'left-full ml-2';

                            return (
                                <div key={effect.id} className="relative group">
                                    <button
                                        onClick={() => {
                                            if (unlocked) {
                                                setSelectedBorder(effect.id);
                                                setShowColorPicker(false);
                                            }
                                        }}
                                        disabled={!unlocked}
                                        className={`relative p-3 rounded-lg border-2 transition-all duration-300 w-full ${!unlocked
                                            ? 'bg-slate-800/50 border-slate-600 opacity-70 cursor-not-allowed'
                                            : isSelected
                                                ? 'bg-yellow-900/30 border-yellow-400 ring-2 ring-yellow-400/20'
                                                : 'bg-slate-800/70 border-slate-600 hover:border-yellow-400/50 hover:scale-105'
                                            }`}
                                    >
                                        <div className="flex flex-col gap-2 items-center">
                                            {/* Effect Preview with Info Icon */}
                                            <div className="flex items-center justify-center gap-2">
                                                <div
                                                    className={`w-24 h-24 rounded border-4 flex items-center justify-center border-effect-${effect.id}`}
                                                >
                                                    <IconComponent
                                                        size={32}
                                                        className={`${!unlocked ? 'text-slate-600' : 'text-slate-300'}`}
                                                    />
                                                </div>
                                                {!unlocked && (
                                                    <Info size={16} className="text-slate-500" />
                                                )}
                                            </div>
                                            {/* Name and Description - Center Aligned */}
                                            <div className="text-center">
                                                <div className={`text-sm font-bold ${!unlocked ? 'text-slate-500' : 'text-yellow-400'}`}>
                                                    {effect.name}
                                                </div>
                                                <div className={`text-xs ${!unlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {effect.description}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                    ACTIVE
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                    {/* Achievement Info Popup - CSS hover/focus based */}
                                    <div className={`absolute z-50 ${tooltipPosition} top-0 w-64 bg-slate-900 border-2 border-yellow-400 rounded-lg shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 pointer-events-none`}>
                                        <div className="flex items-start gap-2 mb-2">
                                            {achievement && (
                                                <>
                                                    <div className={`p-1.5 rounded ${unlocked ? 'bg-yellow-400/20' : 'bg-slate-700'}`}>
                                                        <IconComponent
                                                            size={20}
                                                            className={unlocked ? 'text-yellow-400' : 'text-slate-400'}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className={`text-sm font-bold ${unlocked ? 'text-yellow-400' : 'text-slate-300'}`}>
                                                            {achievement.name}
                                                        </h4>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            {achievement.description}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded ${unlocked ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                            {unlocked ? '✓ Unlocked' : '✗ Locked'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CosmeticsDrawer;
