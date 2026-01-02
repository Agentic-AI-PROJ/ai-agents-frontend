export interface AIModelDetails {
    requests_per_day?: number | null;
    requests_per_minute?: number | null;
}

export interface AIModelLimits {
    max_input_tokens?: number | null;
    max_output_tokens?: number | null;
    input_types: string[];
    output_types: string[];
}

export interface AIModelCost {
    input_per_million: number;
    output_per_million: number;
}

export interface AIModelGroundings {
    websearch?: number | null;
}

export interface AIModel {
    _id?: string;
    name: string;
    description?: string;
    model_id: string; // The underlying model ID e.g. gemini/pro
    api_key: string;
    base_url?: string;
    isActive: boolean;
    cost: AIModelCost;
    limits: AIModelLimits;
    details: AIModelDetails;
    groundings?: AIModelGroundings;
    created_at?: string;
    updated_at?: string;
}
