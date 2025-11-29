import React, { useState, useEffect, useRef } from 'react';
import { 
    Menu, Sparkles, ChevronLeft, ChevronRight, Gift, Heart, Circle, Square, Triangle, Hexagon
} from 'lucide-react';

// Modules
import GlobalStyles from './components/ui/GlobalStyles';
import SafeImage from './components/ui/SafeImage';
import ResetModal from './components/modals/ResetModal';
import SettingsDrawer from './components/drawers/SettingsDrawer';
import MenuDrawer from './components/drawers/MenuDrawer';
import SkillCard from './components/skills/SkillCard';

// Utils & Constants
import { getRandomMob, getMobForSkill } from './utils/gameUtils';
import { 
    BASE_ASSETS, THEME_CONFIG, SKILL_DATA, 
    SIGHT_WORDS, SPELLING_ITEMS, HOMOPHONES 
} from './constants/gameData';

const App = () => {
    const [currentProfile, setCurrentProfile] = useState(() => localStorage.getItem('currentProfile_v1') ? parseInt(localStorage.getItem('currentProfile_v1')) : 1);
    const [profileNames, setProfileNames] = useState(() => localStorage.getItem('heroProfileNames_v1') ? JSON.parse(localStorage.getItem('heroProfileNames_v1')) : { 1: "Player 1", 2: "Player 2", 3: "Player 3" });
    const [playerHealth, setPlayerHealth] = useState(10);
    
    const getStorageKey = (profileId) => `heroSkills_v23_p${profileId}`;
    const loadSkills = (profileId) => {
        const initial = {};
        SKILL_DATA.forEach(skill => { initial[skill.id] = { level: 1, xp: 0, currentMob: getRandomMob(null) }; });
        let saved = localStorage.getItem(getStorageKey(profileId));
        if (!saved && profileId === 1) saved = localStorage.getItem('heroSkills_v23');
        try { if (saved) { const parsed = JSON.parse(saved); const data = parsed.skills || parsed; Object.keys(data).forEach(key => { initial[key] = { ...initial[key], ...data[key] }; }); return initial; } } catch (e) {}
        return initial;
    };
    const loadTheme = (profileId) => { let saved = localStorage.getItem(getStorageKey(profileId)); if(!saved && profileId === 1) saved = localStorage.getItem('heroSkills_v23'); try { return JSON.parse(saved).theme || 'minecraft'; } catch(e){} return 'minecraft'; };
    
    const getProfileStats = (id) => {
        const initial = {};
        SKILL_DATA.forEach(skill => { initial[skill.id] = { level: 1 }; });
        const key = getStorageKey(id);
        let saved = localStorage.getItem(key);
        if (!saved && id === 1) saved = localStorage.getItem('heroSkills_v23');
        if (!saved) return null;
        try {
            const data = JSON.parse(saved);
            const skillsData = data.skills || data;
            const theme = data.theme || 'minecraft';
            let totalLevel = 0;
            let highestLevel = 0;
            Object.values(skillsData).forEach(s => {
                if (s && typeof s.level === 'number') {
                    totalLevel += s.level;
                    if (s.level > highestLevel) highestLevel = s.level;
                }
            });
            return { totalLevel, highestLevel, skills: skillsData, theme };
        } catch(e) { return null; }
    };

    const [skills, setSkills] = useState(() => loadSkills(currentProfile));
    const [activeTheme, setActiveTheme] = useState(() => loadTheme(currentProfile));
    const [difficulty, setDifficulty] = useState(1);
    const [battlingSkillId, setBattlingSkillId] = useState(null);
    const [challengeData, setChallengeData] = useState(null);
    const [lootBox, setLootBox] = useState(null); 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState("");
    const [damageNumbers, setDamageNumbers] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const recognitionRef = useRef(null);
    const [bgmVol, setBgmVol] = useState(0.3);
    const [sfxVol, setSfxVol] = useState(0.5);
    const bgmRef = useRef(new Audio(BASE_ASSETS.audio.bgm[0]));

    useEffect(() => { 
        const dataToSave = { skills: skills, theme: activeTheme };
        localStorage.setItem(getStorageKey(currentProfile), JSON.stringify(dataToSave)); 
        localStorage.setItem('currentProfile_v1', currentProfile);
        localStorage.setItem('heroProfileNames_v1', JSON.stringify(profileNames));
    }, [skills, currentProfile, activeTheme, profileNames]);

    useEffect(() => { bgmRef.current.volume = bgmVol; }, [bgmVol]);
    const playSfx = (src) => { if(!src) return; new Audio(src).play().catch(e=>{}); };

    const generateChallenge = (type, diff) => {
        const limit = 10 * diff;
        if (type === 'math') { const a = Math.floor(Math.random() * limit) + 1; const b = Math.floor(Math.random() * limit) + 1; return { type, question: `${a} + ${b} = ?`, answer: (a + b).toString() }; }
        if (type === 'patterns') { const labels = ['CIRCLE', 'SQUARE', 'TRIANGLE', 'HEXAGON']; const seqIndex = Math.floor(Math.random() * 4); return { type: 'patterns', question: [labels[seqIndex], labels[(seqIndex+1)%4], labels[seqIndex], '?'], answer: labels[(seqIndex+1)%4] }; }
        if (type === 'reading') { const word = SIGHT_WORDS[Math.floor(Math.random() * SIGHT_WORDS.length)]; return { type, question: word, answer: word }; }
        if (type === 'writing') { const item = SPELLING_ITEMS[Math.floor(Math.random() * SPELLING_ITEMS.length)]; return { type, question: "Item?", answer: item.word, img: BASE_ASSETS.items[item.word] || BASE_ASSETS.items['TNT'] }; }
        if (type === 'memory') return { type: 'memory', question: "Find Pairs!", answer: "WIN" };
        return { type: 'manual', question: "Task Complete?", answer: "yes" };
    };

    const handleSuccessHit = (skillId, isWrong) => {
        if (isWrong === 'WRONG') {
            setPlayerHealth(h => { const newH = h - 1; if (newH <= 0) { new Audio(BASE_ASSETS.audio.faint).play().catch(e=>{}); setBattlingSkillId(null); return 10; } new Audio(BASE_ASSETS.audio.damage).play().catch(e=>{}); return newH; }); return;
        }
        if (!skillId) return;
        const skillConfig = SKILL_DATA.find(s => s.id === skillId);
        const multiplier = 1 + (difficulty - 1) * 0.2;
        const dmg = (skillConfig.id === 'cleaning' || skillConfig.id === 'memory') ? 100 : 20;
        const scaledDmg = Math.round(dmg * multiplier);
        if(skillConfig.id !== 'memory') { const id = Date.now(); setDamageNumbers(prev => [...prev, { id, skillId, val: scaledDmg, x: Math.random() * 100 - 50, y: Math.random() * 50 - 25 }]); setTimeout(() => setDamageNumbers(prev => prev.filter(n => n.id !== id)), 800); new Audio(BASE_ASSETS.audio.hit[0]).play().catch(e=>{}); }
        const currentSkillState = skills[skillId];
        if (skillConfig.id !== 'memory') { 
            const mob = getMobForSkill(skillConfig, currentSkillState);
        }
        setSkills(prev => {
            const current = prev[skillId]; let newXp = current.xp + scaledDmg; let newLevel = current.level; let leveledUp = false; let newMob = current.currentMob;
            if (newXp >= 100) { const levelsGained = Math.floor(newXp / 100); newLevel += levelsGained; newXp = newXp % 100; leveledUp = true; new Audio(BASE_ASSETS.audio.success).play().catch(e=>{}); if (newLevel % 20 !== 0 && (newLevel - 1) % 20 !== 0) newMob = getRandomMob(current.currentMob); }
            if (leveledUp) { new Audio(BASE_ASSETS.audio.levelup).play().catch(e=>{}); if (newLevel % 20 === 0) setLootBox({ level: newLevel, skillName: skillConfig.fantasyName, item: "New Rank!", img: BASE_ASSETS.badges.Wood }); }
            return { ...prev, [skillId]: { ...current, level: newLevel, xp: newXp, currentMob: newMob } };
        });
        if (skillConfig.hasChallenge && skillConfig.id !== 'memory') { setChallengeData(generateChallenge(skillConfig.challengeType, difficulty)); } else if (skillConfig.id === 'memory') { setBattlingSkillId(null); }
    };

    const startBattle = (id) => {
        const skill = SKILL_DATA.find(s => s.id === id); setBattlingSkillId(id);
        const maxDiff = Math.max(1, Math.floor(skills[id].level / 20) + 1); setDifficulty(maxDiff);
        setChallengeData(generateChallenge(skill.challengeType, maxDiff));
        new Audio(BASE_ASSETS.audio.click).play().catch(e=>{});
        if (skill.challengeType === 'reading' && window.webkitSpeechRecognition) startVoiceListener(id);
    };

    const endBattle = () => {
        setBattlingSkillId(null);
        setChallengeData(null);
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
        playSfx('click');
    };

    const handleSwitchProfile = (newId) => { if (newId === currentProfile) return; playSfx(BASE_ASSETS.audio.click); const newSkills = loadSkills(newId); const newTheme = loadTheme(newId); setSkills(newSkills); setActiveTheme(newTheme); setCurrentProfile(newId); };
    const handleRenameProfile = (id, newName) => { setProfileNames(prev => ({ ...prev, [id]: newName })); };
    const handleReset = () => { localStorage.removeItem(getStorageKey(currentProfile)); if (currentProfile === 1) localStorage.removeItem('heroSkills_v23'); window.location.reload(); };

    const startVoiceListener = (targetId) => {
        if (!window.webkitSpeechRecognition) return;
        recognitionRef.current = new window.webkitSpeechRecognition(); recognitionRef.current.lang = 'en-US'; recognitionRef.current.continuous = true;
        recognitionRef.current.onstart = () => { setIsListening(true); setSpokenText("Listening..."); }; recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onresult = (e) => { const t = e.results[e.results.length-1][0].transcript.toUpperCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,""); setSpokenText(t); if (challengeData && (t === challengeData.answer || HOMOPHONES[challengeData.answer]?.includes(t))) handleSuccessHit(targetId || battlingSkillId); };
        recognitionRef.current.start();
    };

    useEffect(() => { if(lootBox) setTimeout(() => setLootBox(null), 4000); }, [lootBox]);
    const getVisibleItems = () => { const items = []; for (let i = -2; i <= 2; i++) { let idx = selectedIndex + i; let dataIndex = idx % SKILL_DATA.length; if (dataIndex < 0) dataIndex += SKILL_DATA.length; items.push({ ...SKILL_DATA[dataIndex], offset: i, key: idx }); } return items; };
    const currentThemeData = THEME_CONFIG[activeTheme] || THEME_CONFIG.minecraft;
    const containerStyle = { ...currentThemeData.style, fontFamily: '"VT323", monospace' };

    return (
        <div className="min-h-screen overflow-hidden relative flex flex-col bg-cover bg-center bg-no-repeat font-sans text-stone-100" style={containerStyle}>
            <GlobalStyles />
            <div className="absolute inset-0 bg-black/30 pointer-events-none z-0"></div>
            <button onClick={() => setIsSettingsOpen(true)} className="absolute z-40 bg-stone-800/90 text-white p-3 rounded-lg border-2 border-stone-600 hover:bg-stone-700 transition-all shadow-lg" style={{ top: '16px', left: '16px' }}><Sparkles size={32} className="text-yellow-400" /></button>
            <div className="absolute z-40 flex gap-2" style={{ top: '16px', left: '80px' }}>{Array(10).fill(0).map((_, i) => (<Heart key={i} size={32} className={`${i < playerHealth ? 'fill-red-600 text-red-600' : 'fill-gray-900 text-gray-700'} drop-shadow-md`} />))}</div>
            <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} activeTheme={activeTheme} setActiveTheme={setActiveTheme} onReset={handleReset} bgmVol={bgmVol} setBgmVol={setBgmVol} sfxVol={sfxVol} setSfxVol={setSfxVol} currentProfile={currentProfile} onSwitchProfile={handleSwitchProfile} profileNames={profileNames} onRenameProfile={handleRenameProfile} getProfileStats={getProfileStats} />
            <ResetModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} onConfirm={handleReset} />
            <button onClick={() => setIsMenuOpen(true)} className="absolute z-40 bg-stone-800/90 text-white p-3 rounded-lg border-2 border-stone-600 hover:bg-stone-700 transition-all shadow-lg" style={{ top: '16px', right: '16px' }}><Menu size={32} /></button>
            <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} skills={skills} />
            <main className="flex-1 relative flex flex-col items-center justify-center w-full">
                <div className="z-10 relative mb-[-30px] md:mb-[-50px] pointer-events-none opacity-90"><SafeImage src={currentThemeData.assets.logo} fallbackSrc="https://placehold.co/800x300/333/FFD700?text=LOGO+PLACEHOLDER&font=monsterrat" alt="Game Logo" className="w-[480px] md:w-[720px] lg:w-[960px] object-contain drop-shadow-2xl" /></div>
                <h1 className="text-9xl text-yellow-400 tracking-widest uppercase mb-[40px] z-20 relative drop-shadow-[4px_4px_0_#000]" style={{ textShadow: '6px 6px 0 #000' }}>Level Up!</h1>
                <button onClick={() => {setSelectedIndex(p => p - 1); new Audio(BASE_ASSETS.audio.click).play();}} className="flex absolute left-4 md:left-8 z-30 bg-stone-800/80 text-white p-3 md:p-4 border-4 border-stone-600 rounded-sm"><ChevronLeft size={32} className="md:w-10 md:h-10" /></button>
                <button onClick={() => {setSelectedIndex(p => p + 1); new Audio(BASE_ASSETS.audio.click).play();}} className="flex absolute right-4 md:right-8 z-30 bg-stone-800/80 text-white p-3 md:p-4 border-4 border-stone-600 rounded-sm"><ChevronRight size={32} className="md:w-10 md:h-10" /></button>
                <div className="relative w-full flex items-center justify-center perspective-1000 h-[650px]">
                    {getVisibleItems().map((item) => (
                        <div key={item.key} className="absolute transition-all duration-500 ease-out" style={{ transform: `translateX(${item.offset * 320}px) scale(${item.offset === 0 ? 1.1 : 0.85})`, opacity: item.offset === 0 ? 1 : 0.6, zIndex: item.offset === 0 ? 20 : 10 - Math.abs(item.offset), filter: item.offset === 0 ? 'none' : 'brightness(0.5) blur(1px)' }}>
                            <SkillCard 
                                config={item} data={skills[item.id]} themeData={currentThemeData} isCenter={item.offset === 0} isBattling={item.offset === 0 && battlingSkillId === item.id}
                                mobName={getMobForSkill(item, skills[item.id])} challenge={challengeData} isListening={isListening} spokenText={spokenText} damageNumbers={damageNumbers.filter(d => d.skillId === item.id)}
                                onStartBattle={() => startBattle(item.id)} onEndBattle={endBattle}
                                onMathSubmit={(val) => handleSuccessHit(item.id, val)} onMicClick={() => startVoiceListener(item.id)}
                                difficulty={difficulty} setDifficulty={setDifficulty} unlockedDifficulty={Math.floor(skills[item.id].level / 20) + 1}
                            />
                        </div>
                    ))}
                </div>
            </main>
            {lootBox && <div className="fixed bottom-8 left-1/2 z-50 animate-toast w-full max-w-2xl pointer-events-none transform -translate-x-1/2"><div className="bg-black/80 border-4 border-yellow-500 rounded-full p-4 px-12 flex items-center justify-between shadow-[0_0_30px_rgba(255,215,0,0.6)] backdrop-blur-md mx-4"><div className="flex items-center gap-4"><div className="bg-yellow-500/20 p-3 rounded-full border-2 border-yellow-400"><Gift size={32} className="text-yellow-300 animate-bounce" /></div><div className="text-left"><h2 className="text-2xl text-yellow-400 font-bold leading-none mb-1">LEVEL {lootBox.level} REACHED!</h2><p className="text-stone-300 text-sm">{lootBox.skillName}</p></div></div><div className="text-right pl-8 border-l-2 border-stone-600 flex items-center gap-4"><SafeImage src={lootBox.img} alt="Badge" className="w-12 h-12 object-contain" /><div><p className="text-stone-400 text-xs uppercase tracking-wider">Unlocked</p><p className="text-2xl text-green-400 font-bold">{lootBox.item}</p></div></div></div></div>}
        </div>
    );
};

export default App;