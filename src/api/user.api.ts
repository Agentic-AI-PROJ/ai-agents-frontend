import { apiClient } from './apiClient';
import { User } from '@/types/User';

export const getUser = async (): Promise<{ success: boolean; data: User }> => {
    const res = await apiClient.get<{ success: boolean; data: User }>("/users/me");
    return res;
};

export const getAllUsers = async (): Promise<User[]> => {
    const res = await apiClient.get<{ success: boolean; data: User[] }>("/users");
    return res.data;
};

export async function updateUserRole(userId: string, roleId: string) {
    const res = await apiClient.patch<{ success: boolean; data: User }>(`/users/${userId}/role`, { roleId });
    return res.data;
}

