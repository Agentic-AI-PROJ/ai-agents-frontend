/**
 * Centralized keyboard shortcuts configuration
 * Define all shortcuts here to maintain consistency across the app
 */

export const SHORTCUTS = {
    NEW_CHAT: ["cmd", "n"],
    SEARCH: ["cmd", "k"],
    CREATE_CARD: ["cmd", "E"],
    TOGGLE_SIDEBAR: ["cmd", "b"],
    HOME: ["cmd", "shift", "o"],
} as const;

export type ShortcutKey = keyof typeof SHORTCUTS;
