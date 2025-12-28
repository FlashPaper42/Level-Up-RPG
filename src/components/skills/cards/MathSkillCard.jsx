import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Minus } from 'lucide-react';
import SafeImage from '../../ui/SafeImage';
import MobWithAura from '../../ui/MobWithAura';
import { BASE_ASSETS, HOSTILE_MOBS, BOSS_MOBS, MINIBOSS_MOBS, DIFFICULTY_IMAGES } from '../../../constants/gameData';
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
 * MathSkillCard - Handles the Math skill with numeric input challenges and combat
 * Features: Attack/Defend/Special/Heal actions, math problem input, 3-card battle layout
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
    armorPoints,
    playerHealth,
    handleCombatAction,
    generateChallengeAtDifficulty,
    mobAttacking,
    playerDamageIndicator,
    calculateMobAction,
    mobNextAction
}) => {
    const [mathInput, setMathInput] = useState('');
    const [isHit, setIsHit] = useState(false);
    const [isWrong, setIsWrong] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
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

    // Reset selectedAction when battle ends
    useEffect(() => {
        if (!isBattling) {
            setSelectedAction(null);
        }
    }, [isBattling]);

    const isBattlingCenter = isBattling && isCenter;

    // Handle input change for math challenges
    const handleMathInputChange = (e) => {
        const val = e.target.value.replace(/[^0-9-]/g, '');
        setMathInput(val);
        if (val === String(challenge?.answer)) {
            // Correct answer - trigger combat action
            if (selectedAction && handleCombatAction) {
                handleCombatAction(config.id, selectedAction, true);
                setSelectedAction(null);
            } else {
                onMathSubmit(val);
            }
            setMathInput('');
        } else if (val.length === String(challenge?.answer).length) {
            // Wrong answer - forfeit turn, no retry
            setIsWrong(true);
            playMismatch();
            onMathSubmit('WRONG');
            setTimeout(() => {
                setIsWrong(false);
                setMathInput('');
                // Forfeit turn: deselect action so player must choose again
                setSelectedAction(null);
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
                {!isBattling && (
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

    // Portal rendering for battle mode with combat system
    if (isBattlingCenter) {
        const { animationClass, actionStyle } = getActionAnimation(isHit, mobAttacking, config.id, bossHealing);

        return (
            <>
                {ReactDOM.createPortal(
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
                        onClick={() => {
                            if (selectedAction) {
                                setSelectedAction(null);
                                playClick();
                            } else {
                                onEndBattle();
                            }
                        }}
                        style={{ zIndex: 50 }}
                    >
                        <div className="relative flex items-center justify-center pointer-events-none">
                            {/* Left - Action/Input Card */}
                            <div className="absolute left-[calc(50%-615px)] flex-shrink-0 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                <div
                                    className="relative w-[300px] bg-[#2b2b2b] border-4 rounded-lg overflow-visible flex flex-col transition-all duration-500 border-stone-700"
                                    style={isCenter ? borderStyle : {}}
                                >
                                    {isCenter && data.level >= PRESTIGE_LEVEL_THRESHOLD && <div className="gem-socket"><div className="gem-stone" style={gemStyle}></div></div>}
                                    <div className="h-full bg-[#3a3a3a] p-4 flex flex-col relative rounded-lg">
                                        <div className="flex flex-col h-full animate-in slide-in-from-bottom-10 duration-300">
                                            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                                                {selectedAction ? (
                                                    <>
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
                                                                {String(challenge?.answer).split('').map((char, i) => {
                                                                    const isFilled = i < mathInput.length;
                                                                    const isActiveEmpty = i === mathInput.length;
                                                                    return (
                                                                        <div key={i} className={`w-10 h-12 border-b-4 flex items-center justify-center text-2xl font-mono font-bold text-white bg-black/20 rounded-t ${isWrong ? 'border-red-500 bg-red-900/30' : (isFilled ? 'border-green-500' : 'border-gray-600')} ${isActiveEmpty && !isWrong ? 'animate-blink-box' : ''}`}>
                                                                            {mathInput[i] || ''}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <button onClick={() => { setSelectedAction(null); playClick(); }} className="w-full text-xs text-gray-500 underline hover:text-white mt-2">Cancel Action</button>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col gap-3 w-full">
                                                        <button onClick={() => { setSelectedAction('attack'); playClick(); }} className="bg-red-600 hover:bg-red-500 text-white text-xl font-bold py-3 px-2 rounded border-2 border-red-700 active:shadow-none active:translate-y-[2px] transition-all shadow-[0_2px_0_#7f1d1d] flex flex-col items-center justify-center relative" style={{ opacity: 0.9 }}>
                                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-80" style={{ backgroundSize: '40px 40px' }}></div>
                                                            <span className="relative z-10 uppercase">Attack</span>
                                                            <div className="relative z-10 flex items-center justify-center gap-2 mt-1 text-base">
                                                                <span className="text-red-200">+2 DMG ⚔</span>
                                                                <span className="text-yellow-300">+1 AP ✨</span>
                                                            </div>
                                                        </button>
                                                        <button onClick={() => { setSelectedAction('defend'); playClick(); }} className="bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold py-3 px-2 rounded border-2 border-blue-700 active:shadow-none active:translate-y-[2px] transition-all shadow-[0_2px_0_#1e3a5f] flex flex-col items-center justify-center relative" style={{ opacity: 0.9 }}>
                                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-60" style={{ backgroundSize: '40px 40px' }}></div>
                                                            <span className="relative z-10 uppercase">Defend</span>
                                                            <div className="relative z-10 flex items-center justify-center gap-2 mt-1 text-base">
                                                                <span className="text-blue-200">+2 Armor 🛡</span>
                                                                <span className="text-yellow-300">+1 AP ✨</span>
                                                            </div>
                                                        </button>
                                                        <button onClick={() => { if (actionPoints >= 5) { setSelectedAction('special'); generateChallengeAtDifficulty && generateChallengeAtDifficulty(config.id, Math.min(7, difficulty + 1)); playClick(); } }} disabled={actionPoints < 5} className={`text-white text-xl font-bold py-3 px-2 rounded border-2 active:shadow-none active:translate-y-[2px] transition-all flex flex-col items-center justify-center relative ${actionPoints >= 5 ? 'bg-purple-600 hover:bg-purple-500 border-purple-700 shadow-[0_2px_0_#581c87]' : 'bg-purple-900/50 border-purple-900 cursor-not-allowed'}`} style={actionPoints >= 5 ? { backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', backgroundSize: '40px 40px', opacity: 0.9 } : {}}>
                                                            {actionPoints >= 5 && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-60" style={{ backgroundSize: '40px 40px' }}></div>}
                                                            <span className="relative z-10 uppercase">Special</span>
                                                            <div className="relative z-10 flex items-center justify-center gap-2 mt-1 text-base">
                                                                <span className={actionPoints >= 5 ? 'text-purple-200' : 'text-purple-400/60'}>Instant Kill ⚡</span>
                                                                <span className={actionPoints >= 5 ? 'text-yellow-300' : 'text-red-400'}>{actionPoints >= 5 ? '5 AP' : `${actionPoints}/5 AP`} ✨</span>
                                                            </div>
                                                        </button>
                                                        <button onClick={() => { if (actionPoints >= 2) { setSelectedAction('heal'); playClick(); } }} disabled={actionPoints < 2} className={`text-white text-xl font-bold py-3 px-2 rounded border-2 active:shadow-none active:translate-y-[2px] transition-all flex flex-col items-center justify-center relative ${actionPoints >= 2 ? 'bg-green-600 hover:bg-green-500 border-green-700 shadow-[0_2px_0_#14532d]' : 'bg-green-900/50 border-green-900 cursor-not-allowed'}`} style={actionPoints >= 2 ? { backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', backgroundSize: '40px 40px', opacity: 0.9 } : {}}>
                                                            {actionPoints >= 2 && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-60" style={{ backgroundSize: '40px 40px' }}></div>}
                                                            <span className="relative z-10 uppercase">Heal</span>
                                                            <div className="relative z-10 flex items-center justify-center gap-2 mt-1 text-base">
                                                                <span className={actionPoints >= 2 ? 'text-green-200' : 'text-green-400/60'}>Full HP ❤️</span>
                                                                <span className={actionPoints >= 2 ? 'text-yellow-300' : 'text-red-400'}>{actionPoints >= 2 ? '2 AP' : `${actionPoints}/2 AP`} ✨</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {/* XP and AP indicators */}
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
                                                        <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] flex items-center justify-center" style={{ width: '20%', minHeight: '52px' }}>
                                                            <div className="flex items-center gap-1 text-yellow-300 text-xs uppercase font-bold">
                                                                <span>AP:</span><span className="text-xs">{cappedAP}/5</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center - Mob Card */}
                            <div className="flex-shrink-0 absolute left-1/2 pointer-events-auto" style={{ transform: 'translateX(-50%)' }} onClick={(e) => e.stopPropagation()}>
                                <div
                                    className={`relative w-[534px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 rounded-lg overflow-hidden flex flex-col ${appliedBorderEffect || 'border-slate-600'}`}
                                    style={{ boxShadow: '0 0 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(100,100,100,0.2)', height: 'calc(100vh - 230px)', ...borderStyle }}
                                >
                                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-600"></div>
                                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-600"></div>
                                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-600"></div>
                                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-600"></div>

                                    <div className="bg-gradient-to-b from-blue-800 to-blue-900 p-4 border-b-4 border-slate-700 relative flex-shrink-0">
                                        <div className="text-blue-200 text-xl font-black uppercase tracking-wider text-center" style={{ textShadow: '2px 2px 0 #000' }}>
                                            ⚔ {displayMobNameWithAura} ⚔
                                        </div>
                                    </div>

                                    <div className="relative flex flex-col items-center justify-center flex-1" style={{ ...config.colorStyle, minHeight: '255px', width: '100%', overflow: 'hidden' }}>
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

                                    {/* Mob Next Action Indicator */}
                                    <div className="flex justify-center items-center py-2">
                                        <div className="bg-[#1a1a1a] px-4 py-2 rounded-full border-2 border-slate-700 inline-block">
                                            <div className="text-gray-400 text-xs mb-1 uppercase font-bold text-center">Next Action</div>
                                            <div className="flex items-center justify-center">
                                                {(() => {
                                                    const action = mobNextAction?.skillId === config.id ? mobNextAction.action : (calculateMobAction ? calculateMobAction(config.id) : { type: 'damage', value: 1 });
                                                    return action.type === 'damage' ? (
                                                        <span className="text-red-400 font-bold text-lg">⚔ +1 DMG</span>
                                                    ) : action.type === 'armor' ? (
                                                        <span className="text-blue-400 font-bold text-lg">🛡 +10% ARMOR</span>
                                                    ) : (
                                                        <span className="text-green-400 font-bold text-lg">❤️ +10% HEAL</span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* HP Bar */}
                                    <div className="bg-[#1a1a1a] p-3 border-t-4 border-slate-700 flex-shrink-0">
                                        <div className="flex justify-between text-gray-400 text-sm mb-1 uppercase font-bold"><span>HP</span><span>{hpPercent}%</span></div>
                                        <div className="w-full h-8 bg-[#333] rounded-full overflow-hidden border-2 border-[#555] relative">
                                            {(() => {
                                                const mobArmor = data.mobArmor || 0;
                                                const armorPercent = mobMaxHealth > 0 ? Math.min(100, (mobArmor / mobMaxHealth) * 100) : 0;
                                                return (
                                                    <>
                                                        <div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-200" style={{ width: `${hpPercent}%` }}></div>
                                                        {armorPercent > 0 && (
                                                            <div className="absolute inset-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-200 opacity-80" style={{ width: `${armorPercent}%` }}></div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right - Battle Data Card */}
                            <div className="absolute left-[calc(50%+315px)] flex-shrink-0 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                <div
                                    className="relative w-[400px] bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-50 border-4 border-amber-800 rounded-lg overflow-hidden"
                                    style={{ boxShadow: '0 0 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(251,191,36,0.3)' }}
                                >
                                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-red-700"></div>
                                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-red-700"></div>
                                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-red-700"></div>
                                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-red-700"></div>

                                    <div className="bg-gradient-to-b from-red-700 to-red-800 p-3 border-b-4 border-amber-900 relative">
                                        <div className="absolute inset-0 opacity-80 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <div className="text-yellow-300 text-lg font-black uppercase tracking-wider text-center relative z-10" style={{ fontFamily: '"Orbitron", sans-serif', textShadow: '2px 2px 0 #000' }}>
                                            ⚔ BATTLE DATA ⚔
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div className="bg-amber-900/20 border-2 border-amber-900/40 rounded p-3 flex flex-col items-center justify-center min-h-[80px]">
                                            <div className="text-xl text-amber-900 uppercase font-bold tracking-wide mb-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>Target</div>
                                            <div className="text-stone-900 font-black text-2xl leading-tight text-center" style={{ fontFamily: '"Orbitron", sans-serif' }}>{displayMobNameWithAura}</div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1 bg-amber-900/20 border-2 border-amber-900/40 rounded p-3 flex flex-col items-center justify-center min-h-[80px]">
                                                <div className="text-xl text-amber-900 uppercase font-bold mb-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>Skill</div>
                                                <div className="text-stone-900 font-bold text-lg leading-tight text-center" style={{ fontFamily: '"Orbitron", sans-serif' }}>{skillName}</div>
                                            </div>
                                            <div className="flex-1 bg-amber-900/20 border-2 border-amber-900/40 rounded p-3 flex flex-col items-center justify-center min-h-[80px]">
                                                <div className="text-xl text-amber-900 uppercase font-bold mb-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>Level</div>
                                                <div className={`font-black text-4xl leading-tight text-center ${levelTextColor}`} style={{ fontFamily: '"Orbitron", sans-serif' }}>
                                                    {data.level}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-amber-900/20 border-2 border-amber-900/40 rounded p-3 flex flex-col items-center justify-center min-h-[80px]">
                                            <div className="text-xl text-amber-900 uppercase font-bold mb-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>Quest</div>
                                            <div className="text-stone-800 text-base leading-snug italic font-medium text-center" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                                                {config.taskDescription}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-t from-amber-900 to-amber-800 p-2 border-t-4 border-amber-950 relative">
                                        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <div className="text-center text-yellow-200 text-sm font-bold uppercase tracking-widest relative z-10" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                                            {config.fantasyName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-yellow-400 text-2xl font-bold pointer-events-none z-50" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Click outside to flee the battle</div>
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
