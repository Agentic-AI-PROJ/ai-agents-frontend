import React, { createContext, useContext, ReactNode } from 'react';
import { addToast } from '@heroui/toast';

// Alert types
export type AlertVariant = 'default' | 'success' | 'warning' | 'danger';

export interface AlertOptions {
    title?: string;
    description?: string;
    variant?: AlertVariant;
    timeout?: number;
}

// Alert context interface
interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
}

// Create context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Singleton instance for use outside React components (e.g., axios)
let alertInstance: AlertContextType | null = null;

export const getAlertInstance = (): AlertContextType => {
    if (!alertInstance) {
        throw new Error('AlertContext not initialized. Make sure AlertProvider is mounted.');
    }
    return alertInstance;
};

// Alert Provider Component
export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const showAlert = ({ title, description, variant = 'default', timeout = 5000 }: AlertOptions) => {
        addToast({
            title,
            description,
            color: variant,
            timeout,
        });
    };

    const showSuccess = (message: string, title?: string) => {
        showAlert({
            title: title || 'Success',
            description: message,
            variant: 'success',
        });
    };

    const showError = (message: string, title?: string) => {
        showAlert({
            title: title || 'Error',
            description: message,
            variant: 'danger',
        });
    };

    const showWarning = (message: string, title?: string) => {
        showAlert({
            title: title || 'Warning',
            description: message,
            variant: 'warning',
        });
    };

    const showInfo = (message: string, title?: string) => {
        showAlert({
            title: title || 'Info',
            description: message,
            variant: 'default',
        });
    };

    const contextValue: AlertContextType = {
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    // Set singleton instance
    React.useEffect(() => {
        alertInstance = contextValue;
        return () => {
            alertInstance = null;
        };
    }, []);

    return (
        <AlertContext.Provider value={contextValue}>
            {children}
        </AlertContext.Provider>
    );
};

// Custom hook to use alert context
export const useAlert = (): AlertContextType => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
