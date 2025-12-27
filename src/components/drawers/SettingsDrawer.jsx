import React, { useState } from 'react';
import { Users, Music, Trash2, AlertTriangle, Edit3, Crown, LockOpen } from 'lucide-react';
import ProfileCard from '../profile/ProfileCard';
import ProfileEditorModal from '../modals/ProfileEditorModal';

const SettingsDrawer = ({ isOpen, onReset, bgmVol, setBgmVol, sfxVol, setSfxVol, currentProfile, onSwitchProfile, profileNames, onRenameProfile, getProfileStats, parentStatus, onParentVerified, currentSkills, selectedAvatar, selectedBorder, borderColor, hasProfilePin, setProfilePin, verifyProfilePin, clearProfilePin }) => {
    const [editingProfileId, setEditingProfileId] = useState(null);
    // Helper to get avatar for each profile
    const getProfileAvatar = (profileId) => {
        if (profileId === currentProfile) {
            return selectedAvatar;
        }
        // Load from localStorage for other profiles
        const saved = localStorage.getItem(`profileAvatar_p${profileId}`);
        return saved || 'person';
    };

    // Helper to get border for each profile
    const getProfileBorder = (profileId) => {
        if (profileId === currentProfile) {
            return selectedBorder;
        }
        const saved = localStorage.getItem(`borderEffect_p${profileId}`);
        return saved || 'solid';
    };

    // Helper to get border color for each profile
    const getProfileBorderColor = (profileId) => {
        if (profileId === currentProfile) {
            return borderColor;
        }
        const saved = localStorage.getItem(`borderColor_p${profileId}`);
        return saved || '#FFD700';
    };

    // Helper to get background color for each profile
    const getProfileBgColor = (profileId) => {
        const saved = localStorage.getItem(`profileBgColor_p${profileId}`);
        return saved || 'linear-gradient(to bottom, #7e22ce, #581c87)';
    };

    return (
        <div
            className={`fixed h-full w-[85%] md:w-[60%] bg-[#0f172a]/95 backdrop-blur-xl z-50 border-r-4 border-slate-700 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ top: 0, left: 0 }}
        >
            <div className="p-6 h-full flex flex-col text-slate-200 font-sans">
                {/* Header - Fixed at top */}
                <div className="flex justify-between items-center border-b-2 border-slate-700 pb-4 shrink-0">
                    <h2 className="text-4xl text-yellow-400 font-bold uppercase tracking-widest drop-shadow-md" style={{ fontFamily: '"VT323", monospace' }}>Settings</h2>
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto scrollbar-hide py-6">
                    <div className="flex flex-col gap-6">
                        <div>
                            <h3 className="text-xl text-blue-300 mb-5 font-bold flex items-center gap-3 uppercase tracking-wider"><Users size={20} /> Select File</h3>
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map(id => (
                                    <ProfileCard
                                        key={id}
                                        id={id}
                                        name={profileNames[id]}
                                        stats={id === currentProfile ? getProfileStats(id, currentSkills) : getProfileStats(id)}
                                        isCurrent={currentProfile === id}
                                        onSwitch={onSwitchProfile}
                                        onRename={onRenameProfile}
                                        isParent={parentStatus && parentStatus[id]}
                                        onParentVerified={onParentVerified}
                                        selectedAvatar={getProfileAvatar(id)}
                                        selectedBorder={getProfileBorder(id)}
                                        borderColor={getProfileBorderColor(id)}
                                        profileBgColor={getProfileBgColor(id)}
                                        hasPin={hasProfilePin && hasProfilePin(id)}
                                        onSetPin={setProfilePin}
                                        onVerifyPin={verifyProfilePin}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Parent Profile Editor - Only show if current profile is a parent */}
                        {parentStatus && parentStatus[currentProfile] && (
                            <div>
                                <h3 className="text-lg text-yellow-300 mb-3 font-bold flex items-center gap-2 uppercase tracking-wider">
                                    <Crown size={18} className="text-yellow-400" /> Parent Tools
                                </h3>
                                <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border-2 border-yellow-600/50">
                                    {/* Edit Levels Section */}
                                    <div>
                                        <p className="text-slate-400 text-sm mb-2 font-medium">
                                            Edit skill levels for each profile:
                                        </p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(id => (
                                                <button
                                                    key={id}
                                                    onClick={() => setEditingProfileId(id)}
                                                    className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 p-2 rounded-lg border border-yellow-600/50 hover:border-yellow-500 font-bold text-sm flex items-center justify-center gap-1 transition-all"
                                                >
                                                    <Edit3 size={14} />
                                                    {profileNames[id]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Reset PIN Section */}
                                    <div className="pt-3 border-t border-yellow-600/30">
                                        <p className="text-slate-400 text-sm mb-2 font-medium">
                                            Reset forgotten profile PINs:
                                        </p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(id => (
                                                <button
                                                    key={id}
                                                    onClick={() => {
                                                        if (hasProfilePin && hasProfilePin(id)) {
                                                            if (clearProfilePin) {
                                                                clearProfilePin(id);
                                                            }
                                                        }
                                                    }}
                                                    disabled={!hasProfilePin || !hasProfilePin(id)}
                                                    className={`flex-1 p-2 rounded-lg border font-bold text-sm flex items-center justify-center gap-1 transition-all ${
                                                        hasProfilePin && hasProfilePin(id)
                                                            ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/50 hover:border-red-500'
                                                            : 'bg-slate-800/50 text-slate-600 border-slate-700 cursor-not-allowed'
                                                    }`}
                                                    title={hasProfilePin && hasProfilePin(id) ? 'Click to remove PIN' : 'No PIN set'}
                                                >
                                                    <LockOpen size={14} />
                                                    {profileNames[id]}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-slate-500 text-xs mt-2 italic">
                                            Only profiles with a PIN set can be reset. Grayed-out profiles have no PIN.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-xl text-blue-300 mb-5 font-bold flex items-center gap-3 uppercase tracking-wider"><Music size={20} /> Audio Configuration</h3>
                            <div className="space-y-4 bg-slate-900/50 p-5 rounded-xl border-2 border-slate-600">
                                <div className="px-3">
                                    <div className="flex justify-between mb-1 text-slate-400 font-bold text-sm uppercase"><span className="pl-2">Music Volume</span><span className="text-yellow-400">{Math.round(bgmVol * 100)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.05" value={bgmVol} onChange={(e) => setBgmVol(parseFloat(e.target.value))} className="h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
                                </div>
                                <div className="px-3">
                                    <div className="flex justify-between mb-1 text-slate-400 font-bold text-sm uppercase"><span className="pl-2">SFX Volume</span><span className="text-yellow-400">{Math.round(sfxVol * 100)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.05" value={sfxVol} onChange={(e) => setSfxVol(parseFloat(e.target.value))} className="h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone - Fixed at bottom */}
                <div className="shrink-0 pt-4 border-t-2 border-red-900/50">
                    <h3 className="text-xl text-red-400 mb-4 font-bold flex items-center gap-3 uppercase tracking-wider">
                        <AlertTriangle size={20} className="text-red-500" /> Danger Zone
                    </h3>
                    <button onClick={onReset} className="w-full bg-red-950/50 hover:bg-red-900/80 text-red-400 p-3 rounded-lg border border-red-900/50 hover:border-red-500 font-bold text-lg flex items-center justify-center gap-3 transition-all">
                        <Trash2 size={20} /> DELETE PROFILE PROGRESS
                    </button>
                </div>
            </div>

            {/* Profile Editor Modal */}
            {editingProfileId && (
                <ProfileEditorModal
                    isOpen={!!editingProfileId}
                    onClose={() => setEditingProfileId(null)}
                    profileId={editingProfileId}
                    profileName={profileNames[editingProfileId]}
                    onSave={() => {
                        // Reload the page to refresh data
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default SettingsDrawer;
