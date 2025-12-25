import { useState, useEffect, useCallback } from 'react';
import { loadProfileSettings, saveProfileSettings } from '../utils/storage';

// Helper for safe storage access (fallback for sync access)
const safeGet = (key, fallback) => {
    try {
        const saved = localStorage.getItem(key);
        if (!saved) return fallback;
        return JSON.parse(saved);
    } catch (e) {
        console.warn(`[useProfile] Failed to load ${key}`, e);
        return fallback;
    }
};

export const useProfile = () => {
    // Initialize with sync fallback, then load async
    const [currentProfile, setCurrentProfileState] = useState(() => {
        try {
            const saved = localStorage.getItem('currentProfile_v1');
            return saved ? parseInt(saved, 10) : 1;
        } catch (e) {
            return 1;
        }
    });

    const [profileNames, setProfileNames] = useState(() =>
        safeGet('heroProfileNames_v1', { 1: "Player 1", 2: "Player 2", 3: "Player 3" })
    );

    const [parentStatus, setParentStatus] = useState(() =>
        safeGet('heroParentStatus_v1', { 1: false, 2: false, 3: false })
    );

    const [pinCodes, setPinCodes] = useState(() =>
        safeGet('heroPinCodes_v1', { 1: null, 2: null, 3: null })
    );

    const [isLoading, setIsLoading] = useState(true);

    // Load settings asynchronously on mount
    useEffect(() => {
        let isMounted = true;

        const loadSettings = async () => {
            try {
                const settings = await loadProfileSettings();
                if (isMounted) {
                    setCurrentProfileState(settings.currentProfile);
                    setProfileNames(settings.profileNames);
                    setParentStatus(settings.parentStatus);
                    setPinCodes(settings.pinCodes || { 1: null, 2: null, 3: null });
                    setIsLoading(false);
                }
            } catch (error) {
                console.warn('[useProfile] Failed to load settings:', error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadSettings();

        return () => {
            isMounted = false;
        };
    }, []);

    // Persistence Effect (debounced)
    useEffect(() => {
        if (isLoading) return; // Don't save during initial load

        const timeoutId = setTimeout(() => {
            saveProfileSettings({
                currentProfile,
                profileNames,
                parentStatus,
                pinCodes
            });
        }, 500); // Debounce saves by 500ms

        return () => clearTimeout(timeoutId);
    }, [currentProfile, profileNames, parentStatus, pinCodes, isLoading]);

    // Helpers
    const setCurrentProfile = useCallback((id) => {
        if (id >= 1 && id <= 3) setCurrentProfileState(id);
    }, []);

    const updateProfileName = useCallback((id, name) => {
        setProfileNames(prev => ({ ...prev, [id]: name }));
    }, []);

    const toggleParentStatus = useCallback((id) => {
        setParentStatus(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    // PIN management helpers
    const setPinCode = useCallback((id, pin) => {
        console.log(`[useProfile] Setting PIN for profile ${id}: ${pin ? '****' : 'cleared'}`);
        setPinCodes(prev => ({ ...prev, [id]: pin }));
    }, []);

    const verifyPin = useCallback((id, enteredPin) => {
        const storedPin = pinCodes[id];
        if (!storedPin) return true; // No PIN set, always allow
        return storedPin === enteredPin;
    }, [pinCodes]);

    const hasPin = useCallback((id) => {
        return pinCodes[id] !== null && pinCodes[id] !== '';
    }, [pinCodes]);

    return {
        currentProfile,
        setCurrentProfile,
        profileNames,
        setProfileNames, // Export raw setter if needed by legacy code, or prefer updateProfileName
        updateProfileName,
        parentStatus,
        setParentStatus,
        toggleParentStatus,
        pinCodes,
        setPinCodes,
        setPinCode,
        verifyPin,
        hasPin,
        isLoading
    };
};
