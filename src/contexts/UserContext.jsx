import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    // --- State Initialization ---
    // Safely load from localStorage or fall back to defaults
    const [currentProfile, setCurrentProfile] = useState(() => {
        try {
            return localStorage.getItem('currentProfile_v1') ? parseInt(localStorage.getItem('currentProfile_v1')) : 1;
        } catch (e) { console.error(e); return 1; }
    });

    const [profileNames, setProfileNames] = useState(() => {
        try {
            return localStorage.getItem('heroProfileNames_v1') ? JSON.parse(localStorage.getItem('heroProfileNames_v1')) : { 1: "Player 1", 2: "Player 2", 3: "Player 3" };
        } catch (e) { console.error(e); return { 1: "Player 1", 2: "Player 2", 3: "Player 3" }; }
    });

    const [parentStatus, setParentStatus] = useState(() => {
        try {
            return localStorage.getItem('heroParentStatus_v1') ? JSON.parse(localStorage.getItem('heroParentStatus_v1')) : { 1: false, 2: false, 3: false };
        } catch (e) { console.error(e); return { 1: false, 2: false, 3: false }; }
    });

    // Profile PINs for account protection (4-digit codes)
    const [profilePins, setProfilePins] = useState(() => {
        try {
            return localStorage.getItem('heroProfilePins_v1') ? JSON.parse(localStorage.getItem('heroProfilePins_v1')) : { 1: null, 2: null, 3: null };
        } catch (e) { console.error(e); return { 1: null, 2: null, 3: null }; }
    });

    // Theme state (Managed here as it's user-specific preference)
    // Note: In App.jsx this was loaded from 'heroSkills_v23_pX' but that mixes progression with settings.
    // For now, we will expose the activeTheme state, but the actual LOADING might still need to depend on 
    // progression data if we strictly follow the legacy storage format.
    // However, to decouple, we'll maintain a local state here that App.jsx can initialize/sync.
    const [activeTheme, setActiveTheme] = useState('minecraft');

    // --- Effects ---
    // Persist basic profile data
    useEffect(() => {
        localStorage.setItem('currentProfile_v1', currentProfile);
    }, [currentProfile]);

    useEffect(() => {
        localStorage.setItem('heroProfileNames_v1', JSON.stringify(profileNames));
    }, [profileNames]);

    useEffect(() => {
        localStorage.setItem('heroParentStatus_v1', JSON.stringify(parentStatus));
    }, [parentStatus]);

    useEffect(() => {
        localStorage.setItem('heroProfilePins_v1', JSON.stringify(profilePins));
    }, [profilePins]);

    // --- Actions ---
    const updateProfileName = (id, name) => {
        setProfileNames(prev => ({ ...prev, [id]: name }));
    };

    const toggleParentStatus = (id) => {
        setParentStatus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // PIN management functions
    const setProfilePin = (id, pin) => {
        // Pin should be 4 digits or null to clear
        if (pin === null || (typeof pin === 'string' && /^\d{4}$/.test(pin))) {
            setProfilePins(prev => ({ ...prev, [id]: pin }));
            return true;
        }
        return false;
    };

    const verifyProfilePin = (id, pin) => {
        const savedPin = profilePins[id];
        if (!savedPin) return true; // No PIN set, always allow
        return savedPin === pin;
    };

    const clearProfilePin = (id) => {
        setProfilePins(prev => ({ ...prev, [id]: null }));
    };

    const hasProfilePin = (id) => {
        return profilePins[id] !== null;
    };

    // --- Cosmetics State ---
    const [selectedBorder, setSelectedBorder] = useState('solid');
    const [borderColor, setBorderColor] = useState('#FFD700');
    const [selectedAvatar, setSelectedAvatar] = useState('person');
    const [profileBgColor, setProfileBgColor] = useState('linear-gradient(to bottom, #7e22ce, #581c87)');

    // Sync cosmetics when currentProfile changes
    useEffect(() => {
        const savedBorder = localStorage.getItem(`borderEffect_p${currentProfile}`) || 'solid';
        const savedColor = localStorage.getItem(`borderColor_p${currentProfile}`) || '#FFD700';
        const savedAvatar = localStorage.getItem(`profileAvatar_p${currentProfile}`) || 'person';
        const savedBgColor = localStorage.getItem(`profileBgColor_p${currentProfile}`) || 'linear-gradient(to bottom, #7e22ce, #581c87)';

        setSelectedBorder(savedBorder);
        setBorderColor(savedColor);
        setSelectedAvatar(savedAvatar);
        setProfileBgColor(savedBgColor);
    }, [currentProfile]);

    // Persist Cosmetics
    useEffect(() => { localStorage.setItem(`borderEffect_p${currentProfile}`, selectedBorder); }, [selectedBorder, currentProfile]);
    useEffect(() => { localStorage.setItem(`borderColor_p${currentProfile}`, borderColor); }, [borderColor, currentProfile]);
    useEffect(() => { localStorage.setItem(`profileAvatar_p${currentProfile}`, selectedAvatar); }, [selectedAvatar, currentProfile]);
    useEffect(() => { localStorage.setItem(`profileBgColor_p${currentProfile}`, profileBgColor); }, [profileBgColor, currentProfile]);

    const switchProfile = (id) => {
        setCurrentProfile(id);
    };

    const value = {
        currentProfile,
        profileNames,
        parentStatus,
        profilePins,
        activeTheme,
        setActiveTheme, // Exposed for App.jsx to sync with legacy load logic for now
        updateProfileName,
        toggleParentStatus,
        switchProfile,
        // PIN management
        setProfilePin,
        verifyProfilePin,
        clearProfilePin,
        hasProfilePin,
        // Cosmetics
        selectedBorder, setSelectedBorder,
        borderColor, setBorderColor,
        selectedAvatar, setSelectedAvatar,
        profileBgColor, setProfileBgColor
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
