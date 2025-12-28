import React, { useState, useEffect } from 'react';
import { X, Save, ChevronRight, Flame, HelpCircle, BookOpen, Calculator, PenTool, Puzzle, Brain, Sparkles } from 'lucide-react';
import { SKILL_DATA } from '../../constants/gameData';
import { loadProfileData, saveProfileData } from '../../utils/storage';
import { getDefaultStats } from '../../utils/achievementUtils';
import { calculateMobHealth } from '../../utils/gameUtils';

// Parent-friendly skill information with clear descriptions
const PARENT_SKILL_INFO = {
    reading: {
        name: 'Reading',
        icon: BookOpen,
        color: '#a855f7',
        shortDesc: 'Speak words aloud to defeat monsters',
        fullDesc: 'Your child speaks words displayed on screen to attack enemies. The game uses speech recognition to check pronunciation.',
        levels: [
            { level: 1, label: '3-letter words', example: 'CAR, SUN, BIG', ageHint: 'Ages 4-5' },
            { level: 2, label: '4-letter words', example: 'BOOK, TREE, FISH', ageHint: 'Ages 5-6' },
            { level: 3, label: '5-letter words', example: 'APPLE, HOUSE, WATER', ageHint: 'Ages 6-7' },
            { level: 4, label: '6-letter words', example: 'BANANA, ORANGE, FRIEND', ageHint: 'Ages 7-8' },
            { level: 5, label: '7-letter words', example: 'DIAMOND, RAINBOW, DOLPHIN', ageHint: 'Ages 8-9' },
            { level: 6, label: '8-letter words', example: 'SKELETON, ELEPHANT, TREASURE', ageHint: 'Ages 9+' },
            { level: 7, label: 'NIGHTMARE!', example: 'Extremely long, silly words', ageHint: 'For fun!', isNightmare: true }
        ]
    },
    math: {
        name: 'Math',
        icon: Calculator,
        color: '#ef4444',
        shortDesc: 'Solve math problems to power attacks',
        fullDesc: 'Your child solves math equations to deal damage to enemies. Problems get more complex at higher levels.',
        levels: [
            { level: 1, label: 'Simple addition (0-9)', example: '3 + 2 = ?', ageHint: 'Ages 4-5' },
            { level: 2, label: 'Addition (0-20)', example: '8 + 7 = ?', ageHint: 'Ages 5-6' },
            { level: 3, label: 'Addition & subtraction', example: '15 - 8 = ?', ageHint: 'Ages 6-7' },
            { level: 4, label: 'Add, subtract, multiply', example: '6 × 4 = ?', ageHint: 'Ages 7-8' },
            { level: 5, label: 'All four operations', example: '24 ÷ 6 = ?', ageHint: 'Ages 8-9' },
            { level: 6, label: 'Order of operations', example: '(3 + 2) × 4 = ?', ageHint: 'Ages 9+' },
            { level: 7, label: 'NIGHTMARE!', example: 'Complex multi-step problems', ageHint: 'For fun!', isNightmare: true }
        ]
    },
    writing: {
        name: 'Writing',
        icon: PenTool,
        color: '#06b6d4',
        shortDesc: 'Type item names to craft weapons',
        fullDesc: 'Your child types the spelling of Minecraft items and creatures shown on screen. Great for practicing spelling!',
        levels: [
            { level: 1, label: '3-letter words', example: 'AXE, BED, EGG', ageHint: 'Ages 4-5' },
            { level: 2, label: '4-letter words', example: 'BOAT, DOOR, WOOL', ageHint: 'Ages 5-6' },
            { level: 3, label: '5-letter words', example: 'CHEST, HORSE, APPLE', ageHint: 'Ages 6-7' },
            { level: 4, label: '6-letter words', example: 'BUCKET, ZOMBIE, TURTLE', ageHint: 'Ages 7-8' },
            { level: 5, label: '7-letter words', example: 'DIAMOND, CHICKEN, CREEPER', ageHint: 'Ages 8-9' },
            { level: 6, label: '8-letter words', example: 'SKELETON, ENDERMAN, GUARDIAN', ageHint: 'Ages 9+' },
            { level: 7, label: 'NIGHTMARE!', example: 'Very long creature names', ageHint: 'For fun!', isNightmare: true }
        ]
    },
    memory: {
        name: 'Memory',
        icon: Brain,
        color: '#ec4899',
        shortDesc: 'Find matching pairs of cards',
        fullDesc: 'A classic memory matching game! Your child flips cards to find matching pairs of Minecraft mobs and items.',
        levels: [
            { level: 1, label: '6 cards (3 pairs)', example: 'Small 3×2 grid', ageHint: 'Ages 4-5' },
            { level: 2, label: '8 cards (4 pairs)', example: '4×2 grid', ageHint: 'Ages 5-6' },
            { level: 3, label: '10 cards (5 pairs)', example: '5×2 grid', ageHint: 'Ages 6-7' },
            { level: 4, label: '12 cards (6 pairs)', example: '4×3 grid', ageHint: 'Ages 7-8' },
            { level: 5, label: '14 cards (7 pairs)', example: '4×4 grid with gaps', ageHint: 'Ages 8-9' },
            { level: 6, label: '16 cards (8 pairs)', example: 'Full 4×4 grid', ageHint: 'Ages 9+' },
            { level: 7, label: 'NIGHTMARE!', example: '20 cards (10 pairs)!', ageHint: 'For fun!', isNightmare: true }
        ]
    },
    patterns: {
        name: 'Patterns',
        icon: Puzzle,
        color: '#f97316',
        shortDesc: 'Repeat color patterns in sequence',
        fullDesc: 'Colored axolotls light up in a pattern. Your child clicks them in the same order to progress.',
        levels: [
            { level: 1, label: '3 axolotls', example: 'Small ring, short sequences', ageHint: 'Ages 4-5' },
            { level: 2, label: '4 axolotls', example: 'Slightly longer patterns', ageHint: 'Ages 5-6' },
            { level: 3, label: '5 axolotls', example: 'Medium complexity', ageHint: 'Ages 6-7' },
            { level: 4, label: '6 axolotls', example: 'More colors to track', ageHint: 'Ages 7-8' },
            { level: 5, label: '7 axolotls', example: 'Challenging patterns', ageHint: 'Ages 8-9' },
            { level: 6, label: '8 axolotls', example: 'Full ring of colors', ageHint: 'Ages 9+' },
            { level: 7, label: 'NIGHTMARE!', example: 'Patterns reset mid-game!', ageHint: 'For fun!', isNightmare: true }
        ]
    },
    cleaning: {
        name: 'Cleaning',
        icon: Sparkles,
        color: '#10b981',
        shortDesc: 'A real-life chore activity!',
        fullDesc: 'This is a real-life activity! Your child confirms completing chores in the real world. Visit the Cleaning skill card in the carousel to learn more about how it works.',
        levels: [
            { level: 1, label: 'No difficulty effect', example: 'Same gameplay at all levels', ageHint: 'All ages' },
            { level: 2, label: 'No difficulty effect', example: 'Same gameplay at all levels', ageHint: 'All ages' },
            { level: 3, label: 'No difficulty effect', example: 'Same gameplay at all levels', ageHint: 'All ages' },
            { level: 4, label: 'No difficulty effect', example: 'Same gameplay at all levels', ageHint: 'All ages' },
            { level: 5, label: 'No difficulty effect', example: 'Same gameplay at all levels', ageHint: 'All ages' },
            { level: 6, label: 'No difficulty effect', example: 'Same gameplay at all levels', ageHint: 'All ages' },
            { level: 7, label: 'No difficulty effect', example: 'Same gameplay at all levels', ageHint: 'All ages' }
        ],
        isExempt: true
    }
};

