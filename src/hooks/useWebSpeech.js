import { useState, useRef, useEffect, useCallback } from 'react';
import { startWebSpeechRecognition, stopWebSpeechRecognition } from '../utils/webSpeechRecognizer';
import { HOMOPHONES } from '../constants/gameData';

const MIN_SPOKEN_TEXT_LENGTH = 2;
const MIC_OFF_TEXT = "Mic Off";

export const useWebSpeech = ({
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

    useEffect(() => {
        challengeDataRef.current = challengeData;
        // Clear spokenText when challenge changes to prevent carryover
        if (isListening && challengeData) {
            console.log('[Speech Recognition] Challenge changed, clearing spoken text');
            setSpokenText("Listening...");
        }
    }, [challengeData, isListening]);

    useEffect(() => {
        battlingSkillRef.current = battlingSkillId;
    }, [battlingSkillId]);

    // Helper function to stop and cleanup speech recognition
    const stopVoiceRecognition = useCallback(() => {
        stopWebSpeechRecognition();
        setIsListening(false);
        setSpokenText(MIC_OFF_TEXT);
    }, []);

    const startVoiceListener = useCallback((targetId) => {
        // Stop any existing recognition
        stopWebSpeechRecognition();

        console.log('[Speech Recognition] Initializing Web Speech for skill:', targetId);

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
                    console.log('[Speech Recognition] Correct answer detected!');
                    if (onSuccess) onSuccess(effectiveTargetId);
                    // Clear text after success but DON'T stop recognition (keep listening continuously)
                    setTimeout(() => setSpokenText("Listening..."), 1000);
                    return true;
                } else if (isFinal && final && final.length >= MIN_SPOKEN_TEXT_LENGTH) {
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
            console.error('[Speech Recognition] Web Speech Error:', error);
            setSpokenText("Error: Try Again");
            setIsListening(false);
        };

        const started = startWebSpeechRecognition(handleRecognizing, handleRecognized, handleError);
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
            stopWebSpeechRecognition();
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
