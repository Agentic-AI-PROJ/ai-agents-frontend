import { apiClient } from './apiClient';

export interface NodeConfig {
    _id: string;
    nodeName: string;
    systemPrompt: string;
    modelName: string;
    description?: string;
    variables?: string[];
    lastUpdated: string;
}

export const fetchNodeConfigs = async (): Promise<NodeConfig[]> => {
    try {
        const response = await apiClient.get<NodeConfig[]>("/agent-executions/agent-nodes");
        return response;
    } catch (error) {
        console.error('Error fetching node configs:', error);
        throw error;
    }
};

export const updateNodeConfig = async (nodeName: string, config: Partial<NodeConfig>): Promise<NodeConfig> => {
    try {
        const response = await apiClient.put<NodeConfig>(`/agent-executions/agent-nodes/${nodeName}`, config);
        return response;
    } catch (error) {
        console.error('Error updating node config:', error);
        throw error;
    }
};
