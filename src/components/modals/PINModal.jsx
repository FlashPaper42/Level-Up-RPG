import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, KeyRound } from 'lucide-react';

/**
 * PIN Verification Modal
 * Used when switching to profiles that have a PIN set
 */
const PINModal = ({ isOpen, onClose, onSubmit, profileName, isSettingPin = false }) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1 = enter, 2 = confirm (for setting)
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const confirmInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '']);
            setConfirmPin(['', '', '', '']);
            setError('');
            setStep(1);
            setTimeout(() => inputRefs[0].current?.focus(), 100);
        }
    }, [isOpen]);

    const handleDigitChange = (index, value, isConfirm = false) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newPin = isConfirm ? [...confirmPin] : [...pin];
        newPin[index] = value.slice(-1); // Only keep last digit
        isConfirm ? setConfirmPin(newPin) : setPin(newPin);
        setError('');

        // Auto-focus next input
        if (value && index < 3) {
            const refs = isConfirm ? confirmInputRefs : inputRefs;
            refs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index, e, isConfirm = false) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            const refs = isConfirm ? confirmInputRefs : inputRefs;
            refs[index - 1].current?.focus();
        }
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        const enteredPin = pin.join('');

        if (enteredPin.length !== 4) {
            setError('Please enter all 4 digits');
            return;
        }

        if (isSettingPin) {
            if (step === 1) {
                // Move to confirmation step
                setStep(2);
                setTimeout(() => confirmInputRefs[0].current?.focus(), 100);
                return;
            }

            // Verify confirmation matches
            const confirmedPin = confirmPin.join('');
            if (enteredPin !== confirmedPin) {
                setError('PINs do not match');
                setConfirmPin(['', '', '', '']);
                setTimeout(() => confirmInputRefs[0].current?.focus(), 100);
                return;
            }
        }

        onSubmit(enteredPin);
    };

    const handleClear = () => {
        if (isSettingPin) {
            // When setting PIN, "Clear" removes the PIN
            onSubmit(null);
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    const renderPinInputs = (currentPin, isConfirm = false) => (
        <div className="flex gap-3 justify-center">
            {currentPin.map((digit, index) => (
                <input
                    key={index}
                    ref={isConfirm ? confirmInputRefs[index] : inputRefs[index]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value, isConfirm)}
                    onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
                    className="w-14 h-14 text-center text-2xl font-bold bg-slate-800 border-2 border-slate-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition-colors"
                    style={{ fontFamily: '"VT323", monospace' }}
                />
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 border-yellow-400 rounded-2xl p-6 w-[380px] shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-400/20">
                            {isSettingPin ? <KeyRound className="text-yellow-400" size={24} /> : <Lock className="text-yellow-400" size={24} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-yellow-400" style={{ fontFamily: '"VT323", monospace' }}>
                                {isSettingPin ? 'Set Profile PIN' : 'Profile PIN Required'}
                            </h2>
                            <p className="text-sm text-slate-400">{profileName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        <X className="text-slate-400" size={20} />
                    </button>
                </div>

                {/* Instructions */}
                <p className="text-center text-slate-300 mb-6">
                    {isSettingPin
                        ? (step === 1 ? 'Enter a 4-digit PIN to protect this profile' : 'Confirm your PIN')
                        : 'Enter the 4-digit PIN to access this profile'
                    }
                </p>

                {/* PIN Input */}
                {step === 1 && renderPinInputs(pin)}
                {step === 2 && isSettingPin && (
                    <>
                        <p className="text-center text-slate-400 text-sm mb-4">Confirm your PIN:</p>
                        {renderPinInputs(confirmPin, true)}
                    </>
                )}

                {/* Error Message */}
                {error && (
                    <p className="text-center text-red-400 mt-4 text-sm">{error}</p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleClear}
                        className="flex-1 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold transition-colors"
                    >
                        {isSettingPin ? 'Remove PIN' : 'Cancel'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-colors"
                    >
                        {isSettingPin && step === 1 ? 'Next' : 'Confirm'}
                    </button>
                </div>

                {/* Parent Override Hint */}
                {!isSettingPin && (
                    <p className="text-center text-slate-500 text-xs mt-4">
                        Forgot PIN? A parent account can reset it.
                    </p>
                )}
            </div>
        </div>
    );
};

export default PINModal;
