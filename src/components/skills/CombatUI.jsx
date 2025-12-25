/**
 * CombatUI - Shared Combat Interface Component
 * 
 * Provides reusable UI elements for combat skill cards:
 * - Mob display with aura effects
 * - HP/Armor bars
 * - Action buttons (ATTACK/DEFEND/SPECIAL/HEAL)
 * - Challenge display area
 * - Damage number popups
 */

import React from 'react';
import { Shield, Sword, Heart, Zap } from 'lucide-react';
import MobWithAura from '../ui/MobWithAura';
import SafeImage from '../ui/SafeImage';
import PixelShield from '../ui/PixelShield';
import { AURA_ADJECTIVES } from '../../utils/mobDisplayUtils';
import { playClick } from '../../utils/soundManager';

// Combat action button component
const ActionButton = ({
    action,
    icon: Icon,
    label,
    color,
    isSelected,
    isDisabled,
    cost,
    onClick
}) => {
    const baseClasses = "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer";
    const selectedClasses = isSelected
        ? "ring-2 ring-yellow-400 scale-105 brightness-110"
        : "hover:scale-105 hover:brightness-110";
    const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : "";

    return (
        <button
            onClick={() => {
                if (!isDisabled) {
                    playClick();
                    onClick(action);
                }
            }}
            disabled={isDisabled}
            className={`${baseClasses} ${selectedClasses} ${disabledClasses} ${color}`}
            title={`${label} (${cost} AP)`}
        >
            <Icon size={20} className="mb-1" />
            <span className="text-xs font-bold uppercase">{label}</span>
            <span className="text-[10px] text-slate-300">{cost} AP</span>
        </button>
    );
};

// HP/Armor bar component
export const HealthBar = ({ current, max, showArmor = false, armor = 0, label = "HP", size = "normal" }) => {
    const percent = Math.round((current / max) * 100);
    const heightClass = size === "small" ? "h-4" : "h-6";

    return (
        <div className="bg-[#1a1a1a] p-2 relative">
            <div className="flex justify-between text-gray-400 text-xs mb-1 uppercase">
                <span className="flex items-center gap-1">
                    {label}
                    {showArmor && armor > 0 && (
                        <span className="flex items-center text-cyan-400">
                            <PixelShield size={12} /> +{armor}
                        </span>
                    )}
                </span>
                <span>{current}/{max}</span>
            </div>
            <div className={`w-full ${heightClass} bg-[#333] rounded-full overflow-hidden border-2 border-[#555] relative`}>
                <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-200"
                    style={{ width: `${percent}%` }}
                />
                {showArmor && armor > 0 && (
                    <div
                        className="absolute top-0 right-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400 opacity-80"
                        style={{ width: `${Math.min(100, (armor / max) * 100)}%` }}
                    />
                )}
            </div>
        </div>
    );
};

