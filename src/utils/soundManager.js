/**
 * Sound Manager Utility
 * Centralized sound management for the game including BGM shuffle, UI sounds, and mob sounds.
 * 
 * Sound folder structure:
 * - assets/sounds/battle/hostile/[mob]/hurt.wav, death.wav
 * - assets/sounds/battle/friendly/[mob]/say.wav
 * - assets/sounds/battle/miniboss/[mob]/death.wav (no hurt sounds - they die in one hit)
 * - assets/sounds/battle/boss/[mob]/hurt.wav, death.wav
 */

// BGM tracks discovered from public/assets/sounds/bgm/
const BGM_TRACKS = [
    'assets/sounds/bgm/calm1.wav',
    'assets/sounds/bgm/calm2.wav',
    'assets/sounds/bgm/calm3.wav',
    'assets/sounds/bgm/piano1.wav',
    'assets/sounds/bgm/piano2.wav',
    'assets/sounds/bgm/piano3.wav'
];

// UI sound paths
const UI_SOUNDS = {
    actioncard_left: 'assets/sounds/ui/actioncard_left.wav',
    actioncard_right: 'assets/sounds/ui/actioncard_right.wav',
    click: 'assets/sounds/ui/click.wav',
    death: 'assets/sounds/ui/death.wav',
    fail: 'assets/sounds/ui/fail.wav',
    levelup: 'assets/sounds/ui/levelup.wav',
    notification: 'assets/sounds/ui/notification.wav',
    successful_hit: 'assets/sounds/ui/successful_hit.wav'
};

// Battle action sound paths (new structure)
const ACTION_SOUNDS = {
    armor: 'assets/sounds/battle/actions/armor.wav',
    heal: 'assets/sounds/battle/actions/heal.wav',
    special: 'assets/sounds/battle/actions/special.wav',
    playerHitArmor: 'assets/sounds/battle/actions/playerHitArmor.wav',
    playerHitHealth: 'assets/sounds/battle/actions/playerHitHealth.wav',
    ambush: 'assets/sounds/battle/ambush.wav'
};

// Mob name to folder name mapping
// Organized by mob type: hostile, friendly, miniboss, boss
const MOB_FOLDER_MAP = {
    // ===== HOSTILE MOBS =====
    'Zombie': { type: 'hostile', folder: 'zombie' },
    'Creeper': { type: 'hostile', folder: 'creeper' },
    'Skeleton': { type: 'hostile', folder: 'skeleton' },
    'Spider': { type: 'hostile', folder: 'spider' },
    'Enderman': { type: 'hostile', folder: 'endermen' },
    'Blaze': { type: 'hostile', folder: 'blaze' },
    'Ghast': { type: 'hostile', folder: 'ghast' },
    'Slime': { type: 'hostile', folder: 'slime' },
    'Phantom': { type: 'hostile', folder: 'phantom' },
    'Piglin': { type: 'hostile', folder: 'piglin' },
    'Hoglin': { type: 'hostile', folder: 'hoglin' },
    'Drowned': { type: 'hostile', folder: 'drowned' },
    'Pillager': { type: 'hostile', folder: 'pillager' },
    'Evoker': { type: 'hostile', folder: 'evoker' },
    'Guardian': { type: 'hostile', folder: 'guardian' },
    'Witch': { type: 'hostile', folder: 'witch' },
    // Variants that use skeleton sounds
    'Bogged': { type: 'hostile', folder: 'skeleton' },
    'Breeze': { type: 'hostile', folder: 'skeleton' },
    // Variant that uses slime sounds
    'Magma Cube': { type: 'hostile', folder: 'slime' },
    
    // ===== FRIENDLY MOBS (only those with say sounds for memory game) =====
    'Cat': { type: 'friendly', folder: 'cat' },
    'Chicken': { type: 'friendly', folder: 'chicken' },
    'Cow': { type: 'friendly', folder: 'cow' },
    'Dolphin': { type: 'friendly', folder: 'dolphin' },
    'Mooshroom': { type: 'friendly', folder: 'mooshroom' },
    'Panda': { type: 'friendly', folder: 'panda' },
    'Pig': { type: 'friendly', folder: 'pig' },
    'Sheep': { type: 'friendly', folder: 'sheep' },
    'Villager': { type: 'friendly', folder: 'villager' },
    'Wolf': { type: 'friendly', folder: 'wolf' },
    
    // ===== MINIBOSS MOBS =====
    'Elder Guardian': { type: 'miniboss', folder: 'elderguardian' },
    'Ravager': { type: 'miniboss', folder: 'ravager' },
    'Wither Skeleton': { type: 'miniboss', folder: 'wither_skeleton' },
    'Creaking': { type: 'miniboss', folder: 'creaking' },
    
    // ===== BOSS MOBS =====
    'Ender Dragon': { type: 'boss', folder: 'enderdragon' },
    'Wither': { type: 'boss', folder: 'wither' },
    'Warden': { type: 'boss', folder: 'warden' },
    'Herobrine': { type: 'boss', folder: 'herobrine' }
};

