import { useState, useCallback } from 'react';
import { useProgression } from '../contexts/ProgressionContext';
import { playLevelUp, playNotification } from '../utils/soundManager';
import { SKILL_DATA, HOSTILE_MOBS } from '../constants/gameData';

export const usePhantomSystem = () => {
    const { skills, setSkills, stats, setStats, checkAchievements } = useProgression();
    const [lootBox, setLootBox] = useState(null);

    const handlePhantomLevelAward = useCallback((skillId) => {
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
    }, [skills, setSkills]);

    const handlePhantomCaught = useCallback(() => {
        setStats(prevStats => {
            const newStats = {
                ...prevStats,
                phantomsCaught: (prevStats.phantomsCaught || 0) + 1
            };

            // Check achievements (async to avoid render cycle issues)
            setTimeout(() => {
                checkAchievements(prevStats, newStats, skills, skills);
            }, 100);

            return newStats;
        });
    }, [setStats, checkAchievements, skills]);

    const clearLootBox = useCallback(() => setLootBox(null), []);

    return {
        lootBox,
        setLootBox, // Expose if needed for manual clear or integration
        clearLootBox, // Easier helper
        handlePhantomLevelAward,
        handlePhantomCaught
    };
};
