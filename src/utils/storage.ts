/**
 * Type-safe localStorage utility
 */

const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

class LocalStorageUtil {
    /**
     * Get item from localStorage
     */
    get<T = string>(key: StorageKey): T | null {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            // Try to parse as JSON, fallback to string
            try {
                return JSON.parse(item) as T;
            } catch {
                return item as T;
            }
        } catch (error) {
            console.error(`Error getting item from localStorage: ${key}`, error);
            return null;
        }
    }

    /**
     * Set item in localStorage
     */
    set<T>(key: StorageKey, value: T): void {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, stringValue);
        } catch (error) {
            console.error(`Error setting item in localStorage: ${key}`, error);
        }
    }

    /**
     * Remove item from localStorage
     */
    remove(key: StorageKey): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item from localStorage: ${key}`, error);
        }
    }

    /**
     * Clear all items from localStorage
     */
    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage', error);
        }
    }

    /**
     * Check if key exists in localStorage
     */
    has(key: StorageKey): boolean {
        try {
            return localStorage.getItem(key) !== null;
        } catch (error) {
            console.error(`Error checking localStorage key: ${key}`, error);
            return false;
        }
    }
}

// Export singleton instance
export const storage = new LocalStorageUtil();

// Export keys for convenience
export { STORAGE_KEYS };
