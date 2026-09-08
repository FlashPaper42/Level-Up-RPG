/**
 * Browser persistence for local profiles.
 *
 * Saves are intentionally device-local until a hosted account service exists.
 * Callers receive a boolean result so storage quota and privacy-mode failures
 * can be surfaced by the UI instead of being mistaken for successful saves.
 */

const PROFILE_KEY = profileId => `heroSkills_v23_p${profileId}`;
const LEGACY_PROFILE_KEY = 'heroSkills_v23';
const SETTINGS_KEYS = {
  currentProfile: 'currentProfile_v1',
  profileNames: 'heroProfileNames_v1',
  parentStatus: 'heroParentStatus_v1',
  pinCodes: 'heroProfilePins_v1',
};

const defaults = {
  currentProfile: 1,
  profileNames: { 1: 'Player 1', 2: 'Player 2', 3: 'Player 3' },
  parentStatus: { 1: false, 2: false, 3: false },
  pinCodes: { 1: null, 2: null, 3: null },
};

const storage = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
};

const readJson = (key, fallback = null) => {
  try {
    const store = storage();
    if (!store) return fallback;
    const value = store.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.warn(`Failed to read saved data for ${key}:`, error);
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    const store = storage();
    if (!store) return false;
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save data for ${key}:`, error);
    return false;
  }
};

const validProfileId = profileId => [1, 2, 3].includes(Number(profileId));
const validProfileData = data => data && typeof data === 'object' && !Array.isArray(data);
const validNames = names => names && typeof names === 'object' &&
  [1, 2, 3].every(id => typeof names[id] === 'string' && names[id].trim().length > 0);
const validParentStatus = status => status && typeof status === 'object' &&
  [1, 2, 3].every(id => typeof status[id] === 'boolean');
const validPins = pins => pins && typeof pins === 'object' &&
  [1, 2, 3].every(id => pins[id] === null || /^\d{4}$/.test(pins[id]));

export const loadProfileData = async profileId => {
  if (!validProfileId(profileId)) return null;
  const saved = readJson(PROFILE_KEY(profileId), profileId === 1 ? readJson(LEGACY_PROFILE_KEY) : null);
  return validProfileData(saved) ? saved : null;
};

export const saveProfileData = async (profileId, data) => {
  if (!validProfileId(profileId) || !validProfileData(data)) return false;
  const saved = writeJson(PROFILE_KEY(profileId), data);
  if (saved && profileId === 1) {
    writeJson(LEGACY_PROFILE_KEY, data);
  }
  return saved;
};

export const loadProfileSettings = async () => {
  const currentProfile = Number(readJson(SETTINGS_KEYS.currentProfile, defaults.currentProfile));
  const profileNames = readJson(SETTINGS_KEYS.profileNames);
  const parentStatus = readJson(SETTINGS_KEYS.parentStatus);
  const legacyPins = readJson('heroPinCodes_v1');
  const pinCodes = readJson(SETTINGS_KEYS.pinCodes, legacyPins);
  return {
    currentProfile: validProfileId(currentProfile) ? currentProfile : defaults.currentProfile,
    profileNames: validNames(profileNames) ? profileNames : defaults.profileNames,
    parentStatus: validParentStatus(parentStatus) ? parentStatus : defaults.parentStatus,
    pinCodes: validPins(pinCodes) ? pinCodes : defaults.pinCodes,
  };
};

export const saveProfileSettings = async settings => {
  let saved = true;
  Object.entries(SETTINGS_KEYS).forEach(([name, key]) => {
    if (settings[name] !== undefined) {
      const value = name === 'currentProfile' ? String(settings[name]) : settings[name];
      try {
        const store = storage();
        if (!store) throw new Error('Browser storage is unavailable');
        store.setItem(key, name === 'currentProfile' ? value : JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to save setting ${name}:`, error);
        saved = false;
      }
    }
  });
  return saved;
};

export const clearCache = () => {
  const store = storage();
  if (!store) return false;
  try {
    Object.keys(store).filter(key => key.startsWith('heroSkills_')).forEach(key => store.removeItem(key));
    return true;
  } catch {
    return false;
  }
};
