import axiosInstance from './axiosInstance';

export interface UploadResponse {
    url: string;
}

export const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<UploadResponse>('users/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.url;
};
