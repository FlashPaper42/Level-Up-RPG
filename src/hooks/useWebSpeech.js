import { useState, useEffect, useCallback } from 'react';
import { startWebSpeechRecognition, stopWebSpeechRecognition } from '../utils/webSpeechRecognizer';
const MIC_OFF_TEXT = "Mic Off";

export const useWebSpeech = ({
    challengeData,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState("");

    useEffect(() => {
        // Clear spokenText when challenge changes to prevent carryover
        if (isListening && challengeData) {
            console.log('[Speech Recognition] Challenge changed, clearing spoken text');
            window.setTimeout(() => setSpokenText("Listening..."), 0);
        }
    }, [challengeData, isListening]);

    // Helper function to stop and cleanup speech recognition
    const stopVoiceRecognition = useCallback(() => {
        stopWebSpeechRecognition();
        setIsListening(false);
        setSpokenText(MIC_OFF_TEXT);
    }, []);

    const startVoiceListener = useCallback(() => {
        stopWebSpeechRecognition();
        const handleError = error => {
            const messages = {
                unsupported: 'Speech unavailable in this browser',
                'insecure-context': 'Speech requires a secure connection',
                'not-allowed': 'Microphone permission was denied',
                'service-not-allowed': 'Microphone permission was denied',
                'audio-capture': 'No microphone was found',
                network: 'Speech service is unavailable',
                'no-speech': 'No speech detected; try again',
            };
            setSpokenText(messages[error] || 'Speech could not be started');
            setIsListening(false);
        };

        const started = startWebSpeechRecognition(text => {
            setSpokenText(text);
            setIsListening(false);
        }, handleError);
        if (started) {
            setIsListening(true);
            setSpokenText("Listening...");
        }
    }, []);

    // Toggle mic on/off when mic button is clicked
    const toggleMicListener = useCallback(() => {
        if (isListening) {
            stopVoiceRecognition();
        } else {
            startVoiceListener();
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
