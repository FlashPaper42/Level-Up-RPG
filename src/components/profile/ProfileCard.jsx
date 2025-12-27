import React, { useState, useEffect } from 'react';
import { Pencil, Check, Heart, Crown, Lock, LockOpen, Key } from 'lucide-react';
import SafeImage from '../ui/SafeImage';
import ProfilePicture from '../ui/ProfilePicture';
import ParentalVerificationModal from '../ui/ParentalVerificationModal';
import PinModal from '../ui/PinModal';
import { THEMES_LIST, SKILL_DATA } from '../../constants/gameData';
import { getAvatarEmoji } from '../../constants/avatarData';

const ProfileCard = ({ id, name, stats, isCurrent, onSwitch, onRename, isParent, onParentVerified, selectedAvatar, selectedBorder, borderColor, profileBgColor, hasPin, onSetPin, onVerifyPin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(name);
    const [showParentalModal, setShowParentalModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinMode, setPinMode] = useState('enter'); // 'enter' | 'set'
    const [pinError, setPinError] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { if (!isCurrent) setIsEditing(false); }, [isCurrent]);

    let themeBg = null;

    if (stats && stats.theme) {
        const themeObj = THEMES_LIST.find(t => t.id === stats.theme);
        if (themeObj) themeBg = themeObj.img;
    }

    const getLevelColors = (level) => {
        if (level >= 160) return 'text-rainbow border-purple-500';
        if (level >= 100) return 'text-emerald-400 border-emerald-500';
        if (level >= 60) return 'text-yellow-400 border-yellow-500';
        if (level >= 20) return 'text-amber-700 border-amber-800';
        return 'text-white border-slate-600';
    };

    const handleParentCheckboxChange = (e) => {
        e.stopPropagation();
        // Only allow checking the box to become a parent (not unchecking)
        if (!isParent) {
            setShowParentalModal(true);
        }
    };

    const handleParentalVerified = () => {
        if (onParentVerified) {
            onParentVerified(id, true);
        }
        setShowParentalModal(false);
    };

    const handleCardClick = () => {
        if (isEditing) return;
        
        // If switching to a different profile that has a PIN
        if (!isCurrent && hasPin) {
            setPinMode('enter');
            setPinError(false);
            setShowPinModal(true);
            return;
        }
        
        onSwitch(id);
    };

    const handlePinSubmit = (pin) => {
        if (pinMode === 'enter') {
            // Verify PIN
            if (onVerifyPin && onVerifyPin(id, pin)) {
                setShowPinModal(false);
                onSwitch(id);
            } else {
                setPinError(true);
                setTimeout(() => setPinError(false), 600);
            }
        } else if (pinMode === 'set') {
            // Set new PIN
            if (onSetPin) {
                onSetPin(id, pin);
            }
            setShowPinModal(false);
        }
    };

    const handleSetPinClick = (e) => {
        e.stopPropagation();
        setPinMode('set');
        setPinError(false);
        setShowPinModal(true);
    };

    const carouselItems = [].concat(...Array(10).fill(SKILL_DATA));

    const getProfileCardClasses = () => {
        const baseClasses = 'relative w-full h-[100px] rounded-xl overflow-hidden transition-all cursor-pointer group select-none';
        if (isCurrent) {
            const ringClass = isParent ? 'ring-rainbow' : 'ring-4 ring-yellow-400';
            return `${baseClasses} ${ringClass} z-10`;  // No scale - this is the "full size"
        }
        return `${baseClasses} scale-[0.98] hover:scale-[0.99] opacity-70 hover:opacity-100`;  // Shrunk when inactive
    };

    const getProfileCardStyles = () => {
        const baseStyle = { backgroundColor: '#0f172a' };
        if (isCurrent) {
            const glowColor = isParent ? '0 0 30px rgba(255, 215, 0, 0.5)' : '0 0 20px rgba(250, 204, 21, 0.3)';
            return { ...baseStyle, boxShadow: glowColor };
        }
        return { ...baseStyle, boxShadow: '0 4px 6px rgba(0,0,0,0.5)' };
    };

    return (
        <>
            <div onClick={handleCardClick} className={getProfileCardClasses()} style={getProfileCardStyles()}>
                {themeBg && <div className="absolute inset-0"><SafeImage src={themeBg} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/60"></div></div>}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 pointer-events-none"></div>
                <div className="relative flex h-full p-2 gap-2 z-10">
                    {/* Parent indicator on the left - checkbox if not verified, crown if verified */}
                    <div className="flex flex-col justify-center items-center px-2 border-r-2 border-white/20">
                        {isParent ? (
                            <div className="flex flex-col items-center gap-1">
                                <Crown className="fill-yellow-400 text-yellow-600" size={24} />
                                <span className="text-[10px] text-yellow-400 font-bold uppercase">Parent</span>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center gap-1 cursor-pointer" onClick={e => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={isParent}
                                    onChange={handleParentCheckboxChange}
                                    className="w-4 h-4 accent-yellow-400 cursor-pointer"
                                />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Parent?</span>
                            </label>
                        )}
                    </div>

                    {/* Profile Picture */}
                    <div className="flex items-center justify-center px-2">
                        <ProfilePicture
                            avatar={getAvatarEmoji(selectedAvatar || 'person')}
                            border={selectedBorder || 'solid'}
                            borderColor={borderColor || '#FFD700'}
                            totalLevel={0}
                            size="medium"
                            skillColorStyle={{ background: profileBgColor || 'linear-gradient(to bottom, #7e22ce, #581c87)' }}
                        />
                    </div>

                    {/* Profile identifiers - horizontal layout */}
                    <div className="w-1/2 flex flex-col justify-center items-center px-4 border-r-2 border-white/20">
                        {isEditing ? (
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <input 
                                    type="text" 
                                    value={tempName} 
                                    onChange={e => setTempName(e.target.value)} 
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            onRename(id, tempName);
                                            setIsEditing(false);
                                        }
                                    }}
                                    className="bg-black text-white w-full text-2xl font-bold p-0.5 rounded border border-yellow-500 outline-none uppercase" 
                                    autoFocus 
                                />
                                <button onClick={(e) => { e.stopPropagation(); onRename(id, tempName); setIsEditing(false); }} className="text-green-400 hover:text-green-300"><Check size={24} /></button>
                            </div>
                        ) : (
                            <div className="bg-black/50 rounded-lg px-5 py-3 border border-white/10 backdrop-blur-sm">
                                <div className="group/name flex items-center justify-center gap-2 flex-wrap">
                                    <span className="text-slate-300 text-lg font-bold">P{id},</span>
                                    <h3 className={`text-2xl font-bold uppercase truncate leading-none ${isCurrent ? 'text-yellow-100 drop-shadow-md' : 'text-white'}`} style={{ fontFamily: 'sans-serif', textShadow: '2px 2px 0 #000' }}>{name},</h3>
                                    <Heart className={`fill-red-600 text-red-800 ${isCurrent ? 'animate-pulse' : ''}`} size={24} />
                                    <span className="text-lg text-slate-400 uppercase tracking-wider">LV.</span>
                                    <span className="text-2xl font-bold text-white leading-none">{stats ? stats.totalLevel : 0}</span>
                                    {isCurrent && (
                                        <>
                                            <Pencil size={18} className="text-slate-400 group-hover/name:text-yellow-400 transition-colors ml-1" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} />
                                            {/* PIN Lock Button */}
                                            <button
                                                onClick={handleSetPinClick}
                                                className={`p-1 rounded transition-colors ml-1 ${hasPin ? 'text-green-400 hover:text-green-300' : 'text-slate-500 hover:text-yellow-400'}`}
                                                title={hasPin ? 'Profile is protected (click to change PIN)' : 'Set a PIN to protect your profile'}
                                            >
                                                {hasPin ? <Lock size={16} /> : <LockOpen size={16} />}
                                            </button>
                                        </>
                                    )}
                                    {/* Show lock icon for non-current profiles with PIN */}
                                    {!isCurrent && hasPin && (
                                        <Lock size={16} className="text-yellow-500 ml-1" title="This profile is protected" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0 pr-2">
                        <div className="flex justify-between items-center mb-1"><span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider drop-shadow-md pl-2">Skill Proficiency</span></div>
                        <div className="flex-1 bg-black/50 rounded-lg border-2 border-white/10 inner-shadow p-0 overflow-hidden backdrop-blur-sm relative flex items-center">
                            <div className="flex gap-6 animate-scroll-left px-6 w-max">
                                {carouselItems.map((skillConfig, index) => {
                                    const userSkillLevel = stats && stats.skills && stats.skills[skillConfig.id] ? stats.skills[skillConfig.id].level : 1;
                                    const isUnlocked = userSkillLevel > 1;
                                    return (
                                        <div key={`${skillConfig.id}-${index}`} className="relative flex-shrink-0 w-16 h-16 group/icon">
                                            <div className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 transform rotate-6 transition-transform group-hover/icon:rotate-0"></div>
                                            <div className={`relative z-10 w-full h-full p-2 transition-all duration-300 ${isUnlocked ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                                                <SafeImage src={skillConfig.img} className="w-full h-full object-contain drop-shadow-xl" />
                                                {isUnlocked && <div className={`absolute -bottom-2 -right-2 bg-slate-900 text-lg font-black w-8 h-8 flex items-center justify-center rounded-full border-2 shadow-lg z-20 ${getLevelColors(userSkillLevel)}`}>{userSkillLevel}</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ParentalVerificationModal
                isOpen={showParentalModal}
                onClose={() => setShowParentalModal(false)}
                onVerified={handleParentalVerified}
            />
            <PinModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                mode={pinMode}
                onSubmit={handlePinSubmit}
                profileName={name}
                error={pinError}
            />
        </>
    );
};

export default ProfileCard;
