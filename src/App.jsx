import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { getAvatarEmoji } from './constants/avatarData';

// Utils & Constants
import { getRandomMob, getRandomFriendlyMob, getRandomMiniboss, getRandomBoss, getMobForSkill, getEncounterType, generateMathProblem, getReadingWord, getWordForDifficulty, calculateDamage, calculateMobHealth, calculateXPReward, calculateXPToLevel } from './utils/gameUtils';
import { getRandomAura } from './utils/mobDisplayUtils';
import {
    BASE_ASSETS, THEME_CONFIG, SKILL_DATA,
    HOMOPHONES, DIFFICULTY_CONTENT, HOSTILE_MOBS, BOSS_MOBS, MINIBOSS_MOBS
} from './constants/gameData';
import {
    getBGMManager, setSfxVolume,
    playClick,
    playDeath, playFail, playLevelUp, playNotification, playSuccessfulHit,
    playMobHurt, playMobDeath, playAchievement
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
    const [currentProfile, setCurrentProfile] = useState(() => localStorage.getItem('currentProfile_v1') ? parseInt(localStorage.getItem('currentProfile_v1')) : 1);
    const [profileNames, setProfileNames] = useState(() => localStorage.getItem('heroProfileNames_v1') ? JSON.parse(localStorage.getItem('heroProfileNames_v1')) : { 1: "Player 1", 2: "Player 2", 3: "Player 3" });
    const [parentStatus, setParentStatus] = useState(() => localStorage.getItem('heroParentStatus_v1') ? JSON.parse(localStorage.getItem('heroParentStatus_v1')) : { 1: false, 2: false, 3: false });
    const [playerHealth, setPlayerHealth] = useState(10);
    
    // Turn-based combat state
    const [actionPoints, setActionPoints] = useState(0);
    const [armorPoints, setArmorPoints] = useState(0);
    const [mobAttacking, setMobAttacking] = useState(null); // skillId of mob attacking player
    const [playerDamageIndicator, setPlayerDamageIndicator] = useState(null); // { amount: number, blocked: boolean }
    const [mobNextAction, setMobNextAction] = useState(null); // { skillId: string, action: { type: string, value: number } }

    const getStorageKey = (profileId) => `heroSkills_v23_p${profileId}`;
    const loadSkills = (profileId) => {
        const initial = {};
        // Initialize each skill with level, xp, currentMob, difficulty (1-7), earnedBadges array,
        // mobHealth for HP-based combat, and death/recovery state
        SKILL_DATA.forEach(skill => {
            const initialDifficulty = 1;
            initial[skill.id] = {
                level: 1,
                xp: 0,
                currentMob: getRandomMob(null),
                difficulty: initialDifficulty,  // Per-skill difficulty (1-7)
                earnedBadges: [], // Array of earned badge tier numbers (1-7)
                mobHealth: calculateMobHealth(initialDifficulty), // Mob's current HP
                mobMaxHealth: calculateMobHealth(initialDifficulty), // Mob's max HP
                mobArmor: 0, // Mob's current armor (for reading skill)
                lostLevel: false, // True if player died and lost a level
                recoveryDifficulty: null, // Difficulty to suggest for recovery
                memoryMob: skill.id === 'memory' ? getRandomFriendlyMob() : null, // Stable mob for Memory card display
                patternMob: skill.id === 'patterns' ? getRandomMob(null) : null, // Stable hostile mob for Patterns card display
                currentMiniboss: getRandomMiniboss(), // Stable miniboss for miniboss encounters
                currentBoss: getRandomBoss(), // Stable boss for boss encounters
                readingMob: skill.id === 'reading' ? getRandomMob(null) : null, // Stable mob for Reading card display
                mathMob: skill.id === 'math' ? getRandomMob(null) : null, // Stable mob for Math card display
                writingMob: skill.id === 'writing' ? getRandomMob(null) : null, // Stable mob for Writing card display
                // Auras for each mob type
                readingMobAura: skill.id === 'reading' ? getRandomAura() : null,
                mathMobAura: skill.id === 'math' ? getRandomAura() : null,
                writingMobAura: skill.id === 'writing' ? getRandomAura() : null,
                patternMobAura: skill.id === 'patterns' ? getRandomAura() : null,
                currentMinibossAura: getRandomAura(), // Aura for miniboss encounters
                currentBossAura: getRandomAura() // Aura for boss encounters
            };
        });
        let saved = localStorage.getItem(getStorageKey(profileId));
        if (!saved && profileId === 1) saved = localStorage.getItem('heroSkills_v23');
        try {
            if (saved) {
                const parsed = JSON.parse(saved);
                const data = parsed.skills || parsed;
                Object.keys(data).forEach(key => {
                    initial[key] = { ...initial[key], ...data[key] };
                    // Ensure difficulty exists (backward compatibility)
                    if (typeof initial[key].difficulty !== 'number') {
                        initial[key].difficulty = 1;
                    }
                    // Ensure earnedBadges array exists (backward compatibility)
                    if (!Array.isArray(initial[key].earnedBadges)) {
                        initial[key].earnedBadges = [];
                    }
                    // Ensure mobHealth exists (backward compatibility)
                    if (typeof initial[key].mobHealth !== 'number') {
                        const diff = initial[key].difficulty || 1;
                        initial[key].mobHealth = calculateMobHealth(diff);
                        initial[key].mobMaxHealth = calculateMobHealth(diff);
                    }
                    // Ensure mobArmor exists (backward compatibility)
                    if (typeof initial[key].mobArmor !== 'number') {
                        initial[key].mobArmor = 0;
                    }
                    // Ensure death/recovery state exists
                    if (typeof initial[key].lostLevel !== 'boolean') {
                        initial[key].lostLevel = false;
                    }
                    if (initial[key].recoveryDifficulty === undefined) {
                        initial[key].recoveryDifficulty = null;
                    }
                    // Ensure memoryMob exists for memory skill (backward compatibility)
                    if (key === 'memory' && !initial[key].memoryMob) {
                        initial[key].memoryMob = getRandomFriendlyMob();
                    }
                    // Ensure patternMob exists for patterns skill (backward compatibility)
                    if (key === 'patterns' && !initial[key].patternMob) {
                        initial[key].patternMob = getRandomMob(null);
                    }
                    // Ensure combat skill mobs exist (backward compatibility)
                    if (key === 'reading' && !initial[key].readingMob) {
                        initial[key].readingMob = getRandomMob(null);
                    }
                    if (key === 'math' && !initial[key].mathMob) {
                        initial[key].mathMob = getRandomMob(null);
                    }
                    if (key === 'writing' && !initial[key].writingMob) {
                        initial[key].writingMob = getRandomMob(null);
                    }
                    // Ensure auras exist for combat skill mobs (backward compatibility)
                    if (key === 'reading' && !initial[key].readingMobAura) {
                        initial[key].readingMobAura = getRandomAura();
                    }
                    if (key === 'math' && !initial[key].mathMobAura) {
                        initial[key].mathMobAura = getRandomAura();
                    }
                    if (key === 'writing' && !initial[key].writingMobAura) {
                        initial[key].writingMobAura = getRandomAura();
                    }
                    if (key === 'patterns' && !initial[key].patternMobAura) {
                        initial[key].patternMobAura = getRandomAura();
                    }
                    // Ensure miniboss and boss mobs exist for combat skills (backward compatibility)
                    // Only initialize for skills that use the encounter type system (not cleaning or memory)
                    if (key !== 'cleaning' && key !== 'memory') {
                        if (!initial[key].currentMiniboss) {
                            initial[key].currentMiniboss = getRandomMiniboss();
                        }
                        if (!initial[key].currentBoss) {
                            initial[key].currentBoss = getRandomBoss();
                        }
                        if (!initial[key].currentMinibossAura) {
                            initial[key].currentMinibossAura = getRandomAura();
                        }
                        if (!initial[key].currentBossAura) {
                            initial[key].currentBossAura = getRandomAura();
                        }
                    }
                });
                return initial;
            }
        } catch (e) {
            console.warn('Failed to parse saved skills:', e);
        }
        return initial;
    };
    const loadTheme = (profileId) => {
        let saved = localStorage.getItem(getStorageKey(profileId));
        if (!saved && profileId === 1) {
            saved = localStorage.getItem('heroSkills_v23');
        }
        try {
            return JSON.parse(saved).theme || 'minecraft';
        } catch (e) {
            console.warn('Failed to parse theme:', e);
        }
        return 'minecraft';
    };

    const loadStats = (profileId) => {
        let saved = localStorage.getItem(getStorageKey(profileId));
        if (!saved && profileId === 1) {
            saved = localStorage.getItem('heroSkills_v23');
        }
        try {
            const data = JSON.parse(saved);
            if (data.stats) {
                // Merge with default stats to ensure all fields exist
                return { ...getDefaultStats(), ...data.stats };
            }
        } catch (e) {
            console.warn('Failed to parse stats:', e);
        }
        return getDefaultStats();
    };

    const getProfileStats = (id, liveSkills = null) => {
        const initial = {};
        SKILL_DATA.forEach(skill => { initial[skill.id] = { level: 1 }; });

        // Use live skills if provided (for current profile with pending state changes)
        if (liveSkills) {
            let totalLevel = 0;
            let highestLevel = 0;
            Object.values(liveSkills).forEach(s => {
                if (s && typeof s.level === 'number') {
                    totalLevel += s.level;
                    if (s.level > highestLevel) highestLevel = s.level;
                }
            });
            return { totalLevel, highestLevel, skills: liveSkills, theme: activeTheme };
        }

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
        } catch (e) {
            console.warn('Failed to parse profile stats:', e);
            return null;
        }
    };

    const [skills, setSkills] = useState(() => loadSkills(currentProfile));
    const [activeTheme, setActiveTheme] = useState(() => loadTheme(currentProfile));
    const [stats, setStats] = useState(() => loadStats(currentProfile));
    const [achievementToast, setAchievementToast] = useState(null);
    const [battlingSkillId, setBattlingSkillId] = useState(null);
    const [battleDifficulty, setBattleDifficulty] = useState(null); // Track battle's starting difficulty for consistent challenge generation
    const [challengeData, setChallengeData] = useState(null);
    const [lootBox, setLootBox] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCosmeticsOpen, setIsCosmeticsOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [isBugReportOpen, setIsBugReportOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const [damageNumbers, setDamageNumbers] = useState([]);
    const [showDeathOverlay, setShowDeathOverlay] = useState(false);
    const [showLevelRestored, setShowLevelRestored] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [bossHealing, setBossHealing] = useState(null); // skillId of boss being healed
    const challengeDataRef = useRef(null);
    const damageIdRef = useRef(0); // Counter for generating unique damage number IDs
    const loginTrackedRef = useRef(false); // Track if we've already recorded today's login
    const [bgmVol, setBgmVol] = useState(0.3);
    const [sfxVol, setSfxVolState] = useState(0.5);
    const bgmManager = useRef(getBGMManager());

    // Cosmetics state
    const [selectedBorder, setSelectedBorder] = useState(() => {
        const saved = localStorage.getItem(`borderEffect_p${currentProfile}`);
        return saved || 'solid';
    });
    const [borderColor, setBorderColor] = useState(() => {
        const saved = localStorage.getItem(`borderColor_p${currentProfile}`);
        return saved || '#FFD700';
    });
    const [selectedAvatar, setSelectedAvatar] = useState(() => {
        const saved = localStorage.getItem(`profileAvatar_p${currentProfile}`);
        return saved || 'person'; // Default avatar ID
    });
    const [profileBgColor, setProfileBgColor] = useState(() => {
        const saved = localStorage.getItem(`profileBgColor_p${currentProfile}`);
        return saved || 'linear-gradient(to bottom, #7e22ce, #581c87)'; // Default purple
    });

    // Run migration on mount (Electron only)
    useEffect(() => {
        migrateLocalStorageToFiles();
    }, []);

    // Save game data whenever it changes (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const dataToSave = { skills, theme: activeTheme, stats };
            // Save to both localStorage (for browser compatibility) and files (for Electron)
            const key = getStorageKey(currentProfile);
            localStorage.setItem(key, JSON.stringify(dataToSave));
            // Also save to files if in Electron
            if (typeof window !== 'undefined' && window.electron && window.electron.isElectron) {
                saveProfileData(currentProfile, dataToSave);
            }
        }, 500); // Debounce saves by 500ms
        
        return () => clearTimeout(timeoutId);
    }, [skills, activeTheme, stats, currentProfile]);

    // Save profile settings whenever they change (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const settingsToSave = {
                currentProfile,
                profileNames,
                parentStatus
            };
            // Save to both localStorage (for browser compatibility) and files (for Electron)
            localStorage.setItem('currentProfile_v1', currentProfile.toString());
            localStorage.setItem('heroProfileNames_v1', JSON.stringify(profileNames));
            localStorage.setItem('heroParentStatus_v1', JSON.stringify(parentStatus));
            // Also save to files if in Electron
            if (typeof window !== 'undefined' && window.electron && window.electron.isElectron) {
                saveProfileSettings(settingsToSave);
            }
        }, 500); // Debounce saves by 500ms
        
        return () => clearTimeout(timeoutId);
    }, [currentProfile, profileNames, parentStatus]);

    // Reload avatar and bgColor when profile changes
    useEffect(() => {
        const savedAvatar = localStorage.getItem(`profileAvatar_p${currentProfile}`);
        const savedBgColor = localStorage.getItem(`profileBgColor_p${currentProfile}`);

        setSelectedAvatar(savedAvatar || 'person');
        setProfileBgColor(savedBgColor || 'linear-gradient(to bottom, #7e22ce, #581c87)');
    }, [currentProfile]);


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
            // For reading skill, don't call handleSuccessHit directly - let SkillCard handle it via handleCombatAction
            // This prevents bypassing the action selection system (attack/defend/special/heal)
            if (targetId === 'reading') {
                // SkillCard's useEffect will handle the combat action based on selectedAction
                return;
            }
            handleSuccessHit(targetId);
        },
        onFailure: (targetId) => handleSuccessHit(targetId, 'WRONG')
    });

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

    const generateChallenge = (type, diff) => {
        // Math: Use difficulty-based problem generation
        if (type === 'math') {
            return generateMathProblem(diff);
        }
        // Patterns: Simon Says - no challenge data needed, handled in SkillCard
        if (type === 'patterns') {
            return { type: 'patterns', question: "Simon Says!", answer: "WIN" };
        }
        // Reading: Use difficulty-based word selection
        if (type === 'reading') {
            const word = getReadingWord(diff);
            return { type, question: word, answer: word };
        }
        // Writing: Use difficulty-based word selection from comprehensive index
        if (type === 'writing') {
            const wordData = getWordForDifficulty(diff);
            // Use displayName in uppercase for the answer (handles multi-word items with spaces)
            const answer = wordData.displayName.toUpperCase();
            return {
                type,
                question: "Spell it!",
                answer,
                images: [wordData.image],
                displayName: wordData.displayName
            };
        }
        // Memory: No specific challenge data, handled in SkillCard
        if (type === 'memory') return { type: 'memory', question: "Find Pairs!", answer: "WIN" };
        // Cleaning: Manual task
        return { type: 'manual', question: "Task Complete?", answer: "yes" };
    };

    // Regenerate challenge when difficulty or level changes during active battle
    // This fixes the issue where challenges use stale difficulty after leveling up
    // Removed problematic useEffect that was causing infinite loop
    // The startBattle function already sets battleDifficulty correctly

    // Check for achievement unlocks
    const checkAchievements = useCallback((oldStats, newStats, oldSkills, newSkills) => {
        // Check for newly unlocked one-time achievements
        const newlyUnlocked = getNewlyUnlockedAchievements(oldStats, newStats, oldSkills, newSkills);

        // Check for tiered achievement progress
        const newTiers = getNewTierAchievements(oldStats, newStats, oldSkills, newSkills);

        // Show toast for the first achievement/tier unlocked
        if (newlyUnlocked.length > 0) {
            // Show first newly unlocked achievement
            setAchievementToast({ achievementId: newlyUnlocked[0], tierIndex: null });
            playAchievement();
        } else if (newTiers.length > 0) {
            // Show first new tier
            setAchievementToast({
                achievementId: newTiers[0].achievementId,
                tierIndex: newTiers[0].tierIndex
            });
            playAchievement();
        }
    }, []);

    const handleSuccessHit = (skillId, isWrong, customDamage = null, customXPMultiplier = null) => {
        // Handle wrong answer
        if (isWrong === 'WRONG') {
            // Check if player is fighting a boss
            if (battlingSkillId) {
                const currentSkillState = skills[battlingSkillId];
                const encounterType = getEncounterType(currentSkillState.level);

                // Boss fights: heal the boss instead of damaging the player
                if (encounterType === 'boss') {
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
                    return;
                }
            }

            // Non-boss encounters: damage player
            setPlayerHealth(h => {
                const newH = h - 1;
                if (newH <= 0) {
                    // Death sequence - play UI death sound
                    playDeath();
                    setShowDeathOverlay(true);

                    // Track death in stats
                    setStats(prevStats => {
                        const newStats = {
                            ...prevStats,
                            totalDeaths: (prevStats.totalDeaths || 0) + 1
                        };

                        // Check achievements after death
                        setTimeout(() => {
                            checkAchievements(prevStats, newStats, skills, skills);
                        }, 100);

                        return newStats;
                    });

                    // Reduce player level by 1 for the active skill (minimum level 1)
                    if (battlingSkillId) {
                        setSkills(prev => {
                            const current = prev[battlingSkillId];
                            const newLevel = Math.max(1, current.level - 1);
                            const currentDiff = current.difficulty || 1;
                            return {
                                ...prev,
                                [battlingSkillId]: {
                                    ...current,
                                    level: newLevel,
                                    lostLevel: current.level > 1, // Only true if we actually lost a level
                                    recoveryDifficulty: Math.max(1, currentDiff - 1)
                                }
                            };
                        });
                    }

                    // End battle after short delay
                    setTimeout(() => {
                        setBattlingSkillId(null);
                        setShowDeathOverlay(false);
                    }, 2000);

                    return 10; // Heal to full health
                }
                // Player takes damage but doesn't die - play fail sound
                playFail();
                return newH;
            });
            return;
        }

        if (!skillId) return;
        const skillConfig = SKILL_DATA.find(s => s.id === skillId);
        const currentSkillState = skills[skillId];
        const skillDifficulty = currentSkillState.difficulty || 1;
        const playerLevel = currentSkillState.level;
        const currentMobName = currentSkillState.currentMob;

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

        // Determine if this hit will defeat the mob (including exactly 0) - account for armor
        const currentMobArmor = currentSkillState.mobArmor || 0;
        const damageAfterArmor = Math.max(0, actualDamage - currentMobArmor);
        const willDefeatMob = (currentSkillState.mobHealth - damageAfterArmor) <= 0;

        // Show damage numbers and play sounds
        if (skillConfig.id !== 'memory') {
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
            const currentMobArmor = current.mobArmor || 0;
            // Apply damage to armor first, then health
            let remainingDamage = actualDamage;
            let newMobArmor = currentMobArmor;
            if (currentMobArmor > 0 && remainingDamage > 0) {
                const armorAbsorbed = Math.min(currentMobArmor, remainingDamage);
                newMobArmor = Math.max(0, currentMobArmor - armorAbsorbed);
                remainingDamage = remainingDamage - armorAbsorbed;
            }
            let newMobHealth = Math.max(0, current.mobHealth - remainingDamage); // Ensure health doesn't go below 0
            let newLevel = current.level;
            let newXp = current.xp;
            let leveledUp = false;
            let newMob = current.currentMob;
            let newDifficulty = current.difficulty || 1;
            let newBadges = [...(current.earnedBadges || [])];
            let newMobMaxHealth = current.mobMaxHealth;
            let newLostLevel = current.lostLevel;
            let newRecoveryDifficulty = current.recoveryDifficulty;
            let newMemoryMob = current.memoryMob;
            let newPatternMob = current.patternMob;
            let newMiniboss = current.currentMiniboss;
            let newBoss = current.currentBoss;
            let newReadingMob = current.readingMob;
            let newMathMob = current.mathMob;
            let newWritingMob = current.writingMob;
            let newReadingMobAura = current.readingMobAura;
            let newMathMobAura = current.mathMobAura;
            let newWritingMobAura = current.writingMobAura;
            let newPatternMobAura = current.patternMobAura;
            let newMinibossAura = current.currentMinibossAura;
            let newBossAura = current.currentBossAura;

            // Calculate XP reward for this hit
            // Total XP is split evenly among all hits required to defeat the mob
            // Apply custom XP multiplier if provided (for pattern recognition scaling)
            const baseXPReward = calculateXPReward(skillDifficulty, playerLevel);
            const totalXPReward = customXPMultiplier !== null 
                ? Math.floor(baseXPReward * customXPMultiplier)
                : baseXPReward;
            // For instant-defeat mobs (miniboss, cleaning, memory), actualDamage = full health, so hitsToKill = 1
            // For regular mobs, actualDamage = damage, so hitsToKill = mobMaxHealth / damage
            const effectiveDamage = isInstantDefeat ? current.mobMaxHealth : damage;
            const hitsToKill = Math.ceil(current.mobMaxHealth / effectiveDamage);
            const xpPerHit = Math.floor(totalXPReward / hitsToKill);

            // If this hit doesn't defeat the mob, award partial XP
            // If this hit defeats the mob, award any remaining XP (to account for rounding)
            const willDefeatMobInUpdate = newMobHealth <= 0;
            if (!willDefeatMobInUpdate) {
                // Award partial XP for non-killing hit
                newXp += xpPerHit;
            }

            // Mob defeated!
            if (newMobHealth <= 0) {
                // Calculate remaining XP to award (total - already awarded)
                const hitsDealt = Math.ceil((current.mobMaxHealth - current.mobHealth) / effectiveDamage);
                const xpAlreadyAwarded = hitsDealt * xpPerHit;
                const remainingXP = totalXPReward - xpAlreadyAwarded;
                newXp += remainingXP;

                // Track stats for mob defeat
                const encounterType = getEncounterType(current.level);
                setStats(prevStats => {
                    const newStats = { ...prevStats };

                    // Increment battle session counter
                    newStats.battlesThisSession = (newStats.battlesThisSession || 0) + 1;

                    if (encounterType === 'boss') {
                        // Boss defeated
                        newStats.totalBossesDefeated = (newStats.totalBossesDefeated || 0) + 1;
                        newStats.uniqueBossesDefeated = addUniqueToArray(
                            newStats.uniqueBossesDefeated || [],
                            current.currentBoss
                        );
                    } else if (encounterType === 'miniboss') {
                        // Miniboss defeated
                        newStats.totalMinibossesDefeated = (newStats.totalMinibossesDefeated || 0) + 1;
                        newStats.uniqueMinibossesDefeated = addUniqueToArray(
                            newStats.uniqueMinibossesDefeated || [],
                            current.currentMiniboss
                        );
                    } else {
                        // Regular mob defeated
                        newStats.totalMobsDefeated = (newStats.totalMobsDefeated || 0) + 1;
                        newStats.uniqueMobsDefeated = addUniqueToArray(
                            newStats.uniqueMobsDefeated || [],
                            current.currentMob
                        );
                    }

                    // Check achievements after stats update
                    setTimeout(() => {
                        checkAchievements(prevStats, newStats, prev, { ...prev, [skillId]: { ...current, level: newLevel } });
                    }, 100);

                    return newStats;
                });

                // Update stable mobs for memory and patterns skills on completion
                if (skillConfig.id === 'memory') {
                    newMemoryMob = getRandomFriendlyMob();
                }
                if (skillConfig.id === 'patterns') {
                    newPatternMob = getRandomMob(current.currentMob);
                    newPatternMobAura = getRandomAura();
                }

                // Update stable mobs for combat skills on completion
                const combatSkillMobUpdates = {
                    'reading': () => {
                        newReadingMob = getRandomMob(current.readingMob);
                        newReadingMobAura = getRandomAura();
                    },
                    'math': () => {
                        newMathMob = getRandomMob(current.mathMob);
                        newMathMobAura = getRandomAura();
                    },
                    'writing': () => {
                        newWritingMob = getRandomMob(current.writingMob);
                        newWritingMobAura = getRandomAura();
                    }
                };

                if (combatSkillMobUpdates[skillConfig.id]) {
                    combatSkillMobUpdates[skillConfig.id]();
                }

                // Update miniboss when defeating a miniboss encounter
                if (getEncounterType(current.level) === 'miniboss') {
                    newMiniboss = getRandomMiniboss();
                    newMinibossAura = getRandomAura();
                }

                // Update boss when defeating a boss encounter
                if (getEncounterType(current.level) === 'boss') {
                    newBoss = getRandomBoss();
                    newBossAura = getRandomAura();
                }

                // Check for level restoration first
                if (newLostLevel) {
                    newLevel += 1;
                    newLostLevel = false;
                    newRecoveryDifficulty = null;
                    setShowLevelRestored(true);
                    setTimeout(() => setShowLevelRestored(false), 2000);
                    playNotification();
                }

                // Process level ups - use difficulty-scaled XP requirement
                const xpToLevel = calculateXPToLevel(newDifficulty, newLevel);
                if (newXp >= xpToLevel) {
                    const levelsGained = Math.floor(newXp / xpToLevel);
                    const oldLevel = newLevel;
                    newLevel += levelsGained;
                    newXp = newXp % xpToLevel;
                    leveledUp = true;

                    // Check if we just defeated a boss (leaving a boss level)
                    // Badge/difficulty increment happens when crossing FROM a boss level (e.g., 20->21)
                    // not when arriving AT a boss level (e.g., 19->20)
                    // Cleaning is exempt from difficulty auto-increment
                    if (skillConfig.id !== 'cleaning') {
                        for (let lvl = oldLevel; lvl < newLevel; lvl++) {
                            if (lvl % 20 === 0 && lvl > 0) {
                                // Boss at level lvl was just defeated - increment difficulty (max 7)
                                const newTier = Math.floor(lvl / 20);
                                if (newDifficulty < 7) {
                                    newDifficulty++;
                                }
                                // Award badge for this tier if not already earned
                                if (!newBadges.includes(newTier) && newTier <= 7) {
                                    newBadges.push(newTier);
                                    // Show badge notification for defeating the boss
                                    setLootBox({ level: lvl, skillName: skillConfig.fantasyName, item: "New Rank!", img: BASE_ASSETS.badges.Wood });
                                    playNotification();
                                }
                            }
                        }
                    }

                    // Get new mob if not at boss level
                    if (newLevel % 20 !== 0 && (newLevel - 1) % 20 !== 0) {
                        newMob = getRandomMob(current.currentMob);
                    }

                    if (leveledUp) {
                        playLevelUp();
                    }
                }

                // Spawn new mob with fresh health
                newMobMaxHealth = calculateMobHealth(newDifficulty);
                newMobHealth = newMobMaxHealth;
                if (newLevel % 20 !== 0) {
                    newMob = getRandomMob(current.currentMob);
                }
            }

            const updatedState = {
                ...prev,
                [skillId]: {
                    ...current,
                    level: newLevel,
                    xp: newXp,
                    currentMob: newMob,
                    difficulty: newDifficulty,
                    earnedBadges: newBadges,
                    mobHealth: newMobHealth,
                    mobMaxHealth: newMobMaxHealth,
                    mobArmor: newMobArmor,
                    lostLevel: newLostLevel,
                    recoveryDifficulty: newRecoveryDifficulty,
                    memoryMob: newMemoryMob,
                    patternMob: newPatternMob,
                    currentMiniboss: newMiniboss,
                    currentBoss: newBoss,
                    readingMob: newReadingMob,
                    mathMob: newMathMob,
                    writingMob: newWritingMob,
                    readingMobAura: newReadingMobAura,
                    mathMobAura: newMathMobAura,
                    writingMobAura: newWritingMobAura,
                    patternMobAura: newPatternMobAura,
                    currentMinibossAura: newMinibossAura,
                    currentBossAura: newBossAura
                }
            };

            return updatedState;
        });
        
        // Check if mob was defeated and end battle for reading skill
        // Check after state update completes
        if (newMobHealth <= 0 && skillConfig.id === 'reading') {
            // End battle when mob is defeated
            setTimeout(() => {
                setBattlingSkillId(null);
                setBattleDifficulty(null);
                setChallengeData(null);
                setActionPoints(0);
                setArmorPoints(0);
                setMobNextAction(null);
                stopVoiceRecognition();
            }, 100); // Small delay to ensure state is updated
            return; // Exit early to prevent generating new challenge
        }

        // Generate next challenge for continuous gameplay (only if mob wasn't defeated)
        // Check if battle is still active before generating new challenge
        setTimeout(() => {
            if (battlingSkillId === skillId && skillConfig.hasChallenge && skillConfig.id !== 'memory') {
                // Use the stored battle difficulty for consistent challenge generation throughout the battle
                // This ensures bosses don't change difficulty mid-fight and miniboss difficulty+1 is maintained
                const challengeDiff = battleDifficulty || skillDifficulty;
                setChallengeData(generateChallenge(skillConfig.challengeType, challengeDiff));
                // Clear spokenText for reading challenges to prevent stale text from triggering false damage
                if (skillConfig.challengeType === 'reading') {
                    setSpokenText('');
                }
            } else if (skillConfig.id === 'memory') {
                setBattlingSkillId(null);
                setBattleDifficulty(null);
            }
        }, 0);
    };

    // Calculate mob action for Reading skill - randomly chooses: +1 DMG, +1 ARMOR, or +1 HEAL
    // Returns: { type: 'damage' | 'armor' | 'heal', value: 1 }
    const calculateMobAction = useCallback((skillId) => {
        if (!skillId) return { type: 'damage', value: 1 };
        const skillConfig = SKILL_DATA.find(s => s.id === skillId);
        
        // Only normalize for Reading skill - other skills keep original scaling
        if (skillConfig && skillConfig.id === 'reading') {
            // Randomly choose: 1 damage, 1 armor, or 1 heal (equal probability - 33.3% each)
            const rand = Math.random();
            console.log('[Mob Action] Random value:', rand); // Debug log
            if (rand < 0.333) {
                console.log('[Mob Action] Chosen: damage');
                return { type: 'damage', value: 1 };
            } else if (rand < 0.666) {
                console.log('[Mob Action] Chosen: armor');
                return { type: 'armor', value: 1 };
            } else {
                console.log('[Mob Action] Chosen: heal');
                return { type: 'heal', value: 1 };
            }
        }
        
        // For non-reading skills, return default damage
        return { type: 'damage', value: 1 };
    }, []);

    // Handle turn-based combat action (attack, defend, special, heal)
    const handleCombatAction = useCallback((skillId, actionType, wasSuccessful) => {
        if (!skillId || !wasSuccessful) return;
        
        const skillConfig = SKILL_DATA.find(s => s.id === skillId);
        const skillState = skills[skillId];
        const encounterType = getEncounterType(skillState.level);
        
        if (actionType === 'attack') {
            // Gain 1 AP first (before state changes that might trigger re-renders)
            setActionPoints(prev => prev + 1);
            
            // Mob counterattacks after player's turn (with delay for better feedback)
            // Calculate NEW action for this turn (don't use stored one - that's for display only)
            const mobAction = calculateMobAction(skillId);
            console.log('[Mob Action] Attack turn - calculated action:', mobAction);
            // Calculate next mob action for display (for next turn)
            setMobNextAction({ skillId, action: calculateMobAction(skillId) });
            
            // Then deal damage to mob (after setting up mob action)
            handleSuccessHit(skillId);
            
            // Check if battle is still active before mob acts
            setTimeout(() => {
                // Only act if battle is still active
                if (battlingSkillId !== skillId) return;
                
                // Show mob attack animation with action type
                setMobAttacking({ skillId, type: mobAction.type });
                
                // Apply action after animation plays (increased duration for visibility)
                setTimeout(() => {
                    // Check again if battle is still active
                    if (battlingSkillId !== skillId) return;
                    
                    setMobAttacking(null);
                    
                    if (mobAction.type === 'armor') {
                        // Mob gains armor
                        setSkills(prev => {
                            const current = prev[skillId];
                            const currentArmor = current.mobArmor || 0;
                            return {
                                ...prev,
                                [skillId]: {
                                    ...current,
                                    mobArmor: Math.min(10, currentArmor + mobAction.value) // Cap at 10
                                }
                            };
                        });
                        setPlayerDamageIndicator({ amount: mobAction.value, blocked: true, isHeal: true });
                        setTimeout(() => setPlayerDamageIndicator(null), 1000);
                        playClick(); // Shield sound
                    } else if (mobAction.type === 'heal') {
                        // Mob heals itself (restore mob health)
                        setSkills(prev => {
                            const current = prev[skillId];
                            const newMobHealth = Math.min(current.mobMaxHealth, current.mobHealth + mobAction.value);
                            return {
                                ...prev,
                                [skillId]: {
                                    ...current,
                                    mobHealth: newMobHealth
                                }
                            };
                        });
                        setPlayerDamageIndicator({ amount: mobAction.value, blocked: true, isHeal: true });
                        setTimeout(() => setPlayerDamageIndicator(null), 1000);
                        playClick(); // Heal sound
                    } else {
                        // Mob deals damage
                        const mobDamage = mobAction.value;
                        if (armorPoints > 0) {
                            // Armor absorbs damage
                            const absorbed = Math.min(armorPoints, mobDamage);
                            setArmorPoints(prev => Math.max(0, prev - absorbed));
                            if (absorbed < mobDamage) {
                                // Remaining damage hits player
                                const actualDamage = mobDamage - absorbed;
                                setPlayerHealth(h => {
                                    const newH = h - actualDamage;
                                    if (newH <= 0) {
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
                                            setBattlingSkillId(null);
                                            setShowDeathOverlay(false);
                                            setActionPoints(0);
                                            setArmorPoints(0);
                                        }, 2000);
                                        return 10;
                                    }
                                    return newH;
                                });
                                setPlayerDamageIndicator({ amount: actualDamage, blocked: false });
                                setTimeout(() => setPlayerDamageIndicator(null), 1000);
                                if (actualDamage > 0) playFail();
                            } else {
                                // Fully blocked
                                setPlayerDamageIndicator({ amount: absorbed, blocked: true });
                                setTimeout(() => setPlayerDamageIndicator(null), 1000);
                                playClick(); // Shield sound
                            }
                        } else {
                            // Direct damage to player
                            setPlayerDamageIndicator({ amount: mobDamage, blocked: false });
                            setTimeout(() => setPlayerDamageIndicator(null), 1000);
                            
                            setPlayerHealth(h => {
                                const newH = h - mobDamage;
                                if (newH <= 0) {
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
                                        setBattlingSkillId(null);
                                        setShowDeathOverlay(false);
                                        setActionPoints(0);
                                        setArmorPoints(0);
                                    }, 2000);
                                    return 10;
                                }
                                playFail();
                                return newH;
                            });
                        }
                    }
                }, 600); // Action applies after attack animation (increased for distinct sound queue)
            }, 1000); // Delay before mob counterattacks (reduced by 200ms)
            
        } else if (actionType === 'defend') {
            // Gain armor, gain 1 AP
            setArmorPoints(prev => Math.min(10, prev + 2)); // Gain 2 armor per defend (cap at 10)
            setActionPoints(prev => prev + 1);
            playClick();
            
            // Mob still attacks but armor should absorb it
            // Calculate NEW action for this turn (don't use stored one)
            const mobAction = calculateMobAction(skillId);
            console.log('[Mob Action] Defend turn - calculated action:', mobAction);
            // Calculate next mob action for display (for next turn)
            setMobNextAction({ skillId, action: calculateMobAction(skillId) });
            setTimeout(() => {
                // Only act if battle is still active
                if (battlingSkillId !== skillId) return;
                
                // Show mob attack animation with action type
                setMobAttacking({ skillId, type: mobAction.type });
                
                setTimeout(() => {
                    // Check again if battle is still active
                    if (battlingSkillId !== skillId) return;
                    
                    setMobAttacking(null);
                    
                    if (mobAction.type === 'armor') {
                        // Mob gains armor
                        setSkills(prev => {
                            const current = prev[skillId];
                            const currentArmor = current.mobArmor || 0;
                            return {
                                ...prev,
                                [skillId]: {
                                    ...current,
                                    mobArmor: Math.min(10, currentArmor + mobAction.value) // Cap at 10
                                }
                            };
                        });
                        setPlayerDamageIndicator({ amount: mobAction.value, blocked: true, isHeal: true });
                        setTimeout(() => setPlayerDamageIndicator(null), 1000);
                        playClick(); // Shield sound
                    } else if (mobAction.type === 'heal') {
                        // Mob heals itself (restore mob health)
                        setSkills(prev => {
                            const current = prev[skillId];
                            const newMobHealth = Math.min(current.mobMaxHealth, current.mobHealth + mobAction.value);
                            return {
                                ...prev,
                                [skillId]: {
                                    ...current,
                                    mobHealth: newMobHealth
                                }
                            };
                        });
                        setPlayerDamageIndicator({ amount: mobAction.value, blocked: true, isHeal: true });
                        setTimeout(() => setPlayerDamageIndicator(null), 1000);
                        playClick(); // Heal sound
                    } else {
                        // Mob deals damage - armor should absorb it
                        const mobDamage = mobAction.value;
                        setArmorPoints(prev => {
                            const newArmor = Math.max(0, prev - mobDamage);
                            if (prev >= mobDamage) {
                                playClick(); // Shield blocked sound
                                setPlayerDamageIndicator({ amount: mobDamage, blocked: true });
                            } else {
                                // Some damage got through
                                const damageTaken = mobDamage - prev;
                                setPlayerHealth(h => {
                                    const newH = h - damageTaken;
                                    if (newH <= 0) {
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
                                            setBattlingSkillId(null);
                                            setShowDeathOverlay(false);
                                            setActionPoints(0);
                                            setArmorPoints(0);
                                        }, 2000);
                                        return 10;
                                    }
                                    playFail();
                                    return newH;
                                });
                                setPlayerDamageIndicator({ amount: damageTaken, blocked: false });
                            }
                            setTimeout(() => setPlayerDamageIndicator(null), 1000);
                            return newArmor;
                        });
                    }
                }, 600); // Action applies after attack animation (increased for distinct sound queue)
            }, 1000); // Delay before mob counterattacks (reduced by 200ms)
            
            // Generate next challenge
            if (skillConfig.hasChallenge) {
                const challengeDiff = battleDifficulty || skillState.difficulty || 1;
                setChallengeData(generateChallenge(skillConfig.challengeType, challengeDiff));
                setSpokenText('');
            }
            
        } else if (actionType === 'special') {
            // Requires 5 AP, instant kill (or 3x damage to boss)
            if (actionPoints < 5) return;
            
            setActionPoints(prev => prev - 5);
            
            if (encounterType === 'boss') {
                // Deal 3x damage to boss
                handleSuccessHit(skillId, null, null, 3);
                handleSuccessHit(skillId, null, null, 0);
                handleSuccessHit(skillId, null, null, 0);
            } else {
                // Instant kill regular mob/miniboss
                const instantKillDamage = skillState.mobHealth;
                handleSuccessHit(skillId, null, instantKillDamage, 1.5);
            }
            playSuccessfulHit();
            
        } else if (actionType === 'heal') {
            // Requires 2 AP, full heal
            if (actionPoints < 2) return;
            
            setActionPoints(prev => prev - 2);
            setPlayerHealth(10); // Full heal
            playNotification();
            
            // Generate next challenge
            if (skillConfig.hasChallenge) {
                const challengeDiff = battleDifficulty || skillState.difficulty || 1;
                setChallengeData(generateChallenge(skillConfig.challengeType, challengeDiff));
                setSpokenText('');
            }
        }
    }, [skills, actionPoints, armorPoints, battleDifficulty, calculateMobAction, handleSuccessHit, setSpokenText]);

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
                    checkAchievements(prevStats, newStats, skills, skills);
                }, 100);

                return newStats;
            });
        }
    }, [activeTheme, skills, checkAchievements]);

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
                    checkAchievements(prevStats, newStats, skills, skills);
                }, 100);

                return newStats;
            });
        }
    }, [selectedBorder, skills, checkAchievements]);

    // Award a free level from phantom click
    const handlePhantomLevelAward = (skillId) => {
        if (!skillId) return;

        // Play level up sound
        playLevelUp();

        setSkills(prev => {
            const current = prev[skillId];
            return {
                ...prev,
                [skillId]: {
                    ...current,
                    level: current.level + 1
                }
            };
        });

        // Show celebration notification
        const skillConfig = SKILL_DATA.find(s => s.id === skillId);
        if (skillConfig) {
            setLootBox({
                level: skills[skillId].level + 1,
                skillName: skillConfig.fantasyName,
                item: "Phantom Bonus!",
                img: HOSTILE_MOBS['Phantom']
            });
            playNotification();
        }
    };

    const startBattle = (id) => {
        const skill = SKILL_DATA.find(s => s.id === id);
        setBattlingSkillId(id);
        // Use the skill's current difficulty setting
        const currentDiff = skills[id].difficulty || 1;
        const playerLevel = skills[id].level;

        // For miniboss encounters, use difficulty+1 for content (capped at 7)
        const encounterType = getEncounterType(playerLevel);
        const challengeDiff = encounterType === 'miniboss'
            ? Math.min(7, currentDiff + 1)
            : currentDiff;

        // Store the battle's challenge difficulty so it remains consistent throughout the battle
        setBattleDifficulty(challengeDiff);

        // Reset turn-based combat state for new battle
        setActionPoints(0);
        setArmorPoints(0);
        // Reset mob armor for reading skill
        if (skill.challengeType === 'reading') {
            setSkills(prev => {
                const current = prev[id];
                return {
                    ...prev,
                    [id]: {
                        ...current,
                        mobArmor: 0
                    }
                };
            });
        }
        // Set initial mob action for reading skill
        if (skill.challengeType === 'reading') {
            setMobNextAction({ skillId: id, action: calculateMobAction(id) });
        } else {
            setMobNextAction(null);
        }

        setChallengeData(generateChallenge(skill.challengeType, challengeDiff));
        playClick();
        startBGM(); // Start BGM on first battle (user interaction)
        if (skill.challengeType === 'reading') startVoiceListener(id);
    };

    const endBattle = () => {
        console.log('[Battle] Ending battle, cleaning up speech recognition');
        // Reset mob armor for reading skill before clearing battlingSkillId
        if (battlingSkillId) {
            setSkills(prev => {
                const current = prev[battlingSkillId];
                if (current) {
                    return {
                        ...prev,
                        [battlingSkillId]: {
                            ...current,
                            mobArmor: 0
                        }
                    };
                }
                return prev;
            });
        }
        setBattlingSkillId(null);
        setBattleDifficulty(null);
        setChallengeData(null);
        // Reset turn-based combat state
        setActionPoints(0);
        setArmorPoints(0);
        stopVoiceRecognition();
        playClick();
    };

    const handleSwitchProfile = (newId) => {
        if (newId === currentProfile) return;
        playClick();
        const newSkills = loadSkills(newId);
        const newTheme = loadTheme(newId);
        setSkills(newSkills);
        setActiveTheme(newTheme);
        setCurrentProfile(newId);
    };
    const handleRenameProfile = (id, newName) => {
        setProfileNames(prev => ({ ...prev, [id]: newName }));
    };
    const handleParentVerified = (profileId, verified) => {
        setParentStatus(prev => ({ ...prev, [profileId]: verified }));

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

            {/* Player Health Display - Centered with Armor Shields overlaying Hearts */}
            <div className="absolute z-[200] flex gap-1.5" style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
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
            />
            <ResetModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} onConfirm={handleReset} />
            <BugReportModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />
            <AvatarSelectionModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={(avatar) => {
                    setSelectedAvatar(avatar);
                    localStorage.setItem(`profileAvatar_p${currentProfile}`, avatar);
                }}
                profileBgColor={profileBgColor}
                setProfileBgColor={(color) => {
                    setProfileBgColor(color);
                    localStorage.setItem(`profileBgColor_p${currentProfile}`, color);
                }}
            />

            {/* Top Right Buttons - Hidden when battling */}
            {!battlingSkillId && (
                <>
                    {/* Button dimensions: p-3 (12px) + icon(48px) + p-3 (12px) + border-2*2 (4px) = 76px + 8px gap = 84px spacing */}
                    <button
                        onClick={async () => {
                            // Check if running in Electron
                            if (window.electron?.toggleFullscreen) {
                                console.log('[Fullscreen] Using Electron IPC');
                                try {
                                    const newState = await window.electron.toggleFullscreen();
                                    console.log('[Fullscreen] New state:', newState);
                                    setIsFullscreen(newState);
                                } catch (err) {
                                    console.error('[Fullscreen] Electron IPC error:', err);
                                }
                            } else {
                                // Fallback to browser Fullscreen API
                                console.log('[Fullscreen] Using browser Fullscreen API');
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen()
                                        .then(() => console.log('[Fullscreen] Entered fullscreen'))
                                        .catch(err => console.error('[Fullscreen] Error:', err));
                                } else {
                                    document.exitFullscreen()
                                        .then(() => console.log('[Fullscreen] Exited fullscreen'))
                                        .catch(err => console.error('[Fullscreen] Error:', err));
                                }
                            }
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

            {/* Bottom Right Bug Report Button */}
            <button
                onClick={() => { setIsMenuOpen(false); setIsCosmeticsOpen(false); setIsSettingsOpen(false); setIsBugReportOpen(true); playClick(); }}
                className="absolute z-40 bg-stone-800/90 text-white p-3 rounded-lg border-2 border-stone-600 hover:bg-stone-700 transition-all shadow-lg"
                style={{ bottom: '24px', right: '24px' }}
            >
                <Bug size={48} className="text-red-400" />
            </button>

            {/* Backdrop overlay when battling - click to exit */}
            {battlingSkillId && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', minWidth: '100vw', minHeight: '100vh' }}
                    onClick={endBattle}
                />
            )}
            <main className="flex-1 relative flex flex-col items-center justify-center w-full">
                <div className="z-10 relative mb-[-30px] md:mb-[-50px] pointer-events-none opacity-90"><SafeImage src={currentThemeData.assets.logo} fallbackSrc="https://placehold.co/800x300/333/FFD700?text=LOGO+PLACEHOLDER&font=monsterrat" alt="Game Logo" className="w-[480px] md:w-[720px] lg:w-[960px] object-contain drop-shadow-2xl" /></div>
                <h1 className="text-9xl text-yellow-400 tracking-widest uppercase mt-[-20px] mb-[95px] z-20 relative drop-shadow-[4px_4px_0_#000]" style={{ textShadow: '6px 6px 0 #000' }}>Level Up!</h1>

                <SkillCarousel
                    skills={skills}
                    activeTheme={activeTheme}
                    battlingSkillId={battlingSkillId}
                    startBattle={startBattle}
                    endBattle={endBattle}
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

            {lootBox && <div className="fixed bottom-8 left-1/2 z-50 animate-toast w-full max-w-2xl pointer-events-none transform -translate-x-1/2"><div className="bg-black/80 border-4 border-yellow-500 rounded-full p-4 px-12 flex items-center justify-between shadow-[0_0_30px_rgba(255,215,0,0.6)] backdrop-blur-md mx-4"><div className="flex items-center gap-4"><div className="bg-yellow-500/20 p-3 rounded-full border-2 border-yellow-400"><Gift size={32} className="text-yellow-300 animate-bounce" /></div><div className="text-left"><h2 className="text-2xl text-yellow-400 font-bold leading-none mb-1">LEVEL {lootBox.level} REACHED!</h2><p className="text-stone-300 text-sm">{lootBox.skillName}</p></div></div><div className="text-right pl-8 border-l-2 border-stone-600 flex items-center gap-4"><SafeImage src={lootBox.img} alt="Badge" className="w-12 h-12 object-contain" /><div><p className="text-stone-400 text-xs uppercase tracking-wider">Unlocked</p><p className="text-2xl text-green-400 font-bold">{lootBox.item}</p></div></div></div></div>}

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

            {/* Phantom Fly-By Bonus Event */}
            <PhantomEvent
                battlingSkillId={battlingSkillId}
                onAwardLevel={handlePhantomLevelAward}
                onPhantomCaught={() => {
                    setStats(prevStats => {
                        const newStats = {
                            ...prevStats,
                            phantomsCaught: (prevStats.phantomsCaught || 0) + 1
                        };

                        // Check achievements
                        setTimeout(() => {
                            checkAchievements(prevStats, newStats, skills, skills);
                        }, 100);

                        return newStats;
                    });
                }}
            />
        </div >
    );
};

export default App;