import React, { useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody } from "@heroui/card";
import { executeTool } from '@/api/mcp-client.api';

interface ToolTesterProps {
    toolName: string;
    schema: any;
}

export const ToolTester: React.FC<ToolTesterProps> = ({ toolName, schema }) => {
    const [args, setArgs] = useState<Record<string, any>>({});
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial properties setup
    useEffect(() => {
        // Initialize defaults if any, or just empty
        // Schema structure: { type: "object", properties: { ... }, required: [...] }
    }, [schema]);

    const handleChange = (key: string, value: any) => {
        setArgs(prev => ({ ...prev, [key]: value }));
    };

    const handleRun = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            // Filter out empty optional strings/undefined to avoid sending unnecessary data
            // but for now sending what's in state is fine. 
            // Maybe rudimentary validation against 'required' fields
            const output = await executeTool(toolName, args);
            setResult(output);
        } catch (err: any) {
            console.error("Tool execution failed", err);
            setError(err.message || "Failed to execute tool");
        } finally {
            setLoading(false);
        }
    };

    const renderField = (key: string, prop: any, isRequired: boolean) => {
        const description = prop.description || "";
        const label = `${key}${isRequired ? ' *' : ''}`;

        if (prop.type === 'boolean') {
            return (
                <div key={key} className="flex flex-col gap-1 mb-4">
                    <Switch
                        isSelected={!!args[key]}
                        onValueChange={(val) => handleChange(key, val)}
                    >
                        {label}
                    </Switch>
                    {description && <p className="text-tiny text-default-400">{description}</p>}
                </div>
            );
        }

        if (prop.enum) {
            return (
                <Select
                    key={key}
                    label={label}
                    placeholder={`Select ${key}`}
                    selectedKeys={args[key] ? [args[key]] : []}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="mb-4"
                    description={description}
                >
                    {prop.enum.map((val: string) => (
                        <SelectItem key={val}>
                            {val}
                        </SelectItem>
                    ))}
                </Select>
            );
        }

        // Default to text input for string/number/others
        return (
            <Input
                key={key}
                label={label}
                placeholder={`Enter ${key}`}
                type={prop.type === 'number' || prop.type === 'integer' ? 'number' : 'text'}
                value={args[key] || ''}
                onValueChange={(val) => {
                    const finalVal = (prop.type === 'number' || prop.type === 'integer') ? Number(val) : val;
                    handleChange(key, finalVal);
                }}
                className="mb-4"
                description={description}
                isRequired={isRequired}
            />
        );
    };

    const properties = schema?.properties || {};
    const required = schema?.required || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(properties).map(([key, prop]) =>
                    renderField(key, prop, required.includes(key))
                )}
                {Object.keys(properties).length === 0 && (
                    <p className="text-default-500 italic">No arguments required for this tool.</p>
                )}
            </div>

            <Button
                color="primary"
                isLoading={loading}
                onPress={handleRun}
                className="w-full md:w-auto self-end"
            >
                Run Tool
            </Button>

            {error && (
                <Card className="bg-danger-50 border-danger-200 border">
                    <CardBody>
                        <p className="text-danger font-semibold">Error:</p>
                        <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                    </CardBody>
                </Card>
            )}

            {result && (
                <Card className="bg-content2">
                    <CardBody>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-default-600 font-semibold">Output:</p>
                        </div>
                        <div className="bg-black/80 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                            <pre>{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};
