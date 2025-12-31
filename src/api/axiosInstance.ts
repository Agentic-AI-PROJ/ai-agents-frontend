// src/api/axiosInstance.ts
import axios from "axios";
import { storage, STORAGE_KEYS } from "@/utils/storage";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true, // if you want cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Add token automatically
axiosInstance.interceptors.request.use((config) => {
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ❗ Handle errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle unauthorized
        if (error.response?.status === 401) {
            console.error("Unauthorized! Token may have expired.");

            // Clear the invalid token
            storage.remove(STORAGE_KEYS.AUTH_TOKEN);

            // Get current path to redirect back after login
            const currentPath = window.location.pathname + window.location.search;

            // Only redirect if not already on auth pages
            if (!currentPath.startsWith('/auth')) {
                // Navigate to auth page with redirect and error message parameters
                const errorMsg = encodeURIComponent('Your session has expired. Please log in again.');
                window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}&error=${errorMsg}`;
            }
        }

        if (error.response?.status === 403) {
            console.error("Forbidden! User does not have permission to access this resource.");

            // Redirect to home with error message
            const errorMsg = encodeURIComponent('You do not have permission to access this resource.');
            window.location.href = `/?error=${errorMsg}`;
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
