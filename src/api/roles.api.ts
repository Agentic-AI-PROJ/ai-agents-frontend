import { Role } from '@/types/Role';
import { apiClient } from './apiClient';

export const getRoles = async (): Promise<Role[]> => {
    const res = await apiClient.get<{ success: boolean; data: Role[] }>("/users/roles");
    return res.data;
};
