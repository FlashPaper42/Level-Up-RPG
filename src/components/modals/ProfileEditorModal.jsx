import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Award, TrendingUp } from 'lucide-react';
import { SKILL_DATA } from '../../constants/gameData';
import { loadProfileData, saveProfileData, getDataDirectory } from '../../utils/storage';
import { getDefaultStats } from '../../utils/achievementUtils';

const ProfileEditorModal = ({ isOpen, onClose, profileId, profileName, onSave }) => {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dataPath, setDataPath] = useState(null);
    const [activeTab, setActiveTab] = useState('skills'); // 'skills' or 'achievements'

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
                        xpToLevel: 10,
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

    const updateSkill = (skillId, field, value) => {
        setProfileData(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [skillId]: {
                    ...prev.skills[skillId],
                    [field]: field === 'level' || field === 'xp' || field === 'xpToLevel' || field === 'difficulty'
                        ? parseInt(value) || 0
                        : value
                }
            }
        }));
    };

    const updateStat = (statKey, value) => {
        setProfileData(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                [statKey]: typeof value === 'number' ? (parseInt(value) || 0) : value
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
    const stats = profileData.stats || getDefaultStats();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-slate-900 border-4 border-yellow-400 rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] shadow-2xl flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
                    <X size={24} />
                </button>

                <div className="flex-shrink-0 mb-4">
                    <h2 className="text-3xl font-bold text-yellow-400 uppercase tracking-wider mb-2">
                        Profile Editor: {profileName}
                    </h2>
                    {dataPath && (
                        <p className="text-xs text-slate-400">
                            Data Location: {dataPath}
                        </p>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b-2 border-slate-700">
                    <button
                        onClick={() => setActiveTab('skills')}
                        className={`px-4 py-2 font-bold uppercase tracking-wider transition-all ${
                            activeTab === 'skills'
                                ? 'text-yellow-400 border-b-2 border-yellow-400'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <TrendingUp size={16} className="inline mr-2" />
                        Skills & Levels
                    </button>
                    <button
                        onClick={() => setActiveTab('achievements')}
                        className={`px-4 py-2 font-bold uppercase tracking-wider transition-all ${
                            activeTab === 'achievements'
                                ? 'text-yellow-400 border-b-2 border-yellow-400'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Award size={16} className="inline mr-2" />
                        Achievements & Stats
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {activeTab === 'skills' && (
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded-lg border-2 border-slate-700">
                                <h3 className="text-xl text-blue-300 font-bold mb-4 uppercase">Edit Skill Levels</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {SKILL_DATA.map(skill => {
                                        const skillData = skills[skill.id] || { level: 1, xp: 0, xpToLevel: 10, difficulty: 1 };
                                        return (
                                            <div key={skill.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="font-bold text-white uppercase">{skill.name}</span>
                                                    <span className="text-xs text-slate-400">({skill.fantasyName})</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="text-xs text-slate-400 uppercase block mb-1">Level</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="200"
                                                            value={skillData.level || 1}
                                                            onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                                                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-400 uppercase block mb-1">XP</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={skillData.xp || 0}
                                                            onChange={(e) => updateSkill(skill.id, 'xp', e.target.value)}
                                                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-400 uppercase block mb-1">XP to Next Level</label>
                                                        <input
                                                            type="number"
                                                            min="10"
                                                            value={skillData.xpToLevel || 10}
                                                            onChange={(e) => updateSkill(skill.id, 'xpToLevel', e.target.value)}
                                                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-400 uppercase block mb-1">Difficulty (1-7)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="7"
                                                            value={skillData.difficulty || 1}
                                                            onChange={(e) => updateSkill(skill.id, 'difficulty', e.target.value)}
                                                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded-lg border-2 border-slate-700">
                                <h3 className="text-xl text-blue-300 font-bold mb-4 uppercase">Game Statistics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase block mb-1">Phantoms Caught</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stats.phantomsCaught || 0}
                                            onChange={(e) => updateStat('phantomsCaught', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase block mb-1">Total Mobs Defeated</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stats.totalMobsDefeated || 0}
                                            onChange={(e) => updateStat('totalMobsDefeated', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase block mb-1">Total Bosses Defeated</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stats.totalBossesDefeated || 0}
                                            onChange={(e) => updateStat('totalBossesDefeated', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase block mb-1">Total Minibosses Defeated</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stats.totalMinibossesDefeated || 0}
                                            onChange={(e) => updateStat('totalMinibossesDefeated', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase block mb-1">Total Deaths</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stats.totalDeaths || 0}
                                            onChange={(e) => updateStat('totalDeaths', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase block mb-1">Perfect Memory Games</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stats.perfectMemoryGames || 0}
                                            onChange={(e) => updateStat('perfectMemoryGames', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg border-2 border-slate-700">
                                <h3 className="text-xl text-blue-300 font-bold mb-4 uppercase">Raw Data</h3>
                                <p className="text-xs text-slate-400 mb-2">
                                    For advanced editing, you can view and edit the JSON file directly at: {dataPath || 'Loading...'}
                                </p>
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-yellow-400 hover:text-yellow-300 text-sm font-bold uppercase">
                                        View JSON Data
                                    </summary>
                                    <pre className="mt-2 p-3 bg-slate-900 rounded text-xs text-slate-300 overflow-auto max-h-64">
                                        {JSON.stringify(profileData, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        </div>
                    )}
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

