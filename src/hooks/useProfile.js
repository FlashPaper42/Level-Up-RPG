import { useState, useEffect, useCallback } from 'react';

// Helper for safe storage access
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

const safeSet = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`[useProfile] Failed to save ${key}`, e);
    }
};

export const useProfile = () => {
    // Current Profile ID (1-3)
    const [currentProfile, setCurrentProfileState] = useState(() => {
        try {
            const saved = localStorage.getItem('currentProfile_v1');
            return saved ? parseInt(saved, 10) : 1;
        } catch (e) {
            return 1;
        }
    });

    // Profile Names
    const [profileNames, setProfileNames] = useState(() =>
        safeGet('heroProfileNames_v1', { 1: "Player 1", 2: "Player 2", 3: "Player 3" })
    );

    // Parent Status
    const [parentStatus, setParentStatus] = useState(() =>
        safeGet('heroParentStatus_v1', { 1: false, 2: false, 3: false })
    );

    // Persistence Effect
    useEffect(() => {
        try {
            localStorage.setItem('currentProfile_v1', currentProfile.toString());
            safeSet('heroProfileNames_v1', profileNames);
            safeSet('heroParentStatus_v1', parentStatus);
        } catch (e) {
            console.warn('[useProfile] Failed to persist state', e);
        }
    }, [currentProfile, profileNames, parentStatus]);

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

    return {
        currentProfile,
        setCurrentProfile,
        profileNames,
        setProfileNames, // Export raw setter if needed by legacy code, or prefer updateProfileName
        updateProfileName,
        parentStatus,
        setParentStatus,
        toggleParentStatus
    };
};
