import React from 'react';
import { Lock } from 'lucide-react';
import SafeImage from '../ui/SafeImage';
import { BADGE_TIERS, BASE_ASSETS, SKILL_DATA } from '../../constants/gameData';
import { ACHIEVEMENTS, TIER_COLORS, TIER_NAMES } from '../../constants/achievements';
import {
    isAchievementUnlocked,
    getCurrentTier,
    getNextTier,
    getTierProgress,
    getAchievementDisplayName
} from '../../utils/achievementUtils';
import { calculateXPToLevel } from '../../utils/gameUtils';

// Achievement grid constants
const ACHIEVEMENT_GRID_COLUMNS = 6;
const TOOLTIP_POSITION_THRESHOLD = 4; // Columns >= this show tooltip on left

const MenuDrawer = ({ isOpen, skills, stats }) => {
    const totalLevels = Object.values(skills).reduce((acc, s) => acc + s.level, 0);

    // Calculate total badges earned
    const totalBadges = Object.values(skills).reduce((acc, skill) => {
        let count = BADGE_TIERS.filter(tier => skill.level >= tier.level).length;
        if (skill.level >= 180) {
            const legendaryCount = Math.floor((skill.level - 160) / 20);
            count += legendaryCount;
        }
        return acc + count;
    }, 0);

    // Count unlocked achievements
    const unlockedAchievements = Object.keys(ACHIEVEMENTS).filter(id =>
        isAchievementUnlocked(id, stats, skills)
    ).length;
    const totalAchievements = Object.keys(ACHIEVEMENTS).length;

    return (
        <div
            className={`fixed h-full w-[75%] md:w-[60%] bg-[#1a1a1a]/95 backdrop-blur-md z-50 border-l-4 border-stone-600 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ top: 0, right: 0 }}
        >
            <div className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="shrink-0 border-b-4 border-stone-600 pb-4 mb-4">
                    <h2 className="text-5xl text-yellow-400 font-bold uppercase tracking-widest mb-2 drop-shadow-md">Achievements</h2>
                    <div className="flex gap-6 text-stone-400 text-2xl">
                        <p>Total Level: <span className="text-white font-bold">{totalLevels}</span></p>
                        <p>Badges: <span className="text-yellow-400 font-bold">{totalBadges}</span></p>
                        <p>Achievements: <span className="text-green-400 font-bold">{unlockedAchievements}/{totalAchievements}</span></p>
                    </div>
                </div>

                {/* Content Area - Single scrollable view */}
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    {/* Skill Badges Section */}
                    <div className="grid grid-cols-2 gap-4">
                        {Object.keys(skills).map(key => {
                            const userSkill = skills[key];
                            const skillDifficulty = userSkill.difficulty || 1;
                            const xpToLevel = calculateXPToLevel(skillDifficulty, userSkill.level);
                            const xpPercent = Math.min(100, (userSkill.xp / xpToLevel) * 100);
                            const skillConfig = SKILL_DATA.find(s => s.id === key);
                            const legendaryCount = userSkill.level >= 180 ? Math.floor((userSkill.level - 160) / 20) : 0;

                            return (
                                <div key={key} className="bg-black/40 p-4 rounded-xl border-2 border-stone-700">
                                    {/* Compact Skill Header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        {skillConfig && <SafeImage src={skillConfig.img} alt={key} className="w-12 h-12 object-contain shrink-0" />}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="text-2xl font-bold text-white tracking-wide truncate">{key.toUpperCase()}</h3>
                                                <span className="text-stone-400 text-xl font-bold ml-2 shrink-0">Lvl {userSkill.level}</span>
                                            </div>
                                            <div className="w-full h-3 bg-stone-900 rounded-full border border-stone-600 relative overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500" style={{ width: `${xpPercent}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Compact Badge Row */}
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {BADGE_TIERS.map((tier) => {
                                            const isUnlocked = userSkill.level >= tier.level;
                                            return (
                                                <div
                                                    key={tier.level}
                                                    className="group relative"
                                                    title={`${tier.title} - Level ${tier.level}`}
                                                >
                                                    <div className={`w-11 h-11 border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${isUnlocked
                                                            ? 'border-yellow-500 bg-stone-800 shadow-md hover:scale-110'
                                                            : 'border-stone-600 bg-stone-900/50 opacity-50 grayscale'
                                                        }`}>
                                                        {isUnlocked ? (
                                                            <SafeImage src={BASE_ASSETS.badges[tier.title]} className="w-8 h-8 object-contain" />
                                                        ) : (
                                                            <Lock size={16} className="text-stone-500" />
                                                        )}
                                                    </div>
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                        {tier.title} (Lvl {tier.level})
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* LEGENDARY Badge(s) */}
                                        {legendaryCount > 0 && (
                                            <div
                                                className="group relative"
                                                title="LEGENDARY!"
                                            >
                                                <div className="w-11 h-11 border-2 rounded-lg flex items-center justify-center border-yellow-500 bg-gradient-to-br from-yellow-900 to-stone-800 shadow-lg relative hover:scale-110 transition-all duration-300">
                                                    <SafeImage src={BASE_ASSETS.badges.Legendary} className="w-8 h-8 object-contain" />
                                                    {legendaryCount >= 2 && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border border-yellow-400 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold text-xs">{legendaryCount}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    LEGENDARY! (Lvl 180+)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Special Achievements Section */}
                    <div className="mt-8">
                        <h3 className="text-3xl text-yellow-400 font-bold uppercase tracking-widest mb-4 border-b-2 border-stone-600 pb-2">
                            Special Achievements
                        </h3>
                        <div className="grid grid-cols-6 gap-3">
                            {Object.values(ACHIEVEMENTS).map((achievement, index) => {
                                const Icon = achievement.icon;
                                const unlocked = isAchievementUnlocked(achievement.id, stats, skills);

                                // For tiered achievements
                                let currentTierIndex = -1;
                                let nextTier = null;
                                let progress = 0;
                                let tierProgress = 0;
                                let displayName = achievement.name;
                                let tierColor = null;

                                if (achievement.isTiered) {
                                    currentTierIndex = getCurrentTier(achievement.id, stats, skills);
                                    nextTier = getNextTier(achievement.id, stats, skills);
                                    progress = achievement.getProgress(stats, skills);
                                    tierProgress = getTierProgress(achievement.id, stats, skills);
                                    displayName = getAchievementDisplayName(achievement.id, stats, skills);

                                    if (unlocked && currentTierIndex >= 0) {
                                        tierColor = TIER_COLORS[currentTierIndex + 1];
                                    }
                                }

                                // Calculate tooltip position (grid-cols-6)
                                const columnIndex = index % ACHIEVEMENT_GRID_COLUMNS;
                                const tooltipPosition = columnIndex >= TOOLTIP_POSITION_THRESHOLD ? 'right-full mr-2' : 'left-full ml-2';

                                return (
                                    <div key={achievement.id} className="relative group">
                                        {/* Achievement Square */}
                                        <div
                                            className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${unlocked
                                                    ? tierColor
                                                        ? 'hover:scale-110'
                                                        : 'border-yellow-500 bg-yellow-900/20 hover:scale-110'
                                                    : 'border-stone-600 bg-stone-900/50 opacity-60 hover:opacity-80'
                                                }`}
                                            style={unlocked && tierColor ? {
                                                borderColor: tierColor.border,
                                                backgroundColor: tierColor.bg
                                            } : {}}
                                        >
                                            <Icon
                                                size={32}
                                                className={
                                                    unlocked
                                                        ? tierColor ? tierColor.text : 'text-yellow-400'
                                                        : 'text-stone-500'
                                                }
                                            />
                                        </div>

                                        {/* Hover Popup */}
                                        <div className={`absolute z-50 ${tooltipPosition} top-0 w-80 bg-slate-900 border-2 border-yellow-400 rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none`}>
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className={`p-2 rounded ${unlocked ? (tierColor ? 'bg-opacity-20' : 'bg-yellow-400/20') : 'bg-slate-700'}`}
                                                    style={unlocked && tierColor ? { backgroundColor: tierColor.bg } : {}}
                                                >
                                                    <Icon
                                                        size={28}
                                                        className={unlocked ? (tierColor ? tierColor.text : 'text-yellow-400') : 'text-slate-400'}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`text-xl font-bold ${unlocked ? (tierColor ? tierColor.text : 'text-yellow-400') : 'text-slate-400'}`}>
                                                        {displayName}
                                                    </h4>
                                                    <p className="text-lg text-slate-300 mt-1">
                                                        {achievement.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress Bar for Tiered Achievements */}
                                            {achievement.isTiered && (
                                                <div className="mb-2">
                                                    <div className="flex justify-between text-base text-slate-400 mb-1">
                                                        <span>Progress: {progress}</span>
                                                        {nextTier && <span>Next: {nextTier.level}</span>}
                                                    </div>
                                                    {nextTier && (
                                                        <>
                                                            <div className="w-full h-3 bg-stone-900 rounded-full border border-stone-600 overflow-hidden">
                                                                <div
                                                                    className="h-full transition-all duration-500"
                                                                    style={{
                                                                        width: `${tierProgress}%`,
                                                                        backgroundColor: tierColor ? tierColor.border : '#FFD700'
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <p className="text-base text-slate-400 mt-1">
                                                                Next: {TIER_NAMES[currentTierIndex + 1]}
                                                            </p>
                                                        </>
                                                    )}
                                                    {!nextTier && unlocked && (
                                                        <p className="text-lg text-green-400 font-bold">MAX TIER REACHED!</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Unlock Status */}
                                            <div className={`text-lg px-3 py-2 rounded ${unlocked ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                {unlocked ? '✓ Unlocked' : '🔒 Locked'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuDrawer;
