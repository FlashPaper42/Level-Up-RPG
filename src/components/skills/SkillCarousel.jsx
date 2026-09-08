import React, { useState } from 'react';
import SkillCardFactory from './SkillCardFactory';
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
    bossHealing,
    actionPoints,
    armorPoints,
    playerHealth,
    handleCombatAction,
    generateChallengeAtDifficulty,
    mobAttacking,
    playerDamageIndicator,
    onPerfectMemoryGame,
    onChoresCompleted,
    calculateMobAction,
    mobNextAction
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

    return (
        <>
            <div
                className={`skill-carousel-stage relative w-full flex items-center justify-center perspective-1000 min-h-0 ${battlingSkillId ? 'z-50' : ''}`}
                style={{ cursor: battlingSkillId ? 'default' : (isDragging ? 'grabbing' : 'grab') }}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
            >
                {getVisibleItems().map((item) => {
                    const isItemBattling = item.offset === 0 && battlingSkillId === item.id;
                    // Calculate curved positioning based on offset
                    const getVerticalOffset = (offset) => {
                        if (offset === 0) return -20;
                        if (Math.abs(offset) === 1) return 5;
                        if (Math.abs(offset) === 2) return 55;
                        return 110;
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
                                transform: `translateX(calc(${item.offset} * var(--card-offset))) translateY(calc(${translateY}px + var(--carousel-y-shift))) rotateX(${rotateX}deg) scale(${item.offset === 0 ? 1.18 : 0.9})`,
                                opacity: item.offset === 0 ? 1 : (Math.abs(item.offset) === 3 ? 0 : (Math.abs(item.offset) === 2 ? 0.3 : 0.6)),
                                zIndex: isItemBattling ? 50 : (item.offset === 0 ? 20 : 10 - Math.abs(item.offset)),
                                filter: item.offset === 0 ? 'none' : 'brightness(0.5) blur(1px)',
                                cursor: item.offset !== 0 && !battlingSkillId ? 'pointer' : 'default',
                                // Smooth entry/exit transitions along the parabola
                                transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
                            }}
                            onClick={() => handleCardClick(item.offset)}
                        >
                            <SkillCardFactory
                                config={item}
                                data={skills[item.id]}
                                themeData={currentThemeData}
                                isCenter={item.offset === 0}
                                isBattling={item.offset === 0 && battlingSkillId === item.id}
                                mobName={getMobForSkill(item, skills[item.id])}
                                mobAura={getAuraForSkill(item, skills[item.id])}
                                challenge={challengeData}
                                handleSuccessHit={handleSuccessHit}
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
                                actionPoints={actionPoints}
                                armorPoints={armorPoints}
                                playerHealth={playerHealth}
                                handleCombatAction={handleCombatAction}
                                generateChallengeAtDifficulty={generateChallengeAtDifficulty}
                                mobAttacking={mobAttacking?.skillId === item.id ? mobAttacking : null}
                                playerDamageIndicator={playerDamageIndicator}
                                onPerfectMemoryGame={onPerfectMemoryGame}
                                onChoresCompleted={onChoresCompleted}
                                calculateMobAction={calculateMobAction}
                                mobNextAction={mobNextAction}
                            />
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default SkillCarousel;
