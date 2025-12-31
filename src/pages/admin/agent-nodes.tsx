import React, { useEffect, useState } from 'react';
import { fetchNodeConfigs, updateNodeConfig, NodeConfig } from '../../api/nodes.api';
import { aiModelsApi } from "@/api/aiModels.api";
import { AIModel } from "@/types/AIModel";
import { title } from "@/components/primitives";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { Divider } from "@heroui/divider";
import { appRoutes } from "@/config/site";
import { Server, Cpu, FileText, Copy, Edit } from 'lucide-react';
import { useAlert } from "@/contexts/AlertContext";
import { Textarea } from "@heroui/input";

const AgentNodesPage: React.FC = () => {
    const [nodes, setNodes] = useState<NodeConfig[]>([]);
    const [activeModels, setActiveModels] = useState<AIModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingNode, setEditingNode] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [editedSystemPrompt, setEditedSystemPrompt] = useState<string>('');
    const [updating, setUpdating] = useState(false);

    const { showAlert } = useAlert();

    const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");

    useEffect(() => {
        document.title = "Agent Nodes";
        const loadData = async () => {
            try {
                const [nodesData, modelsData] = await Promise.all([
                    fetchNodeConfigs(),
                    aiModelsApi.getActive()
                ]);
                setNodes(nodesData);
                setActiveModels(modelsData);
            } catch (err: any) {
                setError('Failed to load configurations');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleEdit = (node: NodeConfig) => {
        setEditingNode(node.nodeName);
        setSelectedModel(node.modelName);
        setEditedSystemPrompt(node.systemPrompt);
    };

    const handleCancel = () => {
        setEditingNode(null);
        setSelectedModel('');
        setEditedSystemPrompt('');
    };

    const validateVariables = (prompt: string, variables?: string[]) => {
        if (!variables || variables.length === 0) return true;
        // Check if all variables are present in the prompt
        // Variables are expected to be in {{variable}} format
        return variables.every(v => prompt.includes(`{{${v}}}`));
    };

    const handleSave = async (node: NodeConfig) => {
        if (!selectedModel) return;
        if (!validateVariables(editedSystemPrompt, node.variables)) return;

        setUpdating(true);
        try {
            const updatedNode = await updateNodeConfig(node.nodeName, {
                modelName: selectedModel,
                systemPrompt: editedSystemPrompt
            });
            setNodes(nodes.map(n => n.nodeName === node.nodeName ? updatedNode : n));
            setEditingNode(null);
            showAlert({
                title: "Node configuration updated",
                variant: "success"
            });
        } catch (error) {
            console.error("Failed to update node config", error);
            showAlert({
                title: "Failed to update configuration",
                variant: "danger"
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="p-8 text-center text-danger">{error}</div>;

    return (
        <section className="flex flex-col items-center gap-6 py-8 px-8 md:py-10">
            <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
                <h1 className={title()}>Agent Nodes</h1>
                <Breadcrumbs>
                    <BreadcrumbItem href={adminRoute?.path}>Admin</BreadcrumbItem>
                    <BreadcrumbItem>Agent Nodes</BreadcrumbItem>
                </Breadcrumbs>
            </div>

            <div className="w-full max-w-6xl px-4 grid grid-cols-1 gap-6">
                {nodes.map((node) => (
                    <Card key={node._id} className="w-full">
                        <CardHeader className="flex gap-3 justify-between items-start">
                            <div className="flex gap-3">
                                <div className="p-2 rounded-lg bg-default-100 flex items-center justify-center">
                                    <Server size={20} className="text-default-500" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-md font-semibold">{node.nodeName}</p>
                                    <p className="text-small text-default-500">{node.description || "No description provided."}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {editingNode === node.nodeName ? (
                                    <div className="flex items-center gap-2">
                                        <Select
                                            size="sm"
                                            className="w-64"
                                            selectedKeys={selectedModel ? [selectedModel] : []}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            aria-label="Select Model"
                                        >
                                            {activeModels.map((model) => (
                                                <SelectItem key={model.model_id} textValue={model.model_id}>
                                                    {model.model_id}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <Button
                                            size="sm"
                                            color="primary"
                                            isLoading={updating}
                                            onPress={() => handleSave(node)}
                                            isDisabled={!validateVariables(editedSystemPrompt, node.variables)}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="light"
                                            onPress={handleCancel}
                                            isDisabled={updating}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Chip
                                            startContent={<Cpu size={14} />}
                                            variant="flat"
                                            color="primary"
                                            size="sm"
                                        >
                                            {node.modelName}
                                        </Chip>
                                        <Button
                                            size="sm"
                                            isIconOnly
                                            variant="light"
                                            onPress={() => handleEdit(node)}
                                        >
                                            <Edit size={16} />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            {node.variables && node.variables.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-small font-medium text-default-600 mb-2">Variables</p>
                                    <div className="flex flex-wrap gap-2">
                                        {node.variables.map((v) => (
                                            <Chip key={v} size="sm" variant="flat" color="primary" className="font-mono text-tiny">
                                                {`{${v}}`}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-2 text-small font-medium text-default-600">
                                <FileText size={16} />
                                <span>System Prompt</span>
                            </div>
                            <div className="relative group">
                                {editingNode === node.nodeName ? (
                                    <div className="flex flex-col gap-2">
                                        <Textarea
                                            value={editedSystemPrompt}
                                            onValueChange={setEditedSystemPrompt}
                                            minRows={5}
                                            maxRows={20}
                                            variant="bordered"
                                            classNames={{
                                                input: "font-mono text-sm",
                                            }}
                                            isInvalid={!validateVariables(editedSystemPrompt, node.variables)}
                                            errorMessage={
                                                !validateVariables(editedSystemPrompt, node.variables)
                                                    ? `All variables must be used: ${node.variables?.filter(v => !editedSystemPrompt.includes(`{{${v}}`)).map(v => `{{${v}}}`).join(', ')}`
                                                    : undefined
                                            }
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <pre className="bg-zinc-950 p-4 rounded-lg text-sm text-zinc-300 font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto border border-zinc-900 custom-scrollbar">
                                            {node.systemPrompt.split(/(\{\{.*?\}\})/).map((part, index) => {
                                                if (part.match(/^\{\{.*?\}\}$/)) {
                                                    const variableName = part.replace(/^\{\{|\}\}$/g, '');
                                                    return (
                                                        <Chip
                                                            key={index}
                                                            size="sm"
                                                            color="primary"
                                                            variant="flat"
                                                            className="mx-1 h-5 text-tiny font-mono select-none"
                                                        >
                                                            {variableName}
                                                        </Chip>
                                                    );
                                                }
                                                return <span key={index}>{part}</span>;
                                            })}
                                        </pre>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(node.systemPrompt)}
                                            className="absolute top-3 right-3 p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Copy Prompt"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </CardBody>
                        <CardFooter className="text-tiny text-default-400 justify-end">
                            Last Updated: {new Date(node.lastUpdated).toLocaleString()}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    );
};

export default AgentNodesPage;
