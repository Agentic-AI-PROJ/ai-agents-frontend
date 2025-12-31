import axiosInstance from './axiosInstance';

export interface McpServer {
    _id: string;
    key: string;
    url?: string;
    command?: string;
    args?: string[];
    type: "sse" | "http" | "stdio";
    isActive: boolean;
    addedAt: string;
    logo?: string;
}

export interface McpTool {
    id: string;
    name: string;
    description: string;
    inputSchema: any;
    server: string; // key
    server_id: string;
    isActive: boolean;
}

export const getServers = async (): Promise<McpServer[]> => {
    const response = await axiosInstance.get<{ servers: McpServer[] }>('/mcp-client/admin/servers');
    return response.data.servers;
};

export const getTools = async (): Promise<McpTool[]> => {
    const response = await axiosInstance.get<{ tools: McpTool[] }>('/mcp-client/admin/tools');
    return response.data.tools;
};

export const updateServerStatus = async (key: string, isActive: boolean): Promise<McpServer> => {
    const safeKey = encodeURIComponent(key);
    const response = await axiosInstance.patch<{ server: McpServer }>(`mcp-client/admin/servers/${safeKey}/status`, { isActive });
    return response.data.server;
};

export const updateServer = async (key: string, data: Partial<McpServer>): Promise<McpServer> => {
    const safeKey = encodeURIComponent(key);
    const response = await axiosInstance.patch<{ server: McpServer }>(`mcp-client/admin/servers/${safeKey}`, data);
    return response.data.server;
};

export const updateToolStatus = async (id: string, isActive: boolean): Promise<McpTool> => {
    const response = await axiosInstance.patch<{ tool: McpTool }>(`mcp-client/admin/tools/${id}/status`, { isActive });
    return response.data.tool;
};

// Simple in-memory cache for tool logos
const logoCache = new Map<string, Promise<string | undefined>>();

export const getToolLogo = async (toolName: string): Promise<string | undefined> => {
    if (logoCache.has(toolName)) {
        return logoCache.get(toolName);
    }

    const fetchPromise = (async () => {
        try {
            const response = await axiosInstance.get<{ logo?: string }>(`/mcp-client/admin/tools/${toolName}/logo`);
            return response.data.logo;
        } catch (error) {
            console.error(`Failed to fetch logo for tool ${toolName}`, error);
            return undefined;
        }
    })();

    logoCache.set(toolName, fetchPromise);
    return fetchPromise;
};
