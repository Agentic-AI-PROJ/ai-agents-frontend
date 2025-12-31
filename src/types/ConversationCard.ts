export interface ConversationCard {
    _id?: string;
    name: string;
    summary: string;
    guid: string;
    chatbotCard: string;
    createdBy?: string | {
        _id: string;
        name: string;
        email: string;
    };
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Message {
    _id?: string;
    conversationId: string;
    userId?: string;
    role: string;
    content: string;
    metadata?: any;
    createdAt?: string;
    updatedAt?: string;
}
