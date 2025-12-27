import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Minus } from 'lucide-react';
import SafeImage from '../../ui/SafeImage';
import { BASE_ASSETS, FRIENDLY_MOBS, DIFFICULTY_CONTENT, DIFFICULTY_IMAGES } from '../../../constants/gameData';
import { FRIENDLY_MOBS_WITH_SAY } from '../../../systems/mobs';
import { playClick, getSfxVolume, playMobSay } from '../../../utils/soundManager';
import { calculateXPToLevel } from '../../../utils/gameUtils';
import {
    PRESTIGE_LEVEL_THRESHOLD,
    getLevelStyling,
    getButtonStyle,
    getBorderEffect
} from '../shared';

/**
 * MemorySkillCard - Handles the Memory skill with card matching game
 * Features: Card grid that scales to fill window, side panel for controls, nightmare mode with random bouncing
 */
const MemorySkillCard = ({
    config,
    data,
    themeData,
    isCenter,
    isBattling,
    mobName,
    onStartBattle,
    onEndBattle,
    onMathSubmit,
    difficulty,
    setDifficulty,
    unlockedDifficulty,
    selectedBorder,
    borderColor,
    actionPoints,
    onPerfectMemoryGame
}) => {
    const [memoryCards, setMemoryCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [isProcessingMatch, setIsProcessingMatch] = useState(false);
    const [mismatchShake, setMismatchShake] = useState(false);
    const [cardPositions, setCardPositions] = useState([]);
    const [cardVelocities, setCardVelocities] = useState([]);
    const [mismatchCount, setMismatchCount] = useState(0);
    const animationFrameRef = useRef(null);
    const containerRef = useRef(null);
    const memorySessionStartedRef = useRef(false);

    const { borderClass, levelTextColor } = getLevelStyling(data.level);
    const { appliedBorderEffect, borderStyle } = getBorderEffect(isCenter, selectedBorder, borderColor);

    const skillThemeConfig = themeData.skills[config.id] || {};
    const skillName = skillThemeConfig.name || config.name;

    const mobSrc = 'assets/skills/farm_icon.png';
    const displayMobName = mobName;

    const gemStyle = {};
    const buttonStyle = getButtonStyle(config.colorStyle);

    const memoryConfig = DIFFICULTY_CONTENT.memory[difficulty] || DIFFICULTY_CONTENT.memory[1];
    const memoryPairs = memoryConfig.pairs || 3;
    const memoryGridCols = memoryConfig.gridCols || 4;
    const isNightmareMode = difficulty >= 7;

    // Calculate card size based on grid dimensions
    const totalCards = memoryPairs * 2;
    const rows = Math.ceil(totalCards / memoryGridCols);

    // Initialize memory game
    useEffect(() => {
        if (isBattling && !memorySessionStartedRef.current) {
            memorySessionStartedRef.current = true;
            // Only use friendly mobs that have "say" sounds for the memory game
            const allMobKeys = FRIENDLY_MOBS_WITH_SAY;
            const shuffledMobs = [...allMobKeys].sort(() => Math.random() - 0.5);
            const selectedMobs = shuffledMobs.slice(0, memoryPairs);
            const cardPairs = selectedMobs.flatMap((mob, idx) => [
                { id: idx * 2, color: mob, img: FRIENDLY_MOBS[mob] },
                { id: idx * 2 + 1, color: mob, img: FRIENDLY_MOBS[mob] }
            ]);
            const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
            setMemoryCards(shuffledCards);
            setFlippedIndices([]);
            setMatchedPairs([]);
            setIsProcessingMatch(false);
            setMismatchShake(false);
            setMismatchCount(0);
            // Initialize positions and velocities for nightmare mode
            if (isNightmareMode) {
                const SPEED = 1.5;
                setCardPositions(shuffledCards.map(() => ({ x: 0, y: 0 })));
                setCardVelocities(shuffledCards.map(() => {
                    // Random angle for initial direction
                    const angle = Math.random() * 2 * Math.PI;
                    return {
                        x: Math.cos(angle) * SPEED,
                        y: Math.sin(angle) * SPEED
                    };
                }));
            }
        } else if (!isBattling) {
            memorySessionStartedRef.current = false;
            setMemoryCards([]);
            setFlippedIndices([]);
            setMatchedPairs([]);
            setMismatchCount(0);
            setCardPositions([]);
            setCardVelocities([]);
        }
    }, [isBattling, memoryPairs, isNightmareMode]);

    // Nightmare mode bouncing animation with random bounce angles
    useEffect(() => {
        if (!isBattling || !isNightmareMode || memoryCards.length === 0) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            return;
        }

        // Larger bounce area based on container size
        const bounceMarginX = 150;
        const bounceMarginY = 100;
        const SPEED = 1.5;

        const animate = () => {
            setCardPositions(prevPositions => {
                return prevPositions.map((pos, idx) => {
                    if (matchedPairs.includes(memoryCards[idx]?.color)) return pos;

                    const vel = cardVelocities[idx];
                    if (!vel) return pos;

                    let newX = pos.x + vel.x;
                    let newY = pos.y + vel.y;
                    let needsVelocityUpdate = false;
                    let newVelX = vel.x;
                    let newVelY = vel.y;

                    // Bounce off horizontal walls with random angle
                    if (newX < -bounceMarginX || newX > bounceMarginX) {
                        const randomAngle = (Math.random() - 0.5) * Math.PI * 0.5; // -45 to +45 degrees
                        newVelX = -vel.x * Math.cos(randomAngle) - vel.y * Math.sin(randomAngle);
                        newVelY = -vel.x * Math.sin(randomAngle) + vel.y * Math.cos(randomAngle);
                        // Normalize speed
                        const currentSpeed = Math.sqrt(newVelX * newVelX + newVelY * newVelY);
                        newVelX = (newVelX / currentSpeed) * SPEED;
                        newVelY = (newVelY / currentSpeed) * SPEED;
                        needsVelocityUpdate = true;
                        newX = Math.max(-bounceMarginX, Math.min(bounceMarginX, newX));
                    }

                    // Bounce off vertical walls with random angle
                    if (newY < -bounceMarginY || newY > bounceMarginY) {
                        const randomAngle = (Math.random() - 0.5) * Math.PI * 0.5;
                        newVelX = vel.x * Math.cos(randomAngle) + vel.y * Math.sin(randomAngle);
                        newVelY = vel.x * Math.sin(randomAngle) - vel.y * Math.cos(randomAngle);
                        // Normalize speed
                        const currentSpeed = Math.sqrt(newVelX * newVelX + newVelY * newVelY);
                        newVelX = (newVelX / currentSpeed) * SPEED;
                        newVelY = (newVelY / currentSpeed) * SPEED;
                        needsVelocityUpdate = true;
                        newY = Math.max(-bounceMarginY, Math.min(bounceMarginY, newY));
                    }

                    if (needsVelocityUpdate) {
                        setCardVelocities(prev => {
                            const newVel = [...prev];
                            newVel[idx] = { x: newVelX, y: newVelY };
                            return newVel;
                        });
                    }

                    return { x: newX, y: newY };
                });
            });
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [isBattling, isNightmareMode, memoryCards.length, matchedPairs, memoryCards, cardVelocities]);

    const handleCardClick = (index) => {
        if (isProcessingMatch || flippedIndices.includes(index) || matchedPairs.includes(memoryCards[index].color)) return;
        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);
        
        // Play the mob's "say" sound when flipped
        const mobName = memoryCards[index].color;
        playMobSay(mobName);

        if (newFlipped.length === 2) {
            setIsProcessingMatch(true);
            setTimeout(() => {
                if (memoryCards[newFlipped[0]].color === memoryCards[newFlipped[1]].color) {
                    const matchAudio = new Audio(BASE_ASSETS.audio.match);
                    matchAudio.volume = getSfxVolume();
                    matchAudio.play().catch(() => { });
                    const newMatched = [...matchedPairs, memoryCards[newFlipped[0]].color];
                    setMatchedPairs(newMatched);
                    setFlippedIndices([]);
                    setIsProcessingMatch(false);
                    if (newMatched.length === memoryPairs) {
                        // Check for perfect game
                        if (mismatchCount === 0 && onPerfectMemoryGame) {
                            onPerfectMemoryGame();
                        }
                        setTimeout(() => onMathSubmit("WIN"), 500);
                    }
                } else {
                    const mismatchAudio = new Audio(BASE_ASSETS.audio.mismatch);
                    mismatchAudio.volume = getSfxVolume();
                    mismatchAudio.play().catch(() => { });
                    setMismatchShake(true);
                    setMismatchCount(prev => prev + 1);
                    setTimeout(() => {
                        setMismatchShake(false);
                        setFlippedIndices([]);
                        setIsProcessingMatch(false);
                    }, 500);
                }
            }, 300);
        }
    };

    const isBattlingCenter = isBattling && isCenter;

    // Non-battle card content
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
                <div className="relative z-10 flex items-center justify-center h-full max-h-[200px] w-full">
                    <SafeImage key={displayMobName} src={mobSrc} alt={displayMobName} className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-transform duration-100 animate-bob" />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full text-white border-2 border-white/30 text-xl font-bold tracking-wide z-10 shadow-lg whitespace-nowrap min-w-max">{displayMobName}</div>
            </div>
            {/* Difficulty bar instead of HP */}
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

    // When battling, render full-screen layout with side panel and scalable cards
    if (isBattlingCenter) {
        const xpToLevel = calculateXPToLevel(difficulty, data.level);
        const xpPercent = Math.min(100, (data.xp / xpToLevel) * 100);

        // Calculate card size to fill the game area - larger cards for fewer pairs
        const gameAreaHeight = typeof window !== 'undefined' ? window.innerHeight - 200 : 600;
        const gameAreaWidth = typeof window !== 'undefined' ? window.innerWidth - 300 : 800; // 300px for side panel
        const maxCardHeight = Math.floor((gameAreaHeight - 80) / rows) - 16; // subtract spacing
        const maxCardWidth = Math.floor((gameAreaWidth - 80) / memoryGridCols) - 16;
        const cardSize = Math.min(maxCardHeight * 0.8, maxCardWidth); // Slightly shorter than maxHeight for aesthetics
        const cardWidth = cardSize;
        const cardHeight = cardSize * 1.4; // Match typical card aspect ratio to prevent cardback clipping

        return ReactDOM.createPortal(
            <div
                className="fixed inset-0 z-50 flex bg-black/60"
                onClick={onEndBattle}
                style={{ zIndex: 50 }}
            >
                {/* Main game area - takes most of the screen */}
                <div
                    ref={containerRef}
                    className="flex-1 flex items-center justify-center p-4 relative"
                    onClick={(e) => e.stopPropagation()}
                    style={{ overflow: 'hidden' }}
                >
                    {/* Memory card grid - cards scale to fill available space */}
                    <div
                        className="grid gap-4"
                        style={{
                            gridTemplateColumns: `repeat(${memoryGridCols}, ${cardWidth}px)`,
                            position: 'relative'
                        }}
                    >
                        {memoryCards.map((card, index) => {
                            const isFlipped = flippedIndices.includes(index);
                            const isMatched = matchedPairs.includes(card.color);
                            const bouncePos = isNightmareMode && cardPositions[index] ? cardPositions[index] : { x: 0, y: 0 };

                            if (isMatched) {
                                return (
                                    <div
                                        key={card.id}
                                        style={{ width: cardWidth, height: cardHeight }}
                                    ></div>
                                );
                            }

                            return (
                                <div
                                    key={card.id}
                                    onClick={() => handleCardClick(index)}
                                    className={`cursor-pointer transition-transform duration-100 perspective-1000 relative transform-style-3d ${isFlipped ? 'rotate-y-180' : ''} ${mismatchShake && isFlipped ? 'animate-shake-flipped border-red-500' : ''}`}
                                    style={{
                                        width: cardWidth,
                                        height: cardHeight,
                                        zIndex: isNightmareMode ? 10 + index : 'auto', // Each card gets unique z-index
                                        transform: isNightmareMode
                                            ? `translate(${bouncePos.x}px, ${bouncePos.y}px) ${isFlipped ? 'rotateY(180deg)' : ''}`
                                            : isFlipped ? 'rotateY(180deg)' : 'none',
                                        transition: isNightmareMode ? 'none' : 'transform 0.3s'
                                    }}
                                >
                                    <div className="absolute inset-0 backface-hidden w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                                        <SafeImage src={themeData.assets.cardBack} className="w-full h-full object-contain rounded-xl shadow-lg" />
                                    </div>
                                    <div className="absolute inset-0 backface-hidden w-full h-full rotate-y-180 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                        <SafeImage src={card.img} className="w-full h-full object-contain p-3" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Side Panel - controls and stats */}
                <div
                    className="w-[280px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-l-4 border-teal-600 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-700 to-teal-800 p-4 border-b-4 border-slate-700">
                        <div className="text-teal-100 text-xl font-black uppercase tracking-wider text-center" style={{ textShadow: '2px 2px 0 #000' }}>
                            🧠 Memory Game
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="p-4 space-y-4 flex-1">
                        {/* Match counter */}
                        <div className="bg-black/40 rounded-lg p-4 border-2 border-teal-600/50">
                            <div className="text-gray-400 text-xs uppercase mb-1">Matches</div>
                            <div className="text-teal-400 text-3xl font-bold text-center">
                                {matchedPairs.length} / {memoryPairs}
                            </div>
                        </div>

                        {/* Difficulty display */}
                        <div className="bg-black/40 rounded-lg p-4 border-2 border-purple-600/50">
                            <div className="text-gray-400 text-xs uppercase mb-1">Difficulty</div>
                            <div className={`text-2xl font-bold text-center ${isNightmareMode ? 'text-red-400' : 'text-purple-400'}`}>
                                {isNightmareMode ? '🌀 NIGHTMARE' : `Level ${difficulty}`}
                            </div>
                        </div>

                        {/* Level/XP */}
                        <div className="bg-black/40 rounded-lg p-4 border-2 border-slate-600/50">
                            <div className="text-gray-400 text-xs uppercase mb-1">Level {data.level}</div>
                            <div className="w-full h-3 bg-[#333] rounded-full overflow-hidden border border-[#555]">
                                <div className="h-full bg-gradient-to-r from-green-600 to-green-400" style={{ width: `${xpPercent}%` }}></div>
                            </div>
                            <div className="text-gray-500 text-xs mt-1 text-center">{data.xp} / {xpToLevel} XP</div>
                        </div>

                        {/* Mismatches */}
                        {mismatchCount > 0 && (
                            <div className="bg-black/40 rounded-lg p-3 border-2 border-red-600/30">
                                <div className="text-red-400 text-sm text-center">
                                    Mismatches: {mismatchCount}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons - at the bottom of side panel */}
                    <div className="p-4 border-t-2 border-slate-700 space-y-3">
                        {/* Play Again button - only shows when round is complete */}
                        {matchedPairs.length === memoryPairs && (
                            <button
                                onClick={() => {
                                    // Reset game state to start a new round
                                    memorySessionStartedRef.current = false;
                                    setMatchedPairs([]);
                                    setFlippedIndices([]);
                                    setMismatchCount(0);
                                    setIsProcessingMatch(false);
                                    // Reinitialize cards
                                    // Only use friendly mobs that have "say" sounds for the memory game
                                    const allMobKeys = FRIENDLY_MOBS_WITH_SAY;
                                    const shuffledMobs = [...allMobKeys].sort(() => Math.random() - 0.5);
                                    const selectedMobs = shuffledMobs.slice(0, memoryPairs);
                                    const cardPairs = selectedMobs.flatMap((mob, idx) => [
                                        { id: idx * 2, color: mob, img: FRIENDLY_MOBS[mob] },
                                        { id: idx * 2 + 1, color: mob, img: FRIENDLY_MOBS[mob] }
                                    ]);
                                    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
                                    setMemoryCards(shuffledCards);
                                    if (isNightmareMode) {
                                        const SPEED = 1.5;
                                        setCardPositions(shuffledCards.map(() => ({ x: 0, y: 0 })));
                                        setCardVelocities(shuffledCards.map(() => {
                                            const angle = Math.random() * 2 * Math.PI;
                                            return { x: Math.cos(angle) * SPEED, y: Math.sin(angle) * SPEED };
                                        }));
                                    }
                                    playClick();
                                }}
                                className="w-full bg-green-600 hover:bg-green-500 text-white text-lg font-bold py-3 rounded-lg border-2 border-green-700 shadow-[0_4px_0_#166534] active:shadow-none active:translate-y-[4px] transition-all"
                            >
                                🔄 Play Again
                            </button>
                        )}

                        {/* Exit button */}
                        <button
                            onClick={onEndBattle}
                            className="w-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-2 rounded-lg border-2 border-red-700 shadow-[0_2px_0_#991b1b] active:shadow-none active:translate-y-[2px] transition-all"
                        >
                            ✕ Exit Game
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // Non-battling state with difficulty selector
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

export default MemorySkillCard;
