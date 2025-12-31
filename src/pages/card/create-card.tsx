import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Spacer } from "@heroui/spacer";
import { createChatbotCard } from '@/api/chatbot-cards.api';
import { useAlert } from '@/contexts/AlertContext';
import { ChatbotCard } from '@/types/ChatbotCard';
import { useChatbotCards } from '@/contexts/ChatbotCardsContext';
import { appRoutes } from '@/config/site';

export default function CreateCardPage() {
    const navigate = useNavigate();
    const { loadChatbotCards } = useChatbotCards();
    const { showSuccess, showError } = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    const cardsRoute = appRoutes.find((route) => route.name === "Cards");
    const newChatRoute = appRoutes.find((route) => route.name === "New Chat");

    const [formData, setFormData] = useState<Partial<ChatbotCard>>({
        name: '',
        description: '',
        systemPrompt: '',
        visibility: 'private',
        reasoningEffort: 'minimal',
        llmModel: 'gpt-3.5-turbo',
        fileParameters: {
            fileUploadAllowed: false,
            allowedFileTypes: [],
            fileUploadSizeLimit: 10,
        },
        modelParameters: {
            temperature: 0.7,
            maxTokens: 100,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
        },
    });

    useEffect(() => {
        document.title = 'Create Chatbot Card';
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent: 'fileParameters' | 'modelParameters', field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent]!,
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createChatbotCard(formData);
            showSuccess('Chatbot card created successfully!');
            loadChatbotCards();
            navigate(cardsRoute?.path || '/card'); // Redirect to list page (we'll need to create this later or redirect to home)
        } catch (error) {
            console.error('Error creating card:', error);
            showError('Failed to create chatbot card. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full py-10">
            <Card className="w-full max-w-4xl">
                <CardHeader className="flex flex-col items-start px-8 pt-8">
                    <h1 className="text-3xl font-bold">Create Chatbot Card</h1>
                    <p className="text-default-500">Configure your new AI assistant</p>
                </CardHeader>
                <Divider className="my-4" />
                <CardBody className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Name"
                                placeholder="e.g., Coding Assistant"
                                value={formData.name}
                                onValueChange={(val) => handleChange('name', val)}
                                isRequired
                            />
                            <Select
                                label="Visibility"
                                selectedKeys={[formData.visibility!]}
                                onChange={(e) => handleChange('visibility', e.target.value)}
                            >
                                <SelectItem key="public">Public</SelectItem>
                                <SelectItem key="private">Private</SelectItem>
                            </Select>
                        </div>

                        <Textarea
                            label="Description"
                            placeholder="Describe what this chatbot does..."
                            value={formData.description}
                            onValueChange={(val) => handleChange('description', val)}
                        />

                        <Textarea
                            label="System Prompt"
                            placeholder="You are a helpful AI assistant..."
                            value={formData.systemPrompt}
                            onValueChange={(val) => handleChange('systemPrompt', val)}
                            minRows={4}
                            isRequired
                        />

                        <Divider />

                        {/* Model Configuration */}
                        <h3 className="text-xl font-semibold">Model Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="LLM Model"
                                placeholder="e.g., gpt-4"
                                value={formData.llmModel}
                                onValueChange={(val) => handleChange('llmModel', val)}
                                isRequired
                            />
                            <Select
                                label="Reasoning Effort"
                                selectedKeys={[formData.reasoningEffort!]}
                                onChange={(e) => handleChange('reasoningEffort', e.target.value)}
                            >
                                <SelectItem key="none">None</SelectItem>
                                <SelectItem key="minimal">Minimal</SelectItem>
                                <SelectItem key="low">Low</SelectItem>
                                <SelectItem key="medium">Medium</SelectItem>
                                <SelectItem key="high">High</SelectItem>
                            </Select>
                        </div>

                        {/* Model Parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="number"
                                label="Temperature"
                                value={formData.modelParameters?.temperature.toString()}
                                onValueChange={(val) => handleNestedChange('modelParameters', 'temperature', parseFloat(val))}
                                step={0.1}
                                min={0}
                                max={2}
                            />
                            <Input
                                type="number"
                                label="Max Tokens"
                                value={formData.modelParameters?.maxTokens.toString()}
                                onValueChange={(val) => handleNestedChange('modelParameters', 'maxTokens', parseInt(val))}
                            />
                            <Input
                                type="number"
                                label="Top P"
                                value={formData.modelParameters?.topP.toString()}
                                onValueChange={(val) => handleNestedChange('modelParameters', 'topP', parseFloat(val))}
                                step={0.1}
                                min={0}
                                max={1}
                            />
                            <Input
                                type="number"
                                label="Frequency Penalty"
                                value={formData.modelParameters?.frequencyPenalty.toString()}
                                onValueChange={(val) => handleNestedChange('modelParameters', 'frequencyPenalty', parseFloat(val))}
                                step={0.1}
                                min={-2}
                                max={2}
                            />
                            <Input
                                type="number"
                                label="Presence Penalty"
                                value={formData.modelParameters?.presencePenalty.toString()}
                                onValueChange={(val) => handleNestedChange('modelParameters', 'presencePenalty', parseFloat(val))}
                                step={0.1}
                                min={-2}
                                max={2}
                            />
                        </div>

                        <Divider />

                        {/* File Parameters */}
                        <h3 className="text-xl font-semibold">File Capabilities</h3>
                        <div className="flex flex-col gap-4">
                            <Switch
                                isSelected={formData.fileParameters?.fileUploadAllowed}
                                onValueChange={(val) => handleNestedChange('fileParameters', 'fileUploadAllowed', val)}
                            >
                                Allow File Uploads
                            </Switch>

                            {formData.fileParameters?.fileUploadAllowed && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        type="number"
                                        label="Size Limit (MB)"
                                        value={formData.fileParameters?.fileUploadSizeLimit.toString()}
                                        onValueChange={(val) => handleNestedChange('fileParameters', 'fileUploadSizeLimit', parseInt(val))}
                                    />
                                    {/* Note: Allowed file types would typically be a multi-select or tag input, simplified here */}
                                    <Input
                                        label="Allowed Types (comma separated)"
                                        placeholder="pdf, txt, docx"
                                        value={formData.fileParameters?.allowedFileTypes.join(', ')}
                                        onValueChange={(val) => handleNestedChange('fileParameters', 'allowedFileTypes', val.split(',').map(s => s.trim()))}
                                    />
                                </div>
                            )}
                        </div>

                        <Spacer y={4} />

                        <div className="flex justify-end gap-4">
                            <Button variant="flat" color="danger" onPress={() => navigate(newChatRoute?.path || "/chat")}>
                                Cancel
                            </Button>
                            <Button color="primary" type="submit" isLoading={isLoading}>
                                Create Card
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
