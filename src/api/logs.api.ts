import { apiClient } from "./apiClient";

export interface LogFilterParams {
    page?: number;
    limit?: number;
    ai_model_id?: string;
    start_date?: string;
    end_date?: string;
    success?: boolean;
}

export interface RequestLog {
    _id: string;
    ai_model_id: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    response_time_ms: number;
    success: boolean;
    input_text?: string;
    output_text?: string;
    error_message?: string;
    timestamp: string;
    cost?: number;
}

export interface LogStats {
    model_id: string;
    model_name?: string;
    provider?: string;
    total_requests: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    avg_response_time: number;
    successful_requests: number;
    failed_requests: number;
    total_cost: number;
}

export interface StatsResponse {
    success: boolean;
    data: LogStats[];
    global_totals: {
        total_requests: number;
        total_tokens: number;
        input_tokens: number;
        output_tokens: number;
        total_cost: number;
    };
}

export interface LogsResponse {
    success: boolean;
    data: RequestLog[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export const getLogs = async (params: LogFilterParams): Promise<LogsResponse> => {
    const response = await apiClient.get<LogsResponse>("/llm-chat/logs", params);
    return response;
};

export const getLogStats = async (
    startDate?: string,
    endDate?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
): Promise<StatsResponse> => {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (sortBy) params.sort_by = sortBy;
    if (sortOrder) params.sort_order = sortOrder;

    const response = await apiClient.get<StatsResponse>("/llm-chat/logs/stats", params);
    return response;
};
