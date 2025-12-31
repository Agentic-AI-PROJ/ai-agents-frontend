import { ChatbotCard } from '@/types/ChatbotCard';
import axiosInstance from './axiosInstance';

export const createChatbotCard = async (card: Partial<ChatbotCard>): Promise<ChatbotCard> => {
    const response = await axiosInstance.post<ChatbotCard>('/chatbot-cards', card);
    return response.data;
};

export const getChatbotCards = async (): Promise<ChatbotCard[]> => {
    const response = await axiosInstance.get<ChatbotCard[]>('/chatbot-cards');
    return response.data;
};

export const getChatbotCardById = async (id: string): Promise<ChatbotCard | null> => {
    const response = await axiosInstance.get<ChatbotCard>(`/chatbot-cards/${id}`);
    return response.data;
};

export const updateChatbotCard = async (id: string, card: Partial<ChatbotCard>): Promise<ChatbotCard> => {
    const response = await axiosInstance.put<ChatbotCard>(`/chatbot-cards/${id}`, card);
    return response.data;
};

export const deleteChatbotCard = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/chatbot-cards/${id}`);
};
