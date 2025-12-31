import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { ChatbotCard } from '@/types/ChatbotCard';
import { getChatbotCards, deleteChatbotCard } from '@/api/chatbot-cards.api';
import { useAlert } from '@/contexts/AlertContext';

// User context interface
interface ChatbotCardsContextType {
    chatbotCards: ChatbotCard[] | null;
    loading: boolean;
    setChatbotCards: (user: ChatbotCard[] | null) => void;
    loadChatbotCards: () => Promise<void>;
    handleDeleteChatbotCard: (id: string | undefined) => Promise<void>;
}

// Create context
const ChatbotCardsContext = createContext<ChatbotCardsContextType | undefined>(undefined);

// Singleton instance for use outside React components
let chatbotCardsInstance: ChatbotCardsContextType | null = null;

export const getChatbotCardsInstance = (): ChatbotCardsContextType => {
    if (!chatbotCardsInstance) {
        throw new Error('ChatbotCardsContext not initialized. Make sure ChatbotCardsProvider is mounted.');
    }
    return chatbotCardsInstance;
};

// User Provider Component
export const ChatbotCardsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chatbotCards, setChatbotCards] = useState<ChatbotCard[] | null>(null);
    const [loading, setLoading] = useState(true);
    const { showError, showSuccess } = useAlert();

    const loadChatbotCards = async () => {
        const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);

        if (!token) {
            setLoading(false);
            setChatbotCards(null);
            return;
        }

        try {
            const res = await getChatbotCards();
            if (res) {
                setChatbotCards(res);
            }
        } catch (error) {
            // Token invalid or error fetching user
            console.error('Error loading user:', error);
            showError('Failed to load chatbot cards. Please try again.');
            storage.remove(STORAGE_KEYS.AUTH_TOKEN);
            setChatbotCards(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChatbotCard = async (id: string | undefined) => {
        if (!id) {
            showError('Failed to delete chatbot card. Please try again.');
            return;
        }
        try {
            await deleteChatbotCard(id);
            showSuccess('Chatbot card deleted successfully!');
            loadChatbotCards();
        } catch (error) {
            console.error(error);
            showError('Failed to delete chatbot card. Please try again.');
        }
    };

    // Load user on mount
    useEffect(() => {
        loadChatbotCards();
    }, []);

    const contextValue: ChatbotCardsContextType = {
        chatbotCards,
        loading,
        setChatbotCards,
        loadChatbotCards,
        handleDeleteChatbotCard,
    };

    // Set singleton instance
    React.useEffect(() => {
        chatbotCardsInstance = contextValue;
        return () => {
            chatbotCardsInstance = null;
        };
    }, [chatbotCards, loading]);

    return (
        <ChatbotCardsContext.Provider value={contextValue}>
            {children}
        </ChatbotCardsContext.Provider>
    );
};

// Custom hook to use user context
export const useChatbotCards = (): ChatbotCardsContextType => {
    const context = useContext(ChatbotCardsContext);
    if (!context) {
        throw new Error('useChatbotCards must be used within a ChatbotCardsProvider');
    }
    return context;
};
