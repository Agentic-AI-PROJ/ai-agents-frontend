import { apiClient } from './apiClient';

export interface AgentExecution {
    _id: string;
    executionId: string;
    userMessage: string;
    status: string;
    startTime: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    endTime?: string;
}

export interface Pagination {
    total: number;
    limit: number;
    skip: number;
}

export interface GetAgentExecutionsResponse {
    data: AgentExecution[];
    pagination: Pagination;
}

export interface AgentExecutionFilters {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
}

export const getAgentExecutions = async (filters: AgentExecutionFilters = {}): Promise<GetAgentExecutionsResponse> => {
    const res = await apiClient.get<GetAgentExecutionsResponse>("/agent-executions/executions", filters);
    return res;
};

export const getAgentExecutionById = async (id: string): Promise<AgentExecution> => {
    const res = await apiClient.get<AgentExecution>(`/agent-executions/executions/${id}`);
    return res;
};

export interface NodeExecution {
    _id: string;
    executionId: string;
    nodeName: string;
    startTime: string;
    endTime?: string;
    input?: any;
    output?: any;
    status: 'RUNNING' | 'SUCCESS' | 'ERROR';
    error?: string;
    createdAt: string;
    updatedAt: string;
}

export const getAgentExecutionNodes = async (id: string): Promise<NodeExecution[]> => {
    const res = await apiClient.get<NodeExecution[]>(`/agent-executions/executions/${id}/nodes`);
    return res;
};