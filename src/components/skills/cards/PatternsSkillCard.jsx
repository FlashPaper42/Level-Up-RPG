import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Minus } from 'lucide-react';
import SafeImage from '../../ui/SafeImage';
import { BASE_ASSETS, DIFFICULTY_IMAGES, DIFFICULTY_CONTENT } from '../../../constants/gameData';
import { playClick, getSfxVolume } from '../../../utils/soundManager';
import { calculateXPToLevel } from '../../../utils/gameUtils';
import { calculatePatternXP, calculateXPReward } from '../../../systems/progression';
import {
    PRESTIGE_LEVEL_THRESHOLD,
    AXOLOTL_NOTE_MAP,
    getTempoDelays,
    getLevelStyling,
    getButtonStyle,
    getBorderEffect
} from '../shared';

/**
 * PatternsSkillCard - Handles the Patterns skill with axolotl memory game
 * Features: Axolotl ring, clock hand pointer, sequence playback/input, rotating ring nightmare mode
 */
const PatternsSkillCard = ({
    config,
    data,
    themeData,
    isCenter,
    isBattling,
    mobName,
    damageNumbers,
    onStartBattle,
    onEndBattle,
    onMathSubmit,
    difficulty,
    setDifficulty,
    unlockedDifficulty,
    selectedBorder,
    borderColor
}) => {
    const prevDamageCount = useRef(0);

    // Game state
    const [simonSequence, setSimonSequence] = useState([]);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [completedRounds, setCompletedRounds] = useState(0);
    const [litAxolotl, setLitAxolotl] = useState(null);
    const [simonGameActive, setSimonGameActive] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [ringRotation, setRingRotation] = useState(0); // 0 = no rotation, 1 = rotating (CSS handles animation)
    const [clockHandAngle, setClockHandAngle] = useState(0); // Persisted clock hand angle
    const simonSessionStartedRef = useRef(false);

    const { borderClass, levelTextColor } = getLevelStyling(data.level);
    const { appliedBorderEffect, borderStyle } = getBorderEffect(isCenter, selectedBorder, borderColor);

    const skillThemeConfig = themeData.skills[config.id] || {};
    const skillName = skillThemeConfig.name || config.name;

    const gemStyle = {};
    const buttonStyle = getButtonStyle(config.colorStyle);

    // Pattern config based on difficulty
    const patternConfig = DIFFICULTY_CONTENT.patterns[difficulty] || DIFFICULTY_CONTENT.patterns[1];
    const axolotlCount = patternConfig.axolotlCount || 2;
    const isNightmareMode = difficulty >= 7;

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

    // Nightmare mode: simple constant rotation like a spinning wheel
    // Uses CSS animation for smooth, GPU-accelerated rotation
    useEffect(() => {
        if (isNightmareMode && simonGameActive && !showInstructions) {
            // Start rotation - CSS handles the actual animation
            setRingRotation(1); // Non-zero value triggers CSS animation class
        } else {
            setRingRotation(0);
        }
    }, [isNightmareMode, simonGameActive, showInstructions]);
    
    // Get border color for active elements (use player's custom border or default yellow)
    const getActiveBorderStyle = () => {
        if (selectedBorder === 'solid-picker' && borderColor) {
            return { borderColor: borderColor, boxShadow: `0 0 20px ${borderColor}, 0 0 30px ${borderColor}` };
        } else if (selectedBorder === 'solid') {
            return { borderColor: '#FFD700', boxShadow: '0 0 20px #FFD700, 0 0 30px #FFD700' };
        } else if (borderColor) {
            return { borderColor: borderColor, boxShadow: `0 0 20px ${borderColor}, 0 0 30px ${borderColor}` };
        }
        return { borderColor: '#FFD700', boxShadow: '0 0 20px #FFD700, 0 0 30px #FFD700' };
    };
    
    const activeBorderStyle = getActiveBorderStyle();

    const playSequence = useCallback((sequence) => {
        setIsShowingSequence(true);
        setPlayerIndex(0);
        let i = 0;
        const { onDelay, offDelay } = getTempoDelays(completedRounds, difficulty);

        const playNext = () => {
            if (i < sequence.length) {
                const currentColor = sequence[i];
                setLitAxolotl(currentColor);
                playAxolotlNote(currentColor);

                // Update clock hand angle to point at current axolotl (persist it)
                const idx = axolotlColors.indexOf(currentColor);
                if (idx !== -1) {
                    const anglePerAxolotl = 360 / axolotlColors.length;
                    setClockHandAngle(idx * anglePerAxolotl);
                }

                setTimeout(() => {
                    setLitAxolotl(null);
                    // Don't reset clock hand - keep it pointing at last position
                    i++;
                    setTimeout(playNext, offDelay);
                }, onDelay);
            } else {
                setIsShowingSequence(false);
            }
        };
        setTimeout(playNext, 500);
    }, [completedRounds, difficulty, playAxolotlNote, axolotlColors]);

    const startSimonGame = useCallback(() => {
        const firstColor = axolotlColors[Math.floor(Math.random() * axolotlColors.length)];
        const newSequence = [firstColor];
        setSimonSequence(newSequence);
        setPlayerIndex(0);
        setCompletedRounds(0);
        setSimonGameActive(true);
        setShowInstructions(false);
        setRingRotation(0);
        playSequence(newSequence);
    }, [axolotlColors, playSequence]);

    const handleAxolotlClick = (color) => {
        if (isShowingSequence || !simonGameActive) return;

        // Light up the clicked axolotl briefly and update clock hand
        setLitAxolotl(color);
        playAxolotlNote(color);

        // Update clock hand to point at clicked axolotl
        const idx = axolotlColors.indexOf(color);
        if (idx !== -1) {
            const anglePerAxolotl = 360 / axolotlColors.length;
            setClockHandAngle(idx * anglePerAxolotl);
        }

        setTimeout(() => setLitAxolotl(null), 200);

        if (color === simonSequence[playerIndex]) {
            if (playerIndex === simonSequence.length - 1) {
                const matchAudio = new Audio(BASE_ASSETS.audio.match);
                matchAudio.volume = getSfxVolume();
                matchAudio.play().catch(() => { });
                const newRounds = completedRounds + 1;
                setCompletedRounds(newRounds);

                // Calculate XP using the new difficulty-weighted exponential formula
                // XP is weighted heavily towards difficulty with exponential iteration scaling
                const patternXP = calculatePatternXP(difficulty, data.level, newRounds);
                
                // Calculate the XP multiplier to pass to the combat system
                // We divide by base XP reward to get an effective multiplier
                const baseXP = calculateXPReward(difficulty, data.level);
                const xpMultiplier = baseXP > 0 ? patternXP / baseXP : 1;
                
                // Damage is used for mob defeat calculation - set high to ensure progression
                const damage = Math.max(1, Math.round(newRounds * 2));
                
                setTimeout(() => onMathSubmit("WIN", damage, xpMultiplier), 300);

                // Add next color to sequence
                const nextColor = axolotlColors[Math.floor(Math.random() * axolotlColors.length)];
                const newSequence = [...simonSequence, nextColor];
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
        if (isBattling && !simonSessionStartedRef.current) {
            simonSessionStartedRef.current = true;
            setShowInstructions(true);
        } else if (!isBattling) {
            simonSessionStartedRef.current = false;
            setSimonSequence([]);
            setPlayerIndex(0);
            setIsShowingSequence(false);
            setCompletedRounds(0);
            setLitAxolotl(null);
            setSimonGameActive(false);
            setShowInstructions(true);
            setRingRotation(0);
            setClockHandAngle(0);
        }
    }, [isBattling]);

    const isBattlingCenter = isBattling && isCenter;

    // Non-battling card content (carousel view) - CIRCULAR LAYOUT
    const cardContent = (
        <div
            className={`bg-[#2b2b2b] border-4 rounded-lg overflow-visible flex flex-col transition-all duration-500 ${isCenter ? `${appliedBorderEffect} ${!appliedBorderEffect ? borderClass : ''}` : 'border-stone-700'} w-[300px] h-[600px] relative`}
            style={isCenter ? borderStyle : {}}
        >
            {isCenter && data.level >= PRESTIGE_LEVEL_THRESHOLD && <div className="gem-socket"><div className="gem-stone" style={gemStyle}></div></div>}
            <div className="h-[55%] relative flex items-center justify-center overflow-hidden rounded-t-sm" style={config.colorStyle}>
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-white border border-white/20 z-20">
                    <div className="text-xs text-gray-400 uppercase">{skillName}</div>
                    <div className="text-lg leading-none">{config.fantasyName}</div>
                </div>
                <div className="absolute top-2 right-2 z-20">
                    <div className={`bg-black/60 px-3 py-1 rounded border border-white/20 text-3xl font-bold ${levelTextColor}`}>Lvl {data.level}</div>
                </div>
                <div className="relative z-10 flex items-center justify-center h-full w-full">
                    {/* Circular axolotl preview based on difficulty */}
                    <div className="relative" style={{ width: '180px', height: '180px' }}>
                        {axolotlColors.map((color, idx) => {
                            const angle = (idx / axolotlColors.length) * 2 * Math.PI - Math.PI / 2;
                            const radius = 65;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;
                            return (
                                <div
                                    key={color}
                                    className="absolute"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        left: `calc(50% + ${x}px)`,
                                        top: `calc(50% + ${y}px)`,
                                        marginLeft: '-24px',
                                        marginTop: '-24px'
                                    }}
                                >
                                    {/* Inner div for animation - separate from positioning */}
                                    <div
                                        className="animate-bob w-full h-full"
                                        style={{ animationDelay: `${idx * 0.1}s` }}
                                    >
                                        <SafeImage
                                            src={BASE_ASSETS.axolotls[color]}
                                            alt={color}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="bg-[#1a1a1a] p-2 border-t-4 border-b-4 border-black relative">
                <div className="flex justify-between text-gray-400 text-xs mb-1 uppercase"><span>Difficulty</span><span>{difficulty}</span></div>
                <div className="w-full h-6 bg-[#333] rounded-full overflow-hidden border-2 border-[#555] relative">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-200" style={{ width: `${(difficulty / 7) * 100}%` }}></div>
                </div>
            </div>
            <div className="flex-1 bg-[#3a3a3a] p-4 flex flex-col relative rounded-b-sm">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-gray-400 text-center mb-4 px-2">{config.taskDescription}</p>
                    <button onClick={isCenter ? onStartBattle : undefined} disabled={!isCenter} style={buttonStyle} className={`w-full text-white text-3xl font-bold py-6 rounded-lg active:shadow-none active:translate-y-[6px] transition-all border-2 uppercase tracking-wider ${!isCenter ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {config.actionName}
                    </button>
                </div>
            </div>
        </div>
    );

    // When battling, render single large card in portal
    if (isBattlingCenter) {
        const xpToLevel = calculateXPToLevel(difficulty, data.level);
        const xpPercent = Math.min(100, (data.xp / xpToLevel) * 100);


        return ReactDOM.createPortal(
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={onEndBattle}
                style={{ zIndex: 50 }}
            >
                {/* Large centered game card */}
                <div
                    className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 border-purple-600 rounded-xl overflow-hidden flex flex-col pointer-events-auto"
                    style={{
                        width: '95vw',
                        maxWidth: '1200px',
                        height: 'calc(100vh - 120px)',
                        maxHeight: '850px',
                        boxShadow: '0 0 60px rgba(147, 51, 234, 0.4), inset 0 0 40px rgba(100,100,100,0.1)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Full background cube texture */}
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" style={{ backgroundSize: '60px 60px' }}></div>

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-yellow-400"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-yellow-400"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-yellow-400"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-yellow-400"></div>

                    {/* Header */}
                    <div className="bg-gradient-to-b from-purple-700 to-purple-800 p-3 border-b-4 border-slate-700 relative flex-shrink-0 z-10">
                        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="text-purple-100 text-2xl font-black uppercase tracking-wider text-center relative z-10" style={{ textShadow: '2px 2px 0 #000' }}>
                            🎵 {config.fantasyName} 🎵
                        </div>
                    </div>

                    {/* Main content area with corner-positioned UI */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden">
                        {/* Round counter - top left (only during game) */}
                        {!showInstructions && (
                            <div className="absolute top-4 left-4 bg-black/60 px-6 py-2 rounded-full border-2 border-yellow-500/50">
                                <span className="text-yellow-400 text-xl font-bold">Round: {completedRounds + 1}</span>
                                {isNightmareMode && <span className="text-red-400 ml-2 text-sm">🌀 NIGHTMARE</span>}
                            </div>
                        )}

                        {/* Status indicator - top right (only during game) */}
                        {!showInstructions && (
                            <div className="absolute top-4 right-4">
                                {isShowingSequence ? (
                                    <div className="bg-black/60 px-4 py-2 rounded-full border-2 border-yellow-500/50">
                                        <span className="text-yellow-400 animate-pulse">👀 Watch the pattern...</span>
                                    </div>
                                ) : simonGameActive ? (
                                    <div className="bg-black/60 px-4 py-2 rounded-full border-2 border-green-500/50">
                                        <span className="text-green-400">🎯 Your turn! ({playerIndex + 1}/{simonSequence.length})</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="bg-black/60 px-4 py-2 rounded-full border-2 border-red-500/50">
                                            <span className="text-red-400">❌ Game Over!</span>
                                        </div>
                                        <button
                                            onClick={startSimonGame}
                                            className="bg-purple-600 hover:bg-purple-500 text-white text-lg font-bold py-2 px-6 rounded-lg shadow-[0_3px_0_#581c87] active:shadow-none active:translate-y-[3px] transition-all"
                                        >
                                            🔄 Play Again?
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {showInstructions ? (
                            /* Instructions overlay */
                            <div className="bg-black/80 rounded-xl p-6 max-w-lg text-center border-2 border-purple-500">
                                <h2 className="text-yellow-400 text-3xl font-bold mb-4">🎮 How to Play</h2>
                                <div className="text-white text-lg space-y-3 mb-6">
                                    <p>1. 👀 <span className="text-yellow-300">Watch</span> the axolotls light up in sequence</p>
                                    <p>2. 🎯 <span className="text-green-300">Repeat</span> the pattern by clicking them in order</p>
                                    <p>3. 📈 Each round adds <span className="text-purple-300">one more</span> to the sequence</p>
                                    <p>4. ⚡ Go as far as you can to <span className="text-green-300">gain more XP!</span></p>
                                </div>
                                {isNightmareMode && (
                                    <div className="text-red-400 text-sm mb-4 p-2 bg-red-900/30 rounded border border-red-500/50">
                                        ⚠️ NIGHTMARE MODE: The ring constantly rotates and the clock hand drifts!
                                    </div>
                                )}
                                <button
                                    onClick={startSimonGame}
                                    className="bg-green-600 hover:bg-green-500 text-white text-2xl font-bold py-4 px-8 rounded-lg shadow-[0_4px_0_#166534] active:shadow-none active:translate-y-[4px] transition-all"
                                >
                                    Start Game! 🚀
                                </button>
                            </div>
                        ) : (
                            /* Game area */
                            <div className="flex flex-col items-center justify-center flex-1 w-full">

                                <div
                                    className={`relative flex items-center justify-center ${ringRotation ? 'animate-spin-slow' : ''}`}
                                    style={{
                                        width: 'min(75vh, 600px)',
                                        height: 'min(75vh, 600px)'
                                    }}
                                >
                                    {/* Center dot with player's border theme */}
                                    <div
                                        className="absolute z-20 w-10 h-10 bg-slate-800 rounded-full border-4 flex items-center justify-center"
                                        style={activeBorderStyle}
                                    >
                                    </div>

                                    {/* Axolotl buttons arranged in circle */}
                                    {axolotlColors.map((color, idx) => {
                                        const angle = (idx / axolotlColors.length) * 2 * Math.PI - Math.PI / 2;
                                        const radius = 240; // Increased for larger circle
                                        const x = Math.cos(angle) * radius;
                                        const y = Math.sin(angle) * radius;
                                        const isLit = litAxolotl === color;
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => handleAxolotlClick(color)}
                                                disabled={isShowingSequence}
                                                className={`absolute rounded-full border-4 transition-all duration-150 flex items-center justify-center ${isLit ? 'scale-125 brightness-150' : 'border-slate-500 hover:border-slate-300 hover:scale-110'} ${!simonGameActive && !isShowingSequence ? 'opacity-50' : ''}`}
                                                style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    transform: `translate(${x}px, ${y}px)`,
                                                    ...(isLit ? activeBorderStyle : { boxShadow: '0 4px 8px rgba(0,0,0,0.4)' })
                                                }}
                                            >
                                                <SafeImage src={BASE_ASSETS.axolotls[color]} alt={color} className="w-20 h-20 object-contain" />
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Status moved to top-right corner, this space now empty */}
                            </div>
                        )}
                    </div>

                    {/* XP bar - full width */}
                    <div className="bg-[#1a1a1a] p-3 border-t-4 border-slate-700 flex-shrink-0 relative z-10">
                        <div className="flex justify-between text-gray-400 text-sm mb-1 uppercase font-bold">
                            <span>Level {data.level} XP</span>
                            <span>{data.xp} / {xpToLevel}</span>
                        </div>
                        <div className="w-full h-4 bg-[#333] rounded-full overflow-hidden border-2 border-[#555] relative">
                            <div className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300" style={{ width: `${xpPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Click to exit text */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-yellow-400 text-2xl font-bold pointer-events-none" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    Click outside to exit
                </div>
            </div>,
            document.body
        );
    }

    // Non-battling state
    return (
        <div className="relative">
            {unlockedDifficulty > 1 && (
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
