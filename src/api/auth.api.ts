import { apiClient } from './apiClient';

export const getAuthMethods = async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>("auth/available-auths");
    return res;
};