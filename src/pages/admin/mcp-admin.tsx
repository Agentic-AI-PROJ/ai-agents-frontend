import { title } from '@/components/primitives';
import { useEffect, useState } from 'react';
import {
    getServers,
    getTools,
    updateServerStatus,
    updateToolStatus,
    updateServer,
    McpServer,
    McpTool
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
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";

export default function McpAdminPage() {
    const [servers, setServers] = useState<McpServer[]>([]);
    const [tools, setTools] = useState<McpTool[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Logo Modal State
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [editingServerKey, setEditingServerKey] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState("");


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
            alert("Failed to save logo");
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
                    <h2 className="text-2xl font-bold">Servers</h2>
                    <Table aria-label="MCP Servers Table">
                        <TableHeader>
                            <TableColumn>LOGO</TableColumn>
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
                                        <Button size="sm" variant="light" onPress={() => openEditLogo(server)}>Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Tools Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">Tools</h2>
                    <Table aria-label="MCP Tools Table">
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
                                    <TableRow key={tool.id}>
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

            {/* Edit Modal */}
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
        </section>
    );
}
