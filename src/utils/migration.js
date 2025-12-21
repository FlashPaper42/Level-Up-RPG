/**
 * Migration utility to move localStorage data to file system in Electron
 */

import { loadProfileData, saveProfileData, loadProfileSettings, saveProfileSettings } from './storage';

// Check if we're in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electron && window.electron.isElectron;
};

/**
 * Migrate localStorage data to file system (Electron only)
 * This should be called once on app startup
 */
export const migrateLocalStorageToFiles = async () => {
  if (!isElectron()) {
    return; // Only migrate in Electron
  }

  try {
    // Check if migration has already been done
    const migrationKey = 'localStorage_migrated_to_files_v1';
    const alreadyMigrated = localStorage.getItem(migrationKey);
    
    if (alreadyMigrated === 'true') {
      return; // Already migrated
    }

    console.log('Starting migration from localStorage to file system...');

    // Migrate profile settings
    const currentProfile = localStorage.getItem('currentProfile_v1');
    const profileNames = localStorage.getItem('heroProfileNames_v1');
    const parentStatus = localStorage.getItem('heroParentStatus_v1');

    if (currentProfile || profileNames || parentStatus) {
      const settings = {
        currentProfile: currentProfile ? parseInt(currentProfile, 10) : 1,
        profileNames: profileNames ? JSON.parse(profileNames) : { 1: "Player 1", 2: "Player 2", 3: "Player 3" },
        parentStatus: parentStatus ? JSON.parse(parentStatus) : { 1: false, 2: false, 3: false }
      };
      await saveProfileSettings(settings);
      console.log('Migrated profile settings');
    }

    // Migrate profile data for each profile (1-3)
    for (let profileId = 1; profileId <= 3; profileId++) {
      const key = `heroSkills_v23_p${profileId}`;
      let saved = localStorage.getItem(key);
      
      // Also check old key for profile 1
      if (!saved && profileId === 1) {
        saved = localStorage.getItem('heroSkills_v23');
      }

      if (saved) {
        try {
          const data = JSON.parse(saved);
          await saveProfileData(profileId, data);
          console.log(`Migrated profile ${profileId} data`);
        } catch (e) {
          console.warn(`Failed to migrate profile ${profileId}:`, e);
        }
      }
    }

    // Mark migration as complete
    localStorage.setItem(migrationKey, 'true');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't mark as migrated if it failed, so it can retry
  }
};

