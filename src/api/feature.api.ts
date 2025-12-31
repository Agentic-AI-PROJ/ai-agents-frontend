import { Feature } from '@/types/Feature';
import { apiClient } from './apiClient';

export const getFeatures = async (): Promise<Feature[]> => {
    const response = await apiClient.get<Feature[]>(`/features`);
    return response;
};

export const createFeature = async (feature: Partial<Feature>): Promise<Feature> => {
    const response = await apiClient.post<Feature>(`/features`, feature);
    return response;
};

export const updateFeature = async (id: string, feature: Partial<Feature>): Promise<Feature> => {
    const response = await apiClient.put<Feature>(`/features/${id}`, feature);
    return response;
};

export const deleteFeature = async (id: string): Promise<void> => {
    await apiClient.delete<Feature>(`/features/${id}`);
};