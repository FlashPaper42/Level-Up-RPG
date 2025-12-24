import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import SafeImage from '../../ui/SafeImage';
import ParentalVerificationModal from '../../ui/ParentalVerificationModal';
import { BASE_ASSETS, CHEST_BLOCKS } from '../../../constants/gameData';
import { playClick, getSfxVolume } from '../../../utils/soundManager';
import {
    PRESTIGE_LEVEL_THRESHOLD,
    getLevelStyling,
    getButtonStyle,
    getBorderEffect
} from '../shared';

// Chore list - static for now
const CHORE_LIST = [
    { chore: 'Take out the trash', emoji: '🗑️' },
    { chore: 'Clean your room', emoji: '🧹' },
    { chore: 'Do the dishes', emoji: '🍽️' },
    { chore: 'Put away laundry', emoji: '👕' },
    { chore: 'Feed the pets', emoji: '🐕' },
    { chore: 'Make your bed', emoji: '🛏️' },
];

/**
 * CleaningSkillCard - Handles the Cleaning skill with parental verification
 * Features: 3-card battle layout (Instructions, Chest, Bounty List), interactive chore list
 */
const CleaningSkillCard = ({
    config,
    data,
    themeData,
    isCenter,
    isBattling,
    mobName,
    challenge,
    onStartBattle,
    onEndBattle,
    onMathSubmit,
    selectedBorder,
    borderColor
}) => {
    const [showParentalModal, setShowParentalModal] = useState(false);
    const [completedChores, setCompletedChores] = useState([]);

    const { borderClass, levelTextColor } = getLevelStyling(data.level);
    const { appliedBorderEffect, borderStyle } = getBorderEffect(isCenter, selectedBorder, borderColor);

    const skillThemeConfig = themeData.skills[config.id] || {};
    const skillName = skillThemeConfig.name || config.name;

    // For Cleaning skill, use chest blocks
    const mobSrc = CHEST_BLOCKS[mobName] || themeData.assets.mobs[mobName] || BASE_ASSETS.axolotls.Pink;
    const displayMobName = mobName;

    const gemStyle = {};
    const buttonStyle = getButtonStyle(config.colorStyle);

    const toggleChore = (index) => {
        playClick();
        setCompletedChores(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            }
            return [...prev, index];
        });
    };

    const handleParentalVerified = useCallback(() => {
        setShowParentalModal(false);
        // Grant XP/levels for each completed chore
        const choreCount = completedChores.length;
        if (choreCount > 0) {
            // Submit multiple wins - one per chore
            for (let i = 0; i < choreCount; i++) {
                setTimeout(() => {
                    onMathSubmit("WIN", 1, 1);
                }, i * 100);
            }
            // Play success sound
            const matchAudio = new Audio(BASE_ASSETS.audio.match);
            matchAudio.volume = getSfxVolume();
            matchAudio.play().catch(() => { });
        }
        // Reset completed chores
        setCompletedChores([]);
    }, [onMathSubmit, completedChores]);

    const isBattlingCenter = isBattling && isCenter;

    const cardContent = (
        <div
            className={`bg-[#2b2b2b] border-4 rounded-lg overflow-visible flex flex-col transition-all duration-500 ${isCenter ? `${appliedBorderEffect} ${!appliedBorderEffect ? borderClass : ''}` : 'border-stone-700'} w-[300px] ${isBattlingCenter ? 'h-[550px]' : 'h-[600px]'} ${!isBattlingCenter ? 'relative' : ''}`}
            style={isCenter ? borderStyle : {}}
        >
            {isCenter && data.level >= PRESTIGE_LEVEL_THRESHOLD && <div className="gem-socket"><div className="gem-stone" style={gemStyle}></div></div>}
            {/* Top section with chest */}
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
                        <SafeImage
                            key={displayMobName}
                            src={mobSrc}
                            alt={displayMobName}
                            className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-transform duration-100 animate-bob"
                        />
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full text-white border-2 border-white/30 text-xl font-bold tracking-wide z-10 shadow-lg whitespace-nowrap min-w-max">{displayMobName}</div>
                </div>
            )}
            {/* HP bar for non-battle state */}
            {!isBattling && (
                <div className="bg-[#1a1a1a] p-2 border-t-4 border-b-4 border-black relative">
                    <div className="flex justify-between text-gray-400 text-xs mb-1 uppercase"><span>HP</span><span>100%</span></div>
                    <div className="w-full h-6 bg-[#333] rounded-full overflow-hidden border-2 border-[#555] relative">
                        <div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-200" style={{ width: '100%' }}></div>
                    </div>
                </div>
            )}
            <div className={isBattling ? 'h-full bg-[#3a3a3a] p-4 flex flex-col relative rounded-lg' : 'flex-1 bg-[#3a3a3a] p-4 flex flex-col relative rounded-b-sm'}>
                {!isBattling && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-gray-400 text-center mb-4 px-2">{config.taskDescription}</p>
                        <button
                            onClick={isCenter ? onStartBattle : undefined}
                            disabled={!isCenter}
                            style={buttonStyle}
                            className={`w-full text-white text-3xl font-bold py-6 rounded-lg active:shadow-none active:translate-y-[6px] transition-all border-2 uppercase tracking-wider ${!isCenter ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {config.actionName}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // When battling, render the specialized 3-card layout
    if (isBattlingCenter) {
        return (
            <>
                {ReactDOM.createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onEndBattle} style={{ zIndex: 50 }}>
                        <div className="flex items-center justify-center gap-16 relative max-w-[95vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                            {/* Left Card - Instructions */}
                            <div className="flex-shrink-0">
                                <div className="relative w-[280px] bg-gradient-to-br from-cyan-900 via-slate-800 to-cyan-900 border-4 border-cyan-600 rounded-lg overflow-hidden" style={{ boxShadow: '0 0 40px rgba(0,150,150,0.5), inset 0 0 30px rgba(100,200,200,0.1)', height: '550px' }}>
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400"></div>
                                    <div className="bg-gradient-to-b from-cyan-700 to-cyan-800 p-3 border-b-4 border-slate-700 relative">
                                        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <div className="text-cyan-200 text-lg font-black uppercase tracking-wider text-center relative z-10" style={{ textShadow: '2px 2px 0 #000' }}>📋 HOW TO LEVEL UP</div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-4 h-[calc(100%-52px)]">
                                        <div className="bg-black/30 rounded-lg p-4 border border-cyan-700/50">
                                            <p className="text-cyan-100 text-lg leading-relaxed text-center">Complete a <span className="text-yellow-400 font-bold">real-world chore</span> to earn XP!</p>
                                        </div>
                                        <div className="bg-black/30 rounded-lg p-4 border border-cyan-700/50 flex-1">
                                            <div className="text-cyan-300 text-sm uppercase font-bold mb-2 text-center">Steps:</div>
                                            <ol className="text-cyan-100 text-base space-y-2 list-decimal list-inside">
                                                <li>Choose chores from the bounty list</li>
                                                <li>Complete the chores in real life</li>
                                                <li>Click chores to mark them done</li>
                                                <li>Ask a parent to verify</li>
                                                <li>Click "Complete!" to level up!</li>
                                            </ol>
                                        </div>
                                        {/* Removed yellow warning element */}
                                    </div>
                                </div>
                            </div>

                            {/* Center Card - Chest Preview with Action Button */}
                            <div className="flex-shrink-0" style={{ transform: 'scale(1.1)' }}>
                                <div className="relative w-[350px] bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 border-4 border-amber-600 rounded-lg overflow-hidden flex flex-col" style={{ boxShadow: '0 0 50px rgba(200,150,50,0.5), inset 0 0 40px rgba(255,200,100,0.1)', height: '550px' }}>
                                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-yellow-500"></div>
                                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-yellow-500"></div>
                                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-yellow-500"></div>
                                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-yellow-500"></div>
                                    <div className="bg-gradient-to-b from-amber-700 to-amber-800 p-4 border-b-4 border-amber-950 relative">
                                        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <div className="text-yellow-300 text-xl font-black uppercase tracking-wider text-center relative z-10" style={{ textShadow: '2px 2px 0 #000' }}>🗃️ CHEST MANAGEMENT</div>
                                    </div>
                                    <div className="relative flex flex-col items-center justify-center flex-1 p-4 min-h-0">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <SafeImage src={mobSrc} alt={displayMobName} className="max-w-full object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] animate-bob relative z-10" style={{ maxHeight: '140px' }} />
                                        <div className="mt-2 bg-black/60 px-6 py-2 rounded-full border-2 border-yellow-500/50 relative z-10">
                                            <span className="text-yellow-400 text-lg font-bold">{displayMobName}</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-4 border-t-4 border-amber-950 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-amber-400 text-lg font-bold uppercase">Level</span>
                                            <span className="text-yellow-400 text-3xl font-black" style={{ textShadow: '2px 2px 0 #000' }}>{data.level}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-amber-400">Chores Completed:</span>
                                            <span className="text-green-400 font-bold">{completedChores.length}</span>
                                        </div>
                                        <button
                                            onClick={() => setShowParentalModal(true)}
                                            disabled={completedChores.length === 0}
                                            className={`w-full text-white text-2xl font-bold py-3 rounded shadow-[0_4px_0_#166534] active:shadow-none active:translate-y-[4px] transition-all ${completedChores.length > 0 ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}`}
                                        >
                                            ✓ Complete! (+{completedChores.length} XP)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Card - Interactive Bounty List */}
                            <div className="flex-shrink-0">
                                <div className="relative w-[280px] bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-50 border-4 border-amber-800 rounded-lg overflow-hidden" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(251,191,36,0.2)', height: '550px' }}>
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-700"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-700"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-700"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-700"></div>
                                    <div className="bg-gradient-to-b from-red-700 to-red-800 p-3 border-b-4 border-amber-900 relative">
                                        <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <div className="text-yellow-300 text-lg font-black uppercase tracking-wider text-center relative z-10" style={{ fontFamily: '"Orbitron", sans-serif', textShadow: '2px 2px 0 #000' }}>📜 CHORE BOUNTIES</div>
                                        <div className="absolute top-2 left-3 w-2.5 h-2.5 bg-amber-900 rounded-full border border-amber-950 z-10"></div>
                                        <div className="absolute top-2 right-3 w-2.5 h-2.5 bg-amber-900 rounded-full border border-amber-950 z-10"></div>
                                    </div>
                                    <div className="p-3 space-y-2 h-[calc(100%-100px)]">
                                        {CHORE_LIST.map((item, idx) => {
                                            const isCompleted = completedChores.includes(idx);
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => toggleChore(idx)}
                                                    className={`w-full border-2 rounded p-2.5 flex items-center gap-2 transition-all ${isCompleted
                                                        ? 'bg-green-200/50 border-green-600/50 opacity-60'
                                                        : 'bg-amber-900/20 border-amber-900/40 hover:bg-amber-900/30 hover:scale-[1.02]'}`}
                                                >
                                                    <span className="text-2xl">{item.emoji}</span>
                                                    <span
                                                        className={`font-bold text-sm flex-1 text-left ${isCompleted ? 'line-through text-stone-500' : 'text-stone-800'}`}
                                                        style={{ fontFamily: '"Orbitron", sans-serif' }}
                                                    >
                                                        {item.chore}
                                                    </span>
                                                    {isCompleted && <span className="text-green-600 text-xl">✓</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-gradient-to-t from-amber-900 to-amber-800 p-2 border-t-4 border-amber-950 relative">
                                        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <div className="text-center text-yellow-200 text-xs font-bold uppercase tracking-widest relative z-10">Click to Mark Complete!</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-yellow-400 text-2xl font-bold pointer-events-none z-50" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Click outside to exit</div>
                    </div>,
                    document.body
                )}
                <ParentalVerificationModal isOpen={showParentalModal} onClose={() => setShowParentalModal(false)} onVerified={handleParentalVerified} />
            </>
        );
    }

    return (
        <div className="relative">
            {cardContent}
            <ParentalVerificationModal isOpen={showParentalModal} onClose={() => setShowParentalModal(false)} onVerified={handleParentalVerified} />
        </div>
    );
};

export default CleaningSkillCard;
