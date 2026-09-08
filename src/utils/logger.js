/**
 * Development-only logging for diagnostics that should not run in production.
 */
export const devLog = (...args) => {
    if (import.meta.env.DEV) {
        console.log(...args);
    }
};
