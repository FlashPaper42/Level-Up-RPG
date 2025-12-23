import React, { useState, useEffect, useRef } from 'react';
import SafeImage from '../../ui/SafeImage';
import { BASE_ASSETS, FRIENDLY_MOBS, DIFFICULTY_CONTENT } from '../../../constants/gameData';
import { playClick, getSfxVolume } from '../../../utils/soundManager';
import { calculateXPToLevel } from '../../../utils/gameUtils';
import {
    PRESTIGE_LEVEL_THRESHOLD,
    getLevelStyling,
    getButtonStyle,
    getBorderEffect
} from '../shared';

/**
 * MemorySkillCard - Handles the Memory skill with card matching game
 * Features: Card grid, flip animations, nightmare mode bouncing, match detection
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
    const animationFrameRef = useRef(null);
    const containerRef = useRef(null);
    const memorySessionStartedRef = useRef(false);

    const mobHealth = data.mobHealth || 100;
    const mobMaxHealth = data.mobMaxHealth || 100;
    const hpPercent = Math.round((mobHealth / mobMaxHealth) * 100);

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

    // Initialize memory game
    useEffect(() => {
        if (isBattling && !memorySessionStartedRef.current) {
            memorySessionStartedRef.current = true;
            const allMobKeys = Object.keys(FRIENDLY_MOBS);
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
            // Initialize positions and velocities for nightmare mode
            if (difficulty === 7) {
                setCardPositions(shuffledCards.map(() => ({ x: 0, y: 0 })));
                setCardVelocities(shuffledCards.map(() => ({
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2
                })));
            }
        } else if (!isBattling) {
            memorySessionStartedRef.current = false;
            setMemoryCards([]);
            setFlippedIndices([]);
            setMatchedPairs([]);
        }
    }, [isBattling, memoryPairs, difficulty]);

    // Nightmare mode bouncing animation
    useEffect(() => {
        if (!isBattling || difficulty !== 7 || memoryCards.length === 0) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            return;
        }

        const containerWidth = containerRef.current?.offsetWidth || 300;
        const containerHeight = containerRef.current?.offsetHeight || 400;
        const cardWidth = 60;
        const cardHeight = 80;
        const bounceMargin = 20;

        const animate = () => {
            setCardPositions(prevPositions => {
                return prevPositions.map((pos, idx) => {
                    if (matchedPairs.includes(memoryCards[idx]?.color)) return pos;
                    let newX = pos.x + cardVelocities[idx].x;
                    let newY = pos.y + cardVelocities[idx].y;
                    if (newX < -bounceMargin || newX > bounceMargin) {
                        setCardVelocities(prev => {
                            const newVel = [...prev];
                            newVel[idx] = { ...newVel[idx], x: -newVel[idx].x };
                            return newVel;
                        });
                    }
                    if (newY < -bounceMargin || newY > bounceMargin) {
                        setCardVelocities(prev => {
                            const newVel = [...prev];
                            newVel[idx] = { ...newVel[idx], y: -newVel[idx].y };
                            return newVel;
                        });
                    }
                    return { x: Math.max(-bounceMargin, Math.min(bounceMargin, newX)), y: Math.max(-bounceMargin, Math.min(bounceMargin, newY)) };
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
    }, [isBattling, difficulty, memoryCards.length, matchedPairs, memoryCards, cardVelocities]);

    const handleCardClick = (index) => {
        if (isProcessingMatch || flippedIndices.includes(index) || matchedPairs.includes(memoryCards[index].color)) return;
        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);
        playClick();

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
                        setTimeout(() => onMathSubmit("WIN"), 500);
                    }
                } else {
                    const mismatchAudio = new Audio(BASE_ASSETS.audio.mismatch);
                    mismatchAudio.volume = getSfxVolume();
                    mismatchAudio.play().catch(() => { });
                    setMismatchShake(true);
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
                        <SafeImage key={displayMobName} src={mobSrc} alt={displayMobName} className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-transform duration-100 animate-bob" />
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full text-white border-2 border-white/30 text-xl font-bold tracking-wide z-10 shadow-lg whitespace-nowrap min-w-max">{displayMobName}</div>
                </div>
            )}
            {(isBattling || !isBattling) && (
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
                        {/* Memory card grid */}
                        <div ref={containerRef} className={`flex-1 grid gap-2 bg-black/20 p-2 rounded items-center ${difficulty === 7 ? 'overflow-visible' : ''}`} style={{ gridTemplateColumns: `repeat(${memoryGridCols}, 1fr)` }}>
                            {memoryCards.map((card, index) => {
                                const isFlipped = flippedIndices.includes(index);
                                const isMatched = matchedPairs.includes(card.color);
                                const bouncePos = difficulty === 7 && cardPositions[index] ? cardPositions[index] : { x: 0, y: 0 };
                                if (isMatched) return <div key={card.id} className="w-full aspect-[2/3]"></div>;
                                return (
                                    <div
                                        key={card.id}
                                        onClick={() => handleCardClick(index)}
                                        className={`w-full aspect-[2/3] cursor-pointer transition-transform duration-100 perspective-1000 relative transform-style-3d ${isFlipped ? 'rotate-y-180' : ''} ${mismatchShake && isFlipped ? 'animate-shake-flipped border-red-500' : ''}`}
                                        style={difficulty === 7 ? { transform: `translate(${bouncePos.x}px, ${bouncePos.y}px) ${isFlipped ? 'rotateY(180deg)' : ''}`, transition: 'none' } : {}}
                                    >
                                        <div className="absolute inset-0 backface-hidden w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                                            <SafeImage src={themeData.assets.cardBack} className="w-full h-full object-cover rounded border border-stone-600" />
                                        </div>
                                        <div className="absolute inset-0 backface-hidden w-full h-full rotate-y-180 bg-slate-800 rounded border border-white/20 flex items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                            <SafeImage src={card.img} className="w-full h-full object-contain p-1" />
                                        </div>
                                    </div>
                                );
                            })}
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
            {cardContent}
        </div>
    );
};

export default MemorySkillCard;