// Get difficulty color based on level
const getDifficultyColor = (level) => {
    if (level <= 2) return '#22c55e'; // Green
    if (level <= 4) return '#eab308'; // Yellow
    if (level <= 6) return '#f97316'; // Orange
    return '#ef4444'; // Red for nightmare
};

const ProfileEditorModal = ({ isOpen, onClose, profileId, profileName, onSave }) => {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState('reading'); // Default to reading

    useEffect(() => {
        if (isOpen && profileId) {
            loadData();
        }
    }, [isOpen, profileId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await loadProfileData(profileId);
            if (data) {
                setProfileData(data);
            } else {
                // Initialize empty profile
                const initialSkills = {};
                SKILL_DATA.forEach(skill => {
                    initialSkills[skill.id] = {
                        level: 1,
                        xp: 0,
                        difficulty: 1,
                        earnedBadges: []
                    };
                });
                setProfileData({
                    skills: initialSkills,
                    theme: 'minecraft',
                    stats: getDefaultStats()
                });
            }
        } catch (error) {
            console.error('Failed to load profile data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveProfileData(profileId, profileData);
            if (onSave) {
                onSave();
            }
            setTimeout(() => {
                setIsSaving(false);
                onClose();
            }, 500);
        } catch (error) {
            console.error('Failed to save profile data:', error);
            setIsSaving(false);
            alert('Failed to save profile data. Please try again.');
        }
    };

    // Calculate level from difficulty
    const getLevelFromDifficulty = (difficulty) => {
        if (difficulty <= 1) return 1;
        if (difficulty >= 7) return 120;
        return (difficulty - 1) * 20 + 1;
    };

    const updateSkillDifficulty = (skillId, newDifficulty) => {
        const difficulty = Math.max(1, Math.min(7, parseInt(newDifficulty) || 1));
        const level = getLevelFromDifficulty(difficulty);
        const xp = 0;
        const mobMaxHealth = calculateMobHealth(difficulty);

        // Calculate what badges the player should have at this level
        // Badges are earned at level thresholds: 20=tier1, 40=tier2, etc.
        const earnedBadges = [];
        for (let tier = 1; tier <= 7; tier++) {
            if (level >= tier * 20) {
                earnedBadges.push(tier);
            }
        }

        setProfileData(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [skillId]: {
                    ...prev.skills[skillId],
                    level,
                    xp,
                    difficulty,
                    mobHealth: mobMaxHealth,
                    mobMaxHealth,
                    earnedBadges // Sync badges based on level
                }
            }
        }));
    };

    const getCurrentDifficulty = (skillId) => {
        const skillData = profileData?.skills?.[skillId];
        if (!skillData) return 1;
        const level = skillData.level || 1;
        return level <= 0 ? 1 : Math.min(7, Math.ceil(level / 20));
    };

    if (!isOpen) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative bg-slate-900 border-4 border-yellow-400 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                        <p>Loading profile data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profileData) return null;

    const selectedSkillInfo = PARENT_SKILL_INFO[selectedSkill];
    const currentDiff = getCurrentDifficulty(selectedSkill);
    const IconComponent = selectedSkillInfo.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-slate-900 border-4 border-yellow-400 rounded-2xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-slate-700 shrink-0">
                    <div>
                        <h2 className="text-3xl font-bold text-yellow-400 uppercase tracking-wider">
                            Set Difficulty Levels
                        </h2>
                        <p className="text-slate-400 mt-1">Profile: <span className="text-white font-semibold">{profileName}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2">
                        <X size={28} />
                    </button>
                </div>

                {/* Two-panel content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel - Skill List */}
                    <div className="w-1/3 border-r-2 border-slate-700 overflow-y-auto p-4 space-y-2">
                        <p className="text-sm text-slate-400 mb-4 px-2">Select a skill to adjust:</p>
                        {Object.entries(PARENT_SKILL_INFO).map(([skillId, info]) => {
                            const diff = getCurrentDifficulty(skillId);
                            const Icon = info.icon;
                            const isSelected = selectedSkill === skillId;

                            return (
                                <button
                                    key={skillId}
                                    onClick={() => setSelectedSkill(skillId)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${isSelected
                                        ? 'bg-slate-700 border-2 border-yellow-400'
                                        : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-700/50 hover:border-slate-600'
                                        }`}
                                >
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${info.color}30` }}
                                    >
                                        <Icon size={24} style={{ color: info.color }} />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="font-bold text-white text-lg">{info.name}</div>
                                        <div className="text-sm text-slate-400 truncate">{info.shortDesc}</div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                                            style={{ backgroundColor: getDifficultyColor(diff) }}
                                        >
                                            {diff}
                                        </div>
                                        <ChevronRight size={20} className={isSelected ? 'text-yellow-400' : 'text-slate-600'} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Panel - Difficulty Details */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Skill Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${selectedSkillInfo.color}30` }}
                            >
                                <IconComponent size={32} style={{ color: selectedSkillInfo.color }} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">{selectedSkillInfo.name}</h3>
                                <p className="text-slate-400">{selectedSkillInfo.fullDesc}</p>
                            </div>
                        </div>

                        {/* Difficulty notice for exempt skills */}
                        {selectedSkillInfo.isExempt && (
                            <div className="bg-emerald-900/30 border-2 border-emerald-600/50 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                                    <HelpCircle size={20} />
                                    <span>This skill is for fun!</span>
                                </div>
                                <p className="text-slate-300 mt-1 text-sm">
                                    Difficulty has no effect on gameplay for Cleaning. It's a reward activity between learning sessions.
                                </p>
                            </div>
                        )}

                        {/* Difficulty Selector */}
                        <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-lg font-bold text-white">Select Difficulty Level</span>
                                <span className="text-slate-400">
                                    Current: <span className="text-yellow-400 font-bold text-xl">{currentDiff}</span>
                                </span>
                            </div>

                            {/* Visual Difficulty Steps */}
                            <div className="flex items-center justify-between gap-2 mb-4">
                                {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                                    const isSelected = currentDiff === level;
                                    const isNightmare = level === 7;
                                    const color = getDifficultyColor(level);

                                    return (
                                        <button
                                            key={level}
                                            onClick={() => updateSkillDifficulty(selectedSkill, level)}
                                            className={`flex-1 py-4 rounded-xl font-bold text-xl transition-all relative ${isSelected
                                                ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900 scale-105'
                                                : 'hover:scale-102 opacity-70 hover:opacity-100'
                                                }`}
                                            style={{
                                                backgroundColor: isSelected ? color : `${color}40`,
                                                color: isSelected ? 'white' : color
                                            }}
                                        >
                                            {isNightmare ? (
                                                <Flame size={24} className="mx-auto pointer-events-none" />
                                            ) : (
                                                level
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Difficulty labels */}
                            <div className="flex justify-between text-xs text-slate-500 px-2">
                                <span>Easiest</span>
                                <span>Hardest</span>
                            </div>
                        </div>

                        {/* Current Level Details */}
                        <div className="bg-slate-800/50 rounded-xl p-6">
                            <h4 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                                <span
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: getDifficultyColor(currentDiff) }}
                                >
                                    {currentDiff === 7 ? <Flame size={16} /> : currentDiff}
                                </span>
                                Level {currentDiff} Details
                            </h4>

                            {(() => {
                                const levelInfo = selectedSkillInfo.levels[currentDiff - 1];
                                return (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1">
                                                <div className="text-slate-400 text-sm uppercase tracking-wider mb-1">Challenge Type</div>
                                                <div className={`text-xl font-bold ${levelInfo.isNightmare ? 'text-red-400' : 'text-white'}`}>
                                                    {levelInfo.label}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-slate-400 text-sm uppercase tracking-wider mb-1">Recommended</div>
                                                <div className={`text-xl font-bold ${levelInfo.isNightmare ? 'text-orange-400' : 'text-green-400'}`}>
                                                    {levelInfo.ageHint}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-slate-400 text-sm uppercase tracking-wider mb-1">Example</div>
                                            <div className="text-white bg-slate-900/50 rounded-lg p-3 font-mono text-lg">
                                                {levelInfo.example}
                                            </div>
                                        </div>

                                        {levelInfo.isNightmare && (
                                            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
                                                <Flame className="text-red-400 shrink-0" size={20} />
                                                <span className="text-red-300 text-sm">
                                                    NIGHTMARE mode is designed to challenge even adults! Great for fun family competitions.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Helpful tip */}
                        {!selectedSkillInfo.isExempt && (
                            <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
                                    <div className="text-sm text-blue-200">
                                        <strong className="text-blue-300">Tip:</strong> Start with a level where your child can succeed most of the time.
                                        If they're getting frustrated, try an easier level. The game will naturally guide them to progress when they're ready!
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-4 p-6 border-t-2 border-slate-700 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 px-6 rounded-xl font-bold uppercase tracking-wider transition-all border-2 border-slate-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex-1 py-4 px-6 rounded-xl font-bold uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-3 ${isSaving
                            ? 'bg-slate-800 text-slate-500 border-slate-600 cursor-not-allowed'
                            : 'bg-yellow-600 hover:bg-yellow-500 text-white border-yellow-400 cursor-pointer'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default ProfileEditorModal;
