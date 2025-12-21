/**
 * Azure Speech Recognition for Electron
 * Uses Microsoft Cognitive Services Speech SDK for instant streaming recognition
 * Provides real-time speech-to-text with continuous listening
 */

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Azure Speech Service configuration
const SPEECH_KEY = '5GIVCdqnZAm6ZbXF4NPvr3cZhMlFYnyzPyN80Yc51N6Ap9SjSbP3JQQJ99BLAC1i4TkXJ3w3AAAYACOGzZ8C';
const SPEECH_REGION = 'centralus';

// Module state
let recognizer = null;
let isListening = false;

/**
 * Start continuous speech recognition
 * @param {Function} onRecognizing - Called with partial results as user speaks: (text) => {}
 * @param {Function} onRecognized - Called with final result when phrase completes: (text) => {}
 * @param {Function} onError - Called on error: (error) => {}
 * @param {string|null} expectedPhrase - Optional phrase to prime recognition for better accuracy
 * @returns {boolean} True if started successfully
 */
export function startAzureSpeechRecognition(onRecognizing, onRecognized, onError, expectedPhrase = null) {
    if (isListening && recognizer) {
        console.log('[Azure Speech] Already listening');
        return true;
    }

    try {
        console.log('[Azure Speech] Starting continuous recognition...');

        // Create speech config
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
        speechConfig.speechRecognitionLanguage = 'en-US';

        // Optimize for faster response - reduce silence detection timeout
        // These settings make recognition faster for short words/phrases
        speechConfig.setProperty(
            SpeechSDK.PropertyId.Speech_SegmentationSilenceTimeoutMs,
            "300" // Wait only 300ms of silence before finalizing (default is ~500-1000ms)
        );
        speechConfig.setProperty(
            SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
            "500" // End recognition after 500ms of silence (faster response)
        );

        // Create audio config from default microphone
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

        // Create recognizer
        recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        // Add phrase hints if provided - this dramatically improves accuracy
        if (expectedPhrase) {
            console.log('[Azure Speech] Adding phrase hint:', expectedPhrase);
            const phraseListGrammar = SpeechSDK.PhraseListGrammar.fromRecognizer(recognizer);
            phraseListGrammar.addPhrase(expectedPhrase);

            // Also add common homophones to handle variations
            const homophones = {
                'BEE': ['B', 'BE'],
                'SEE': ['C', 'SEA'],
                'TEA': ['T', 'TEE'],
                'TWO': ['TO', 'TOO'],
                'FOR': ['FOUR'],
                'WON': ['ONE'],
                'ATE': ['EIGHT']
            };

            if (homophones[expectedPhrase.toUpperCase()]) {
                homophones[expectedPhrase.toUpperCase()].forEach(variant => {
                    phraseListGrammar.addPhrase(variant);
                });
            }
        }

        // Handle partial results (as user is speaking)
        recognizer.recognizing = (sender, event) => {
            if (event.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
                const text = event.result.text.toUpperCase();
                console.log('[Azure Speech] Recognizing:', text);
                if (onRecognizing) onRecognizing(text);
            }
        };

        // Handle final results (when phrase is complete)
        recognizer.recognized = (sender, event) => {
            if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                const text = event.result.text.toUpperCase().replace(/[.,!?]/g, '').trim();
                console.log('[Azure Speech] Recognized:', text);
                if (onRecognized) onRecognized(text);
            } else if (event.result.reason === SpeechSDK.ResultReason.NoMatch) {
                console.log('[Azure Speech] No match - speech not recognized');
            }
        };

        // Handle errors
        recognizer.canceled = (sender, event) => {
            if (event.reason === SpeechSDK.CancellationReason.Error) {
                console.error('[Azure Speech] Error:', event.errorDetails);
                if (onError) onError(event.errorDetails);
            }
            stopAzureSpeechRecognition();
        };

        // Handle session events
        recognizer.sessionStarted = () => {
            console.log('[Azure Speech] Session started');
            isListening = true;
        };

        // Handle session stopped
        recognizer.sessionStopped = () => {
            console.log('[Azure Speech] Session stopped');
            isListening = false;
        };

        // Start continuous recognition
        recognizer.startContinuousRecognitionAsync(
            () => {
                console.log('[Azure Speech] Recognition started successfully');
                isListening = true;
            },
            (error) => {
                console.error('[Azure Speech] Failed to start:', error);
                if (onError) onError(error);
                isListening = false;
            }
        );

        return true;
    } catch (error) {
        console.error('[Azure Speech] Setup error:', error);
        if (onError) onError(error.message);
        return false;
    }
}

/**
 * Stop speech recognition
 */
export function stopAzureSpeechRecognition() {
    if (recognizer) {
        console.log('[Azure Speech] Stopping recognition...');
        recognizer.stopContinuousRecognitionAsync(
            () => {
                console.log('[Azure Speech] Recognition stopped');
                recognizer.close();
                recognizer = null;
                isListening = false;
            },
            (error) => {
                console.error('[Azure Speech] Error stopping:', error);
                recognizer.close();
                recognizer = null;
                isListening = false;
            }
        );
    } else {
        isListening = false;
    }
}

/**
 * Check if currently listening
 * @returns {boolean}
 */
export function isAzureListening() {
    return isListening;
}
