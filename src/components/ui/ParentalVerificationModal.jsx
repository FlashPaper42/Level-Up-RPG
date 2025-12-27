import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Save, X } from 'lucide-react';

const ParentalVerificationModal = ({ isOpen, onClose, onVerified }) => {
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState(false);
    const correctAnswer = 'FLOPPY DISK';
    const correctAnswerNoSpaces = correctAnswer.replace(/\s/g, '');
    const inputRef = React.useRef(null);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Compare without spaces for validation
        if (answer.toUpperCase() === correctAnswerNoSpaces) {
            onVerified();
            setAnswer('');
            setError(false);
        } else {
            setError(true);
        }
    };

    const handleClose = () => {
        setAnswer('');
        setError(false);
        onClose();
    };

    const handleInputChange = (e) => {
        // Convert to uppercase and remove spaces from input
        const val = e.target.value.toUpperCase().replace(/\s/g, '');
        if (val.length <= correctAnswerNoSpaces.length) {
            setAnswer(val);
            setError(false);
            
            // Auto-submit when all characters are filled
            if (val.length === correctAnswerNoSpaces.length) {
                if (val === correctAnswerNoSpaces) {
                    onVerified();
                    setAnswer('');
                    setError(false);
                } else {
                    setError(true);
                }
            }
        }
    };

    const handleSlotClick = () => {
        inputRef.current?.focus();
    };

    // Get the input index for a given display index (accounting for spaces in correctAnswer)
    const getInputIndexForDisplay = (displayIndex) => {
        let inputIndex = 0;
        for (let i = 0; i < displayIndex; i++) {
            if (correctAnswer[i] !== ' ') {
                inputIndex++;
            }
        }
        return inputIndex;
    };

    // Get the display character (asterisk if filled, empty otherwise)
    const getDisplayChar = (displayIndex) => {
        const inputIndex = getInputIndexForDisplay(displayIndex);
        return inputIndex < answer.length ? '*' : '';
    };

    // Check if the slot at displayIndex is filled
    const isSlotFilled = (displayIndex) => {
        const inputIndex = getInputIndexForDisplay(displayIndex);
        return inputIndex < answer.length;
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose}></div>
            <div className="relative bg-stone-900 border-4 border-blue-600 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-600/20 p-6 rounded-full mb-4 border-2 border-blue-600">
                        <Save size={64} className="text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-blue-400 uppercase tracking-wider mb-4">What is this?</h2>
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="relative w-full flex justify-center mb-4" onClick={handleSlotClick}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={answer}
                                onChange={handleInputChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                autoFocus
                                maxLength={correctAnswerNoSpaces.length}
                            />
                            <div className={`flex gap-1 flex-wrap justify-center cursor-pointer ${error ? 'animate-shake' : ''}`}>
                                {correctAnswer.split('').map((char, i) => {
                                    if (char === ' ') return <div key={i} className="w-4"></div>;
                                    const inputIndex = getInputIndexForDisplay(i);
                                    const isFilled = isSlotFilled(i);
                                    const isActiveEmpty = inputIndex === answer.length;
                                    return (
                                        <div
                                            key={i}
                                            className={`w-7 h-9 border-b-4 flex items-center justify-center text-lg font-mono font-bold text-white bg-black/20 rounded-t ${
                                                error ? 'border-red-500 bg-red-900/30' : (
                                                    isFilled ? 'border-green-500' : 'border-gray-600'
                                                )
                                            } ${isActiveEmpty && !error ? 'animate-blink-box' : ''}`}
                                        >
                                            {getDisplayChar(i)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {error && <p className="text-red-400 text-sm mb-4">Incorrect answer. Try again!</p>}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-bold uppercase tracking-wider transition-all border-2 border-blue-400"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ParentalVerificationModal;
