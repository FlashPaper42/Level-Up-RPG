import React from 'react';
import { X, Lock } from 'lucide-react';
import SafeImage from '../ui/SafeImage';
import { BADGE_TIERS, BASE_ASSETS } from '../../constants/gameData';

const MenuDrawer = ({ isOpen, onClose, skills }) => {
    const totalLevels = Object.values(skills).reduce((acc, s) => acc + s.level, 0);
    
    return (
        <div 
            className={`fixed h-full w-[75%] md:w-[60%] bg-[#1a1a1a]/95 backdrop-blur-md z-50 border-l-4 border-stone-600 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ top: 0, right: 0 }}
        >
            <div className="p-8 h-full flex flex-col">
                <div className="flex justify-between items-start mb-8 border-b-4 border-stone-600 pb-4">
                    <div><h2 className="text-6xl text-yellow-400 font-bold uppercase tracking-widest mb-2 drop-shadow-md">Achievements</h2><p className="text-stone-400 text-4xl">Total Level: <span className="text-white font-bold">{totalLevels}</span></p></div>
                    <button onClick={onClose} className="bg-red-600/80 hover:bg-red-600 text-white p-4 rounded-xl border-4 border-red-800 shadow-lg transform active:scale-95 transition-all"><X size={48} /></button>
                </div>
                <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
                    {Object.keys(skills).map(key => {
                        const userSkill = skills[key];
                        const xpPercent = userSkill.xp;
                        return (
                            <div key={key} className="mb-10 bg-black/40 p-6 rounded-2xl border-4 border-stone-700">
                                <div className="flex items-center gap-6 mb-8 border-b-2 border-stone-700 pb-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2"><h3 className="text-5xl font-bold text-white tracking-wide drop-shadow-sm">{key.toUpperCase()}</h3><span className="text-stone-400 text-4xl font-bold">Lvl {userSkill.level}</span></div>
                                        <div className="w-full h-6 bg-stone-900 rounded-full border-2 border-stone-600 relative overflow-hidden"><div className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500" style={{ width: `${xpPercent}%` }}></div><div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">{Math.round(xpPercent)}% XP</div></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-y-8 gap-x-4 mb-8">
                                    {BADGE_TIERS.map((tier) => (
                                        <div key={tier.level} className="flex flex-col items-center">
                                            <div className={`w-24 h-24 border-4 rounded-2xl flex items-center justify-center relative mb-3 shadow-lg transition-all duration-300 ${userSkill.level >= tier.level ? 'border-yellow-500 bg-stone-800 scale-105' : 'border-stone-600 bg-stone-900/50 opacity-60'}`}>
                                                {userSkill.level >= tier.level ? <SafeImage src={BASE_ASSETS.badges[tier.title]} className="w-16 h-16 object-contain" /> : <Lock size={40} className="text-stone-500" />}
                                            </div>
                                            <span className={`text-2xl uppercase font-bold tracking-wider text-center ${userSkill.level >= tier.level ? 'text-yellow-200' : 'text-stone-600'}`}>{tier.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MenuDrawer;
