import React, { useState, useEffect } from 'react';
import { X, Save, Info, TrendingUp, HelpCircle } from 'lucide-react';
import { SKILL_DATA } from '../../constants/gameData';
import { loadProfileData, saveProfileData, getDataDirectory } from '../../utils/storage';
import { getDefaultStats } from '../../utils/achievementUtils';
import { calculateXPToLevel, calculateMobHealth } from '../../utils/gameUtils';

const ProfileEditorModal = ({ isOpen, onClose, profileId, profileName, onSave }) => {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dataPath, setDataPath] = useState(null);
    const [showCheatSheet, setShowCheatSheet] = useState(false);

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

    const updateSkillLevel = (skillId, newLevel) => {
        const level = Math.max(1, Math.min(200, parseInt(newLevel) || 1));
        // Calculate difficulty based on level: every 20 levels unlocks a new difficulty, cap at 7
        const difficulty = Math.min(7, Math.floor(level / 20) + 1);
        // Reset XP to 0 when changing level
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-slate-900 border-4 border-yellow-400 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] shadow-2xl flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
                    <X size={24} />
                </button>

                <div className="flex-shrink-0 mb-4">
                    <h2 className="text-3xl font-bold text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-3">
                        <TrendingUp size={28} />
                        Edit Levels: {profileName}
                    </h2>
                    <p className="text-sm text-slate-400">
                        Adjust player levels for each skill. Difficulty unlocks automatically based on level.
                    </p>
                </div>

                {/* Cheat Sheet Toggle */}
                <button
                    onClick={() => setShowCheatSheet(!showCheatSheet)}
                    className="mb-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-bold uppercase"
                >
                    <HelpCircle size={16} />
                    {showCheatSheet ? 'Hide' : 'Show'} Level & Difficulty Guide
                </button>

                {/* Cheat Sheet */}
                {showCheatSheet && (
                    <div className="mb-4 bg-slate-800/80 p-4 rounded-lg border-2 border-blue-600/50">
                        <h3 className="text-lg text-blue-300 font-bold mb-3 uppercase">📖 How Levels Work</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="text-yellow-400 font-bold mb-2">Level → Difficulty Unlock</h4>
                                <ul className="text-slate-300 space-y-1">
                                    <li>• Level 1-19: Difficulty 1</li>
                                    <li>• Level 20-39: Difficulty 2</li>
                                    <li>• Level 40-59: Difficulty 3</li>
                                    <li>• Level 60-79: Difficulty 4</li>
                                    <li>• Level 80-99: Difficulty 5</li>
                                    <li>• Level 100-119: Difficulty 6</li>
                                    <li>• Level 120+: Difficulty 7 (Nightmare)</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-yellow-400 font-bold mb-2">Special Encounters</h4>
                                <ul className="text-slate-300 space-y-1">
                                    <li>• <span className="text-purple-400">Miniboss</span>: Every 20 levels starting at 10</li>
                                    <li className="text-xs text-slate-400 ml-4">(Lvl 10, 30, 50, 70...)</li>
                                    <li>• <span className="text-red-400">Boss</span>: Every 20 levels starting at 20</li>
                                    <li className="text-xs text-slate-400 ml-4">(Lvl 20, 40, 60, 80...)</li>
                                </ul>
                                <h4 className="text-yellow-400 font-bold mb-2 mt-3">Difficulty Effects</h4>
                                <ul className="text-slate-300 space-y-1">
                                    <li>• Higher difficulty = Harder challenges</li>
                                    <li>• Higher difficulty = More XP rewards</li>
                                    <li>• Higher difficulty = Stronger mobs</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Skills Grid */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SKILL_DATA.map(skill => {
                            const skillData = skills[skill.id] || { level: 1, difficulty: 1 };
                            const currentDiff = Math.min(7, Math.floor(skillData.level / 20) + 1);
                            return (
                                <div key={skill.id} className="bg-slate-800/50 p-4 rounded-lg border-2 border-slate-600">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="font-bold text-white uppercase text-lg">{skill.name}</span>
                                            <span className="text-xs text-slate-400 ml-2">({skill.fantasyName})</span>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Diff: <span className={currentDiff >= 7 ? 'text-red-400' : 'text-blue-400'}>{currentDiff}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm text-yellow-400 font-bold uppercase whitespace-nowrap">Level:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="200"
                                            value={skillData.level || 1}
                                            onChange={(e) => updateSkillLevel(skill.id, e.target.value)}
                                            className="flex-1 bg-slate-900 border-2 border-slate-600 rounded-lg px-4 py-2 text-white text-xl font-bold text-center focus:outline-none focus:border-yellow-400 transition-colors"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 mt-4 pt-4 border-t-2 border-slate-700 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-lg font-bold uppercase tracking-wider transition-all border-2 border-slate-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex-1 py-3 px-6 rounded-lg font-bold uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-2 ${
                            isSaving
                                ? 'bg-slate-800 text-slate-500 border-slate-600 cursor-not-allowed'
                                : 'bg-yellow-600 hover:bg-yellow-500 text-white border-yellow-400 cursor-pointer'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditorModal;
