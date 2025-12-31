import { apiClient } from "./apiClient";
import { AIModel } from "../types/AIModel";

export interface AIModelResponse {
    success: boolean;
    data: AIModel[] | AIModel;
    message?: string;
}

export const aiModelsApi = {
    getAll: async (): Promise<AIModel[]> => {
        const response = await apiClient.get<AIModelResponse>("/llm-chat/models");
        return response.data as AIModel[];
    },

    getById: async (id: string): Promise<AIModel> => {
        const response = await apiClient.get<AIModelResponse>(`/llm-chat/models/${id}`);
        return response.data as AIModel;
    },

    create: async (model: Partial<AIModel>): Promise<AIModel> => {
        const response = await apiClient.post<AIModelResponse>("/llm-chat/models", model);
        return response.data as AIModel;
    },

    update: async (id: string, model: Partial<AIModel>): Promise<AIModel> => {
        const response = await apiClient.put<AIModelResponse>(`/llm-chat/models/${id}`, model);
        return response.data as AIModel;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete<AIModelResponse>(`/llm-chat/models/${id}`);
    },

    getActive: async (): Promise<AIModel[]> => {
        const response = await apiClient.get<AIModelResponse>("/llm-chat/models/active");
        return response.data as AIModel[];
    },
};
