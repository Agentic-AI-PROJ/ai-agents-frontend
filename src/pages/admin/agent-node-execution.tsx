import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getAgentExecutionById,
    getAgentExecutionNodes,
    AgentExecution,
    NodeExecution
} from '@/api/agent_execution.api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Code } from "@heroui/code";
import { ArrowLeft, Clock, Activity, AlertCircle, CheckCircle2, PlayCircle } from 'lucide-react';
import MarkdownRenderer from '@/components/markdownRenderer';

export default function AgentNodeExecutionPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [execution, setExecution] = useState<AgentExecution | null>(null);
    const [nodes, setNodes] = useState<NodeExecution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = "Agent Node Execution";
        const fetchData = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                // Fetch execution details and nodes in parallel
                const [executionData, nodesData] = await Promise.all([
                    getAgentExecutionById(id),
                    getAgentExecutionNodes(id)
                ]);

                setExecution(executionData);
                setNodes(nodesData);
            } catch (err) {
                console.error("Failed to fetch execution data:", err);
                setError("Failed to load execution details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'success';
            case 'FAILED': return 'danger';
            case 'RUNNING': return 'warning';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle2 size={16} />;
            case 'FAILED': return <AlertCircle size={16} />;
            case 'RUNNING': return <Activity size={16} />;
            default: return <PlayCircle size={16} />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex bg-background h-[calc(100vh-4rem)] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-default-500 font-medium">Loading execution details...</div>
                </div>
            </div>
        );
    }

    if (error || !execution) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <AlertCircle className="w-12 h-12 text-danger" />
                <h2 className="text-xl font-bold">Error Loading Execution</h2>
                <p className="text-default-500">{error || "Execution not found"}</p>
                <Button onPress={() => navigate(-1)} startContent={<ArrowLeft size={16} />}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <Button
                    variant="light"
                    isIconOnly
                    onPress={() => navigate(-1)}
                    className="min-w-10"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        Execution Details
                        <Chip
                            size="sm"
                            color={getStatusColor(execution.status)}
                            variant="flat"
                            startContent={getStatusIcon(execution.status)}
                            className="pl-2"
                        >
                            {execution.status}
                        </Chip>
                    </h1>
                    <div className="flex items-center gap-2 text-small text-default-500 mt-1">
                        <span className="font-mono text-xs bg-default-100 px-2 py-0.5 rounded">
                            {execution.executionId}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(execution.startTime).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="">

                {/* Right Column: Node Timeline */}
                <div className="lg:col-span-2 space-y-4">
                    <div>

                        <h2 className="text-xl font-bold flex items-center gap-2 px-1">
                            <Activity size={20} />
                            Execution Timeline
                        </h2>
                        <span className="font-mono text-default-500 text-sm font-light">Total Nodes {nodes.length} • Total Duration {execution.endTime
                            ? `${((new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000).toFixed(2)}s`
                            : 'Running...'}</span>
                    </div>

                    <Card>
                        <CardHeader className="font-bold text-lg px-6 pt-6">User Request</CardHeader>
                        <CardBody className="px-6 pb-6">
                            <div className="bg-default-50 p-4 rounded-lg text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                {execution.userMessage}
                            </div>
                        </CardBody>
                    </Card>

                    {nodes.length === 0 ? (
                        <Card>
                            <CardBody className="py-12 flex flex-col items-center justify-center text-default-500">
                                <Activity size={32} className="mb-2 opacity-50" />
                                <p>No nodes executed yet.</p>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {nodes.map((node, index) => (
                                <Card key={node._id} className="w-full">
                                    <CardHeader className="flex justify-between items-start pb-2 px-5 pt-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-large">{node.nodeName}</h3>
                                                <div className="text-tiny text-default-400 font-mono">
                                                    {new Date(node.startTime).toLocaleTimeString()}
                                                    {node.endTime && ` • ${((new Date(node.endTime).getTime() - new Date(node.startTime).getTime()) / 1000).toFixed(3)}s`}
                                                </div>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={getStatusColor(node.status)}
                                        >
                                            {node.status}
                                        </Chip>
                                    </CardHeader>
                                    <div className="px-5 pb-5">
                                        <div className="pl-11 space-y-4">
                                            {/* Node Input */}
                                            {node.input && Object.keys(node.input).length > 0 && (
                                                <div className="space-y-1">
                                                    <div className="text-tiny uppercase font-bold text-default-400 tracking-wider">Input</div>
                                                    <ScrollShadow className="max-h-[200px] w-full border border-default-200 rounded-lg bg-default-50">
                                                        <Code className="w-full p-3 font-mono text-xs bg-transparent">
                                                            {JSON.stringify(node.input, null, 2)}
                                                        </Code>
                                                    </ScrollShadow>
                                                </div>
                                            )}

                                            {/* Node Output */}
                                            {node.output && (
                                                <div className="space-y-1">
                                                    <div className="text-tiny uppercase font-bold text-default-400 tracking-wider">Output</div>
                                                    <div className="text-sm bg-default-50 border border-default-200 rounded-lg p-3 overflow-x-auto">
                                                        {typeof node.output === 'string' ? (
                                                            <MarkdownRenderer content={node.output} />
                                                        ) : (
                                                            <Code className="w-full bg-transparent font-mono text-xs">
                                                                {JSON.stringify(node.output, null, 2)}
                                                            </Code>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Node Error */}
                                            {node.error && (
                                                <div className="p-3 bg-danger-50 text-danger border border-danger-200 rounded-lg text-sm font-mono mt-2">
                                                    <strong>Error:</strong> {node.error}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}