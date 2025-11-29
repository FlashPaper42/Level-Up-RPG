import { MOB_KEYS } from '../constants/gameData';

export const getRandomMob = (exclude) => { 
    const pool = MOB_KEYS.filter(m => m !== exclude); 
    return pool[Math.floor(Math.random() * pool.length)]; 
};

export const getMobForSkill = (skillConfig, userSkill) => {
    if (skillConfig.id === 'cleaning') {
            if (userSkill.level % 20 === 0) return 'Ender Chest';
            if (userSkill.level % 5 === 0) return 'Shulker Box';
            const standardChests = ['Chest', 'Barrel', 'Bundle', 'Trapped Chest'];
            return standardChests[(userSkill.level - 1) % standardChests.length];
    }
    if (skillConfig.id === 'memory') {
        return 'Axolotl Mascot';
    }
    if (userSkill.level % 20 === 0) return skillConfig.boss;
    return userSkill.currentMob || 'Zombie';
};