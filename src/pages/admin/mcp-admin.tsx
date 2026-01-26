import { title } from '@/components/primitives';
import { useEffect, useState } from 'react';
import {
    getServers,
    getTools,
    updateServerStatus,
    updateToolStatus,
    updateServer,
    addServer,
    deleteServer,
    McpServer,
    McpTool,
    testServer
} from '@/api/mcp-client.api';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@heroui/table";
import { Switch } from "@heroui/switch";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { appRoutes } from "@/config/site";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";

import { ToolTester } from '@/components/mcp/ToolTester';
import { Tabs, Tab } from "@heroui/tabs";
import { useAlert } from '@/contexts/AlertContext';

export default function McpAdminPage() {
    const [servers, setServers] = useState<McpServer[]>([]);
    const [tools, setTools] = useState<McpTool[]>([]);
    const [loading, setLoading] = useState(true);
    const [testButLoading, setTestButLoading] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const { showSuccess, showError } = useAlert();

    // Edit Logo Modal State
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [editingServerKey, setEditingServerKey] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState("");

    // Add Server Modal State
    const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
    const [addServerType, setAddServerType] = useState<"sse" | "stdio">("sse");
    const [addServerConfig, setAddServerConfig] = useState("");

    // Tool Details Modal State
    const { isOpen: isToolOpen, onOpen: onToolOpen, onOpenChange: onToolOpenChange } = useDisclosure();
    const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);

    const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [serversData, toolsData] = await Promise.all([getServers(), getTools()]);
            setServers(serversData);
            setTools(toolsData);
        } catch (error) {
            console.error("Failed to fetch MCP data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "MCP Management";
        fetchData();
    }, []);

    const handleServerToggle = async (key: string, currentStatus: boolean) => {
        // Optimistic update
        setServers(prev => prev.map(s => s.key === key ? { ...s, isActive: !currentStatus } : s));

        try {
            const updatedServer = await updateServerStatus(key, !currentStatus);
            // Confirm with server response
            setServers(prev => prev.map(s => s.key === key ? updatedServer : s));

            // If we just turned it ON (currentStatus was false), we should refetch tools 
            // because the server might have refreshed its tool list upon reconnection
            if (!currentStatus) {
                await fetchData();
            } else {
                // If we turned it OFF, tools should be deactivated locally too to reflect cascading
                const serverId = servers.find(s => s.key === key)?._id;
                if (serverId) {
                    setTools(prev => prev.map(t => t.server_id === serverId ? { ...t, isActive: false } : t));
                }
            }
        } catch (error) {
            console.error("Failed to update server status", error);
            // Revert on error
            setServers(prev => prev.map(s => s.key === key ? { ...s, isActive: currentStatus } : s));
        }
    };

    const handleToolToggle = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setTools(prev => prev.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));

        try {
            await updateToolStatus(id, !currentStatus);
            // Verify/Sync if needed, but optimistic is usually fine for simple toggle
        } catch (error) {
            console.error("Failed to update tool status", error);
            // Revert
            setTools(prev => prev.map(t => t.id === id ? { ...t, isActive: currentStatus } : t));
        }
    };

    const openEditLogo = (server: McpServer) => {
        setEditingServerKey(server.key);
        setLogoUrl(server.logo || "");
        onOpen();
    };

    const saveLogo = async () => {
        if (!editingServerKey) return;
        try {
            const updated = await updateServer(editingServerKey, { logo: logoUrl });
            setServers(prev => prev.map(s => s.key === editingServerKey ? updated : s));
            onOpenChange(); // Close modal
        } catch (error) {
            console.error("Failed to save logo", error);
            showError("Failed to save logo");
        }
    };

    const handleAddServer = async (onClose: () => void) => {
        let configStr = addServerConfig.trim();
        // Handle unwrapped property input (e.g. "time": { ... })
        if (!configStr.startsWith('{') && configStr.includes(':')) {
            configStr = `{${configStr}}`;
        }

        let parsedConfig: any;
        try {
            parsedConfig = JSON.parse(configStr);
        } catch (e) {
            showError("Invalid JSON configuration. Please check usage of quotes and braces.");
            return;
        }

        let name: string | undefined;
        let configData: any = parsedConfig;

        // Check if input is {"name": { ...config }}
        const keys = Object.keys(parsedConfig);
        if (keys.length === 1) {
            const key = keys[0];
            const value = parsedConfig[key];
            if (typeof value === 'object' && value !== null && (value.command || value.url)) {
                name = key;
                configData = value;
            }
        }

        if (addServerType === 'sse' && !configData.url) {
            showError("SSE config must contain 'url'");
            return;
        }
        if (addServerType === 'stdio' && !configData.command) {
            showError("Stdio config must contain 'command'");
            return;
        }

        const newServer: any = {
            type: addServerType,
            name: name,
            ...configData
        };
        // Ensure args is array if provided
        if (newServer.args && !Array.isArray(newServer.args)) {
            showError("Args must be an array of strings.");
            return;
        }

        setIsAdding(true);
        try {
            await addServer(newServer);
            await fetchData();
            onClose();
            // Reset form
            setAddServerConfig("");
        } catch (error) {
            console.error("Failed to add server", error);
            showError("Failed to add server");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteServer = async (server: McpServer) => {
        if (!confirm(`Are you sure you want to delete ${server.key}?`)) return;
        try {
            await deleteServer(server);
            await fetchData();
        } catch (error) {
            console.error("Failed to delete server", error);
            showError("Failed to delete server");
        }
    };

    const handleTestServer = async (server: McpServer) => {
        try {
            setTestButLoading(server.key);
            const result = await testServer(server.key);
            if (result.success) {

                const message = [
                    `Connection successful with server ${server.key}`,
                ].join('\n');

                showSuccess(message);
            } else {
                showError(`Connection failed with server ${server.key}\n\n${result.message}`);
            }
        } catch (error: any) {
            console.error("Failed to test server", error);
            showError(`ERROR: ${error.message || "Unknown error occurred"}`);
        } finally {
            setTestButLoading(null);
        }
    };


    if (loading && servers.length === 0) {
        return <div className="p-8">Loading MCP configuration...</div>;
    }

    return (
        <section className="flex flex-col items-center gap-6 py-8 px-8 md:py-10">
            <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
                <h1 className={title()}>MCP Management</h1>
                <Breadcrumbs>
                    <BreadcrumbItem href={adminRoute?.path}>Admin</BreadcrumbItem>
                    <BreadcrumbItem>MCP Management</BreadcrumbItem>
                </Breadcrumbs>
            </div>

            <div className="w-full max-w-6xl px-4 flex flex-col gap-8">
                {/* Servers Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Servers</h2>
                        <Button onPress={onAddOpen} color="primary" size="sm">
                            Add Server
                        </Button>
                    </div>
                    <Table aria-label="MCP Servers Table">
                        <TableHeader>
                            <TableColumn>LOGO</TableColumn>
                            <TableColumn>NAME</TableColumn>
                            <TableColumn>TYPE</TableColumn>
                            <TableColumn>DETAILS (URL / COMMAND)</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"No servers found"}>
                            {servers.map((server) => (
                                <TableRow key={server.key}>
                                    <TableCell>
                                        <div className="relative group cursor-pointer" onClick={() => openEditLogo(server)}>
                                            <Avatar
                                                src={server.logo}
                                                name={server.type.substring(0, 2).toUpperCase()}
                                                size="md"
                                                isBordered
                                            />
                                            {/* Hover overlay hint */}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-bold text-sm">
                                            {server.name || server.key}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-default-600 uppercase text-xs tracking-wider">
                                            {server.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm block max-w-md truncate" title={server.type === 'stdio' ? `${server.command} ${(server.args || []).join(' ')}` : server.url}>
                                            {server.type === 'stdio'
                                                ? `${server.command} ${(server.args || []).join(' ')}`
                                                : server.url}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                isSelected={server.isActive}
                                                onValueChange={() => handleServerToggle(server.key, server.isActive)}
                                                color="success"
                                                size="sm"
                                            />
                                            <span className="text-small text-default-500">
                                                {server.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="light" onPress={() => openEditLogo(server)}>Edit</Button>
                                            <Button isLoading={testButLoading === server.key} size="sm" color="primary" variant="flat" onPress={() => handleTestServer(server)}>Test</Button>
                                            <Button size="sm" color="danger" variant="light" onPress={() => handleDeleteServer(server)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Tools Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">Tools</h2>
                    <Table
                        aria-label="MCP Tools Table"
                        onRowAction={(key) => {
                            const tool = tools.find(t => t.id === key);
                            if (tool) {
                                setSelectedTool(tool);
                                onToolOpen();
                            }
                        }}
                        selectionMode="single"
                        color="primary"
                    >
                        <TableHeader>
                            <TableColumn>NAME</TableColumn>
                            <TableColumn>DESCRIPTION</TableColumn>
                            <TableColumn>SERVER</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"No tools found"}>
                            {tools.map((tool) => {
                                // Check parent server status to disable
                                const parentServer = servers.find(s => s._id === tool.server_id);
                                const parentDisabled = parentServer ? !parentServer.isActive : true;

                                return (
                                    <TableRow key={tool.id} className="cursor-pointer">
                                        <TableCell>
                                            <span className="font-bold">{tool.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-600 max-w-xs truncate" title={tool.description}>
                                                {tool.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono text-gray-500">
                                                {tool.server}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    isSelected={tool.isActive}
                                                    onValueChange={() => handleToolToggle(tool.id, tool.isActive)}
                                                    isDisabled={parentDisabled}
                                                    color="success"
                                                    size="sm"
                                                />
                                                <span className={`text-small ${parentDisabled ? "text-default-300" : "text-default-500"}`}>
                                                    {parentDisabled ? "Server Off" : (tool.isActive ? "Active" : "Inactive")}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Logo Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Edit Server</ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-default-500 mb-2">Update the logo URL for this server.</p>
                                <Input
                                    label="Logo URL"
                                    placeholder="https://example.com/logo.png"
                                    value={logoUrl}
                                    onValueChange={setLogoUrl}
                                />
                                {logoUrl && (
                                    <div className="flex justify-center mt-4">
                                        <Avatar src={logoUrl} className="w-20 h-20 text-large" />
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={saveLogo}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Add Server Modal */}
            <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Add MCP Server</ModalHeader>
                            <ModalBody>
                                <Select
                                    label="Server Type"
                                    selectedKeys={[addServerType]}
                                    onChange={(e) => setAddServerType(e.target.value as "sse" | "stdio")}
                                >
                                    <SelectItem key="sse">SSE (HTTP)</SelectItem>
                                    <SelectItem key="stdio">Stdio (Local Command)</SelectItem>
                                </Select>

                                <Textarea
                                    label="Configuration (JSON)"
                                    placeholder={
                                        addServerType === 'sse'
                                            ? '{"my-server": {"url": "http://localhost:3000/sse"}}'
                                            : '{"filesystem": {"command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/files"]}}'
                                    }
                                    value={addServerConfig}
                                    onValueChange={setAddServerConfig}
                                    minRows={5}
                                    description="Enter the server configuration as a JSON object."
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={() => handleAddServer(onClose)} isLoading={isAdding}>
                                    Add Server
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Tool Details Modal */}
            <Modal isOpen={isToolOpen} onOpenChange={onToolOpenChange} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {selectedTool?.name}
                            </ModalHeader>
                            <ModalBody>
                                <Tabs aria-label="Tool Options">
                                    <Tab key="details" title="Details">
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <h3 className="text-sm font-semibold text-default-500">Description</h3>
                                                <p className="text-default-700">{selectedTool?.description || "No description provided."}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-default-500 mb-2">Input Schema</h3>
                                                <div className="bg-default-100 p-4 rounded-lg overflow-x-auto">
                                                    <pre className="text-xs font-mono whitespace-pre-wrap">
                                                        {JSON.stringify(selectedTool?.inputSchema, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </Tab>
                                    <Tab key="run" title="Run Tool">
                                        {selectedTool && (
                                            <ToolTester
                                                toolName={selectedTool.name}
                                                schema={selectedTool.inputSchema}
                                            />
                                        )}
                                    </Tab>
                                </Tabs>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </section>
    );
}
