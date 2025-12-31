export interface Feature {
    _id: string;
    name: string;
    description?: string;
    enabledForAll: boolean;
    enabledRoles: string[];
    enabledUsers: string[];
    createdAt: string;
    updatedAt: string;
}