import { ConversationCard, Message } from '@/types/ConversationCard';
import axiosInstance from './axiosInstance';

export const createConversationCard = async (chatbotCardId: string): Promise<ConversationCard> => {
    const response = await axiosInstance.post<ConversationCard>('/chatbot-cards/conversation', { chatbotCard: chatbotCardId });
    return response.data;
};

export const getConversationCards = async (chatbotCardId: string): Promise<ConversationCard[]> => {
    const response = await axiosInstance.get<ConversationCard[]>(`/chatbot-cards/conversation/card/${chatbotCardId}`);
    return response.data;
};

export const getConversationCardById = async (guid: string): Promise<{ conversation: ConversationCard; messages: Message[] } | null> => {
    const response = await axiosInstance.get<{ conversation: ConversationCard; messages: Message[] }>(`/chatbot-cards/conversation/${guid}`);
    return response.data;
};

export const deleteConversationCard = async (guid: string): Promise<void> => {
    await axiosInstance.delete(`/chatbot-cards/conversation/${guid}`);
};
