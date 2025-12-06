/**
 * Sound Manager Utility
 * Centralized sound management for the game including BGM shuffle, UI sounds, and mob sounds.
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

// Mob name to folder name mapping (handles differences between display names and folder names)
const MOB_FOLDER_MAP = {
    // Hostile mobs
    'Zombie': 'zombie',
    'Creeper': 'creeper',
    'Skeleton': 'skeleton',
    'Spider': 'spider',
    'Enderman': 'endermen',
    'Blaze': 'blaze',
    'Ghast': 'ghast',
    'Slime': 'slime',
    'Phantom': 'phantom',
    'Piglin': 'piglin',
    'Hoglin': 'hoglin',
    'Drowned': 'drowned',
    'Pillager': 'pillager',
    'Evoker': 'evoker',
    'Guardian': 'guardian',
    'Magma Cube': 'magmacube',
    'Witch': 'witch',
    // Boss mobs
    'Ender Dragon': 'enderdragon',
    'Wither': 'wither',
    'Warden': 'warden',
    // Miniboss mobs
    'Elder Guardian': 'elderguardian',
    'Ravager': 'ravager',
    'Wither Skeleton': 'wither_skeleton',
    'Creaking': 'creaking',
    // Friendly mobs
    'Cat': 'cat',
    'Chicken': 'chicken',
    'Cow': 'cow',
    'Pig': 'pig',
    'Sheep': 'sheep',
    'Wolf': 'wolf',
    'Dolphin': 'dolphin',
    'Fox': 'fox',
    'Panda': 'panda',
    'Parrot': 'parrot',
    'Horse': 'horse',
    'Turtle': 'turtle',
    'Rabbit': 'rabbit',
    'Bunny': 'rabbit',
    'Mooshroom': 'mooshroom',
    'Polar Bear': 'polarbear',
    'Llama': 'llama',
    'Bat': 'bat',
    'Bee': 'bee',
    'Villager': 'villager',
    'Iron Golem': 'irongolem',
    'Wandering Trader': 'wandering_trader',
    'Strider': 'strider'
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
        
        this.audio.play().catch(() => {});
        this.isPlaying = true;
    }

    playNextTrack() {
        this.currentTrackIndex = this.getRandomTrack();
        if (this.audio) {
            this.audio.src = this.tracks[this.currentTrackIndex];
            this.audio.volume = this.volume; // Ensure volume is set for new track
            this.audio.play().catch(() => {});
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
    audio.play().catch(() => {});
};

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
 * Get the folder name for a mob
 * @param {string} mobName - Display name of the mob
 * @returns {string|null} - Folder name or null if not found/mapped
 */
const getMobFolder = (mobName) => {
    // Only use explicit mappings to avoid loading non-existent files
    return MOB_FOLDER_MAP[mobName] || null;
};

/**
 * Play mob hurt sound
 * @param {string} mobName - Display name of the mob
 */
export const playMobHurt = (mobName) => {
    const folder = getMobFolder(mobName);
    if (!folder) return;
    
    // Use standardized naming (all files renamed to hurt.wav)
    const audio = new Audio(`assets/sounds/mob/${folder}/hurt.wav`);
    audio.volume = sfxVolume;
    audio.play().catch(() => {});
};

/**
 * Play mob death sound
 * @param {string} mobName - Display name of the mob
 */
export const playMobDeath = (mobName) => {
    const folder = getMobFolder(mobName);
    if (!folder) return;
    
    // Use standardized naming (all files renamed to death.wav)
    const audio = new Audio(`assets/sounds/mob/${folder}/death.wav`);
    audio.volume = sfxVolume;
    audio.play().catch(() => {});
};

/**
 * Play mob say sound (for friendly mobs)
 * @param {string} mobName - Display name of the mob
 */
export const playMobSay = (mobName) => {
    const folder = getMobFolder(mobName);
    if (!folder) return;
    
    // Use standardized naming (all files renamed to say.wav)
    const audio = new Audio(`assets/sounds/mob/${folder}/say.wav`);
    audio.volume = sfxVolume;
    audio.play().catch(() => {});
};

// Export UI sound names for reference
export const UI_SOUND_NAMES = Object.keys(UI_SOUNDS);
