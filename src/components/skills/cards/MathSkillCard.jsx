import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Minus } from 'lucide-react';
import SafeImage from '../../ui/SafeImage';
import MobWithAura from '../../ui/MobWithAura';
import { BASE_ASSETS, HOSTILE_MOBS, BOSS_MOBS, MINIBOSS_MOBS, DIFFICULTY_IMAGES, DIFFICULTY_CONTENT } from '../../../constants/gameData';
import { playClick } from '../../../utils/soundManager';
import { calculateXPToLevel } from '../../../utils/gameUtils';
import { AURA_ADJECTIVES } from '../../../utils/mobDisplayUtils';
import {
    PRESTIGE_LEVEL_THRESHOLD,
    getActionAnimation,
    getLevelStyling,
    getButtonStyle,
    playMismatch,
    getBorderEffect
} from '../shared';

/**
 * MathSkillCard - Handles the Math skill with numeric input challenges
 */
const MathSkillCard = ({
    config,
    data,
    themeData,
    isCenter,
    isBattling,
    mobName,
    mobAura,
    challenge,
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
    const [mathInput, setMathInput] = useState('');
    const [isHit, setIsHit] = useState(false);
    const [isWrong, setIsWrong] = useState(false);
    const prevDamageCount = useRef(0);
    const inputRef = useRef(null);

    // Calculate HP percentage
    const mobHealth = data.mobHealth || 100;
    const mobMaxHealth = data.mobMaxHealth || 100;
    const hpPercent = Math.round((mobHealth / mobMaxHealth) * 100);

    // Get level-based styling
    const { borderClass, levelTextColor } = getLevelStyling(data.level);

    // Get border effect styling
    const { appliedBorderEffect, borderStyle } = getBorderEffect(isCenter, selectedBorder, borderColor);

    // Get skill theme config
    const skillThemeConfig = themeData.skills[config.id] || {};
    const skillName = skillThemeConfig.name || config.name;

    // Determine mob source
    let mobSrc = HOSTILE_MOBS[mobName] || BOSS_MOBS[mobName] || MINIBOSS_MOBS[mobName] || themeData.assets.mobs[mobName];
    let displayMobName = mobName;
    if (!mobSrc) {
        displayMobName = 'Zombie';
        mobSrc = HOSTILE_MOBS[displayMobName] || BASE_ASSETS.axolotls.Pink;
    }

    const displayMobNameWithAura = isBattling && mobAura && AURA_ADJECTIVES[mobAura]
        ? `${AURA_ADJECTIVES[mobAura]} ${displayMobName}`
        : displayMobName;

    const gemStyle = {};
    const buttonStyle = getButtonStyle(config.colorStyle);

    // Reset input when challenge changes
    useEffect(() => { setMathInput(''); }, [challenge]);

    // Handle damage animation
    useEffect(() => {
        if (damageNumbers.length > prevDamageCount.current) {
            setIsHit(true);
            setTimeout(() => setIsHit(false), 400);
        }
        prevDamageCount.current = damageNumbers.length;
    }, [damageNumbers]);

    const isBattlingCenter = isBattling && isCenter;

    // Handle input change for math challenges
    const handleMathInputChange = (e) => {
        const val = e.target.value.replace(/[^0-9-]/g, '');
        setMathInput(val);
        if (val === String(challenge?.answer)) {
            onMathSubmit(val);
            setMathInput('');
        } else if (val.length === String(challenge?.answer).length) {
            setIsWrong(true);
            playMismatch();
            onMathSubmit('WRONG');
            setTimeout(() => {
                setIsWrong(false);
                setMathInput('');
                setTimeout(() => inputRef.current?.focus(), 10);
            }, 500);
        }
    };

    const cardContent = (
        <div
            className={`bg-[#2b2b2b] border-4 rounded-lg overflow-visible flex flex-col transition-all duration-500 ${isCenter ? `${appliedBorderEffect} ${!appliedBorderEffect ? borderClass : ''}` : 'border-stone-700'} w-[300px] ${isBattlingCenter ? 'h-[550px]' : 'h-[600px]'} ${!isBattlingCenter ? 'relative' : ''}`}
            style={isCenter ? borderStyle : {}}
        >
            {isCenter && data.level >= PRESTIGE_LEVEL_THRESHOLD && <div className="gem-socket"><div className="gem-stone" style={gemStyle}></div></div>}
            {/* Top section with mob */}
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
                            <div key={dmg.id} className="absolute text-5xl font-bold text-red-500 animate-bounce pointer-events-none whitespace-nowrap" style={{ left: `calc(50% + ${dmg.x}px)`, top: `calc(50% + ${dmg.y}px)`, textShadow: '2px 2px 0 #000' }}>
                                -{dmg.val}
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full text-white border-2 border-white/30 text-xl font-bold tracking-wide z-10 shadow-lg whitespace-nowrap min-w-max">{displayMobName}</div>
                </div>
            )}
            {/* HP bar */}
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
                            {/* Math question display */}
                            <div className="flex-1 bg-black/40 rounded border-2 flex flex-col items-center justify-center mb-3 p-2 relative overflow-hidden w-full border-[#555]">
                                {(() => {
                                    const word = challenge?.question.replace('Write: ', '') || '';
                                    const wordLength = word.length;
                                    const fontSize = wordLength > 20 ? '1.2rem' : (wordLength > 12 ? '1.8rem' : '2.5rem');
                                    return (
                                        <span className="text-white font-bold tracking-wider px-2" style={{ fontSize, maxWidth: '100%', wordBreak: 'break-word', textAlign: 'center', lineHeight: '1.2' }}>
                                            {word}
                                        </span>
                                    );
                                })()}
                            </div>
                            {/* Math input boxes */}
                            <div className="relative w-full flex justify-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={mathInput}
                                    onChange={handleMathInputChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    autoFocus
                                    maxLength={String(challenge?.answer).length}
                                    disabled={isWrong}
                                />
                                <div className={`flex gap-2 ${isWrong ? 'animate-shake' : ''}`}>
                                    {String(challenge?.answer).split('').map((char, i) => (
                                        <div key={i} className={`w-10 h-12 border-b-4 flex items-center justify-center text-2xl font-mono font-bold text-white bg-black/20 rounded-t ${isWrong ? 'border-red-500 bg-red-900/30' : (i < mathInput.length ? 'border-green-500' : 'border-gray-600')}`}>
                                            {mathInput[i] || ''}
                                        </div>
                                    ))}
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
                                        <div className="flex items-center gap-1 text-yellow-300 text-xs uppercase font-bold">
                                            <span>AP:</span><span className="text-xs">{cappedAP}/5</span>
                                        </div>
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

    // Portal rendering for battle mode
    if (isBattlingCenter) {
        const { animationClass, actionStyle } = getActionAnimation(isHit, mobAttacking, config.id, bossHealing);

        return (
            <>
                {ReactDOM.createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onEndBattle} style={{ zIndex: 50 }}>
                        <div className="flex items-center justify-center gap-24 relative max-w-[95vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                            {/* Left Panel - Mob Display */}
                            <div className="flex-shrink-0">
                                <div className="relative w-[469px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 border-slate-600 rounded-lg overflow-hidden flex flex-col" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(100,100,100,0.2)', height: '500px' }}>
                                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-purple-600"></div>
                                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-purple-600"></div>
                                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-purple-600"></div>
                                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-purple-600"></div>
                                    <div className="bg-gradient-to-b from-purple-800 to-purple-900 p-4 border-b-4 border-slate-700 relative">
                                        <div className="text-purple-200 text-xl font-black uppercase tracking-wider text-center" style={{ textShadow: '2px 2px 0 #000' }}>⚔ {displayMobNameWithAura} ⚔</div>
                                    </div>
                                    <div className="relative flex flex-col items-center justify-center flex-1" style={{ ...config.colorStyle, minHeight: '310px', width: '100%', overflow: 'hidden' }}>
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <div className={`relative z-10 w-full h-full flex items-center justify-center transition-all duration-300 ${animationClass}`} style={actionStyle}>
                                            {mobAura ? (
                                                <div className="w-full h-full flex items-center justify-center p-4">
                                                    <MobWithAura mobSrc={mobSrc} aura={mobAura} displayName={displayMobNameWithAura} size="100%" isHit={isHit} bossHealing={bossHealing} />
                                                </div>
                                            ) : (
                                                <SafeImage key={displayMobName} src={mobSrc} alt={displayMobName} className="w-full h-full object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] p-4" />
                                            )}
                                            {damageNumbers.map(dmg => (
                                                <div key={dmg.id} className="absolute text-5xl font-bold text-red-500 animate-bounce pointer-events-none whitespace-nowrap" style={{ left: `calc(50% + ${dmg.x}px)`, top: `calc(50% + ${dmg.y}px)`, textShadow: '2px 2px 0 #000' }}>-{dmg.val}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-3 border-t-4 border-slate-700 flex-shrink-0">
                                        <div className="flex justify-between text-gray-400 text-sm mb-1 uppercase font-bold"><span>HP</span><span>{hpPercent}%</span></div>
                                        <div className="w-full h-8 bg-[#333] rounded-full overflow-hidden border-2 border-[#555] relative">
                                            <div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-200" style={{ width: `${hpPercent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Right Panel - Minigame Card */}
                            <div className="flex-shrink-0">{cardContent}</div>
                        </div>
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-yellow-400 text-2xl font-bold pointer-events-none z-50" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Click outside to exit battle</div>
                    </div>,
                    document.body
                )}
            </>
        );
    }

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

export default MathSkillCard;
