/**
 * Web Speech API Recognition for Electron
 * Uses browser's built-in webkitSpeechRecognition for perfect accuracy
 * Free, works offline, excellent for single-syllable words
 */

// Module state
let recognition = null;
let isListening = false;

/**
 * Start continuous speech recognition
 * @param {Function} onRecognizing - Called with partial results as user speaks: (text) => {}
 * @param {Function} onRecognized - Called with final result when phrase completes: (text) => {}
 * @param {Function} onError - Called on error: (error) => {}
 * @returns {boolean} True if started successfully
 */
export function startWebSpeechRecognition(onRecognizing, onRecognized, onError) {
    if (isListening && recognition) {
        console.log('[Web Speech] Already listening');
        return true;
    }

    try {
        console.log('[Web Speech] Starting continuous recognition...');

        // Check if Web Speech API is available
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('[Web Speech] API not available');
            if (onError) onError('Speech recognition not supported');
            return false;
        }

        // Create recognizer
        recognition = new SpeechRecognition();

        // Configure for continuous listening with interim results
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        // Handle results (both interim and final)
        recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            const text = result[0].transcript;
            const isFinal = result.isFinal;

            console.log(`[Web Speech] ${isFinal ? 'Final' : 'Interim'} result:`, text);

            if (isFinal) {
                if (onRecognized) onRecognized(text);
            } else {
                if (onRecognizing) onRecognizing(text);
            }
        };

        // Handle errors
        recognition.onerror = (event) => {
            console.error('[Web Speech] Error:', event.error);
            if (event.error !== 'no-speech') {
                if (onError) onError(event.error);
            }
        };

        // Handle start
        recognition.onstart = () => {
            console.log('[Web Speech] Recognition started');
            isListening = true;
        };

        // Handle end (restart if continuous mode)
        recognition.onend = () => {
            console.log('[Web Speech] Recognition ended');
            isListening = false;
            // Auto-restart for continuous listening unless explicitly stopped
            if (recognition && !recognition._stopped) {
                console.log('[Web Speech] Restarting for continuous mode...');
                try {
                    recognition.start();
                } catch (e) {
                    console.log('[Web Speech] Already started');
                }
            }
        };

        // Start recognition
        recognition._stopped = false;
        recognition.start();
        isListening = true;

        return true;
    } catch (error) {
        console.error('[Web Speech] Setup error:', error);
        if (onError) onError(error.message);
        return false;
    }
}

/**
 * Stop speech recognition
 */
export function stopWebSpeechRecognition() {
    if (recognition) {
        console.log('[Web Speech] Stopping recognition...');
        recognition._stopped = true;
        recognition.stop();
        recognition = null;
        isListening = false;
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
