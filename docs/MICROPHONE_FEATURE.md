# Microphone Feature Documentation

## Overview

The Reading Skill Card in Level-Up RPG uses the Web Speech API to enable voice-based gameplay. Players can speak the words displayed on screen to defeat enemies, making reading practice interactive and engaging.

## How It Works

### Browser Build
In the browser build, the game uses the standard `webkitSpeechRecognition` API available in Chromium-based browsers (Chrome, Edge, Opera, etc.).

### Portable .exe (Electron) Build
The portable .exe build uses Electron, which includes a Chromium engine. The Web Speech API is available in this environment and works the same way as in the browser.

## User Experience

### Starting a Reading Battle
1. Click on the Reading skill card in the carousel
2. Click the "ENCHANT!" button to start a battle
3. The microphone automatically starts listening when the battle begins
4. A word appears on screen for the player to read aloud
5. The status indicator shows "Listening..." when the mic is active

### Manual Mic Control
Players can toggle the microphone on/off by clicking the mic button:
- **Mic Off**: Click the button to start listening
- **Mic On**: Click the button again to stop listening
- Visual feedback:
  - Grey mic icon with "TAP TO SPEAK" = Mic is off
  - Red pulsing mic icon = Mic is actively listening

### Ending a Battle
When the battle ends (by closing the battle card), the microphone automatically stops and cleans up:
- Speech recognition is stopped
- All event listeners are removed
- Audio streams are released

## Technical Implementation

### Key Functions

#### `startVoiceListener(targetId)`
Initializes and starts the speech recognition engine:
- Creates a new `webkitSpeechRecognition` instance
- Configures continuous listening mode
- Sets up event handlers for results, errors, and lifecycle events
- Implements auto-restart logic to maintain continuous listening during battle

#### `toggleMicListener(targetId)`
Handles mic button clicks:
- Checks current listening state
- Stops recognition if currently active
- Starts recognition if currently inactive
- Properly cleans up resources between toggles

#### `endBattle()`
Cleanup function called when battle ends:
- Stops speech recognition
- Clears the recognition reference
- Resets UI state (listening status, spoken text)

### Event Handlers

#### `onstart`
Fired when speech recognition starts:
- Sets `isListening` state to `true`
- Updates spoken text to "Listening..."

#### `onend`
Fired when speech recognition ends:
- Sets `isListening` state to `false`
- Auto-restarts if still in Reading battle (continuous mode)
- Updates spoken text to "Mic Off" if not auto-restarting

#### `onerror`
Handles speech recognition errors:
- `no-speech`: User didn't speak (non-fatal, continues listening)
- `not-allowed`: Microphone permission denied (stops with error message)
- Other errors: Logged for debugging

#### `onresult`
Processes recognized speech:
- Extracts and normalizes the transcript (uppercase, remove punctuation)
- Checks against the current challenge answer
- Handles homophones (e.g., "SEA" matches "SEE")
- Triggers success or error feedback based on correctness

## Debugging

### Console Logging
All speech recognition events are logged to the browser console with the `[Speech Recognition]` or `[Mic Toggle]` prefix:

```
[Speech Recognition] Initializing for skill: reading
[Speech Recognition] Start command issued
[Speech Recognition] Started listening
[Speech Recognition] Recognized text: HELLO
[Speech Recognition] Correct answer!
```

### Common Issues and Solutions

#### Microphone button does nothing
**Symptoms**: Clicking the mic button has no effect
**Cause**: Recognition ref exists but listener isn't active
**Fix**: The new `toggleMicListener` function properly handles this by checking both the ref and the listening state

#### Auto-restart loop
**Symptoms**: Speech recognition restarts continuously even after battle ends
**Cause**: `battlingSkillId` check in `onend` handler failing
**Fix**: Ensure `endBattle()` properly clears the `recognitionRef` before the auto-restart check

#### "Mic permission denied" error
**Symptoms**: Error message appears, mic doesn't work
**Cause**: User denied microphone permission or browser/OS doesn't allow access
**Solutions**:
- Browser: Check site permissions in browser settings
- Electron: May require additional permissions in OS settings

#### No speech detected
**Symptoms**: Mic shows as listening but doesn't recognize words
**Possible causes**:
- Background noise
- Microphone not properly configured
- Audio input device not selected
**Solutions**:
- Check OS audio settings
- Ensure correct input device is selected
- Test microphone in other applications

## Electron-Specific Considerations

### Permissions
The Electron app does not require special configuration for microphone access. The Chromium engine handles permission requests the same way as in a browser.

### Security Settings
The main Electron process (`electron/main.cjs`) uses:
- `nodeIntegration: false` - Prevents Node.js API access in renderer
- `contextIsolation: true` - Isolates renderer process

These security settings do not interfere with the Web Speech API, which is a standard browser API.

### Build Configuration
No special build configuration is needed for microphone support. The feature works out-of-the-box in Electron apps using Chromium's built-in speech recognition.

## Manual Testing Checklist

### Browser Build
- [ ] Start a Reading battle - mic should auto-start
- [ ] Speak a correct word - should damage enemy
- [ ] Speak an incorrect word - should show error animation
- [ ] Click mic button while listening - should turn off
- [ ] Click mic button while off - should turn on
- [ ] Close battle card - mic should stop cleanly
- [ ] Check console for any errors

### Portable .exe Build
- [ ] Launch the .exe file
- [ ] Start a Reading battle - mic should auto-start
- [ ] Verify mic icon shows red pulsing animation when listening
- [ ] Speak a correct word - should damage enemy and show hit animation
- [ ] Speak an incorrect word - should show red flash/shake animation
- [ ] Click mic button to toggle off - should stop listening
- [ ] Click mic button to toggle on - should start listening
- [ ] Speak words with mic manually toggled - should work correctly
- [ ] Close battle card - mic should stop cleanly
- [ ] Start another battle - mic should work again
- [ ] Check console (if dev tools available) for any errors

### Homophones Testing
- [ ] Word "SEE" - verify "SEA" and "C" also work
- [ ] Word "TO" - verify "TWO", "TOO", and "2" also work
- [ ] Word "RED" - verify "READ" also works

### Edge Cases
- [ ] Deny microphone permission - should show error message
- [ ] Speak very long word - should be truncated/cleaned properly
- [ ] Background noise - should not trigger false positives
- [ ] Multiple rapid clicks on mic button - should toggle cleanly
- [ ] Switch to different skill then back - mic state should reset

## Future Enhancements

Potential improvements for the microphone feature:
1. Visual waveform feedback when speaking
2. Volume level indicator
3. Alternative input method (keyboard) for accessibility
4. Support for multiple languages
5. Custom vocabulary training
6. Offline speech recognition (would require additional libraries)
