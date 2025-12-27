import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from './contexts/UserContext';
import { useProgression } from './contexts/ProgressionContext';
import { useCombat } from './contexts/CombatContext';

import {
    Menu, Sparkles, Gift, Maximize, Minimize, Settings, Bug
} from 'lucide-react';

// Modules
import GlobalStyles from './components/ui/GlobalStyles';
import SafeImage from './components/ui/SafeImage';
import PixelHeart from './components/ui/PixelHeart';
import PixelShield from './components/ui/PixelShield';
import ProfilePicture from './components/ui/ProfilePicture';
import ResetModal from './components/modals/ResetModal';
import BugReportModal from './components/modals/BugReportModal';
import AvatarSelectionModal from './components/modals/AvatarSelectionModal';
import SettingsDrawer from './components/drawers/SettingsDrawer';
import CosmeticsDrawer from './components/drawers/CosmeticsDrawer';
import MenuDrawer from './components/drawers/MenuDrawer';
import SkillCarousel from './components/skills/SkillCarousel';
import PhantomEvent from './components/PhantomEvent';
import AchievementToast from './components/ui/AchievementToast';
import { useAzureSpeech } from './hooks/useAzureSpeech';
import { usePhantomSystem } from './hooks/usePhantomSystem';
import { toggleFullscreenSafe } from './utils/platform';
import { getAvatarEmoji } from './constants/avatarData';

// Utils & Constants
import { getRandomMob, getRandomFriendlyMob, getRandomMiniboss, getRandomBoss, getMobForSkill, getEncounterType, generateMathProblem, getReadingWord, getWordForDifficulty, calculateDamage, calculateMobHealth, calculateXPReward, calculateXPToLevel } from './utils/gameUtils';
import {
    calculateMobAction as calculateMobActionFromSystem,
    calculateDamageAfterArmor,
    willHitDefeatMob,
    isCombatSkill as checkIsCombatSkill,
    applyDamageToMob,
    processXPGain,
    generateNewMobData,
    applyMobCounterAttack,
    calculatePlayerDamage
} from './systems/combat';
import { generateChallenge as generateChallengeFromSystem } from './systems/challenges';
import { getRandomAura } from './utils/mobDisplayUtils';
import {
    BASE_ASSETS, THEME_CONFIG, SKILL_DATA,
    HOMOPHONES, DIFFICULTY_CONTENT, HOSTILE_MOBS, BOSS_MOBS, MINIBOSS_MOBS
} from './constants/gameData';
import {
    getBGMManager, setSfxVolume,
    playClick,
    playDeath, playFail, playLevelUp, playNotification, playSuccessfulHit,
    playMobHurt, playMobDeath, playMobSay, playAchievement,
    playArmorGain, playHealSound, playSpecialAttack, playPlayerHitArmor, playPlayerHitHealth, playAmbush
} from './utils/soundManager';
import {
    getDefaultStats, getNewlyUnlockedAchievements, getNewTierAchievements,
    addUniqueToArray, isAchievementUnlocked
} from './utils/achievementUtils';
import { migrateLocalStorageToFiles } from './utils/migration';
import { saveProfileData, saveProfileSettings } from './utils/storage';

// Parent verification privilege constants
const PARENT_PRIVILEGE_LEVEL = 200;
const PARENT_PRIVILEGE_DIFFICULTY = 7;
const PARENT_PRIVILEGE_BADGES = [1, 2, 3, 4, 5, 6, 7, 8];

// Voice recognition constants
const MIN_SPOKEN_TEXT_LENGTH = 2;
const MIC_OFF_TEXT = "Mic Off";

// Boss healing animation duration (ms)
const BOSS_HEALING_ANIMATION_DURATION = 600;

