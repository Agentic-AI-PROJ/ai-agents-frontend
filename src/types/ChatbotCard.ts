export interface ChatbotCard {
    _id?: string;
    name: string;
    description?: string;
    systemPrompt: string;
    visibility: 'public' | 'private';
    reasoningEffort: 'none' | 'minimal' | 'low' | 'medium' | 'high';
    llmModel: string;
    fileParameters: {
        fileUploadAllowed: boolean;
        allowedFileTypes: string[];
        fileUploadSizeLimit: number;
    };
    modelParameters: {
        temperature: number;
        maxTokens: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
    };
    createdBy?: string | {
        _id: string;
        name: string;
        email: string;
    };
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}
