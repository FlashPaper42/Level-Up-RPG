import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Unlock, Key } from 'lucide-react';

/**
 * PIN Modal - For entering or setting a 4-digit PIN
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Called when modal is closed
 * @param {string} mode - 'enter' (verify PIN) or 'set' (create new PIN) or 'reset' (parent reset)
 * @param {function} onSubmit - Called with the PIN when submitted
 * @param {string} profileName - Name of the profile for display
 * @param {boolean} error - Whether to show error state
 */
const PinModal = ({ isOpen, onClose, mode = 'enter', onSubmit, profileName = 'Profile', error = false }) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [step, setStep] = useState(1); // 1 = enter, 2 = confirm (for 'set' mode)
    const [localError, setLocalError] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];
    const confirmRefs = [useRef(), useRef(), useRef(), useRef()];

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '']);
            setConfirmPin(['', '', '', '']);
            setStep(1);
            setLocalError(false);
            setTimeout(() => inputRefs[0].current?.focus(), 100);
        }
    }, [isOpen]);

    // Show error effect
    useEffect(() => {
        if (error) {
            setLocalError(true);
            setPin(['', '', '', '']);
            setTimeout(() => {
                setLocalError(false);
                inputRefs[0].current?.focus();
            }, 500);
        }
    }, [error]);

    const handleDigitChange = (index, value, isConfirm = false) => {
        const digit = value.replace(/[^0-9]/g, '').slice(-1);
        const refs = isConfirm ? confirmRefs : inputRefs;
        const setter = isConfirm ? setConfirmPin : setPin;
        const current = isConfirm ? confirmPin : pin;
        
        setter(prev => {
            const newPin = [...prev];
            newPin[index] = digit;
            return newPin;
        });

        // Move to next input
        if (digit && index < 3) {
            refs[index + 1].current?.focus();
        }

        // Check if all digits entered
        const newPin = [...current];
        newPin[index] = digit;
        if (newPin.every(d => d !== '')) {
            const fullPin = newPin.join('');
            
            if (mode === 'set' && !isConfirm && step === 1) {
                // Move to confirm step
                setTimeout(() => {
                    setStep(2);
                    setConfirmPin(['', '', '', '']);
                    setTimeout(() => confirmRefs[0].current?.focus(), 100);
                }, 200);
            } else if (mode === 'set' && isConfirm) {
                // Check if PINs match
                const originalPin = pin.join('');
                if (fullPin === originalPin) {
                    onSubmit(fullPin);
                } else {
                    setLocalError(true);
                    setConfirmPin(['', '', '', '']);
                    setTimeout(() => {
                        setLocalError(false);
                        confirmRefs[0].current?.focus();
                    }, 500);
                }
            } else {
                // Enter mode - submit directly
                onSubmit(fullPin);
            }
        }
    };

    const handleKeyDown = (index, e, isConfirm = false) => {
        const refs = isConfirm ? confirmRefs : inputRefs;
        const current = isConfirm ? confirmPin : pin;
        const setter = isConfirm ? setConfirmPin : setPin;

        if (e.key === 'Backspace' && !current[index] && index > 0) {
            refs[index - 1].current?.focus();
            setter(prev => {
                const newPin = [...prev];
                newPin[index - 1] = '';
                return newPin;
            });
        }
    };

    if (!isOpen) return null;

    const getTitle = () => {
        switch (mode) {
            case 'set': return step === 1 ? 'Create PIN' : 'Confirm PIN';
            case 'reset': return 'Reset PIN';
            default: return `Enter PIN for ${profileName}`;
        }
    };

    const getIcon = () => {
        switch (mode) {
            case 'set': return <Key size={32} className="text-yellow-400" />;
            case 'reset': return <Unlock size={32} className="text-red-400" />;
            default: return <Lock size={32} className="text-blue-400" />;
        }
    };

    const getDescription = () => {
        switch (mode) {
            case 'set': 
                return step === 1 
                    ? 'Enter a 4-digit PIN to protect your profile from siblings!' 
                    : 'Enter the same PIN again to confirm';
            case 'reset': return 'Enter a new PIN for this profile';
            default: return 'This profile is protected. Enter the 4-digit PIN to continue.';
        }
    };

    const renderPinInputs = (isConfirm = false) => {
        const current = isConfirm ? confirmPin : pin;
        const refs = isConfirm ? confirmRefs : inputRefs;
        
        return (
            <div className="flex gap-3 justify-center">
                {[0, 1, 2, 3].map(index => (
                    <input
                        key={index}
                        ref={refs[index]}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={current[index]}
                        onChange={(e) => handleDigitChange(index, e.target.value, isConfirm)}
                        onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
                        className={`w-16 h-20 text-center text-4xl font-bold bg-slate-800 border-4 rounded-xl focus:outline-none transition-all ${
                            localError 
                                ? 'border-red-500 animate-shake' 
                                : current[index] 
                                    ? 'border-yellow-400' 
                                    : 'border-slate-600 focus:border-blue-400'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className={`relative bg-slate-900 border-4 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all ${
                localError ? 'border-red-500 animate-shake' : 'border-yellow-400'
            }`}>
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        {getIcon()}
                    </div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
                        {getTitle()}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {getDescription()}
                    </p>
                </div>

                {mode === 'set' && step === 2 ? renderPinInputs(true) : renderPinInputs(false)}

                {localError && (
                    <p className="text-center text-red-400 mt-4 text-sm font-bold">
                        {mode === 'set' ? "PINs don't match! Try again." : 'Incorrect PIN!'}
                    </p>
                )}

                {mode === 'set' && (
                    <div className="flex justify-center gap-2 mt-6">
                        <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-yellow-400' : 'bg-slate-600'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-yellow-400' : 'bg-slate-600'}`}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PinModal;

