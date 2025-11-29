import React from 'react';
import { X, Users, Music, Sparkles, Trash2 } from 'lucide-react';
import ProfileCard from '../profile/ProfileCard';
import SafeImage from '../ui/SafeImage';
import { THEMES_LIST } from '../../constants/gameData';

const SettingsDrawer = ({ isOpen, onClose, activeTheme, setActiveTheme, onReset, bgmVol, setBgmVol, sfxVol, setSfxVol, currentProfile, onSwitchProfile, profileNames, onRenameProfile, getProfileStats }) => (
    <div 
        className={`fixed h-full w-[85%] md:w-[60%] bg-[#0f172a]/95 backdrop-blur-xl z-50 border-r-4 border-slate-700 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ top: 0, left: 0 }}
    >
        <div className="!p-6 h-full flex flex-col justify-evenly gap-6 overflow-y-auto scrollbar-hide text-slate-200 font-sans">
            <div className="flex justify-between items-center border-b-2 border-slate-700 pb-4 shrink-0">
                <h2 className="text-4xl text-yellow-400 font-bold uppercase tracking-widest drop-shadow-md" style={{ fontFamily: '"VT323", monospace' }}>Settings</h2>
                <button onClick={onClose} className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-lg border-2 border-red-800 shadow-lg"><X size={24} /></button>
            </div>
            
            <div>
                <h3 className="text-xl text-blue-300 mb-3 font-bold flex items-center gap-3 uppercase tracking-wider"><Users size={20} /> Select File</h3>
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(id => (<ProfileCard key={id} id={id} name={profileNames[id]} stats={getProfileStats(id)} isCurrent={currentProfile === id} onSwitch={onSwitchProfile} onRename={onRenameProfile} />))}
                </div>
            </div>
            
            <div>
                <h3 className="text-xl text-blue-300 mb-3 font-bold flex items-center gap-3 uppercase tracking-wider"><Music size={20} /> Audio Configuration</h3>
                <div className="space-y-4 bg-slate-900/50 p-5 rounded-xl border-2 border-slate-600">
                    <div>
                        <div className="flex justify-between mb-1 text-slate-400 font-bold text-sm uppercase"><span>Music Volume</span><span className="text-yellow-400">{Math.round(bgmVol * 100)}%</span></div>
                        <input type="range" min="0" max="1" step="0.05" value={bgmVol} onChange={(e) => setBgmVol(parseFloat(e.target.value))} className="h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-1 text-slate-400 font-bold text-sm uppercase"><span>SFX Volume</span><span className="text-yellow-400">{Math.round(sfxVol * 100)}%</span></div>
                        <input type="range" min="0" max="1" step="0.05" value={sfxVol} onChange={(e) => setSfxVol(parseFloat(e.target.value))} className="h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-xl text-blue-300 mb-3 font-bold flex items-center gap-3 uppercase tracking-wider"><Sparkles size={20} /> Theme Select</h3>
                <div className="grid grid-cols-2 gap-4">
                    {THEMES_LIST.map(theme => (
                        <button key={theme.id} onClick={() => setActiveTheme(theme.id)} disabled={activeTheme === theme.id} className={`h-24 rounded-lg border-2 overflow-hidden relative transition-all duration-300 shadow-lg group ${activeTheme === theme.id ? 'border-yellow-400 ring-2 ring-yellow-400/20 opacity-100 cursor-default' : 'border-slate-600 hover:scale-105 hover:border-white opacity-60 hover:opacity-100'}`}>
                            <SafeImage src={theme.img} alt={theme.name} className={`w-full h-full object-cover ${activeTheme === theme.id ? 'grayscale-0' : 'grayscale'}`} />
                            <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${activeTheme === theme.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <span className={`text-lg font-bold uppercase tracking-widest ${activeTheme === theme.id ? 'text-yellow-400' : 'text-white'}`}>{theme.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="pt-4 border-t-2 border-slate-700">
                <button onClick={onReset} className="w-full bg-red-950/50 hover:bg-red-900/80 text-red-400 p-3 rounded-lg border border-red-900/50 hover:border-red-500 font-bold text-lg flex items-center justify-center gap-3 transition-all">
                    <Trash2 size={20} /> DELETE CURRENT FILE
                </button>
            </div>
        </div>
    </div>
);

export default SettingsDrawer;