// Mob display component with optional aura
export const MobDisplay = ({
    mobSrc,
    mobName,
    mobAura,
    isHit,
    bossHealing,
    mobAttacking,
    damageNumbers = [],
    size = "100%"
}) => {
    const displayName = mobAura && AURA_ADJECTIVES[mobAura]
        ? `${AURA_ADJECTIVES[mobAura]} ${mobName}`
        : mobName;

    // Animation classes based on state
    const getAnimation = () => {
        if (isHit) return 'animate-knockback';
        if (bossHealing) return 'animate-shake brightness-150 hue-rotate-90';
        if (mobAttacking) return 'animate-action';
        return 'animate-bob';
    };

    return (
        <div className="relative flex items-center justify-center h-full w-full">
            {mobAura ? (
                <MobWithAura
                    mobSrc={mobSrc}
                    aura={mobAura}
                    displayName={displayName}
                    size={size}
                    isHit={isHit}
                    bossHealing={bossHealing}
                />
            ) : (
                <SafeImage
                    src={mobSrc}
                    alt={mobName}
                    className={`max-w-full max-h-full object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-transform duration-100 ${getAnimation()}`}
                />
            )}

            {/* Damage numbers */}
            {damageNumbers.map(dmg => (
                <div
                    key={dmg.id}
                    className="absolute text-5xl font-bold text-red-500 animate-bounce pointer-events-none whitespace-nowrap"
                    style={{
                        left: `calc(50% + ${dmg.x}px)`,
                        top: `calc(50% + ${dmg.y}px)`,
                        textShadow: '2px 2px 0 #000'
                    }}
                >
                    -{dmg.val}
                </div>
            ))}

            {/* Mob name badge */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-1 rounded-full text-white border border-white/30 text-base font-bold z-10">
                {displayName}
            </div>
        </div>
    );
};

// Action button panel for combat
export const CombatActionPanel = ({
    selectedAction,
    onSelectAction,
    actionPoints,
    armorPoints,
    disabled = false
}) => {
    const actions = [
        { id: 'attack', icon: Sword, label: 'Attack', cost: 1, color: 'bg-red-700/80 border-red-500 text-red-100' },
        { id: 'defend', icon: Shield, label: 'Defend', cost: 1, color: 'bg-blue-700/80 border-blue-500 text-blue-100' },
        { id: 'special', icon: Zap, label: 'Special', cost: 3, color: 'bg-purple-700/80 border-purple-500 text-purple-100' },
        { id: 'heal', icon: Heart, label: 'Heal', cost: 2, color: 'bg-green-700/80 border-green-500 text-green-100' }
    ];

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-yellow-400 font-bold">
                    AP: {actionPoints}
                </span>
                {armorPoints > 0 && (
                    <span className="text-cyan-400 flex items-center gap-1">
                        <PixelShield size={14} /> {armorPoints}
                    </span>
                )}
            </div>
            <div className="grid grid-cols-4 gap-2">
                {actions.map(action => (
                    <ActionButton
                        key={action.id}
                        action={action.id}
                        icon={action.icon}
                        label={action.label}
                        color={action.color}
                        cost={action.cost}
                        isSelected={selectedAction === action.id}
                        isDisabled={disabled || actionPoints < action.cost}
                        onClick={onSelectAction}
                    />
                ))}
            </div>
        </div>
    );
};

// Challenge display component
export const ChallengeDisplay = ({
    challenge,
    isWrong,
    children,
    className = ""
}) => {
    const borderClass = isWrong
        ? 'border-red-500 bg-red-900/30 animate-shake'
        : 'border-[#555]';

    return (
        <div className={`flex-1 bg-black/40 rounded border-2 flex flex-col items-center justify-center p-4 ${borderClass} ${className}`}>
            {children}
        </div>
    );
};

// Complete combat card layout wrapper
const CombatUI = ({
    // Mob data
    mobSrc,
    mobName,
    mobAura,
    mobHealth,
    mobMaxHealth,
    mobArmor = 0,

    // Player state
    playerHealth,
    actionPoints,
    armorPoints,

    // Combat state
    isHit,
    bossHealing,
    mobAttacking,
    damageNumbers,
    selectedAction,

    // Handlers
    onSelectAction,

    // Challenge content (rendered as children)
    children
}) => {
    console.log('[CombatUI] Rendering combat interface');

    return (
        <div className="flex flex-col h-full gap-3 p-2">
            {/* Mob Section */}
            <div className="flex-shrink-0 h-[35%] relative rounded-lg overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900">
                <MobDisplay
                    mobSrc={mobSrc}
                    mobName={mobName}
                    mobAura={mobAura}
                    isHit={isHit}
                    bossHealing={bossHealing}
                    mobAttacking={mobAttacking}
                    damageNumbers={damageNumbers}
                />
            </div>

            {/* Mob HP Bar */}
            <HealthBar
                current={mobHealth}
                max={mobMaxHealth}
                showArmor={true}
                armor={mobArmor}
                label="Enemy HP"
            />

            {/* Challenge Area */}
            <div className="flex-1 min-h-0">
                {children}
            </div>

            {/* Action Panel */}
            <div className="flex-shrink-0">
                <CombatActionPanel
                    selectedAction={selectedAction}
                    onSelectAction={onSelectAction}
                    actionPoints={actionPoints}
                    armorPoints={armorPoints}
                />
            </div>
        </div>
    );
};

export default CombatUI;