const App = () => {
    // Contexts
    const {
        currentProfile, profileNames, parentStatus, activeTheme,
        setActiveTheme, // For theme switching
        // PIN management
        setProfilePin, verifyProfilePin, clearProfilePin, hasProfilePin,
        switchProfile, updateProfileName, toggleParentStatus,
        // Cosmetics
        selectedBorder, setSelectedBorder,
        borderColor, setBorderColor,
        selectedAvatar, setSelectedAvatar,
        profileBgColor, setProfileBgColor
    } = useUser();

    const {
        skills, stats, setSkills, setStats, checkAchievements: checkAchievementsFromContext,
        achievementToast, // Consuming toast from context
        setAchievementToast // Needed for clearing toast
    } = useProgression();

    const {
        battlingSkillId, battlingSkillIdRef, battleDifficulty,
        startBattle: startBattleContext, endBattle: endBattleContext,
        setBattlingSkillId, setBattleDifficulty, // Now exposed and needed
        playerHealth, setPlayerHealth,
        actionPoints, setActionPoints,
        armorPoints, setArmorPoints,
        mobAttacking, setMobAttacking,
        mobNextAction, setMobNextAction,
        playerDamageIndicator, setPlayerDamageIndicator,
        showDeathOverlay, setShowDeathOverlay
    } = useCombat();

    // Local UI State (Not persisted/global)
    const [challengeData, setChallengeData] = useState(null);
    // LootBox state now managed by usePhantomSystem
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCosmeticsOpen, setIsCosmeticsOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);

    // Guard against double-firing of combat actions
    const processingHitRef = useRef(false);
    // Track if a mob turn is currently pending to prevent double execution
    const mobTurnPendingRef = useRef(false);
    const [isBugReportOpen, setIsBugReportOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const [damageNumbers, setDamageNumbers] = useState([]);
    const [showLevelRestored, setShowLevelRestored] = useState(false);
    const [showAmbush, setShowAmbush] = useState(null); // { skillId, encounterType: 'miniboss' | 'boss' }
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [bossHealing, setBossHealing] = useState(null);

    const challengeDataRef = useRef(null);
    const damageIdRef = useRef(0);
    const loginTrackedRef = useRef(0);

    const [bgmVol, setBgmVol] = useState(0.3);
    const [sfxVol, setSfxVolState] = useState(0.5);
    const bgmManager = useRef(getBGMManager());

    // Cosmetics state - Now managed by UserContext.
    // The previous implementation read from localStorage.getItem(...) in useState initializer.
    // We already moved generic Profile settings to UserContext, but specific "Cosmetics"
    // like selectedBorder/Avatar are now also in UserContext.

    // Run migration on mount (Electron only)
    useEffect(() => {
        migrateLocalStorageToFiles();
    }, []);

    // Note: State saving logic (persistence) is now handled inside ProgressionContext and UserContext!
    // We can REMOVE the duplicated `saveProfileData` calls here for skills/stats/theme.
    // UserContext saves profileNames/parentStatus and Cosmetics.
    // ProgressionContext saves Skills/Stats.

    // Enforce Parent Privileges (Level 200) when parent status changes or on load
    // Only run when skills have been loaded (not empty) to prevent race conditions
    useEffect(() => {
        if (parentStatus && parentStatus[currentProfile] && Object.keys(skills).length > 0) {
            setSkills(prevSkills => {
                // Double-check skills aren't empty to prevent accidental overwrites
                if (Object.keys(prevSkills).length === 0) return prevSkills;
                
                let hasChanges = false;
                const newSkills = { ...prevSkills };

                Object.keys(newSkills).forEach(key => {
                    const skill = newSkills[key];
                    if (skill.level < PARENT_PRIVILEGE_LEVEL) {
                        hasChanges = true;
                        newSkills[key] = {
                            ...skill,
                            level: PARENT_PRIVILEGE_LEVEL,
                            // Ensure difficulty is unlocked based on level?
                            // For simplicity, just setting level. Progression system handles unlocks.
                        };
                    }
                    // Also unlock badges?
                    if (hasChanges && (!skill.earnedBadges || skill.earnedBadges.length < 8)) {
                        newSkills[key].earnedBadges = PARENT_PRIVILEGE_BADGES;
                    }
                });

                return hasChanges ? newSkills : prevSkills;
            });
        }
    }, [parentStatus, currentProfile, setSkills, skills]);

    useEffect(() => {
        localStorage.setItem(`borderEffect_p${currentProfile}`, selectedBorder);
    }, [selectedBorder, currentProfile]);

    useEffect(() => {
        localStorage.setItem(`borderColor_p${currentProfile}`, borderColor);
    }, [borderColor, currentProfile]);

    useEffect(() => {
        localStorage.setItem(`profileAvatar_p${currentProfile}`, selectedAvatar);
    }, [selectedAvatar, currentProfile]);

    useEffect(() => {
        localStorage.setItem(`profileBgColor_p${currentProfile}`, profileBgColor);
    }, [profileBgColor, currentProfile]);

    // Keep battlingSkillIdRef in sync (already done in CombatContext, but local hooks might use the ref? 
    // Wait, useAzureSpeech uses context or props? useAzureSpeech is a hook in App.jsx.
    // It takes battlingSkillId as param.
    // But App.jsx passed `battlingSkillId` (state) to it.
    // So we just pass the context value.



    // Use Azure Speech Hook
    // Use Azure Speech Hook
    const {
        isListening,
        spokenText,
        setSpokenText,
        startVoiceListener,
        stopVoiceRecognition,
        toggleMicListener
    } = useAzureSpeech({
        battlingSkillId,
        challengeData,
        onSuccess: (targetId) => {
            handleSuccessHit(targetId);
        },
        onFailure: (targetId) => handleSuccessHit(targetId, 'WRONG')
    });

    // Use Phantom System Hook
    const {
        lootBox,
        setLootBox,
        handlePhantomLevelAward,
        handlePhantomCaught
    } = usePhantomSystem();

    // Calculate unlocked borders based on earned badges (memoized)
    const unlockedBorders = React.useMemo(() => {
        const unlockedBadges = new Set();
        // Tier to badge name mapping
        const tierToBadge = ['Wood', 'Stone', 'Gold', 'Iron', 'Emerald', 'Diamond', 'Netherite', 'Obsidian'];

        Object.values(skills).forEach(skill => {
            if (skill.earnedBadges && Array.isArray(skill.earnedBadges)) {
                skill.earnedBadges.forEach(tier => {
                    // Convert tier number to badge name (tier 1 = Wood = index 0)
                    if (tier >= 1 && tier <= 8) {
                        unlockedBadges.add(tierToBadge[tier - 1]);
                    }
                });
            }
            // Check for Star badge (level 180+) - this is awarded separately
            if (skill.level >= 180) {
                unlockedBadges.add('Star');
            }
        });
        return Array.from(unlockedBadges);
    }, [skills]);

    // Calculate unlocked achievements (memoized)
    const unlockedAchievements = React.useMemo(() => {
        const unlocked = [];
        const achievementIds = ['speed_demon', 'world_ender', 'monster_manual', 'perfectionist', 'full_set'];

        achievementIds.forEach(id => {
            if (isAchievementUnlocked(id, stats, skills)) {
                unlocked.push(id);
            }
        });

        return unlocked;
    }, [stats, skills]);

    // Update BGM volume
    useEffect(() => {
        bgmManager.current.setVolume(bgmVol);
    }, [bgmVol]);

    // Update SFX volume in sound manager
    useEffect(() => {
        setSfxVolume(sfxVol);
    }, [sfxVol]);

    // Keep challengeDataRef in sync with challengeData state for voice listener
    useEffect(() => {
        challengeDataRef.current = challengeData;
    }, [challengeData]);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isNowFullscreen = !!document.fullscreenElement;
            console.log('[Fullscreen] State changed. document.fullscreenElement:', document.fullscreenElement);
            console.log('[Fullscreen] Setting isFullscreen to:', isNowFullscreen);
            setIsFullscreen(isNowFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Start BGM on first user interaction
    const startBGM = useCallback(() => {
        if (!bgmManager.current.isPlaying) {
            bgmManager.current.play();
        }
    }, []);

    // Toggle fullscreen mode
    const toggleFullscreen = useCallback(() => {
        console.log('[Fullscreen] Function called!');
        console.log('[Fullscreen] document.fullscreenElement:', document.fullscreenElement);

        if (!document.fullscreenElement) {
            console.log('[Fullscreen] Calling requestFullscreen on documentElement');
            document.documentElement.requestFullscreen()
                .then(() => console.log('[Fullscreen] requestFullscreen promise resolved'))
                .catch(err => {
                    console.error('[Fullscreen] requestFullscreen failed:', err);
                });
        } else {
            console.log('[Fullscreen] Calling exitFullscreen');
            document.exitFullscreen()
                .then(() => console.log('[Fullscreen] exitFullscreen promise resolved'))
                .catch(err => {
                    console.error('[Fullscreen] exitFullscreen failed:', err);
                });
        }
        playClick();
    }, []);

    // Generate challenges using the challenges system
    const generateChallenge = (type, diff) => generateChallengeFromSystem(type, diff);

    // Regenerate challenge when difficulty or level changes during active battle
    // This fixes the issue where challenges use stale difficulty after leveling up
    // Removed problematic useEffect that was causing infinite loop
    // The startBattle function already sets battleDifficulty correctly



    // Internal Combat Logic - NO DEBOUNCE GUARD (Caller handles it)
    const executeCombatTurn = (skillId = battlingSkillId, isWrong = false, customDamage = null, customXPMultiplier = null) => {
        // Handle wrong answer
        if (isWrong === 'WRONG') {
            // Check if player is fighting a boss
            if (battlingSkillId) {
                const currentSkillState = skills[battlingSkillId];
                const encounterType = getEncounterType(currentSkillState.level);
                const skillConfig = SKILL_DATA.find(s => s.id === battlingSkillId);

                // Helper function to execute mob's turn (used for both regular mobs and bosses)
                const executeMobTurnOnFail = (delayMs = 0) => {
                    setTimeout(() => {
                        if (!skillConfig || !checkIsCombatSkill(skillConfig.id) || !mobNextAction?.skillId === battlingSkillId) {
                            mobTurnPendingRef.current = false;
                            return;
                        }

                        const mobAction = { ...mobNextAction.action }; // Clone to prevent mutation
                        console.log('[Mob Action] Player failed - executing stored action:', mobAction);

                        // Show mob action animation
                        setMobAttacking({ skillId: battlingSkillId, type: mobAction.type });
                        
                        // Play appropriate sound for mob action type
                        if (mobAction.type === 'armor') {
                            playArmorGain();
                        } else if (mobAction.type === 'heal') {
                            playHealSound();
                        } else {
                            playMobSay(getMobForSkill(skillConfig, currentSkillState));
                        }

                        setTimeout(() => {
                            setMobAttacking(null);

                            if (mobAction.type === 'armor') {
                                setSkills(prev => {
                                    const current = prev[battlingSkillId];
                                    const currentArmor = current.mobArmor || 0;
                                    const armorCap = current.mobMaxHealth || 60;
                                    console.log(`[Combat] Mob ARMOR on fail: ${currentArmor} + ${mobAction.value}`);
                                    return {
                                        ...prev,
                                        [battlingSkillId]: {
                                            ...current,
                                            mobArmor: Math.min(armorCap, currentArmor + mobAction.value)
                                        }
                                    };
                                });
                            } else if (mobAction.type === 'heal') {
                                setSkills(prev => {
                                    const current = prev[battlingSkillId];
                                    const newHealth = Math.min(current.mobMaxHealth, current.mobHealth + mobAction.value);
                                    console.log(`[Combat] Mob HEAL on fail: ${current.mobHealth} + ${mobAction.value} = ${newHealth}`);
                                    return {
                                        ...prev,
                                        [battlingSkillId]: {
                                            ...current,
                                            mobHealth: newHealth
                                        }
                                    };
                                });
                            } else if (mobAction.type === 'damage') {
                                // Mob damage is always 1 - simple calculation
                                const damage = mobAction.value; // Should be 1
                                
                                // Use functional updates to get fresh state
                                setArmorPoints(currentArmor => {
                                    if (currentArmor > 0) {
                                        // Has armor - absorb the hit
                                        playPlayerHitArmor();
                                        setPlayerDamageIndicator({ amount: damage, blocked: true });
                                        setTimeout(() => setPlayerDamageIndicator(null), 1000);
                                        return Math.max(0, currentArmor - damage);
                                    } else {
                                        // No armor - take health damage
                                        setPlayerHealth(currentHealth => {
                                            const newHealth = Math.max(0, currentHealth - damage);
                                            if (newHealth <= 0) {
                                                setTimeout(() => processPlayerDeath(battlingSkillId), 0);
                                            } else {
                                                playPlayerHitHealth();
                                            }
                                            setPlayerDamageIndicator({ amount: damage, blocked: false });
                                            setTimeout(() => setPlayerDamageIndicator(null), 1000);
                                            return newHealth <= 0 ? 10 : newHealth; // Reset on death
                                        });
                                        return currentArmor;
                                    }
                                });
                            }

                            // Calculate next mob action AFTER this turn completes
                            const nextAction = calculateMobAction(battlingSkillId);
                            setMobNextAction({ skillId: battlingSkillId, action: nextAction });
                            mobTurnPendingRef.current = false;
                        }, 600);
                    }, delayMs);
                };

                // Boss fights: heal the boss AND the boss still takes their turn
                if (encounterType === 'boss') {
                    if (mobTurnPendingRef.current) {
                        console.log('[Mob Action] Boss turn already pending, skipping');
                        playFail();
                        return;
                    }
                    mobTurnPendingRef.current = true;

                    setSkills(prev => {
                        const current = prev[battlingSkillId];
                        return {
                            ...prev,
                            [battlingSkillId]: {
                                ...current,
                                mobHealth: current.mobMaxHealth // Fully heal the boss
                            }
                        };
                    });

                    // Trigger boss healing animation
                    setBossHealing(battlingSkillId);
                    setTimeout(() => setBossHealing(null), BOSS_HEALING_ANIMATION_DURATION);

                    // Play fail sound to indicate mistake
                    playFail();
                    
                    // Boss takes their turn after the healing animation completes
                    executeMobTurnOnFail(BOSS_HEALING_ANIMATION_DURATION + 200);
                    return;
                }

                // For Combat Skills (Reading, etc): Execute mob's stored action on player failure
                if (skillConfig && checkIsCombatSkill(skillConfig.id) && mobNextAction?.skillId === battlingSkillId) {
                    if (mobTurnPendingRef.current) {
                        console.log('[Mob Action] Mob turn already pending on wrong answer, skipping');
                        playFail();
                        return;
                    }
                    mobTurnPendingRef.current = true;
                    playFail();
                    executeMobTurnOnFail(0);
                } else {
                    // Fallback for non-combat skills or if no mob action ready (just play fail sound)
                    playFail();
                }
            }
            return;
        }

        if (!skillId) return;
        const skillConfig = SKILL_DATA.find(s => s.id === skillId);
        const currentSkillState = skills[skillId];
        const skillDifficulty = currentSkillState.difficulty || 1;
        const playerLevel = currentSkillState.level;
        // Get the correct mob name for this skill (reading uses readingMob, math uses mathMob, etc.)
        const currentMobName = getMobForSkill(skillConfig, currentSkillState);

        // Calculate damage using new RPG formulas
        // Use custom damage if provided (for pattern recognition scaling)
        const baseDamage = calculateDamage(playerLevel, skillDifficulty);
        const damage = customDamage !== null ? customDamage : baseDamage;

        // Get encounter type for current level
        const encounterType = getEncounterType(playerLevel);

        // Cleaning/memory/miniboss are defeated in single hit
        const isMiniboss = encounterType === 'miniboss' && skillConfig.id !== 'cleaning';
        const isInstantDefeat = skillConfig.id === 'cleaning' || skillConfig.id === 'memory' || isMiniboss;
        const actualDamage = isInstantDefeat ? currentSkillState.mobHealth : damage;

        // Determine if this hit will defeat the mob - use combat system function
        const currentMobArmor = currentSkillState.mobArmor || 0;
        const willDefeatMob = willHitDefeatMob(currentSkillState.mobHealth, currentMobArmor, actualDamage);

        // Show damage numbers and play sounds
        if (skillConfig.id !== 'memory' && skillConfig.id !== 'patterns') {
            const id = ++damageIdRef.current;
            setDamageNumbers(prev => [...prev, { id, skillId, val: actualDamage, x: Math.random() * 100 - 50, y: Math.random() * 50 - 25 }]);
            setTimeout(() => setDamageNumbers(prev => prev.filter(n => n.id !== id)), 800);

            // Play mob hurt or death sound based on if mob is defeated
            if (willDefeatMob) {
                playMobDeath(currentMobName);
            } else {
                playMobHurt(currentMobName);
            }

            // Play successful hit UI sound
            playSuccessfulHit();
        }

        setSkills(prev => {
            const current = prev[skillId];

            // 1. Calculate Damage and XP for this hit using combat system
            const combatResult = applyDamageToMob(current, actualDamage, skillConfig, customXPMultiplier);
            const {
                newMobHealth: updatedMobHealth,
                newMobArmor: updatedMobArmor,
                mobDefeated,
                xpGained
            } = combatResult;

            // Initialize update variables
            let newMobHealth = updatedMobHealth;
            let newMobArmor = updatedMobArmor;
            let newLevel = current.level;
            let newDifficulty = current.difficulty || 1;
            let newBadges = [...(current.earnedBadges || [])];
            let newXp = current.xp;
            let leveledUp = false;
            let newLostLevel = current.lostLevel;
            let newRecoveryDifficulty = current.recoveryDifficulty;

            // Mob defeated!
            if (mobDefeated) {
                // Track stats for mob defeat (Side effects kept in App.jsx)
                const encounterType = getEncounterType(current.level);
                setStats(prevStats => {
                    const newStats = { ...prevStats };
                    newStats.battlesThisSession = (newStats.battlesThisSession || 0) + 1;

                    if (encounterType === 'boss') {
                        newStats.totalBossesDefeated = (newStats.totalBossesDefeated || 0) + 1;
                        newStats.uniqueBossesDefeated = addUniqueToArray(newStats.uniqueBossesDefeated || [], current.currentBoss);
                    } else if (encounterType === 'miniboss') {
                        newStats.totalMinibossesDefeated = (newStats.totalMinibossesDefeated || 0) + 1;
                        newStats.uniqueMinibossesDefeated = addUniqueToArray(newStats.uniqueMinibossesDefeated || [], current.currentMiniboss);
                    } else {
                        newStats.totalMobsDefeated = (newStats.totalMobsDefeated || 0) + 1;
                        newStats.uniqueMobsDefeated = addUniqueToArray(newStats.uniqueMobsDefeated || [], current.currentMob);
                    }

                    // Check achievements after stats update
                    setTimeout(() => {
                        checkAchievementsFromContext(prevStats, newStats, prev, { ...prev, [skillId]: { ...current, level: newLevel } });
                    }, 100);
                    return newStats;
                });

                // BOSS DEFEAT: Auto-unlock next difficulty
                // Boss represents mastery of current difficulty - defeating it unlocks the next
                if (encounterType === 'boss' && newDifficulty < 7) {
                    newDifficulty = Math.min(7, newDifficulty + 1);
                    console.log(`[Boss Defeat] Auto-unlocking difficulty ${newDifficulty}`);
                    playNotification();
                }

                // Check for level restoration first (specific logic in App.jsx)
                if (newLostLevel) {
                    newLevel += 1;
                    newLostLevel = false;
                    newRecoveryDifficulty = null;
                    setShowLevelRestored(true);
                    setTimeout(() => setShowLevelRestored(false), 2000);
                    playNotification();
                }

                // 2. Process XP and Leveling using combat system
                const xpResult = processXPGain(
                    { ...current, level: newLevel, difficulty: newDifficulty, earnedBadges: newBadges, xp: current.xp },
                    xpGained,
                    skillConfig
                );

                newLevel = xpResult.level;
                newXp = xpResult.xp;
                // Only update difficulty from XP result if it's higher (don't overwrite boss unlock)
                newDifficulty = Math.max(newDifficulty, xpResult.difficulty);
                newBadges = xpResult.earnedBadges;
                leveledUp = xpResult.leveledUp;

                // Handle Badge Notifications
                if (xpResult.badgesEarned.length > 0) {
                    xpResult.badgesEarned.forEach(tier => {
                        setLootBox({ level: newLevel, skillName: skillConfig.fantasyName, item: "New Rank!", img: BASE_ASSETS.badges.Wood });
                        playNotification();
                    });
                }

                if (leveledUp) {
                    playLevelUp();
                    
                    // Check for AMBUSH: if new level is a miniboss or boss level
                    const newEncounterType = getEncounterType(newLevel);
                    if (newEncounterType === 'miniboss' || newEncounterType === 'boss') {
                        // Trigger AMBUSH animation!
                        setShowAmbush({ skillId, encounterType: newEncounterType });
                        playAmbush();
                        
                        // Fully heal the player
                        setPlayerHealth(10);
                        setArmorPoints(0);
                        
                        // Clear ambush after animation
                        setTimeout(() => setShowAmbush(null), 2500);
                    }
                }

                // 3. Generate New Mob Data using combat system
                const mobUpdates = generateNewMobData(
                    {
                        ...current, level: newLevel, difficulty: newDifficulty,
                        readingMob: current.readingMob, mathMob: current.mathMob,
                        writingMob: current.writingMob, patternMob: current.patternMob,
                        currentMob: current.currentMob,
                        currentMiniboss: current.currentMiniboss,
                        currentBoss: current.currentBoss
                    },
                    skillConfig
                );

                return {
                    ...prev,
                    [skillId]: {
                        ...current,
                        // Update basic stats
                        mobHealth: mobUpdates.mobHealth,
                        mobMaxHealth: mobUpdates.mobMaxHealth,
                        mobArmor: mobUpdates.mobArmor,
                        level: newLevel,
                        xp: newXp,
                        difficulty: newDifficulty,
                        earnedBadges: newBadges,
                        lostLevel: newLostLevel,
                        recoveryDifficulty: newRecoveryDifficulty,

                        // Spread all mob identifiers (currentMob, readingMob, memoryMob, etc.)
                        ...mobUpdates
                    }
                };
            }

            // Not defeated, just update damage/xp
            return {
                ...prev,
                [skillId]: {
                    ...current,
                    mobHealth: newMobHealth,
                    mobArmor: newMobArmor,
                    xp: current.xp + xpGained // Add partial XP
                }
            };
        });

        // Check if mob was defeated and end battle for combat skills
        // Use willDefeatMob which was calculated BEFORE the setState
        if (willDefeatMob && checkIsCombatSkill(skillConfig.id)) {
            // End battle when mob is defeated
            setTimeout(() => {
                endBattleLocal();
            }, 100); // Small delay to ensure state is updated
            return; // Exit early to prevent generating new challenge
        }

        // Generate next challenge for continuous gameplay (only if mob wasn't defeated)
        // Use functional update to avoid stale closure issue with battlingSkillId
        // Wrap in setTimeout to avoid set-state-during-render issues
        setTimeout(() => {
            setBattlingSkillId(currentBattlingSkillId => {
                if (currentBattlingSkillId === skillId && skillConfig.hasChallenge && skillConfig.id !== 'memory') {
                    // Use the stored battle difficulty for consistent challenge generation throughout the battle
                    // This ensures bosses don't change difficulty mid-fight and miniboss difficulty+1 is maintained
                    const challengeDiff = battleDifficulty || skillDifficulty;
                    setChallengeData(generateChallenge(skillConfig.challengeType, challengeDiff));

                    // Clear spokenText for reading challenges to prevent stale text from triggering false damage
                    if (skillConfig.challengeType === 'reading') {
                        setSpokenText('');
                    }
                } else if (skillConfig.id === 'memory') {
                    // End memory battle after complete
                    // Note: Memory game logic might need review if it relies on this
                    endBattleContext();
                }
                return currentBattlingSkillId; // Return unchanged value
            });
        }, 0);
    };

    // Public wrapper for voice success (Debounced)
    const handleSuccessHit = (skillId = battlingSkillId, isWrong = false) => {
        // Prevent double-firing (debounce)
        if (processingHitRef.current) return;
        processingHitRef.current = true;
        setTimeout(() => processingHitRef.current = false, 500);

        executeCombatTurn(skillId, isWrong);
    };



    // Calculate mob action for Reading skill - wrapper around combat system function
    // Returns: { type: 'damage' | 'armor' | 'heal', value: number }
    // Uses calculateMobActionFromSystem from systems/combat.js
    const calculateMobAction = useCallback((skillId) => {
        if (!skillId) return { type: 'damage', value: 1 };
        const skillState = skills[skillId];
        return calculateMobActionFromSystem(skillState, skillId);
    }, [skills]);

    // Helper to handle player death logic
    const processPlayerDeath = (skillId) => {
        playDeath();
        setShowDeathOverlay(true);
        setStats(prevStats => ({
            ...prevStats,
            totalDeaths: (prevStats.totalDeaths || 0) + 1
        }));

        setSkills(prev => {
            const current = prev[skillId];
            return {
                ...prev,
                [skillId]: {
                    ...current,
                    level: Math.max(1, current.level - 1),
                    lostLevel: current.level > 1,
                    recoveryDifficulty: Math.max(1, (current.difficulty || 1) - 1)
                }
            };
        });

        setTimeout(() => {
            endBattleContext(); // Use context function
            setShowDeathOverlay(false);
        }, 2000);
    };

    // Handle turn-based combat action (attack, defend, special, heal)
    const handleCombatAction = useCallback((skillId, actionType, wasSuccessful) => {
        if (!skillId || !wasSuccessful) return;

        // Prevent double-firing (debounce) to avoid double damage/turns
        if (processingHitRef.current) return;
        processingHitRef.current = true;
        setTimeout(() => processingHitRef.current = false, 500);

        const skillConfig = SKILL_DATA.find(s => s.id === skillId);
        const skillState = skills[skillId];
        const encounterType = getEncounterType(skillState.level);

        // CRITICAL: Get the mob action NOW before any state changes
        // This prevents the race condition where UI shows new action while old executes
        const storedMobAction = mobNextAction?.skillId === skillId
            ? { ...mobNextAction.action }  // Clone to prevent mutation
            : calculateMobAction(skillId);

        // Define Mob Turn Execution Logic
        // Uses functional state updates to get fresh values and avoid stale closures
        const executeMobTurn = (currentMobAction) => {
            // Prevent double mob turns
            if (mobTurnPendingRef.current) {
                console.log('[Mob Action] Mob turn already pending, skipping');
                return;
            }
            mobTurnPendingRef.current = true;

            setTimeout(() => {
                if (battlingSkillIdRef.current !== skillId) {
                    console.log('[Mob Action] Battle ended, skipping mob counterattack');
                    mobTurnPendingRef.current = false;
                    return;
                }

                // Show mob attack animation with the CORRECT action type
                setMobAttacking({ skillId, type: currentMobAction.type });
                
                // Play appropriate sound for mob action type
                if (currentMobAction.type === 'armor') {
                    playArmorGain();
                } else if (currentMobAction.type === 'heal') {
                    playHealSound();
                } else {
                    // Get correct mob name for this skill (readingMob, mathMob, etc.)
                    playMobSay(getMobForSkill(skillConfig, skillState));
                }

                // Apply action effect after animation
                setTimeout(() => {
                    if (battlingSkillIdRef.current !== skillId) {
                        setMobAttacking(null);
                        mobTurnPendingRef.current = false;
                        return;
                    }

                    setMobAttacking(null);

                    if (currentMobAction.type === 'damage') {
                        // Mob damage is always 1 - use functional updates for fresh state
                        const damage = currentMobAction.value; // Should be 1
                        
                        setArmorPoints(currentArmor => {
                            if (currentArmor > 0) {
                                // Has armor - absorb the hit
                                playPlayerHitArmor();
                                setPlayerDamageIndicator({ amount: damage, blocked: true });
                                setTimeout(() => setPlayerDamageIndicator(null), 1000);
                                return Math.max(0, currentArmor - damage);
                            } else {
                                // No armor - take health damage
                                setPlayerHealth(currentHealth => {
                                    const newHealth = Math.max(0, currentHealth - damage);
                                    if (newHealth <= 0) {
                                        setTimeout(() => processPlayerDeath(skillId), 0);
                                    } else {
                                        playPlayerHitHealth();
                                    }
                                    setPlayerDamageIndicator({ amount: damage, blocked: false });
                                    setTimeout(() => setPlayerDamageIndicator(null), 1000);
                                    return newHealth <= 0 ? 10 : newHealth; // Reset on death
                                });
                                return currentArmor;
                            }
                        });
                    } else if (currentMobAction.type === 'armor') {
                        // MOB GAINS ARMOR
                        setSkills(prevSkills => {
                            const currentSkill = prevSkills[skillId];
                            const currentArmor = currentSkill.mobArmor || 0;
                            const armorCap = currentSkill.mobMaxHealth || 60;
                            const newArmor = Math.min(armorCap, currentArmor + currentMobAction.value);
                            console.log(`[Combat] Mob ARMOR: ${currentArmor} + ${currentMobAction.value} = ${newArmor}`);
                            
                            setPlayerDamageIndicator({
                                amount: currentMobAction.value,
                                blocked: true,
                                isMobArmor: true
                            });
                            setTimeout(() => setPlayerDamageIndicator(null), 1000);
                            
                            return {
                                ...prevSkills,
                                [skillId]: { ...currentSkill, mobArmor: newArmor }
                            };
                        });
                    } else if (currentMobAction.type === 'heal') {
                        // MOB HEALS
                        setSkills(prevSkills => {
                            const currentSkill = prevSkills[skillId];
                            const newHealth = Math.min(currentSkill.mobMaxHealth, currentSkill.mobHealth + currentMobAction.value);
                            console.log(`[Combat] Mob HEAL: ${currentSkill.mobHealth} + ${currentMobAction.value} = ${newHealth}`);
                            
                            setPlayerDamageIndicator({
                                amount: currentMobAction.value,
                                blocked: true,
                                isMobHeal: true
                            });
                            setTimeout(() => setPlayerDamageIndicator(null), 1000);
                            
                            return {
                                ...prevSkills,
                                [skillId]: { ...currentSkill, mobHealth: newHealth }
                            };
                        });
                    }

                    // CRITICAL: Calculate and set next mob action AFTER this turn completes
                    // This prevents the race condition where UI shows new action prematurely
                    const nextAction = calculateMobAction(skillId);
                    setMobNextAction({ skillId, action: nextAction });
                    
                    mobTurnPendingRef.current = false;
                }, 600);
            }, 1000);
        };

        if (actionType === 'attack') {
            setActionPoints(prev => Math.min(5, prev + 1));

            // Deal Damage to Mob
            executeCombatTurn(skillId);

            // Execute Mob Turn with the stored action (not freshly calculated)
            executeMobTurn(storedMobAction);

        } else if (actionType === 'defend') {
            setArmorPoints(prev => Math.min(10, prev + 2));
            setActionPoints(prev => Math.min(5, prev + 1));
            playArmorGain();

            // Execute Mob Turn with stored action
            executeMobTurn(storedMobAction);

            // Generate next challenge
            if (skillConfig.hasChallenge) {
                const challengeDiff = battleDifficulty || skillState.difficulty || 1;
                setChallengeData(generateChallenge(skillConfig.challengeType, challengeDiff));
                if (skillConfig.challengeType === 'reading') setSpokenText('');
            }

        } else if (actionType === 'special') {
            if (actionPoints < 5) return;
            setActionPoints(prev => prev - 5);

            // Calculate base damage for this difficulty level
            const skillDifficulty = skillState.difficulty || 1;
            const baseDamage = calculateDamage(skillState.level, skillDifficulty);
            const specialDamage = baseDamage * 3; // SPECIAL deals 3x base damage
            console.log(`[Combat] SPECIAL attack: baseDamage=${baseDamage}, specialDamage=${specialDamage}`);

            if (encounterType === 'boss') {
                // Execute 3 hits directly using internal logic to bypass debounce
                setTimeout(() => executeCombatTurn(skillId, false, baseDamage, 3), 0);
                setTimeout(() => executeCombatTurn(skillId, false, baseDamage, 3), 250);
                setTimeout(() => executeCombatTurn(skillId, false, baseDamage, 3), 500);
            } else {
                // Non-boss: instant kill with scaled damage
                executeCombatTurn(skillId, false, specialDamage, 1.5);
            }
            playSpecialAttack();

            // Generate next challenge with increased difficulty for Special
            if (skillConfig.hasChallenge) {
                const challengeDiff = (battleDifficulty || 1) + 1; // +1 Difficulty for next challenge
                setChallengeData(generateChallenge(skillConfig.challengeType, challengeDiff));
                if (skillConfig.challengeType === 'reading') setSpokenText('');
            }

        } else if (actionType === 'heal') {
            if (actionPoints < 2) return;
            setActionPoints(prev => prev - 2);
            setPlayerHealth(10);
            playHealSound();
            console.log('[Combat] HEAL action: player healed to full');

            // Execute mob turn with stored action
            executeMobTurn(storedMobAction);

            if (skillConfig.hasChallenge) {
                const challengeDiff = battleDifficulty || skillState.difficulty || 1;
                setChallengeData(generateChallenge(skillConfig.challengeType, challengeDiff));
                if (skillConfig.challengeType === 'reading') setSpokenText('');
            }
        }
    }, [skills, actionPoints, battleDifficulty, calculateMobAction, setSpokenText, mobNextAction, processPlayerDeath]);

    // Helper function to set difficulty for a specific skill
    const setSkillDifficulty = (skillId, newDiff) => {
        setSkills(prev => {
            const current = prev[skillId];
            const newMobMaxHealth = calculateMobHealth(newDiff);
            return {
                ...prev,
                [skillId]: {
                    ...current,
                    difficulty: newDiff,
                    mobHealth: newMobMaxHealth,
                    mobMaxHealth: newMobMaxHealth
                }
            };
        });
    };

    // Wrapper for setActiveTheme to track theme changes
    const handleThemeChange = useCallback((newTheme) => {
        if (newTheme !== activeTheme) {
            setActiveTheme(newTheme);
            setStats(prevStats => {
                const newStats = {
                    ...prevStats,
                    themeChanges: (prevStats.themeChanges || 0) + 1
                };

                // Check achievements
                setTimeout(() => {
                    checkAchievementsFromContext(prevStats, newStats, skills, skills);
                }, 100);

                return newStats;
            });
        }
    }, [activeTheme, skills, checkAchievementsFromContext, setActiveTheme, setStats]);

    // Wrapper for setSelectedBorder to track border changes
    const handleBorderChange = useCallback((newBorder) => {
        if (newBorder !== selectedBorder) {
            setSelectedBorder(newBorder);
            setStats(prevStats => {
                const newStats = {
                    ...prevStats,
                    borderChanges: (prevStats.borderChanges || 0) + 1
                };

                // Check achievements
                setTimeout(() => {
                    checkAchievementsFromContext(prevStats, newStats, skills, skills);
                }, 100);

                return newStats;
            });
        }
    }, [selectedBorder, skills, checkAchievementsFromContext, setStats]);

    const startBattleLocal = (id) => {
        const skill = SKILL_DATA.find(s => s.id === id);
        // Use the skill's current difficulty setting
        const currentDiff = skills[id].difficulty || 1;
        const playerLevel = skills[id].level;

        // For miniboss encounters, use difficulty+1 for content (capped at 7)
        const encounterType = getEncounterType(playerLevel);
        const challengeDiff = encounterType === 'miniboss'
            ? Math.min(7, currentDiff + 1)
            : currentDiff;

        // Use context action
        startBattleContext(id, challengeDiff);

        // Initialize combat for all combat skills (Reading, Math, Writing)
        // Reset mob armor and set initial mob action
        if (checkIsCombatSkill(skill.id)) {
            const updates = { mobArmor: 0 };
            const newAction = calculateMobAction(id);
            setSkills(prev => ({
                ...prev,
                [id]: { ...prev[id], ...updates }
            }));
            setMobNextAction({ skillId: id, action: newAction });
        } else {
            setMobNextAction(null);
        }

        setChallengeData(generateChallenge(skill.challengeType, challengeDiff));
        playClick();
        startBGM();
        if (skill.challengeType === 'reading') startVoiceListener(id);
    };

    const endBattleLocal = () => {
        console.log('[Battle] Ending battle, cleaning up speech recognition');
        // Reset mob turn pending ref
        mobTurnPendingRef.current = false;
        
        // Reset mob armor for reading skill before clearing battlingSkillId
        if (battlingSkillId) {
            setSkills(prev => {
                const current = prev[battlingSkillId];
                if (current && current.mobArmor > 0) {
                    return { ...prev, [battlingSkillId]: { ...current, mobArmor: 0 } };
                }
                return prev;
            });
        }
        endBattleContext();
        setChallengeData(null);
        stopVoiceRecognition();
        playClick();
    };

    // Helper for reset and profile stats
    const getStorageKey = (profileId) => `heroSkills_v23_p${profileId}`;

    const getProfileStats = (id, liveSkills = null) => {
        // If liveSkills are provided (for current profile), use them instead of localStorage
        // This fixes the visual level swap bug when toggling profiles
        if (liveSkills && Object.keys(liveSkills).length > 0) {
            let totalLevel = 0;
            let highestLevel = 0;
            Object.values(liveSkills).forEach(s => {
                if (s && typeof s.level === 'number') {
                    totalLevel += s.level;
                    if (s.level > highestLevel) highestLevel = s.level;
                }
            });
            return { totalLevel, highestLevel, skills: liveSkills, theme: activeTheme || 'minecraft' };
        }
        
        // Fall back to localStorage for non-current profiles
        const key = getStorageKey(id);
        let saved = localStorage.getItem(key);
        if (!saved && id === 1) saved = localStorage.getItem('heroSkills_v23');
        if (!saved) return null;
        try {
            const data = JSON.parse(saved);
            const skillsData = data.skills || data;
            const theme = data.theme || 'minecraft';
            let totalLevel = 0;
            let highestLevel = 0;
            Object.values(skillsData).forEach(s => {
                if (s && typeof s.level === 'number') {
                    totalLevel += s.level;
                    if (s.level > highestLevel) highestLevel = s.level;
                }
            });
            return { totalLevel, highestLevel, skills: skillsData, theme };
        } catch (e) { return null; }
    };

    const handleSwitchProfile = (newId) => {
        if (newId === currentProfile) return;
        playClick();
        switchProfile(newId);
    };

    const handleRenameProfile = (id, newName) => {
        updateProfileName(id, newName);
    };

    const handleParentVerified = (profileId, verified) => {
        if (parentStatus[profileId] !== verified) {
            toggleParentStatus(profileId);
        }

        if (verified && profileId === currentProfile) {
            // When parent verification passes, apply parent privileges to all skills
            setSkills(prev => {
                const updated = {};
                Object.keys(prev).forEach(skillId => {
                    const current = prev[skillId];
                    updated[skillId] = {
                        ...current,
                        level: PARENT_PRIVILEGE_LEVEL,
                        difficulty: PARENT_PRIVILEGE_DIFFICULTY,
                        earnedBadges: [...PARENT_PRIVILEGE_BADGES],
                        mobHealth: calculateMobHealth(PARENT_PRIVILEGE_DIFFICULTY, PARENT_PRIVILEGE_LEVEL),
                        mobMaxHealth: calculateMobHealth(PARENT_PRIVILEGE_DIFFICULTY, PARENT_PRIVILEGE_LEVEL)
                    };
                });
                return updated;
            });

            // Force a re-render to ensure UI immediately reflects the new levels
            setTimeout(() => {
                setSkills(current => ({ ...current }));
            }, 0);
        }
    };

    const handleReset = () => {
        // Remove skills data for current profile
        localStorage.removeItem(getStorageKey(currentProfile));
        if (currentProfile === 1) localStorage.removeItem('heroSkills_v23');

        // Update parent status in localStorage directly
        const currentParentStatus = localStorage.getItem('heroParentStatus_v1');
        const parentStatusObj = currentParentStatus ? JSON.parse(currentParentStatus) : { 1: false, 2: false, 3: false };
        parentStatusObj[currentProfile] = false;
        localStorage.setItem('heroParentStatus_v1', JSON.stringify(parentStatusObj));

        // Update profile name in localStorage directly
        const currentProfileNames = localStorage.getItem('heroProfileNames_v1');
        const profileNamesObj = currentProfileNames ? JSON.parse(currentProfileNames) : { 1: "Player 1", 2: "Player 2", 3: "Player 3" };
        profileNamesObj[currentProfile] = `Player ${currentProfile}`;
        localStorage.setItem('heroProfileNames_v1', JSON.stringify(profileNamesObj));

        window.location.reload();
    };





    useEffect(() => { if (lootBox) setTimeout(() => setLootBox(null), 4000); }, [lootBox]);

    // Achievement toast auto-dismiss
    useEffect(() => {
        if (achievementToast) {
            setTimeout(() => setAchievementToast(null), 6000);
        }
    }, [achievementToast]);

    // Track login date (once per day)
    useEffect(() => {
        if (loginTrackedRef.current) return; // Skip if already tracked
        loginTrackedRef.current = true;

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const currentDates = stats.loginDates || [];
        // Only set if today's date is not already recorded
        if (!currentDates.includes(today)) {
            setStats(prev => ({
                ...prev,
                loginDates: [...(prev.loginDates || []), today]
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount, guarded by loginTrackedRef

    const currentThemeData = THEME_CONFIG[activeTheme] || THEME_CONFIG.minecraft;
    const containerStyle = { ...currentThemeData.style, fontFamily: '"VT323", monospace' };

    return (
        <div className="min-h-screen overflow-hidden relative flex flex-col bg-cover bg-center bg-no-repeat font-sans text-stone-100" style={containerStyle}>
            <GlobalStyles />
            <div className="absolute inset-0 bg-black/30 pointer-events-none z-0"></div>

            {/* Top Left Buttons - Hidden when battling */}
            {!battlingSkillId && (
                <>
                    {/* Button dimensions: p-3 (12px) + icon(48px) + p-3 (12px) + border-2*2 (4px) = 76px + 8px gap = 84px spacing */}
                    <button
                        onClick={() => { setIsMenuOpen(false); setIsCosmeticsOpen(false); setIsSettingsOpen(true); playClick(); }}
                        className="absolute z-40 bg-stone-800/90 text-white p-3 rounded-lg border-2 border-stone-600 hover:bg-stone-700 transition-all shadow-lg"
                        style={{ top: '24px', left: '24px' }}
                    >
                        <Settings size={48} className="text-slate-400" />
                    </button>
                    <button
                        onClick={() => { setIsMenuOpen(false); setIsSettingsOpen(false); setIsCosmeticsOpen(true); playClick(); }}
                        className="absolute z-40 bg-stone-800/90 text-white p-3 rounded-lg border-2 border-stone-600 hover:bg-stone-700 transition-all shadow-lg"
                        style={{ top: '24px', left: 'calc(24px + 76px + 12px)' }}
                    >
                        <Sparkles size={48} className="text-purple-400" />
                    </button>
                </>
            )}

            {/* Profile Picture Display - Bottom Left */}
            {/* Profile picture selector - hide during gameplay (patterns, memory, cleaning) */}
            {!battlingSkillId && (
                <div
                    className="absolute z-40"
                    style={{ bottom: '48px', left: '48px' }}
                >
                    <ProfilePicture
                        avatar={getAvatarEmoji(selectedAvatar)}
                        border={selectedBorder}
                        borderColor={borderColor}
                        totalLevel={Object.values(skills).reduce((sum, skill) => sum + (skill.level || 0), 0)}
                        size="large"
                        skillColorStyle={{ background: profileBgColor }}
                        onClickPicture={() => {
                            setIsAvatarModalOpen(true);
                            playClick();
                        }}
                        onClickLevel={() => {
                            setIsMenuOpen(true);
                            playClick();
                            // Set highlight state for total level
                            setTimeout(() => {
                                setHighlightTotalLevel(true);
                                setTimeout(() => setHighlightTotalLevel(false), 2000);
                            }, 300);
                        }}
                    />
                </div>
            )}

            {/* Player Health Display - Centered with Armor Shields overlaying Hearts - hide during memory/patterns/cleaning */}
            {battlingSkillId && battlingSkillId !== 'patterns' && battlingSkillId !== 'memory' && battlingSkillId !== 'cleaning' && (
                <div className="absolute z-50 flex gap-1.5" style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                    {Array(10).fill(0).map((_, i) => {
                        // Hearts always show (filled or empty based on health)
                        const isFilledHeart = i < playerHealth;
                        // Shields overlay the leftmost hearts (up to armorPoints)
                        const hasShield = i < armorPoints;
                        return (
                            <div key={i} className="relative">
                                {/* Always show heart */}
                                <PixelHeart size={48} filled={isFilledHeart} />
                                {/* Shield overlays the heart if armor exists */}
                                {hasShield && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PixelShield size={48} filled={true} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Cosmetics drawer overlay - click to close */}
            {isCosmeticsOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => { setIsCosmeticsOpen(false); playClick(); }}
                />
            )}
            <CosmeticsDrawer
                isOpen={isCosmeticsOpen}
                activeTheme={activeTheme}
                setActiveTheme={handleThemeChange}
                selectedBorder={selectedBorder}
                setSelectedBorder={handleBorderChange}
                borderColor={borderColor}
                setBorderColor={setBorderColor}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={setSelectedAvatar}
                unlockedBorders={unlockedBorders}
                unlockedAchievements={unlockedAchievements}
            />

            {/* Settings drawer overlay - click to close */}
            {isSettingsOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => { setIsSettingsOpen(false); playClick(); }}
                />
            )}
            <SettingsDrawer
                isOpen={isSettingsOpen}
                onReset={() => setIsResetOpen(true)}
                bgmVol={bgmVol}
                setBgmVol={setBgmVol}
                sfxVol={sfxVol}
                setSfxVol={setSfxVolState}
                currentProfile={currentProfile}
                onSwitchProfile={handleSwitchProfile}
                profileNames={profileNames}
                onRenameProfile={handleRenameProfile}
                getProfileStats={getProfileStats}
                parentStatus={parentStatus}
                onParentVerified={handleParentVerified}
                currentSkills={skills}
                selectedAvatar={selectedAvatar}
                selectedBorder={selectedBorder}
                borderColor={borderColor}
                hasProfilePin={hasProfilePin}
                setProfilePin={setProfilePin}
                verifyProfilePin={verifyProfilePin}
                clearProfilePin={clearProfilePin}
            />
            <ResetModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} onConfirm={handleReset} />
            <BugReportModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />
            <AvatarSelectionModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={(avatar) => {
                    setSelectedAvatar(avatar);
                    localStorage.setItem(`profileAvatar_p${currentProfile} `, avatar);
                }}
                profileBgColor={profileBgColor}
                setProfileBgColor={(color) => {
                    setProfileBgColor(color);
                    localStorage.setItem(`profileBgColor_p${currentProfile} `, color);
                }}
            />

            {/* Top Right Buttons - Hidden when battling */}
            {!battlingSkillId && (
                <>
                    {/* Button dimensions: p-3 (12px) + icon(48px) + p-3 (12px) + border-2*2 (4px) = 76px + 8px gap = 84px spacing */}
                    <button
                        onClick={async () => {
                            const newState = await toggleFullscreenSafe();
                            setIsFullscreen(newState);
                            playClick();
                        }}
                        className="absolute z-40 bg-stone-800/90 text-white p-3 rounded-lg border-2 border-stone-600 hover:bg-stone-700 transition-all shadow-lg"
                        style={{ top: '24px', right: 'calc(24px + 76px + 12px)' }}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {isFullscreen ? <Minimize size={48} /> : <Maximize size={48} />}
                    </button>
                    <button
                        onClick={() => { setIsSettingsOpen(false); setIsCosmeticsOpen(false); setIsMenuOpen(true); playClick(); }}
                        className="absolute z-40 bg-stone-800/90 text-white p-3 rounded-lg border-2 border-stone-600 hover:bg-stone-700 transition-all shadow-lg"
                        style={{ top: '24px', right: '24px' }}
                    >
                        <Menu size={48} />
                    </button>
                </>
            )}

            {/* Achievement drawer overlay - click to close */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => { setIsMenuOpen(false); playClick(); }}
                />
            )}
            <MenuDrawer isOpen={isMenuOpen} skills={skills} stats={stats} />

            {/* Bottom Right Bug Report Button - hide during gameplay */}
            {!battlingSkillId && (
                <button
                    onClick={() => { setIsMenuOpen(false); setIsCosmeticsOpen(false); setIsSettingsOpen(false); setIsBugReportOpen(true); playClick(); }}
                    className="absolute z-40 bg-stone-800/90 text-white p-3 rounded-lg border-2 border-stone-600 hover:bg-stone-700 transition-all shadow-lg"
                    style={{ bottom: '24px', right: '24px' }}
                >
                    <Bug size={48} className="text-red-400" />
                </button>
            )}

            {/* Backdrop overlay when battling - click to exit */}
            {battlingSkillId && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', minWidth: '100vw', minHeight: '100vh' }}
                    onClick={endBattleLocal}
                />
            )}
            <main className="flex-1 relative flex flex-col items-center justify-center w-full">
                <div className="z-10 relative mb-[-30px] md:mb-[-50px] pointer-events-none opacity-90"><SafeImage src={currentThemeData.assets.logo} fallbackSrc="https://placehold.co/800x300/333/FFD700?text=LOGO+PLACEHOLDER&font=monsterrat" alt="Game Logo" className="w-[480px] md:w-[720px] lg:w-[960px] object-contain drop-shadow-2xl" /></div>
                <h1 className="text-9xl text-yellow-400 tracking-widest uppercase mt-[-20px] mb-[95px] z-20 relative drop-shadow-[4px_4px_0_#000]" style={{ textShadow: '6px 6px 0 #000' }}>Level Up!</h1>

                <SkillCarousel
                    skills={skills}
                    activeTheme={activeTheme}
                    battlingSkillId={battlingSkillId}
                    startBattle={startBattleLocal}
                    endBattle={endBattleLocal}
                    challengeData={challengeData}
                    isListening={isListening}
                    spokenText={spokenText}
                    damageNumbers={damageNumbers}
                    handleSuccessHit={handleSuccessHit}
                    toggleMicListener={toggleMicListener}
                    setSkillDifficulty={setSkillDifficulty}
                    selectedBorder={selectedBorder}
                    borderColor={borderColor}
                    bossHealing={bossHealing}
                    actionPoints={actionPoints}
                    armorPoints={armorPoints}
                    playerHealth={playerHealth}
                    handleCombatAction={handleCombatAction}
                    generateChallengeAtDifficulty={(skillId, diff) => {
                        const skill = SKILL_DATA.find(s => s.id === skillId);
                        if (skill) {
                            setChallengeData(generateChallenge(skill.challengeType, diff));
                        }
                    }}
                    mobAttacking={mobAttacking}
                    playerDamageIndicator={playerDamageIndicator}
                    calculateMobAction={calculateMobAction}
                    mobNextAction={mobNextAction}
                    onPerfectMemoryGame={() => {
                        setStats(prev => ({
                            ...prev,
                            perfectMemoryGames: (prev.perfectMemoryGames || 0) + 1
                        }));
                    }}
                />
            </main>

            {lootBox && <div className="fixed bottom-8 left-1/2 z-[9999] animate-toast w-full max-w-2xl pointer-events-none transform -translate-x-1/2"><div className="bg-black/80 border-4 border-yellow-500 rounded-full p-4 px-12 flex items-center justify-between shadow-[0_0_30px_rgba(255,215,0,0.6)] backdrop-blur-md mx-4"><div className="flex items-center gap-4"><div className="bg-yellow-500/20 p-3 rounded-full border-2 border-yellow-400"><Gift size={32} className="text-yellow-300 animate-bounce" /></div><div className="text-left"><h2 className="text-2xl text-yellow-400 font-bold leading-none mb-1">LEVEL {lootBox.level} REACHED!</h2><p className="text-stone-300 text-sm">{lootBox.skillName}</p></div></div><div className="text-right pl-8 border-l-2 border-stone-600 flex items-center gap-4"><SafeImage src={lootBox.img} alt="Badge" className="w-12 h-12 object-contain" /><div><p className="text-stone-400 text-xs uppercase tracking-wider">Unlocked</p><p className="text-2xl text-green-400 font-bold">{lootBox.item}</p></div></div></div></div>}

            {/* Achievement Toast */}
            {
                achievementToast && (
                    <AchievementToast
                        achievementId={achievementToast.achievementId}
                        tierIndex={achievementToast.tierIndex}
                    />
                )
            }

            {/* Death Overlay - Minecraft-style YOU DIED screen */}
            {
                showDeathOverlay && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-900/60 animate-pulse pointer-events-none">
                        <div className="text-center">
                            <h1 className="text-8xl font-bold text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]" style={{ textShadow: '4px 4px 0 #000, -2px -2px 0 #000' }}>
                                YOU DIED
                            </h1>
                            <p className="text-2xl text-red-300 mt-4">Level -1</p>
                            <p className="text-lg text-stone-400 mt-2">Take a moment to rest...</p>
                        </div>
                    </div>
                )
            }

            {/* Level Restored celebration */}
            {
                showLevelRestored && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                        <div className="text-center animate-bounce">
                            <h1 className="text-6xl font-bold text-green-400 drop-shadow-[0_0_20px_rgba(0,255,0,0.8)]" style={{ textShadow: '4px 4px 0 #000' }}>
                                LEVEL RESTORED!
                            </h1>
                            <p className="text-2xl text-yellow-400 mt-4">Welcome back, hero!</p>
                        </div>
                    </div>
                )
            }

            {/* AMBUSH! - Miniboss or Boss appears mid-battle */}
            {
                showAmbush && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                        <div className="absolute inset-0 bg-black/70 animate-pulse"></div>
                        <div className="relative text-center animate-ambush">
                            <h1 
                                className={`text-9xl font-black uppercase tracking-widest ${showAmbush.encounterType === 'boss' ? 'text-red-500' : 'text-purple-500'}`}
                                style={{ 
                                    textShadow: showAmbush.encounterType === 'boss' 
                                        ? '0 0 40px rgba(255,0,0,0.9), 0 0 80px rgba(255,0,0,0.6), 6px 6px 0 #000' 
                                        : '0 0 40px rgba(168,85,247,0.9), 0 0 80px rgba(168,85,247,0.6), 6px 6px 0 #000',
                                    animation: 'ambushFlash 0.3s ease-in-out infinite alternate'
                                }}
                            >
                                AMBUSH!
                            </h1>
                            <p className={`text-3xl font-bold mt-6 uppercase tracking-wider ${showAmbush.encounterType === 'boss' ? 'text-red-300' : 'text-purple-300'}`}>
                                {showAmbush.encounterType === 'boss' ? '⚔️ A BOSS APPEARS! ⚔️' : '💀 MINIBOSS INCOMING! 💀'}
                            </p>
                            <p className="text-xl text-green-400 mt-4">Player fully healed!</p>
                        </div>
                    </div>
                )
            }

            {/* Phantom Fly-By Bonus Event */}
            <PhantomEvent
                battlingSkillId={battlingSkillId}
                onAwardLevel={handlePhantomLevelAward}
                onPhantomCaught={handlePhantomCaught}
            />
        </div >
    );
};

export default App;