// Class for managing BGM playback with shuffle
class BGMManager {
    constructor() {
        this.audio = null;
        this.volume = 0.3;
        this.isPlaying = false;
        this.currentTrackIndex = -1;
        this.tracks = [...BGM_TRACKS];
    }

    setVolume(vol) {
        this.volume = vol;
        if (this.audio) {
            this.audio.volume = vol;
        }
    }

    getRandomTrack() {
        // Get a random track that's different from the current one
        const availableIndices = this.tracks
            .map((_, i) => i)
            .filter(i => i !== this.currentTrackIndex);

        // If only one track or no other tracks available, return current
        if (availableIndices.length === 0) {
            return this.currentTrackIndex >= 0 ? this.currentTrackIndex : 0;
        }

        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        return availableIndices[randomIndex];
    }

    play() {
        if (!this.audio) {
            this.currentTrackIndex = this.getRandomTrack();
            this.audio = new Audio(this.tracks[this.currentTrackIndex]);
            this.audio.volume = this.volume;

            // When a track ends, play a new random track
            this.audio.addEventListener('ended', () => {
                this.playNextTrack();
            });
        }

        this.audio.play().catch(() => { });
        this.isPlaying = true;
    }

    playNextTrack() {
        this.currentTrackIndex = this.getRandomTrack();
        if (this.audio) {
            this.audio.src = this.tracks[this.currentTrackIndex];
            this.audio.volume = this.volume; // Ensure volume is set for new track
            this.audio.play().catch(() => { });
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
}

// Singleton BGM manager instance
let bgmManagerInstance = null;

export const getBGMManager = () => {
    if (!bgmManagerInstance) {
        bgmManagerInstance = new BGMManager();
    }
    return bgmManagerInstance;
};

// SFX volume (separate from BGM)
let sfxVolume = 0.5;

export const setSfxVolume = (vol) => {
    sfxVolume = vol;
};

export const getSfxVolume = () => sfxVolume;

/**
 * Play a UI sound
 * @param {string} soundName - Name of the UI sound (click, death, fail, levelup, etc.)
 */
export const playUISound = (soundName) => {
    const path = UI_SOUNDS[soundName];
    if (!path) return;

    const audio = new Audio(path);
    audio.volume = sfxVolume;
    audio.play().catch(() => { });
};

/**
 * Play an action sound (armor, heal, special, player hit effects)
 * @param {string} actionName - Name of the action sound
 */
export const playActionSound = (actionName) => {
    const path = ACTION_SOUNDS[actionName];
    if (!path) {
        console.warn(`[SoundManager] Unknown action sound: ${actionName}`);
        return;
    }

    const audio = new Audio(path);
    audio.volume = sfxVolume;
    audio.play().catch(() => { });
};

/**
 * Play armor gain sound (player or mob gains armor)
 */
export const playArmorGain = () => playActionSound('armor');

/**
 * Play heal sound (player or mob heals)
 */
export const playHealSound = () => playActionSound('heal');

/**
 * Play special attack sound
 */
export const playSpecialAttack = () => playActionSound('special');

/**
 * Play player hit armor sound (mob attacked and hit player's armor)
 */
export const playPlayerHitArmor = () => playActionSound('playerHitArmor');

/**
 * Play player hit health sound (mob attacked and hit player's health)
 */
export const playPlayerHitHealth = () => playActionSound('playerHitHealth');

/**
 * Play ambush sound (miniboss/boss appears mid-battle)
 */
export const playAmbush = () => playActionSound('ambush');

/**
 * Play actioncard left sound
 */
export const playActionCardLeft = () => playUISound('actioncard_left');

/**
 * Play actioncard right sound
 */
export const playActionCardRight = () => playUISound('actioncard_right');

/**
 * Play click sound
 */
export const playClick = () => playUISound('click');

/**
 * Play death sound (player death)
 */
export const playDeath = () => playUISound('death');

/**
 * Play fail sound (player takes damage but doesn't die)
 */
export const playFail = () => playUISound('fail');

/**
 * Play level up sound
 */
export const playLevelUp = () => playUISound('levelup');

/**
 * Play notification sound
 */
export const playNotification = () => playUISound('notification');

/**
 * Play successful hit sound
 */
export const playSuccessfulHit = () => playUISound('successful_hit');

/**
 * Play achievement unlock sound
 * Uses the notification sound for achievement unlocks
 */
export const playAchievement = () => playUISound('notification');

/**
 * Get the folder info for a mob
 * @param {string} mobName - Display name of the mob
 * @returns {{type: string, folder: string}|null} - Mob info or null if not found
 */
const getMobInfo = (mobName) => {
    return MOB_FOLDER_MAP[mobName] || null;
};

/**
 * Play mob hurt sound
 * @param {string} mobName - Display name of the mob
 */
export const playMobHurt = (mobName) => {
    const mobInfo = getMobInfo(mobName);
    if (!mobInfo) {
        console.warn(`[SoundManager] No sound mapping for mob: ${mobName}`);
        return;
    }

    // Only hostile mobs and bosses have hurt sounds
    if (mobInfo.type !== 'hostile' && mobInfo.type !== 'boss') {
        console.warn(`[SoundManager] Mob ${mobName} (${mobInfo.type}) does not have hurt sounds`);
        return;
    }

    const audio = new Audio(`assets/sounds/battle/${mobInfo.type}/${mobInfo.folder}/hurt.wav`);
    audio.volume = sfxVolume;
    audio.play().catch((err) => {
        console.warn(`[SoundManager] Failed to play hurt sound for ${mobName}:`, err.message);
    });
};

/**
 * Play mob death sound
 * @param {string} mobName - Display name of the mob
 */
export const playMobDeath = (mobName) => {
    const mobInfo = getMobInfo(mobName);
    if (!mobInfo) {
        console.warn(`[SoundManager] No sound mapping for mob: ${mobName}`);
        return;
    }

    // All mob types except friendly have death sounds
    if (mobInfo.type === 'friendly') {
        console.warn(`[SoundManager] Friendly mobs don't have death sounds`);
        return;
    }

    const audio = new Audio(`assets/sounds/battle/${mobInfo.type}/${mobInfo.folder}/death.wav`);
    audio.volume = sfxVolume;
    audio.play().catch((err) => {
        console.warn(`[SoundManager] Failed to play death sound for ${mobName}:`, err.message);
    });
};

/**
 * Play mob say sound (for friendly mobs in memory game, or when mob takes action)
 * @param {string} mobName - Display name of the mob
 */
export const playMobSay = (mobName) => {
    const mobInfo = getMobInfo(mobName);
    if (!mobInfo) {
        console.warn(`[SoundManager] No sound mapping for mob: ${mobName}`);
        return;
    }

    // Friendly mobs have say sounds, hostile/boss mobs use say as action sound
    if (mobInfo.type === 'friendly') {
        const audio = new Audio(`assets/sounds/battle/${mobInfo.type}/${mobInfo.folder}/say.wav`);
        audio.volume = sfxVolume;
        audio.play().catch((err) => {
            console.warn(`[SoundManager] Failed to play say sound for ${mobName}:`, err.message);
        });
    } else {
        // For hostile/boss mobs, try say.wav first, fallback to hurt.wav
        const sayAudio = new Audio(`assets/sounds/battle/${mobInfo.type}/${mobInfo.folder}/say.wav`);
        sayAudio.volume = sfxVolume;
        sayAudio.play().catch(() => {
            // Fallback to hurt sound if say doesn't exist
            if (mobInfo.type === 'hostile' || mobInfo.type === 'boss') {
                const hurtAudio = new Audio(`assets/sounds/battle/${mobInfo.type}/${mobInfo.folder}/hurt.wav`);
                hurtAudio.volume = sfxVolume;
                hurtAudio.play().catch(() => { });
            }
        });
    }
};

// Export UI sound names for reference
export const UI_SOUND_NAMES = Object.keys(UI_SOUNDS);
export const ACTION_SOUND_NAMES = Object.keys(ACTION_SOUNDS);
