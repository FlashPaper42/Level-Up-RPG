/**
 * Web Speech API Recognition for supported browsers
 * Uses the browser's built-in speech recognition for one explicit attempt.
 */

import { devLog } from './logger';

// Module state
let recognition = null;
let isListening = false;

/**
 * Start one speech recognition attempt.
 * @param {Function} onRecognized - Called once with the final transcript.
 * @param {Function} onError - Called with the browser error code.
 * @returns {boolean} True if started successfully.
 */
export function startWebSpeechRecognition(onRecognized, onError) {
    if (isListening && recognition) {
        devLog('[Web Speech] Already listening');
        return true;
    }

    try {
        const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
        if (!isSecure) {
            onError?.('insecure-context');
            return false;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            onError?.('unsupported');
            return false;
        }

        const currentRecognition = new SpeechRecognition();
        recognition = currentRecognition;
        currentRecognition.continuous = false;
        currentRecognition.interimResults = false;
        currentRecognition.lang = 'en-US';
        currentRecognition.maxAlternatives = 1;

        currentRecognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result?.isFinal) {
                onRecognized?.(result[0].transcript);
            }
        };

        currentRecognition.onerror = (event) => {
            onError?.(event.error || 'unknown');
        };

        currentRecognition.onstart = () => {
            isListening = true;
        };

        currentRecognition.onend = () => {
            isListening = false;
            if (recognition === currentRecognition) recognition = null;
        };

        currentRecognition.start();
        return true;
    } catch (error) {
        recognition = null;
        isListening = false;
        onError?.(error.name === 'NotAllowedError' ? 'not-allowed' : 'start-failed');
        return false;
    }
}

/**
 * Stop speech recognition
 */
export function stopWebSpeechRecognition() {
    if (recognition) {
        const currentRecognition = recognition;
        recognition = null;
        isListening = false;
        currentRecognition.onresult = null;
        currentRecognition.onerror = null;
        currentRecognition.onstart = null;
        currentRecognition.onend = null;
        currentRecognition.abort();
    } else {
        isListening = false;
    }
}

/**
 * Check if currently listening
 * @returns {boolean}
 */
export function isWebSpeechListening() {
    return isListening;
}
