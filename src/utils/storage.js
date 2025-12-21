/**
 * Storage utility that uses file system in Electron and localStorage in browser
 */

// Check if we're in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electron && window.electron.isElectron;
};

// Storage cache to avoid excessive file reads
const storageCache = new Map();
const settingsCache = { currentProfile: null, profileNames: null, parentStatus: null };

/**
 * Load profile data (skills, theme, stats)
 */
export const loadProfileData = async (profileId) => {
  if (isElectron()) {
    try {
      // Check cache first
      const cacheKey = `profile_${profileId}`;
      if (storageCache.has(cacheKey)) {
        return storageCache.get(cacheKey);
      }

      const result = await window.electron.loadProfileData(profileId);
      if (result.success && result.data) {
        storageCache.set(cacheKey, result.data);
        return result.data;
      }
      return null;
    } catch (error) {
      console.warn('Failed to load profile data from file:', error);
      return null;
    }
  } else {
    // Browser: use localStorage
    const key = `heroSkills_v23_p${profileId}`;
    let saved = localStorage.getItem(key);
    if (!saved && profileId === 1) {
      saved = localStorage.getItem('heroSkills_v23');
    }
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved data:', e);
      return null;
    }
  }
};

/**
 * Save profile data (skills, theme, stats)
 */
export const saveProfileData = async (profileId, data) => {
  if (isElectron()) {
    try {
      const result = await window.electron.saveProfileData(profileId, data);
      if (result.success) {
        // Update cache
        const cacheKey = `profile_${profileId}`;
        storageCache.set(cacheKey, data);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to save profile data to file:', error);
      return false;
    }
  } else {
    // Browser: use localStorage
    try {
      const key = `heroSkills_v23_p${profileId}`;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Failed to save data:', e);
      return false;
    }
  }
};

/**
 * Load profile settings (current profile, names, parent status)
 */
export const loadProfileSettings = async () => {
  if (isElectron()) {
    try {
      // Check cache first
      if (settingsCache.currentProfile !== null) {
        return {
          currentProfile: settingsCache.currentProfile,
          profileNames: settingsCache.profileNames,
          parentStatus: settingsCache.parentStatus
        };
      }

      const result = await window.electron.loadProfileSettings();
      if (result.success && result.data) {
        settingsCache.currentProfile = result.data.currentProfile ?? 1;
        settingsCache.profileNames = result.data.profileNames ?? { 1: "Player 1", 2: "Player 2", 3: "Player 3" };
        settingsCache.parentStatus = result.data.parentStatus ?? { 1: false, 2: false, 3: false };
        return result.data;
      }
      // Return defaults if no data
      const defaults = {
        currentProfile: 1,
        profileNames: { 1: "Player 1", 2: "Player 2", 3: "Player 3" },
        parentStatus: { 1: false, 2: false, 3: false }
      };
      settingsCache.currentProfile = defaults.currentProfile;
      settingsCache.profileNames = defaults.profileNames;
      settingsCache.parentStatus = defaults.parentStatus;
      return defaults;
    } catch (error) {
      console.warn('Failed to load profile settings from file:', error);
      return {
        currentProfile: 1,
        profileNames: { 1: "Player 1", 2: "Player 2", 3: "Player 3" },
        parentStatus: { 1: false, 2: false, 3: false }
      };
    }
  } else {
    // Browser: use localStorage
    try {
      const currentProfile = localStorage.getItem('currentProfile_v1')
        ? parseInt(localStorage.getItem('currentProfile_v1'), 10)
        : 1;
      const profileNames = localStorage.getItem('heroProfileNames_v1')
        ? JSON.parse(localStorage.getItem('heroProfileNames_v1'))
        : { 1: "Player 1", 2: "Player 2", 3: "Player 3" };
      const parentStatus = localStorage.getItem('heroParentStatus_v1')
        ? JSON.parse(localStorage.getItem('heroParentStatus_v1'))
        : { 1: false, 2: false, 3: false };
      return { currentProfile, profileNames, parentStatus };
    } catch (e) {
      console.warn('Failed to load profile settings:', e);
      return {
        currentProfile: 1,
        profileNames: { 1: "Player 1", 2: "Player 2", 3: "Player 3" },
        parentStatus: { 1: false, 2: false, 3: false }
      };
    }
  }
};

/**
 * Save profile settings (current profile, names, parent status)
 */
export const saveProfileSettings = async (settings) => {
  if (isElectron()) {
    try {
      const result = await window.electron.saveProfileSettings(settings);
      if (result.success) {
        // Update cache
        settingsCache.currentProfile = settings.currentProfile ?? settingsCache.currentProfile;
        settingsCache.profileNames = settings.profileNames ?? settingsCache.profileNames;
        settingsCache.parentStatus = settings.parentStatus ?? settingsCache.parentStatus;
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to save profile settings to file:', error);
      return false;
    }
  } else {
    // Browser: use localStorage
    try {
      if (settings.currentProfile !== undefined) {
        localStorage.setItem('currentProfile_v1', settings.currentProfile.toString());
      }
      if (settings.profileNames !== undefined) {
        localStorage.setItem('heroProfileNames_v1', JSON.stringify(settings.profileNames));
      }
      if (settings.parentStatus !== undefined) {
        localStorage.setItem('heroParentStatus_v1', JSON.stringify(settings.parentStatus));
      }
      return true;
    } catch (e) {
      console.warn('Failed to save profile settings:', e);
      return false;
    }
  }
};

/**
 * Clear cache (useful when data is modified externally)
 */
export const clearCache = () => {
  storageCache.clear();
  settingsCache.currentProfile = null;
  settingsCache.profileNames = null;
  settingsCache.parentStatus = null;
};

/**
 * Get data directory path (Electron only)
 */
export const getDataDirectory = async () => {
  if (isElectron()) {
    try {
      const result = await window.electron.getDataDirectory();
      if (result.success) {
        return result.path;
      }
    } catch (error) {
      console.warn('Failed to get data directory:', error);
    }
  }
  return null;
};

