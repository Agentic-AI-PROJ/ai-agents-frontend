import { useEffect } from "react";

type ShortcutCallback = (event: KeyboardEvent) => void;

export function useShortcut(keys: readonly string[] | string[] | string, callback: ShortcutCallback) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {

            // Normalize expected keys into an array
            const expectedKeys = Array.isArray(keys)
                ? keys.map(k => k.toLowerCase())
                : (keys as string).toLowerCase().split("+");

            const pressedKeys: string[] = [];

            if (e.ctrlKey) pressedKeys.push("ctrl");
            if (e.metaKey) pressedKeys.push("cmd");
            if (e.shiftKey) pressedKeys.push("shift");
            if (e.altKey) pressedKeys.push("alt");

            pressedKeys.push(e.key.toLowerCase());

            // Compare sorted combinations:
            const normalized = pressedKeys.sort().join("+");
            const expected = expectedKeys.sort().join("+");

            if (normalized === expected) {
                e.preventDefault();
                callback(e);
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [keys, callback]);
}
