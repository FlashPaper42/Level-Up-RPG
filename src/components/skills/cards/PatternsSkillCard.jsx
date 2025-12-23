import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Plus, Minus } from 'lucide-react';
import SafeImage from '../../ui/SafeImage';
import MobWithAura from '../../ui/MobWithAura';
import { BASE_ASSETS, HOSTILE_MOBS, BOSS_MOBS, MINIBOSS_MOBS, DIFFICULTY_IMAGES, DIFFICULTY_CONTENT } from '../../../constants/gameData';
import { playClick, getSfxVolume } from '../../../utils/soundManager';
import { calculateXPToLevel } from '../../../utils/gameUtils';
import { AURA_ADJECTIVES } from '../../../utils/mobDisplayUtils';
import {
    PRESTIGE_LEVEL_THRESHOLD,
    AXOLOTL_NOTE_MAP,
    getTempoDelays,
    getActionAnimation,
    getLevelStyling,
    getButtonStyle,
    getBorderEffect
} from '../shared';

/**
 * PatternsSkillCard - Handles the Patterns skill with Simon Says game
 * Features: Axolotl ring, compass needle, sequence playback/input
 */
const PatternsSkillCard = ({
    config,
    data,
    themeData,
    isCenter,
    isBattling,
    mobName,
    mobAura,
    damageNumbers,
    onStartBattle,
    onEndBattle,
    onMathSubmit,
    difficulty,
    setDifficulty,
    unlockedDifficulty,
    selectedBorder,
    borderColor,
    bossHealing,
    actionPoints,
    mobAttacking
}) => {
    const [isHit, setIsHit] = useState(false);
    const prevDamageCount = useRef(0);

    // Simon Says state
    const [simonSequence, setSimonSequence] = useState([]);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [completedRounds, setCompletedRounds] = useState(0);
    const [litAxolotl, setLitAxolotl] = useState(null);
    const [simonGameActive, setSimonGameActive] = useState(false);
    const simonSessionStartedRef = useRef(false);

    const mobHealth = data.mobHealth || 100;
    const mobMaxHealth = data.mobMaxHealth || 100;
    const hpPercent = Math.round((mobHealth / mobMaxHealth) * 100);

    const { borderClass, levelTextColor } = getLevelStyling(data.level);
    const { appliedBorderEffect, borderStyle } = getBorderEffect(isCenter, selectedBorder, borderColor);

    const skillThemeConfig = themeData.skills[config.id] || {};
    const skillName = skillThemeConfig.name || config.name;

    let mobSrc = HOSTILE_MOBS[mobName] || BOSS_MOBS[mobName] || MINIBOSS_MOBS[mobName] || themeData.assets.mobs[mobName];
    let displayMobName = mobName;
    if (!mobSrc) {
        displayMobName = 'Zombie';
        mobSrc = HOSTILE_MOBS[displayMobName] || BASE_ASSETS.axolotls.Pink;
    }

    const displayMobNameWithAura = isBattling && mobAura && AURA_ADJECTIVES[mobAura]
        ? `${AURA_ADJECTIVES[mobAura]} ${displayMobName}` : displayMobName;

    const gemStyle = {};
    const buttonStyle = getButtonStyle(config.colorStyle);

    // Pattern config based on difficulty
    const patternConfig = DIFFICULTY_CONTENT.patterns[difficulty] || DIFFICULTY_CONTENT.patterns[1];
    const axolotlCount = patternConfig.axolotlCount || 2;
    const shouldResetSequence = patternConfig.resetSequence || false;

    const axolotlColors = useMemo(() => {
        const allAxolotlColors = Object.keys(BASE_ASSETS.axolotls);
        return allAxolotlColors.slice(0, Math.min(axolotlCount, allAxolotlColors.length));
    }, [axolotlCount]);

    const playAxolotlNote = useCallback((color) => {
        const noteName = AXOLOTL_NOTE_MAP[color];
        if (noteName) {
            const audio = new Audio(`assets/sounds/axolotl/${noteName}.wav`);
            audio.volume = getSfxVolume();
            audio.play().catch(() => playClick());
        } else {
            playClick();
        }
    }, []);

    const playSequence = useCallback((sequence) => {
        setIsShowingSequence(true);
        setPlayerIndex(0);
        let i = 0;
        const { onDelay, offDelay } = getTempoDelays(completedRounds, difficulty);

        const playNext = () => {
            if (i < sequence.length) {
                setLitAxolotl(sequence[i]);
                playAxolotlNote(sequence[i]);
                setTimeout(() => {
                    setLitAxolotl(null);
                    i++;
                    setTimeout(playNext, offDelay);
                }, onDelay);
            } else {
                setIsShowingSequence(false);
            }
        };
        setTimeout(playNext, 500);
    }, [completedRounds, difficulty, playAxolotlNote]);

    const startSimonGame = useCallback(() => {
        const firstColor = axolotlColors[Math.floor(Math.random() * axolotlColors.length)];
        const newSequence = [firstColor];
        setSimonSequence(newSequence);
        setPlayerIndex(0);
        setCompletedRounds(0);
        setSimonGameActive(true);
        playSequence(newSequence);
    }, [axolotlColors, playSequence]);

    const handleAxolotlClick = (color) => {
        if (isShowingSequence || !simonGameActive) return;
        playAxolotlNote(color);

        if (color === simonSequence[playerIndex]) {
            if (playerIndex === simonSequence.length - 1) {
                const matchAudio = new Audio(BASE_ASSETS.audio.match);
                matchAudio.volume = getSfxVolume();
                matchAudio.play().catch(() => { });
                const newRounds = completedRounds + 1;
                setCompletedRounds(newRounds);

                const baseMultiplier = Math.max(0.5, Math.min(2, 0.3 + (newRounds * 0.2)));
                const damage = Math.max(1, Math.round(newRounds * 1.5 * baseMultiplier));
                const xpMultiplier = Math.max(0.5, Math.min(3, 0.3 + (newRounds * 0.25)));
                setTimeout(() => onMathSubmit("WIN", damage, xpMultiplier), 300);

                let newSequence;
                if (shouldResetSequence) {
                    newSequence = [];
                    for (let i = 0; i < simonSequence.length + 1; i++) {
                        newSequence.push(axolotlColors[Math.floor(Math.random() * axolotlColors.length)]);
                    }
                } else {
                    const nextColor = axolotlColors[Math.floor(Math.random() * axolotlColors.length)];
                    newSequence = [...simonSequence, nextColor];
                }
                setSimonSequence(newSequence);
                setPlayerIndex(0);
                setTimeout(() => playSequence(newSequence), 800);
            } else {
                setPlayerIndex(playerIndex + 1);
            }
        } else {
            const mismatchAudio = new Audio(BASE_ASSETS.audio.mismatch);
            mismatchAudio.volume = getSfxVolume();
            mismatchAudio.play().catch(() => { });
            setSimonGameActive(false);
        }
    };

    useEffect(() => {
        if (damageNumbers.length > prevDamageCount.current) {
            setIsHit(true);
            setTimeout(() => setIsHit(false), 400);
        }
        prevDamageCount.current = damageNumbers.length;
    }, [damageNumbers]);

    useEffect(() => {
        if (isBattling && !simonSessionStartedRef.current) {
            simonSessionStartedRef.current = true;
            startSimonGame();
        } else if (!isBattling) {
            simonSessionStartedRef.current = false;
            setSimonSequence([]);
            setPlayerIndex(0);
            setIsShowingSequence(false);
            setCompletedRounds(0);
            setLitAxolotl(null);
            setSimonGameActive(false);
        }
    }, [isBattling, startSimonGame]);

    const isBattlingCenter = isBattling && isCenter;

    // Calculate compass needle rotation based on lit axolotl
    const getCompassRotation = () => {
        if (!litAxolotl) return 0;
        const idx = axolotlColors.indexOf(litAxolotl);
        if (idx === -1) return 0;
        return (idx / axolotlColors.length) * 360;
    };

    const cardContent = (
        <div
            className={`bg-[#2b2b2b] border-4 rounded-lg overflow-visible flex flex-col transition-all duration-500 ${isCenter ? `${appliedBorderEffect} ${!appliedBorderEffect ? borderClass : ''}` : 'border-stone-700'} w-[300px] ${isBattlingCenter ? 'h-[550px]' : 'h-[600px]'} ${!isBattlingCenter ? 'relative' : ''}`}
            style={isCenter ? borderStyle : {}}
        >
            {isCenter && data.level >= PRESTIGE_LEVEL_THRESHOLD && <div className="gem-socket"><div className="gem-stone" style={gemStyle}></div></div>}
            {!isBattling && (
                <div className="h-[55%] relative flex items-center justify-center overflow-hidden rounded-t-sm" style={config.colorStyle}>
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-white border border-white/20 z-20">
                        <div className="text-xs text-gray-400 uppercase">{skillName}</div>
                        <div className="text-lg leading-none">{config.fantasyName}</div>
                    </div>
                    <div className="absolute top-2 right-2 z-20">
                        <div className={`bg-black/60 px-3 py-1 rounded border border-white/20 text-3xl font-bold ${levelTextColor}`}>Lvl {data.level}</div>
                    </div>
                    <div className="relative z-10 flex items-center justify-center h-full max-h-[200px] w-full">
                        {mobAura ? (
                            <MobWithAura mobSrc={mobSrc} aura={mobAura} displayName={displayMobNameWithAura} size="100%" isHit={isHit} bossHealing={bossHealing} />
                        ) : (
                            <SafeImage key={displayMobName} src={mobSrc} alt={displayMobName} className={`relative z-10 max-w-full max-h-full object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-transform duration-100 ${isHit ? 'animate-knockback' : bossHealing ? 'animate-shake' : 'animate-bob'} ${bossHealing ? 'brightness-150 hue-rotate-90' : ''}`} />
                        )}
                        {damageNumbers.map(dmg => (
                            <div key={dmg.id} className="absolute text-5xl font-bold text-red-500 animate-bounce pointer-events-none whitespace-nowrap" style={{ left: `calc(50% + ${dmg.x}px)`, top: `calc(50% + ${dmg.y}px)`, textShadow: '2px 2px 0 #000' }}>-{dmg.val}</div>
                        ))}
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full text-white border-2 border-white/30 text-xl font-bold tracking-wide z-10 shadow-lg whitespace-nowrap min-w-max">{displayMobName}</div>
                </div>
            )}
            {!isBattling && (
                <div className="bg-[#1a1a1a] p-2 border-t-4 border-b-4 border-black relative">
                    <div className="flex justify-between text-gray-400 text-xs mb-1 uppercase"><span>HP</span><span>{hpPercent}%</span></div>
                    <div className="w-full h-6 bg-[#333] rounded-full overflow-hidden border-2 border-[#555] relative">
                        <div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-200" style={{ width: `${hpPercent}%` }}></div>
                    </div>
                </div>
            )}
            <div className={isBattling ? 'h-full bg-[#3a3a3a] p-4 flex flex-col relative rounded-lg' : 'flex-1 bg-[#3a3a3a] p-4 flex flex-col relative rounded-b-sm'}>
                {isBattling ? (
                    <div className="flex flex-col h-full animate-in slide-in-from-bottom-10 duration-300">
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="w-full flex flex-col items-center gap-1 relative">
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-700 rounded-lg"></div>
                                {/* Round counter */}
                                <div className="relative z-10 bg-black/60 px-3 py-1 rounded-full border border-yellow-500/50 mb-2">
                                    <span className="text-yellow-400 font-bold">Round: {completedRounds + 1}</span>
                                </div>
                                {/* Axolotl ring with compass needle */}
                                <div className="relative w-[280px] h-[280px] flex items-center justify-center">
                                    {/* Compass needle in center */}
                                    <div className="absolute z-20 w-16 h-16 flex items-center justify-center">
                                        <svg viewBox="0 0 64 64" className="w-full h-full transition-transform duration-300" style={{ transform: `rotate(${getCompassRotation() - 90}deg)` }}>
                                            <polygon points="32,4 40,32 32,28 24,32" fill="#e11d48" stroke="#881337" strokeWidth="1" />
                                            <polygon points="32,60 40,32 32,36 24,32" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
                                            <circle cx="32" cy="32" r="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                                        </svg>
                                    </div>
                                    {/* Axolotl buttons arranged in circle */}
                                    {axolotlColors.map((color, idx) => {
                                        const angle = (idx / axolotlColors.length) * 2 * Math.PI - Math.PI / 2;
                                        const radius = 100;
                                        const x = Math.cos(angle) * radius;
                                        const y = Math.sin(angle) * radius;
                                        const isLit = litAxolotl === color;
                                        return (
                                            <button key={color} onClick={() => handleAxolotlClick(color)} disabled={isShowingSequence} className={`absolute w-16 h-16 rounded-full border-4 transition-all duration-150 flex items-center justify-center ${isLit ? 'border-yellow-400 scale-125 brightness-150' : 'border-slate-600 hover:border-slate-400'} ${!simonGameActive && !isShowingSequence ? 'opacity-50' : ''}`} style={{ transform: `translate(${x}px, ${y}px)`, boxShadow: isLit ? '0 0 20px rgba(250, 204, 21, 0.8)' : 'none' }}>
                                                <SafeImage src={BASE_ASSETS.axolotls[color]} alt={color} className="w-12 h-12 object-contain" />
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Status indicator */}
                                <div className="relative z-10 text-center text-sm mt-2">
                                    {isShowingSequence ? (
                                        <span className="text-yellow-400">Watch the pattern...</span>
                                    ) : simonGameActive ? (
                                        <span className="text-green-400">Your turn! ({playerIndex + 1}/{simonSequence.length})</span>
                                    ) : (
                                        <span className="text-red-400">Game Over! Click outside to exit.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* XP indicator */}
                        {(() => {
                            const xpToLevel = calculateXPToLevel(difficulty, data.level);
                            const xpPercent = Math.min(100, (data.xp / xpToLevel) * 100);
                            const cappedAP = Math.min(5, actionPoints || 0);
                            return (
                                <div className="mt-2 flex gap-2 items-center">
                                    <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] flex-1" style={{ width: '80%' }}>
                                        <div className="flex justify-between text-gray-400 text-xs mb-1 uppercase"><span>XP</span><span>{data.xp} / {xpToLevel}</span></div>
                                        <div className="w-full h-3 bg-[#333] rounded-full overflow-hidden border border-[#555] relative">
                                            <div className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300" style={{ width: `${xpPercent}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="bg-[#1a1a1a] px-2 py-1 rounded border border-[#333] flex items-center justify-center" style={{ width: '20%', minHeight: '40px' }}>
                                        <div className="flex items-center gap-1 text-yellow-300 text-xs uppercase font-bold"><span>AP:</span><span className="text-xs">{cappedAP}/5</span></div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-gray-400 text-center mb-4 px-2">{config.taskDescription}</p>
                        <button onClick={isCenter ? onStartBattle : undefined} disabled={!isCenter} style={buttonStyle} className={`w-full text-white text-3xl font-bold py-6 rounded-lg active:shadow-none active:translate-y-[6px] transition-all border-2 uppercase tracking-wider ${!isCenter ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {config.actionName}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative">
            {(!isBattling) && unlockedDifficulty > 1 && (
                <div className="absolute -top-10 left-0 flex items-center gap-2 z-20">
                    <button onClick={() => setDifficulty(Math.max(1, difficulty - 1))} className="bg-stone-700 text-white rounded p-1 border border-stone-500 hover:bg-stone-600"><Minus size={16} /></button>
                    <div className="relative">
                        <SafeImage src={DIFFICULTY_IMAGES[difficulty] || DIFFICULTY_IMAGES[1]} alt={`Difficulty ${difficulty}`} className="w-8 h-8 object-contain" />
                        <span className="absolute -bottom-1 -right-1 bg-black/90 text-yellow-400 text-xs font-bold px-1 rounded border border-yellow-500/50 min-w-[16px] text-center">{difficulty}</span>
                    </div>
                    <button onClick={() => setDifficulty(Math.min(unlockedDifficulty, difficulty + 1))} className="bg-stone-700 text-white rounded p-1 border border-stone-500 hover:bg-stone-600"><Plus size={16} /></button>
                </div>
            )}
            {cardContent}
        </div>
    );
};

export default PatternsSkillCard;
