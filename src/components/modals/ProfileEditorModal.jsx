import React, { useState, useEffect } from 'react';
import { X, Save, Info, TrendingUp, HelpCircle } from 'lucide-react';
import { SKILL_DATA, DIFFICULTY_CONTENT } from '../../constants/gameData';
import { loadProfileData, saveProfileData, getDataDirectory } from '../../utils/storage';
import { getDefaultStats } from '../../utils/achievementUtils';
import { calculateXPToLevel, calculateMobHealth } from '../../utils/gameUtils';

// Skill-specific difficulty descriptions for parent info popups
// Level 7 descriptions are replaced with just "NIGHTMARE!" to keep it mysterious
const SKILL_DIFFICULTY_INFO = {
    reading: {
        name: 'Reading',
        popupDirection: 'down',
        isList: false, // Use visual progression instead of list
        progression: ['3', '4', '5', '6', '7', '8', 'NIGHTMARE!'],
        progressionLabel: 'Letter words',
        difficulties: [
            { level: '1-19', diff: 1, desc: 'Single-digit addition (0-9)' },
            { level: '20-39', diff: 2, desc: 'Addition (0-20)' },
            { level: '40-59', diff: 3, desc: 'Addition & subtraction (0-20)' },
            { level: '60-79', diff: 4, desc: 'Add, subtract, multiply (0-20)' },
            { level: '80-99', diff: 5, desc: 'All operations including division' },
            { level: '100-119', diff: 6, desc: 'Order of operations (PEMDAS)' },
            { level: '120+', diff: 7, desc: 'NIGHTMARE!' }
        ]
    },
    math: {
        name: 'Math',
        popupDirection: 'down',
        isList: true, // Keep as detailed list
        difficulties: [
            { level: '1-19', diff: 1, desc: 'Single-digit addition (0-9)' },
            { level: '20-39', diff: 2, desc: 'Addition (0-20)' },
            { level: '40-59', diff: 3, desc: 'Addition & subtraction (0-20)' },
            { level: '60-79', diff: 4, desc: 'Add, subtract, multiply (0-20)' },
            { level: '80-99', diff: 5, desc: 'All operations including division' },
            { level: '100-119', diff: 6, desc: 'Order of operations (PEMDAS)' },
            { level: '120+', diff: 7, desc: 'NIGHTMARE!' }
        ]
    },
    writing: {
        name: 'Writing',
        popupDirection: 'down',
        isList: false,
        progression: ['3', '4', '5', '6', '7', '8', 'NIGHTMARE!'],
        progressionLabel: 'Letter words to spell',
        difficulties: [
            { level: '1-19', diff: 1, desc: 'Spell 3-letter words' },
            { level: '20-39', diff: 2, desc: 'Spell 4-letter words' },
            { level: '40-59', diff: 3, desc: 'Spell 5-letter words' },
            { level: '60-79', diff: 4, desc: 'Spell 6-letter words' },
            { level: '80-99', diff: 5, desc: 'Spell 7-letter words' },
            { level: '100-119', diff: 6, desc: 'Spell 8-letter words' },
            { level: '120+', diff: 7, desc: 'NIGHTMARE!' }
        ]
    },
    patterns: {
        name: 'Patterns',
        popupDirection: 'up',
        isList: false,
        progression: ['3', '4', '5', '6', '7', '8', 'NIGHTMARE!'],
        progressionLabel: 'Axolotls in ring',
        difficulties: [
            { level: '1-19', diff: 1, desc: '3 axolotls in ring' },
            { level: '20-39', diff: 2, desc: '4 axolotls in ring' },
            { level: '40-59', diff: 3, desc: '5 axolotls in ring' },
            { level: '60-79', diff: 4, desc: '6 axolotls in ring' },
            { level: '80-99', diff: 5, desc: '7 axolotls in ring' },
            { level: '100-119', diff: 6, desc: '8 axolotls in ring' },
            { level: '120+', diff: 7, desc: 'NIGHTMARE!' }
        ]
    },
    memory: {
        name: 'Memory',
        popupDirection: 'up',
        isList: false,
        progression: ['6', '8', '10', '12', '14', '16', 'NIGHTMARE!'],
        progressionLabel: 'Cards to match',
        difficulties: [
            { level: '1-19', diff: 1, desc: '6 cards (3 pairs)' },
            { level: '20-39', diff: 2, desc: '8 cards (4 pairs)' },
            { level: '40-59', diff: 3, desc: '10 cards (5 pairs)' },
            { level: '60-79', diff: 4, desc: '12 cards (6 pairs)' },
            { level: '80-99', diff: 5, desc: '14 cards (7 pairs)' },
            { level: '100-119', diff: 6, desc: '16 cards (8 pairs)' },
            { level: '120+', diff: 7, desc: 'NIGHTMARE!' }
        ]
    },
    cleaning: {
        name: 'Cleaning',
        popupDirection: 'up',
        isList: false,
        message: 'Level has no gameplay significance for this Skill Card.',
        difficulties: [
            { level: '-', diff: '-', desc: 'Level has no gameplay significance for this Skill Card.' }
        ]
    }
};

