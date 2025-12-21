import { useState, useRef, useEffect, useCallback } from 'react';
import { startAzureSpeechRecognition, stopAzureSpeechRecognition } from '../utils/azureSpeechRecognizer';
import { HOMOPHONES } from '../constants/gameData';

const MIN_SPOKEN_TEXT_LENGTH = 2;
const MIC_OFF_TEXT = "Mic Off";
const RECOGNITION_COOLDOWN_MS = 500; // Prevent rapid-fire recognitions

export const useAzureSpeech = ({
    battlingSkillId,
    challengeData,
    onSuccess,
    onFailure
}) => {
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState("");

    // Keep challenge data fresh for the callback closure
    const challengeDataRef = useRef(challengeData);
    const battlingSkillRef = useRef(battlingSkillId);
    const lastProcessedAnswerRef = useRef(null); // Track last successful answer to prevent carryover
    const lastRecognitionTimeRef = useRef(0); // Debounce recognition results
    const challengeIdRef = useRef(0); // Unique ID for each challenge to detect staleness
    const restartTimeoutRef = useRef(null); // Timeout for restarting recognition with new phrase
    const isListeningRef = useRef(isListening); // Ref to track listening state for async callbacks
    const onSuccessRef = useRef(onSuccess);
    const onFailureRef = useRef(onFailure);

    // Keep refs in sync with state/props
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);
    
    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onFailureRef.current = onFailure;
    }, [onSuccess, onFailure]);

    useEffect(() => {
        battlingSkillRef.current = battlingSkillId;
    }, [battlingSkillId]);

    // Helper function to stop and cleanup speech recognition
    const stopVoiceRecognition = useCallback(() => {
        stopAzureSpeechRecognition();
        setIsListening(false);
        setSpokenText(MIC_OFF_TEXT);
    }, []);

    // Internal function to start voice recognition (used for both initial start and restarts)
    const startVoiceListenerInternal = useCallback((targetId) => {
        // Stop any existing recognition
        stopAzureSpeechRecognition();

        console.log('[Speech Recognition] Initializing Azure for skill:', targetId);

        const processResult = (text, isFinal) => {
            const now = Date.now();
            const final = text.toUpperCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
            console.log(`[Speech Recognition] Processing (${isFinal ? 'FINAL' : 'PARTIAL'}):`, final);
            setSpokenText(final);

            // Use the ref to get the CURRENT challenge data
            const currentChallenge = challengeDataRef.current;
            const currentBattlingId = battlingSkillRef.current;
            const effectiveTargetId = targetId || currentBattlingId;

            if (currentChallenge && currentChallenge.type === 'reading') {
                const spokenWords = final.split(/\s+/);
                const isMatch = spokenWords.includes(currentChallenge.answer) ||
                    (HOMOPHONES[currentChallenge.answer] && HOMOPHONES[currentChallenge.answer].some(h => spokenWords.includes(h))) ||
                    final === currentChallenge.answer; // Fallback to direct match

                if (isMatch) {
                    // Check if this exact answer was already processed for this challenge
                    if (lastProcessedAnswerRef.current === currentChallenge.answer) {
                        console.log('[Speech Recognition] Ignoring duplicate answer for same challenge');
                        return false;
                    }
                    
                    // Apply debouncing - prevent rapid-fire recognitions
                    if (now - lastRecognitionTimeRef.current < RECOGNITION_COOLDOWN_MS) {
                        console.log('[Speech Recognition] Debouncing - too soon after last recognition');
                        return false;
                    }

                    console.log('[Speech Recognition] Correct answer detected!');
                    lastProcessedAnswerRef.current = currentChallenge.answer; // Mark this answer as processed
                    lastRecognitionTimeRef.current = now; // Record recognition time
                    if (onSuccessRef.current) onSuccessRef.current(effectiveTargetId);
                    // Clear text after success but DON'T stop recognition (keep listening continuously)
                    setTimeout(() => setSpokenText("Listening..."), 500);
                    return true;
                } else if (isFinal && final && final.length >= MIN_SPOKEN_TEXT_LENGTH) {
                    // Check if this was the previous challenge's correct answer (carryover from previous round)
                    if (lastProcessedAnswerRef.current && final.includes(lastProcessedAnswerRef.current)) {
                        console.log('[Speech Recognition] Ignoring carryover from previous challenge:', final);
                        return false;
                    }
                    
                    // Apply debouncing for wrong answers too
                    if (now - lastRecognitionTimeRef.current < RECOGNITION_COOLDOWN_MS) {
                        console.log('[Speech Recognition] Debouncing wrong answer - too soon after last recognition');
                        return false;
                    }

                    // Wrong answer - trigger error feedback ONLY on final result
                    console.log('[Speech Recognition] Wrong answer (Final)');
                    lastRecognitionTimeRef.current = now;
                    if (onFailureRef.current) onFailureRef.current(effectiveTargetId);
                    return false;
                }
            }
            return false;
        };

        const handleRecognizing = (text) => {
            processResult(text, false);
        };

        const handleRecognized = (text) => {
            processResult(text, true);
        };

        const handleError = (error) => {
            console.error('[Speech Recognition] Azure Error:', error);
            setSpokenText("Error: Try Again");
            setIsListening(false);
        };

        // Get the expected phrase from current challenge for phrase hints
        const currentChallenge = challengeDataRef.current;
        const expectedPhrase = currentChallenge?.type === 'reading' && currentChallenge?.answer
            ? currentChallenge.answer
            : null;

        console.log('[Speech Recognition] Expected phrase hint:', expectedPhrase);

        const started = startAzureSpeechRecognition(handleRecognizing, handleRecognized, handleError, expectedPhrase);
        if (started) {
            setIsListening(true);
            setSpokenText("Listening...");
            // Reset state for new recognition session
            lastProcessedAnswerRef.current = null;
            lastRecognitionTimeRef.current = 0;
        } else {
            setSpokenText("Microphone Error");
            setIsListening(false);
        }
    }, []);
    
    // Public function to start voice recognition
    const startVoiceListener = useCallback((targetId) => {
        startVoiceListenerInternal(targetId);
    }, [startVoiceListenerInternal]);

    // Effect to handle challenge changes - restart recognition with new phrase hint
    useEffect(() => {
        // Increment challenge ID when challenge changes
        challengeIdRef.current += 1;
        const currentChallengeId = challengeIdRef.current;
        challengeDataRef.current = challengeData;
        
        // IMPORTANT: Clear spokenText when challenge changes to prevent carryover
        // This fixes the bug where previous word carries over to next challenge
        if (isListeningRef.current && challengeData) {
            console.log('[Speech Recognition] Challenge changed, clearing spoken text and restarting recognition');
            setSpokenText("Listening...");
            // Reset last processed answer when challenge changes
            lastProcessedAnswerRef.current = null;
            lastRecognitionTimeRef.current = 0;
            
            // Restart recognition with new phrase hint after a brief delay
            // This ensures the Azure recognizer is primed for the new word
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
            restartTimeoutRef.current = setTimeout(() => {
                if (challengeIdRef.current === currentChallengeId && isListeningRef.current) {
                    console.log('[Speech Recognition] Restarting with new phrase hint');
                    stopAzureSpeechRecognition();
                    // Small delay before restarting
                    setTimeout(() => {
                        if (challengeIdRef.current === currentChallengeId && isListeningRef.current) {
                            const skill = battlingSkillRef.current;
                            if (skill) {
                                // Restart with the new challenge phrase
                                startVoiceListenerInternal(skill);
                            }
                        }
                    }, 100);
                }
            }, 200);
        }
    }, [challengeData, startVoiceListenerInternal]);
    
    // Cleanup restart timeout on unmount
    useEffect(() => {
        return () => {
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
        };
    }, []);

    // Toggle mic on/off when mic button is clicked
    const toggleMicListener = useCallback((targetId) => {
        console.log('[Mic Toggle] isListening:', isListening);

        // If currently listening, stop it
        if (isListening) {
            console.log('[Mic Toggle] Stopping recognition');
            stopVoiceRecognition();
        } else {
            // If not listening, start it
            console.log('[Mic Toggle] Starting recognition');
            startVoiceListener(targetId);
        }
    }, [isListening, stopVoiceRecognition, startVoiceListener]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            stopAzureSpeechRecognition();
        };
    }, []);

    return {
        isListening,
        setIsListening,
        spokenText,
        setSpokenText,
        startVoiceListener,
        stopVoiceRecognition,
        toggleMicListener
    };
};
