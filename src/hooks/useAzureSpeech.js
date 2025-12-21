import { useState, useRef, useEffect, useCallback } from 'react';
import { startAzureSpeechRecognition, stopAzureSpeechRecognition } from '../utils/azureSpeechRecognizer';
import { HOMOPHONES } from '../constants/gameData';

const MIN_SPOKEN_TEXT_LENGTH = 2;
const MIC_OFF_TEXT = "Mic Off";

export const useAzureSpeech = ({
    battlingSkillId,
    challengeData,
    onSuccess,
    onFailure
}) => {
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState("");
    const recognitionRef = useRef(null); // Keep for Web kit legacy or internal tracking if needed

    // Keep challenge data fresh for the callback closure
    const challengeDataRef = useRef(challengeData);
    const battlingSkillRef = useRef(battlingSkillId);
    const lastProcessedAnswerRef = useRef(null); // Track last successful answer to prevent carryover

    useEffect(() => {
        challengeDataRef.current = challengeData;
        // IMPORTANT: Clear spokenText when challenge changes to prevent carryover
        // This fixes the bug where previous word carries over to next challenge
        if (isListening && challengeData) {
            console.log('[Speech Recognition] Challenge changed, clearing spoken text');
            setSpokenText("Listening...");
            // Reset last processed answer when challenge changes
            lastProcessedAnswerRef.current = null;
        }
    }, [challengeData, isListening]);

    useEffect(() => {
        battlingSkillRef.current = battlingSkillId;
    }, [battlingSkillId]);

    // Helper function to stop and cleanup speech recognition
    const stopVoiceRecognition = useCallback(() => {
        stopAzureSpeechRecognition();
        setIsListening(false);
        setSpokenText(MIC_OFF_TEXT);
    }, []);

    const startVoiceListener = useCallback((targetId) => {
        // Stop any existing recognition
        stopAzureSpeechRecognition();

        console.log('[Speech Recognition] Initializing Azure for skill:', targetId);

        const processResult = (text, isFinal) => {
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

                    console.log('[Speech Recognition] Correct answer detected!');
                    lastProcessedAnswerRef.current = currentChallenge.answer; // Mark this answer as processed
                    if (onSuccess) onSuccess(effectiveTargetId);
                    // Clear text after success but DON'T stop recognition (keep listening continuously)
                    setTimeout(() => setSpokenText("Listening..."), 1000);
                    return true;
                } else if (isFinal && final && final.length >= MIN_SPOKEN_TEXT_LENGTH) {
                    // Check if this was the previous challenge's correct answer (carryover from previous round)
                    if (lastProcessedAnswerRef.current && final.includes(lastProcessedAnswerRef.current)) {
                        console.log('[Speech Recognition] Ignoring carryover from previous challenge:', final);
                        return false;
                    }

                    // Wrong answer - trigger error feedback ONLY on final result
                    console.log('[Speech Recognition] Wrong answer (Final)');
                    if (onFailure) onFailure(effectiveTargetId);
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
        } else {
            setSpokenText("Microphone Error");
            setIsListening(false);
        }
    }, [onSuccess, onFailure]);

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
