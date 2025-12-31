export interface User {
    _id: string;
    email: string;
    displayName: string;
    avatar?: string;
    role?: {
        _id?: string;
        name?: string;
    };
    providers: Array<{
        provider: 'google' | 'github';
        email: string;
    }>;
    status?: string;
    createdAt: string;
    updatedAt: string;
}