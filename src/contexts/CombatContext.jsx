import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const CombatContext = createContext();

export const useCombat = () => {
    const context = useContext(CombatContext);
    if (!context) {
        throw new Error('useCombat must be used within a CombatProvider');
    }
    return context;
};

export const CombatProvider = ({ children }) => {
    // --- State ---
    const [battlingSkillId, setBattlingSkillId] = useState(null);
    const [battleDifficulty, setBattleDifficulty] = useState(null);
    const [playerHealth, setPlayerHealth] = useState(10);
    const [actionPoints, setActionPoints] = useState(0);
    const [armorPoints, setArmorPoints] = useState(0);
    const [mobAttacking, setMobAttacking] = useState(null);
    const [mobNextAction, setMobNextAction] = useState(null);
    const [playerDamageIndicator, setPlayerDamageIndicator] = useState(null);
    const [showDeathOverlay, setShowDeathOverlay] = useState(false);

    // Refs for safe access in timeouts
    const battlingSkillIdRef = useRef(null);

    // --- Actions ---
    const startBattle = (skillId, difficulty) => {
        setBattlingSkillId(skillId);
        battlingSkillIdRef.current = skillId;
        setBattleDifficulty(difficulty);
        setPlayerHealth(10);
        setActionPoints(0);
        setArmorPoints(0);
        setShowDeathOverlay(false);
        setMobNextAction(null);
    };

    const endBattle = () => {
        setBattlingSkillId(null);
        battlingSkillIdRef.current = null;
        setMobAttacking(null);
        setMobNextAction(null);
        // Resetting points usually happens on end
        setActionPoints(0);
        setArmorPoints(0);
        setBattleDifficulty(null);
    };

    const updatePlayerHealth = (updater) => setPlayerHealth(updater);
    const updateActionPoints = (updater) => setActionPoints(updater);
    const updateArmorPoints = (updater) => setArmorPoints(updater);

    // This context doesn't handle the *logic* of combat (e.g. calculating damage),
    // it just holds the state. The logic often requires Skills data (ProgressionContext).
    // So the 'handleCombatAction' function will likely live in a hook or App.jsx 
    // that connects Progression and Combat contexts together. Or we import useProgression inside here?
    // Important: Combining contexts can lead to dependency cycles if not careful.
    // Ideally, CombatContext is leaf-node for state, and a logic hook orchestrates them.

    // However, App.jsx has `handleCombatAction`.
    // We will keep the state here.

    const value = {
        battlingSkillId,
        battlingSkillIdRef,
        battleDifficulty,
        startBattle,
        endBattle,
        setBattlingSkillId, // Exposed for App.jsx functional updates
        setBattleDifficulty, // Exposed for App.jsx

        playerHealth,
        updatePlayerHealth, // Exposed Setter
        setPlayerHealth,    // Raw setter if needed

        actionPoints,
        updateActionPoints,
        setActionPoints,

        armorPoints,
        updateArmorPoints,
        setArmorPoints,

        mobAttacking,
        setMobAttacking,

        mobNextAction,
        setMobNextAction,

        playerDamageIndicator,
        setPlayerDamageIndicator,

        showDeathOverlay,
        setShowDeathOverlay
    };

    return (
        <CombatContext.Provider value={value}>
            {children}
        </CombatContext.Provider>
    );
};

export default CombatContext;
