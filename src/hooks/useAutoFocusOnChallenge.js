import { useEffect } from 'react';

/**
 * Focus a challenge input when a challenge/action becomes active.
 * The dependency list intentionally excludes the input value so typing never
 * steals focus back from the player.
 */
const useAutoFocusOnChallenge = (inputRef, {
    enabled = false,
    challengeKey = null,
    retryKey = null
} = {}) => {
    useEffect(() => {
        if (!enabled) return undefined;

        const focusTimer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 0);

        return () => window.clearTimeout(focusTimer);
    }, [enabled, challengeKey, retryKey, inputRef]);
};

export default useAutoFocusOnChallenge;
