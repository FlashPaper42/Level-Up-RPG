import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Plus, Minus } from 'lucide-react';
import SafeImage from '../ui/SafeImage';
import { BASE_ASSETS, SHAPE_COMPONENTS } from '../../constants/gameData';

const PRESTIGE_LEVEL_THRESHOLD = 20;

const SkillCard = ({ config, data, themeData, isCenter, isBattling, mobName, challenge, isListening, spokenText, damageNumbers, onStartBattle, onEndBattle, onMathSubmit, onMicClick, difficulty, setDifficulty, unlockedDifficulty }) => {
    const [mathInput, setMathInput] = useState('');
    const [isHit, setIsHit] = useState(false);
    const [isWrong, setIsWrong] = useState(false);
    const prevDamageCount = useRef(0);
    
    const [memoryCards, setMemoryCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [isProcessingMatch, setIsProcessingMatch] = useState(false);
    const [mismatchShake, setMismatchShake] = useState(false);

    const hpPercent = 100 - data.xp; 
    
    let borderClass = 'border-stone-500';
    let levelTextColor = 'text-white';
    if (data.level >= 20) { levelTextColor = 'text-amber-700'; borderClass = 'border-wood'; }
    if (data.level >= 40) { levelTextColor = 'text-stone-400'; borderClass = 'border-stone'; }
    if (data.level >= 60) { levelTextColor = 'text-yellow-400'; borderClass = 'border-gold'; }
    if (data.level >= 80) { levelTextColor = 'text-gray-200'; borderClass = 'border-iron'; }
    if (data.level >= 100) { levelTextColor = 'text-emerald-400'; borderClass = 'border-emerald'; }
    if (data.level >= 120) { levelTextColor = 'text-cyan-300'; borderClass = 'border-diamond'; }
    if (data.level >= 140) { levelTextColor = 'text-gray-500'; borderClass = 'border-netherite'; }
    if (data.level >= 160) { levelTextColor = 'text-rainbow'; borderClass = 'border-netherite'; }

    const skillThemeConfig = themeData.skills[config.id] || {};
    const skillName = skillThemeConfig.name || config.name;
    let mobSrc = themeData.assets.mobs[mobName] || themeData.assets.mobs['Zombie'] || BASE_ASSETS.axolotls.Pink;
    if (config.id === 'memory') mobSrc = themeData.assets.mobs[mobName] || BASE_ASSETS.axolotls.Pink;

    const difficultyMultiplier = 1 + (difficulty - 1) * 0.2;
    const displayHP = Math.round(100 * difficultyMultiplier);

    const gemStyle = {}; 

    useEffect(() => { setMathInput(''); }, [challenge]);
    
    useEffect(() => {
        if (isBattling && config.id === 'memory') {
            const axolotlColors = Object.keys(BASE_ASSETS.axolotls);
            let deck = [...axolotlColors, ...axolotlColors].sort(() => Math.random() - 0.5);
            setMemoryCards(deck.map((color, i) => ({ id: i, color, img: BASE_ASSETS.axolotls[color] })));
            setFlippedIndices([]); setMatchedPairs([]); setIsProcessingMatch(false); setMismatchShake(false);
        }
    }, [isBattling, config.id]);

    useEffect(() => {
        if (damageNumbers.length > prevDamageCount.current) { setIsHit(true); setTimeout(() => setIsHit(false), 400); }
        prevDamageCount.current = damageNumbers.length;
    }, [damageNumbers]);

    const handleMathSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const val = mathInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const ans = challenge?.answer.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (val === ans) { setIsWrong(false); onMathSubmit(mathInput); setMathInput(''); } else { setIsWrong(true); setMathInput(''); onMathSubmit('WRONG'); setTimeout(() => setIsWrong(false), 500); }
    };

    const handleCardClick = (index) => {
        if (isProcessingMatch || flippedIndices.includes(index) || matchedPairs.includes(memoryCards[index].color)) return;
        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);
        new Audio(BASE_ASSETS.audio.click).play().catch(e=>{});

        if (newFlipped.length === 2) {
            setIsProcessingMatch(true);
            setTimeout(() => {
                if (memoryCards[newFlipped[0]].color === memoryCards[newFlipped[1]].color) {
                    new Audio(BASE_ASSETS.audio.match).play().catch(e=>{});
                    const newMatched = [...matchedPairs, memoryCards[newFlipped[0]].color];
                    setMatchedPairs(newMatched); setFlippedIndices([]); setIsProcessingMatch(false);
                    if (newMatched.length === 8) setTimeout(() => onMathSubmit("WIN"), 500);
                } else {
                    new Audio(BASE_ASSETS.audio.mismatch).play().catch(e=>{});
                    setMismatchShake(true);
                    setTimeout(() => { setMismatchShake(false); setFlippedIndices([]); setIsProcessingMatch(false); }, 500);
                }
            }, 300);
        }
    };

    const showMob = !isBattling || config.id !== 'memory';
    const topSectionBaseClass = config.id === 'memory' && isBattling ? 'hidden' : 'h-[55%] relative flex items-center justify-center overflow-hidden rounded-t-sm';
    const bottomSectionClass = config.id === 'memory' && isBattling ? 'h-full bg-[#3a3a3a] p-4 flex flex-col relative rounded-lg' : 'flex-1 bg-[#3a3a3a] p-4 flex flex-col relative rounded-b-sm';

    return (
        <div className={`relative w-[300px] h-[600px] bg-[#2b2b2b] border-4 rounded-lg overflow-visible flex flex-col transition-colors duration-500 ${isCenter ? `selected-card-glow ${borderClass}` : 'border-stone-700'}`}>
            {isCenter && data.level >= PRESTIGE_LEVEL_THRESHOLD && <div className="gem-socket"><div className="gem-stone" style={gemStyle}></div></div>}
            <div className={topSectionBaseClass} style={config.colorStyle}>
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-white border border-white/20 z-20"><div className="text-xs text-gray-400 uppercase">{skillName}</div><div className="text-lg leading-none">{config.fantasyName}</div></div>
                <div className="absolute top-2 right-2 z-20"><div className={`bg-black/60 px-3 py-1 rounded border border-white/20 text-3xl font-bold ${levelTextColor}`}>Lvl {data.level}</div></div>
                {showMob && <div className="relative z-10 flex items-center justify-center h-full max-h-[200px]"><SafeImage key={mobName} src={mobSrc} alt={mobName} className={`max-w-[160px] max-h-[160px] w-auto h-auto object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-transform duration-100 ${isHit ? 'animate-knockback' : 'animate-bob'}`} />{damageNumbers.map(dmg => (<div key={dmg.id} className="absolute text-5xl font-bold text-red-500 animate-bounce pointer-events-none whitespace-nowrap" style={{ left: `calc(50% + ${dmg.x}px)`, top: `calc(50% + ${dmg.y}px)`, textShadow: '2px 2px 0 #000' }}>-{dmg.val}</div>))}</div>}
                {config.id !== 'memory' && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full text-white border-2 border-white/30 text-xl font-bold tracking-wide z-10 shadow-lg">{mobName}</div>}
            </div>
            {(!isBattling || config.id !== 'memory') && <div className="bg-[#1a1a1a] p-2 border-t-4 border-b-4 border-black relative"><div className="flex justify-between text-gray-400 text-xs mb-1 uppercase"><span>HP</span><span>{hpPercent}%</span></div><div className="w-full h-6 bg-[#333] rounded-full overflow-hidden border-2 border-[#555] relative"><div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-200" style={{ width: `${hpPercent}%` }}></div></div><div className="absolute -bottom-10 left-0 w-full flex justify-center items-center gap-2 z-20"><button onClick={() => setDifficulty(Math.max(1, difficulty - 1))} className="bg-stone-700 text-white rounded p-1 border border-stone-500 hover:bg-stone-600"><Minus size={16} /></button><span className="text-yellow-400 font-bold bg-black/80 px-2 rounded border border-yellow-500 text-sm">Diff: {difficulty}</span><button onClick={() => setDifficulty(Math.min(unlockedDifficulty, difficulty + 1))} className="bg-stone-700 text-white rounded p-1 border border-stone-500 hover:bg-stone-600"><Plus size={16} /></button></div></div>}
            <div className={bottomSectionClass}>
                {isBattling ? (
                    <div className="flex flex-col h-full animate-in slide-in-from-bottom-10 duration-300">
                        <button onClick={onEndBattle} className="absolute top-0 right-0 text-gray-500 hover:text-white p-1 z-30"><X size={20} /></button>
                        <div className="text-center mb-2"><span className="text-yellow-400 text-lg uppercase animate-pulse tracking-wide">{config.taskDescription}</span></div>
                        {config.id === 'memory' ? (
                            <div className="flex-1 grid grid-cols-4 gap-2 bg-black/20 p-2 rounded items-center">
                                {memoryCards.map((card, index) => {
                                    const isFlipped = flippedIndices.includes(index);
                                    const isMatched = matchedPairs.includes(card.color);
                                    if (isMatched) return <div key={card.id} className="w-full aspect-[2/3]"></div>;
                                    return (
                                        <div key={card.id} onClick={() => handleCardClick(index)} className={`w-full aspect-[2/3] cursor-pointer transition-all duration-300 perspective-1000 relative transform-style-3d ${isFlipped ? 'rotate-y-180' : ''} ${mismatchShake && isFlipped ? 'animate-shake-flipped border-red-500' : ''}`}>
                                            <div className="absolute inset-0 backface-hidden w-full h-full" style={{ backfaceVisibility: 'hidden' }}><SafeImage src={themeData.assets.cardBack} className="w-full h-full object-cover rounded border border-stone-600" /></div>
                                            <div className="absolute inset-0 backface-hidden w-full h-full rotate-y-180 bg-slate-800 rounded border border-white/20 flex items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}><SafeImage src={card.img} className="w-full h-full object-contain p-1" /></div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                {config.id === 'patterns' ? (
                                    <div className="w-full flex flex-col items-center gap-4"><div className="flex gap-2 text-4xl">{challenge.question.map((q, i) => <div key={i} className="bg-black/40 p-2 rounded border border-stone-600">{q === '?' ? '?' : SHAPE_COMPONENTS[q] || q}</div>)}</div><div className="flex gap-4">{['Circle','Square','Triangle','Hexagon'].map(opt => <button key={opt} onClick={() => { if(opt.toUpperCase() === challenge.answer) { onMathSubmit(opt.toUpperCase()); } else { setMathInput(''); onMathSubmit("WRONG"); } }} className="bg-stone-700 p-2 rounded hover:bg-stone-600 border border-stone-500">{SHAPE_COMPONENTS[opt] || opt}</button>)}</div></div>
                                ) : (
                                    <>
                                        <div className="flex-1 bg-black/40 rounded border-2 border-[#555] flex items-center justify-center mb-3 p-2 relative overflow-hidden w-full">
                                            {config.challengeType === 'writing' ? <SafeImage src={challenge?.img} className="w-16 h-16 object-contain animate-bob" /> : <span className="text-4xl text-white font-bold tracking-wider">{challenge?.question.replace('Write: ', '')}</span>}
                                            {config.challengeType === 'reading' && <div className="absolute bottom-1 text-xs text-gray-400">{spokenText || (isListening ? "Listening..." : "Mic Off")}</div>}
                                        </div>
                                        {config.challengeType === 'math' && <form onSubmit={handleMathSubmit} className="flex gap-2 justify-center w-full"><input type="number" value={mathInput} onChange={(e) => setMathInput(e.target.value)} className={`w-24 bg-[#222] border-2 text-white text-xl px-2 py-1 rounded font-mono text-center ${isWrong ? 'border-red-500 animate-shake' : 'border-[#555]'}`} autoFocus placeholder="?" /><button type="submit" className="bg-green-600 text-white px-4 py-1 rounded border-b-4 border-green-800 font-bold">GO</button></form>}
                                        {config.challengeType === 'writing' && <div className="relative w-full flex justify-center"><input type="text" value={mathInput} onChange={(e) => { const val = e.target.value.toUpperCase(); setMathInput(val); if (val === challenge?.answer) { onMathSubmit(val); setMathInput(''); } }} className="absolute inset-0 opacity-0 cursor-pointer" autoFocus maxLength={challenge?.answer.length} /><div className={`flex gap-2 ${isWrong ? 'animate-shake' : ''}`}>{challenge?.answer.split('').map((char, i) => (<div key={i} className={`w-10 h-12 border-b-4 flex items-center justify-center text-2xl font-mono font-bold text-white bg-black/20 rounded-t ${i < mathInput.length ? 'border-green-500' : 'border-gray-600'}`}>{mathInput[i] || ''}</div>))}</div></div>}
                                        {config.challengeType === 'reading' && <button onClick={onMicClick} className={`w-full text-center p-2 rounded border-2 transition-colors flex items-center justify-center gap-2 ${isListening ? 'border-red-500 bg-red-900/20' : 'border-gray-600 hover:bg-white/10'}`}>{isListening ? <Mic className="inline animate-pulse text-red-500" /> : <><Mic className="inline text-gray-500" /><span className="text-xs uppercase font-bold text-stone-400">Tap to Speak</span></>}</button>}
                                        {config.challengeType === 'cleaning' && <button onClick={() => onMathSubmit(challenge?.answer)} className="w-full bg-green-600 hover:bg-green-500 text-white text-3xl font-bold py-4 rounded shadow-[0_4px_0_#166534] active:shadow-none active:translate-y-[4px] transition-all">Complete!</button>}
                                        {config.challengeType !== 'cleaning' && config.challengeType !== 'writing' && <button onClick={() => onMathSubmit(challenge?.answer)} className="mt-auto text-xs text-gray-500 underline hover:text-white self-center">Skip / Manual Success</button>}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <button onClick={onStartBattle} className={`w-full bg-gradient-to-b from-purple-500 to-purple-700 text-white text-3xl font-bold py-6 rounded-lg shadow-[0_6px_0_#581c87] active:shadow-none active:translate-y-[6px] transition-all border-2 border-purple-400 uppercase tracking-wider hover:from-purple-400 hover:to-purple-600`}>
                            {config.actionName}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillCard;
