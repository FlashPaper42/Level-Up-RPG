import React, { useState } from 'react';
import SkillCard from './SkillCard';
import { SKILL_DATA, THEME_CONFIG } from '../../constants/gameData.jsx';
import { getEncounterType, getMobForSkill } from '../../utils/gameUtils';
import { playActionCardLeft, playActionCardRight } from '../../utils/soundManager';

const SkillCarousel = ({
    skills,
    activeTheme,
    battlingSkillId,
    startBattle,
    endBattle,
    challengeData,
    isListening,
    spokenText,
    damageNumbers,
    handleSuccessHit,
    toggleMicListener,
    setSkillDifficulty,
    selectedBorder,
    borderColor,
    bossHealing
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);

    const currentThemeData = THEME_CONFIG[activeTheme] || THEME_CONFIG.minecraft;

    const getVisibleItems = () => {
        const items = [];
        // Generate 7 items: 5 visible cards (offsets -2 to +2) + 2 hidden positions (±3) for smooth entry/exit animation
        for (let i = -3; i <= 3; i++) {
            let idx = selectedIndex + i;
            let dataIndex = idx % SKILL_DATA.length;
            if (dataIndex < 0) dataIndex += SKILL_DATA.length;
            items.push({ ...SKILL_DATA[dataIndex], offset: i, key: idx });
        }
        return items;
    };

    // Helper to get the aura for the current mob encounter
    const getAuraForSkill = (skillConfig, userSkill) => {
        // Memory and Cleaning don't use auras
        if (skillConfig.id === 'memory' || skillConfig.id === 'cleaning') {
            return null;
        }

        const encounterType = getEncounterType(userSkill.level);

        if (encounterType === 'boss') {
            return userSkill.currentBossAura;
        }

        if (encounterType === 'miniboss') {
            return userSkill.currentMinibossAura;
        }

        // Combat skills have their own auras
        const combatSkillAuras = {
            'reading': userSkill.readingMobAura,
            'math': userSkill.mathMobAura,
            'writing': userSkill.writingMobAura,
            'patterns': userSkill.patternMobAura
        };

        return combatSkillAuras[skillConfig.id] || null;
    };

    // Drag handlers for carousel navigation
    const handleDragStart = (clientX) => {
        if (battlingSkillId) return;
        setIsDragging(true);
        setDragStartX(clientX);
    };

    const handleDragMove = (clientX) => {
        if (!isDragging || battlingSkillId) return;
        const diff = dragStartX - clientX;
        if (Math.abs(diff) >= 100) {
            if (diff > 0) {
                setSelectedIndex(p => p + 1);
                playActionCardRight();
            } else {
                setSelectedIndex(p => p - 1);
                playActionCardLeft();
            }
            setIsDragging(false);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleCardClick = (offset) => {
        if (battlingSkillId || offset === 0) return;
        setSelectedIndex(p => p + offset);
        if (offset > 0) {
            playActionCardRight();
        } else {
            playActionCardLeft();
        }
    };

    const handlePrev = () => {
        setSelectedIndex(p => p - 1);
        playActionCardLeft();
    };

    const handleNext = () => {
        setSelectedIndex(p => p + 1);
        playActionCardRight();
    };

    return (
        <>
            {/* Left Chevron */}
            {!battlingSkillId && (
                <button
                    onClick={handlePrev}
                    className="flex absolute left-0 z-30 items-center justify-center h-full"
                    style={{
                        background: 'linear-gradient(to right, rgba(100, 100, 100, 0.6), transparent)',
                        width: '80px',
                        padding: '0',
                        top: 0
                    }}
                >
                    <svg
                        width="60"
                        height="450"
                        viewBox="0 0 60 450"
                        className="animate-chevron-left"
                        style={{ opacity: 0.8 }}
                    >
                        <path
                            d="M 50 25 Q 15 225 50 425"
                            stroke="rgba(150, 150, 150, 0.9)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            )}

            {/* Right Chevron */}
            {!battlingSkillId && (
                <button
                    onClick={handleNext}
                    className="flex absolute right-0 z-30 items-center justify-center h-full"
                    style={{
                        background: 'linear-gradient(to left, rgba(100, 100, 100, 0.6), transparent)',
                        width: '80px',
                        padding: '0',
                        top: 0
                    }}
                >
                    <svg
                        width="60"
                        height="450"
                        viewBox="0 0 60 450"
                        className="animate-chevron-right"
                        style={{ opacity: 0.8 }}
                    >
                        <path
                            d="M 10 25 Q 45 225 10 425"
                            stroke="rgba(150, 150, 150, 0.9)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            )}

            <div
                className={`relative w-full flex items-center justify-center perspective-1000 h-[650px] mb-12 ${battlingSkillId ? 'z-50' : ''}`}
                style={{ cursor: battlingSkillId ? 'default' : (isDragging ? 'grabbing' : 'grab') }}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => { e.preventDefault(); handleDragMove(e.touches[0].clientX); }}
                onTouchEnd={handleDragEnd}
            >
                {getVisibleItems().map((item) => {
                    const isItemBattling = item.offset === 0 && battlingSkillId === item.id;
                    // Calculate curved positioning based on offset
                    const getVerticalOffset = (offset) => {
                        if (offset === 0) return -55; // Center card lowered by 5px (was -60)
                        if (Math.abs(offset) === 1) return -30; // Adjacent cards at intermediate height
                        if (Math.abs(offset) === 2) return 20; // Outer cards at lowest position
                        return 75; // Hidden positions (±3) - off-screen, continuing the parabolic curve
                    };
                    const translateY = getVerticalOffset(item.offset);
                    // Add subtle rotation for 3D effect - negative values warp outward
                    const rotateX = Math.abs(item.offset) === 3 ? -12 : (Math.abs(item.offset) === 2 ? -8 : (Math.abs(item.offset) === 1 ? -4 : 0));

                    if (!skills || !skills[item.id]) return null;
                    return (
                        <div
                            key={item.key}
                            className="absolute transition-all duration-500 ease-out"
                            style={{
                                transform: `translateX(${item.offset * 320}px) translateY(${translateY}px) rotateX(${rotateX}deg) scale(${item.offset === 0 ? 1.1 : 0.85})`,
                                opacity: item.offset === 0 ? 1 : (Math.abs(item.offset) === 3 ? 0 : (Math.abs(item.offset) === 2 ? 0.3 : 0.6)),
                                zIndex: isItemBattling ? 50 : (item.offset === 0 ? 20 : 10 - Math.abs(item.offset)),
                                filter: item.offset === 0 ? 'none' : 'brightness(0.5) blur(1px)',
                                cursor: item.offset !== 0 && !battlingSkillId ? 'pointer' : 'default',
                                // Smooth entry/exit transitions along the parabola
                                transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
                            }}
                            onClick={() => handleCardClick(item.offset)}
                        >
                            <SkillCard
                                config={item}
                                data={skills[item.id]}
                                themeData={currentThemeData}
                                isCenter={item.offset === 0}
                                isBattling={item.offset === 0 && battlingSkillId === item.id}
                                mobName={getMobForSkill(item, skills[item.id])}
                                mobAura={getAuraForSkill(item, skills[item.id])}
                                challenge={challengeData}
                                isListening={isListening}
                                spokenText={spokenText}
                                damageNumbers={damageNumbers?.filter(d => d.skillId === item.id) || []}
                                onStartBattle={() => startBattle(item.id)}
                                onEndBattle={endBattle}
                                onMathSubmit={(val, customDamage, customXP) => handleSuccessHit(item.id, val, customDamage, customXP)}
                                onMicClick={() => toggleMicListener(item.id)}
                                difficulty={skills[item.id].difficulty || 1}
                                setDifficulty={(newDiff) => setSkillDifficulty(item.id, newDiff)}
                                unlockedDifficulty={Math.min(7, Math.floor(skills[item.id].level / 20) + 1)}
                                selectedBorder={selectedBorder}
                                borderColor={borderColor}
                                bossHealing={bossHealing === item.id}
                            />
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default SkillCarousel;
