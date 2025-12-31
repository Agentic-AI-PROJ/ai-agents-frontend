import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '@/types/User';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { getUser } from '@/api/user.api';

// User context interface
interface UserContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    loadUser: () => Promise<void>;
    logout: () => void;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Singleton instance for use outside React components
let userInstance: UserContextType | null = null;

export const getUserInstance = (): UserContextType => {
    if (!userInstance) {
        throw new Error('UserContext not initialized. Make sure UserProvider is mounted.');
    }
    return userInstance;
};

// User Provider Component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);

        if (!token) {
            setLoading(false);
            setUser(null);
            return;
        }

        try {
            const res = await getUser();
            if (res?.data) {
                setUser(res.data);
            }
        } catch (error) {
            // Token invalid or error fetching user
            console.error('Error loading user:', error);
            storage.remove(STORAGE_KEYS.AUTH_TOKEN);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        // Remove token from storage
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        setUser(null);
    };

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    const contextValue: UserContextType = {
        user,
        loading,
        setUser,
        loadUser,
        logout,
    };

    // Set singleton instance
    React.useEffect(() => {
        userInstance = contextValue;
        return () => {
            userInstance = null;
        };
    }, [user, loading]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use user context
export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
