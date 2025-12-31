export type ExecutionStepType =
    | 'metadata'
    | 'planning'
    | 'tool_call'
    | 'tool_result'
    | 'replan'
    | 'thought'
    | 'error'
    | 'final_answer'; // Added final_answer for completeness, though mainly used for main content

export interface ExecutionStep {
    id: string;
    type: ExecutionStepType;
    title: string;
    content: any; // content specific to the type (e.g. parsed JSON string, object, or plain string)
    timestamp: number;
    isExpanded?: boolean;
}

export interface Message {
    _id?: string;
    role: string;
    content: string;
    attachments?: Array<{ url: string; name?: string; contentType?: string }>;
    steps?: ExecutionStep[]; // Replacing simple 'reasoning' string
    reasoning?: string; // Keeping for backward compatibility or different usage if needed
    createdAt?: string;
}
