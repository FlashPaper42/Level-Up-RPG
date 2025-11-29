import React, { useState, useEffect } from 'react';
import { Pencil, Check, Heart } from 'lucide-react';
import SafeImage from '../ui/SafeImage';
import { THEMES_LIST, SKILL_DATA } from '../../constants/gameData';

const ProfileCard = ({ id, name, stats, isCurrent, onSwitch, onRename }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(name);
    
    useEffect(() => { if (!isCurrent) setIsEditing(false); }, [isCurrent]);

    let borderColor = 'border-stone-600';
    let themeBg = null;
    
    if (stats && stats.theme) {
        const themeObj = THEMES_LIST.find(t => t.id === stats.theme);
        if (themeObj) themeBg = themeObj.img;
    }
    
    if (stats) {
        const maxLvl = stats.highestLevel;
        if (maxLvl >= 100) borderColor = 'border-emerald-500';
        else if (maxLvl >= 60) borderColor = 'border-yellow-500';
        else if (maxLvl >= 20) borderColor = 'border-blue-400';
    }

    const getLevelColors = (level) => {
        if (level >= 160) return 'text-rainbow border-purple-500';
        if (level >= 100) return 'text-emerald-400 border-emerald-500';
        if (level >= 60) return 'text-yellow-400 border-yellow-500';
        if (level >= 20) return 'text-amber-700 border-amber-800';
        return 'text-white border-slate-600';
    };

    const carouselItems = [].concat(...Array(10).fill(SKILL_DATA));

    return (
        <div onClick={() => !isEditing && onSwitch(id)} className={`relative w-full h-[100px] rounded-xl overflow-hidden transition-all cursor-pointer group select-none ${isCurrent ? 'ring-4 ring-yellow-400 scale-[1.02] z-10' : 'hover:scale-[1.01] opacity-70 hover:opacity-100'}`} style={{ backgroundColor: '#0f172a', boxShadow: isCurrent ? '0 0 20px rgba(250, 204, 21, 0.3)' : '0 4px 6px rgba(0,0,0,0.5)' }}>
            {themeBg && <div className="absolute inset-0"><SafeImage src={themeBg} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/60"></div></div>}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 pointer-events-none"></div>
            <div className="relative flex h-full p-2 gap-2 z-10">
                <div className="w-1/3 flex flex-col justify-between border-r-2 border-white/20 pr-2 pl-2">
                    <div>
                        <div className="bg-black/60 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block border border-white/10 mb-1 backdrop-blur-sm ml-1">FILE {id}</div>
                        {isEditing ? (
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="bg-black text-white w-full text-lg font-bold p-0.5 rounded border border-yellow-500 outline-none uppercase" autoFocus />
                                <button onClick={(e) => { e.stopPropagation(); onRename(id, tempName); setIsEditing(false); }} className="text-green-400 hover:text-green-300"><Check size={16} /></button>
                            </div>
                        ) : (
                            <div className="group/name flex items-center gap-2 pl-1">
                                <h3 className={`text-2xl font-bold uppercase truncate leading-none ${isCurrent ? 'text-yellow-100 drop-shadow-md' : 'text-white'}`} style={{ fontFamily: 'sans-serif', textShadow: '2px 2px 0 #000' }}>{name}</h3>
                                {isCurrent && <Pencil size={12} className="text-slate-400 group-hover/name:text-yellow-400 transition-colors" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} />}
                            </div>
                        )}
                    </div>
                    <div className="bg-black/50 rounded-lg p-3 border border-white/10 flex items-center gap-3 backdrop-blur-sm ml-1">
                        <Heart className={`fill-red-600 text-red-800 ${isCurrent ? 'animate-pulse' : ''}`} size={24} />
                        <div className="bg-slate-900/70 rounded-md px-2 py-1"><div className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">Level</div><div className="text-2xl font-bold text-white leading-none">{stats ? stats.totalLevel : 0}</div></div>
                    </div>
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
    );
};

export default ProfileCard;
