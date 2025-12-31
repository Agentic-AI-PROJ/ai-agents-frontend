/**
 * Utility functions for keyboard shortcuts
 */

/**
 * Converts an array of keys to a display string
 * @param keys - Array of keys like ["cmd", "shift", "n"]
 * @returns Display string like "⌘⇧N"
 */
export function keysToDisplayString(keys: readonly string[] | string[]): string {
    const symbolMap: Record<string, string> = {
        cmd: "⌘",
        ctrl: "⌃",
        shift: "⇧",
        alt: "⌥",
        option: "⌥",
        meta: "⌘",
    };

    return keys
        .map((key) => {
            const lowerKey = key.toLowerCase();
            // Check if it's a modifier key
            if (symbolMap[lowerKey]) {
                return symbolMap[lowerKey];
            }
            // Otherwise, uppercase the key
            return key.toUpperCase();
        })
        .join("");
}

/**
 * Platform-specific modifier key detection
 */
export function isMac(): boolean {
    return typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}