const ProfileEditorModal = ({ isOpen, onClose, profileId, profileName, onSave }) => {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dataPath, setDataPath] = useState(null);
    const [activeSkillInfo, setActiveSkillInfo] = useState(null); // Track which skill info popup is open

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

            // Get data directory path
            const path = await getDataDirectory();
            setDataPath(path);
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
            // Show success message briefly
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

    // Calculate level from difficulty (lowest level of that difficulty range)
    const getLevelFromDifficulty = (difficulty) => {
        if (difficulty <= 1) return 1;
        if (difficulty >= 7) return 120;
        return (difficulty - 1) * 20 + 1;
    };

    const updateSkillDifficulty = (skillId, newDifficulty) => {
        const difficulty = Math.max(1, Math.min(7, parseInt(newDifficulty) || 1));
        const level = getLevelFromDifficulty(difficulty);
        // Reset XP to 0 when changing difficulty
        const xp = 0;
        // Calculate mob health based on difficulty
        const mobMaxHealth = calculateMobHealth(difficulty);
        
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
                    mobMaxHealth
                }
            }
        }));
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

    const skills = profileData.skills || {};

    return (
        <>
            {/* Large Info Popup - Fixed position on right side of screen */}
            {activeSkillInfo && (() => {
                const skillInfo = SKILL_DIFFICULTY_INFO[activeSkillInfo];
                if (!skillInfo) return null;
                const skillData = skills[activeSkillInfo] || { level: 1, difficulty: 1 };
                const level = skillData.level || 1;
                const currentDiff = level <= 0 ? 1 : Math.min(7, Math.ceil(level / 20));
                
                return (
                    <div 
                        className="fixed inset-0 z-[60] flex items-center justify-end pr-4 pointer-events-none"
                        onClick={() => setActiveSkillInfo(null)}
                    >
                        <div 
                            className="skill-info-popup bg-slate-900 border-4 border-blue-500 rounded-2xl p-8 shadow-2xl w-[500px] max-w-[90vw] max-h-[85vh] overflow-y-auto pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-blue-400 font-bold uppercase text-3xl">{skillInfo.name} Difficulties</h4>
                                <button
                                    onClick={() => setActiveSkillInfo(null)}
                                    className="text-slate-400 hover:text-white p-2 transition-colors"
                                >
                                    <X size={28} />
                                </button>
                            </div>
                            
                            {/* Visual progression format for non-Math skills */}
                            {!skillInfo.isList && skillInfo.progression && (
                                <div className="space-y-6">
                                    <p className="text-slate-300 text-xl mb-6 font-medium">{skillInfo.progressionLabel}:</p>
                                    <div className="flex items-center justify-center gap-4 flex-wrap">
                                        {skillInfo.progression.map((value, idx) => {
                                            const diff = idx + 1;
                                            const isCurrent = currentDiff === diff;
                                            const isNightmare = value === 'NIGHTMARE!';
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex flex-col items-center px-6 py-4 rounded-xl border-2 transition-all ${
                                                        isCurrent
                                                            ? 'bg-yellow-600/20 border-yellow-400 scale-110'
                                                            : isNightmare
                                                            ? 'bg-red-900/30 border-red-500'
                                                            : 'bg-slate-800/50 border-slate-600'
                                                    }`}
                                                >
                                                    <span className="text-sm text-slate-400 mb-2 font-medium">Difficulty {diff}</span>
                                                    <span className={`text-4xl font-bold ${isNightmare ? 'text-red-500' : 'text-white'}`}>
                                                        {value}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Cleaning special message */}
                            {!skillInfo.isList && skillInfo.message && (
                                <div className="text-center py-8">
                                    <p className="text-slate-300 text-2xl">{skillInfo.message}</p>
                                </div>
                            )}

                            {/* Detailed list format for Math */}
                            {skillInfo.isList && (
                                <div className="space-y-3 text-lg">
                                    {skillInfo.difficulties.map((d, idx) => (
                                        <div key={idx} className={`flex justify-between gap-4 py-3 px-4 rounded-lg ${currentDiff === d.diff ? 'bg-yellow-600/20' : 'bg-slate-800/30'}`}>
                                            <span className="text-slate-400 whitespace-nowrap font-medium text-xl">Difficulty {d.diff}</span>
                                            <span className={`text-right font-bold ${d.diff === 7 ? 'text-red-500 text-2xl' : 'text-slate-200 text-xl'}`}>{d.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative bg-slate-900 border-4 border-yellow-400 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] shadow-2xl flex flex-col">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
                        <X size={28} />
                    </button>

                    <div className="flex-shrink-0 mb-6">
                        <h2 className="text-4xl font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-4">
                            <TrendingUp size={36} />
                            Edit Difficulty: {profileName}
                        </h2>
                        <p className="text-lg text-slate-400">
                            Select difficulty level (1-7) for each skill. The system will automatically set the appropriate level. Click the <HelpCircle size={16} className="inline text-blue-400" /> button to see what each difficulty includes.
                        </p>
                    </div>

                    {/* Skills Grid */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {SKILL_DATA.map(skill => {
                            const skillData = skills[skill.id] || { level: 1, difficulty: 1 };
                            // Calculate difficulty: 1-19=1, 20-39=2, 40-59=3, etc.
                            // Use: Math.ceil(level / 20) but cap at 7, with special handling for level 0
                            const level = skillData.level || 1;
                            const currentDiff = level <= 0 ? 1 : Math.min(7, Math.ceil(level / 20));
                            return (
                                <div key={skill.id} className="bg-slate-800/50 p-5 rounded-xl border-2 border-slate-600 relative">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="font-bold text-white uppercase text-2xl">{skill.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveSkillInfo(activeSkillInfo === skill.id ? null : skill.id);
                                            }}
                                            className="p-2 rounded-full bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white transition-colors"
                                            title={`View ${skill.name} difficulty info`}
                                        >
                                            <HelpCircle size={20} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <label className="text-lg text-yellow-400 font-bold uppercase whitespace-nowrap">Difficulty:</label>
                                        <select
                                            value={currentDiff}
                                            onChange={(e) => updateSkillDifficulty(skill.id, e.target.value)}
                                            className={`w-16 h-16 bg-slate-900 border-2 border-slate-600 rounded-lg text-xl font-bold text-center focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer ${
                                                currentDiff === 7 ? 'text-red-400' : 'text-white'
                                            }`}
                                        >
                                            <option value={1} className="text-white">1</option>
                                            <option value={2} className="text-white">2</option>
                                            <option value={3} className="text-white">3</option>
                                            <option value={4} className="text-white">4</option>
                                            <option value={5} className="text-white">5</option>
                                            <option value={6} className="text-white">6</option>
                                            <option value={7} className="text-red-400">7</option>
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 mt-6 pt-6 border-t-2 border-slate-700 flex gap-6">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 px-8 rounded-xl font-bold uppercase tracking-wider transition-all border-2 border-slate-500 text-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex-1 py-4 px-8 rounded-xl font-bold uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-3 text-lg ${
                            isSaving
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
        </div>
        </>
    );
};

export default ProfileEditorModal;
