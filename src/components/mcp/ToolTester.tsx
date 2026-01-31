import React, { useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody } from "@heroui/card";
import { executeTool } from '@/api/mcp-client.api';

// Helper to get default value for a schema
const getDefaultValue = (schema: any): any => {
    switch (schema.type) {
        case 'string': return '';
        case 'number':
        case 'integer': return 0;
        case 'boolean': return false;
        case 'array': return [];
        case 'object': return {};
        default: return '';
    }
};

interface DynamicFormInputProps {
    name: string;
    schema: any;
    value: any;
    onChange: (val: any) => void;
    isRequired?: boolean;
    level?: number;
}

const DynamicFormInput: React.FC<DynamicFormInputProps> = ({ name, schema, value, onChange, isRequired, level = 0 }) => {
    const description = schema.description || "";
    const label = `${name}${isRequired ? ' *' : ''}`;

    if (schema.type === 'boolean') {
        return (
            <div className="flex flex-col gap-1 mb-4">
                <Switch
                    isSelected={!!value}
                    onValueChange={onChange}
                >
                    {label}
                </Switch>
                {description && <p className="text-tiny text-default-400">{description}</p>}
            </div>
        );
    }

    if (schema.enum) {
        return (
            <Select
                label={label}
                placeholder={`Select ${name}`}
                selectedKeys={value ? [value] : []}
                onChange={(e) => onChange(e.target.value)}
                className="mb-4"
                description={description}
            >
                {schema.enum.map((val: string) => (
                    <SelectItem key={val}>
                        {val}
                    </SelectItem>
                ))}
            </Select>
        );
    }

    if (schema.type === 'object') {
        const properties = schema.properties || {};
        const required = schema.required || [];
        const currentValue = value || {};

        return (
            <div className="flex flex-col gap-2 mb-4 p-4 border border-default-200 rounded-medium bg-default-50/50">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-tiny text-default-400">Object</span>
                </div>
                {description && <p className="text-tiny text-default-400 mb-2">{description}</p>}

                <div className="flex flex-col gap-2 pl-2 border-l-2 border-default-200">
                    {Object.entries(properties).map(([propKey, propSchema]) => (
                        <DynamicFormInput
                            key={propKey}
                            name={propKey}
                            schema={propSchema}
                            value={currentValue[propKey]}
                            onChange={(val) => {
                                onChange({ ...currentValue, [propKey]: val });
                            }}
                            isRequired={required.includes(propKey)}
                            level={level + 1}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (schema.type === 'array') {
        const itemsSchema = schema.items || {};
        const currentArray = Array.isArray(value) ? value : [];

        const handleAddItem = () => {
            const newItem = getDefaultValue(itemsSchema);
            onChange([...currentArray, newItem]);
        };

        const handleRemoveItem = (index: number) => {
            const newArray = [...currentArray];
            newArray.splice(index, 1);
            onChange(newArray);
        };

        return (
            <div className="flex flex-col gap-2 mb-4 p-4 border border-default-200 rounded-medium bg-default-50/50">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-tiny text-default-400">Array</span>
                </div>
                {description && <p className="text-tiny text-default-400 mb-2">{description}</p>}

                <div className="flex flex-col gap-3">
                    {currentArray.map((item: any, index: number) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="flex-grow">
                                <DynamicFormInput
                                    name={`Item ${index + 1}`}
                                    schema={itemsSchema}
                                    value={item}
                                    onChange={(val) => {
                                        const newArray = [...currentArray];
                                        newArray[index] = val;
                                        onChange(newArray);
                                    }}
                                    level={level + 1}
                                />
                            </div>
                            <Button isIconOnly color="danger" variant="light" size="sm" onPress={() => handleRemoveItem(index)}>
                                X
                            </Button>
                        </div>
                    ))}
                    <Button size="sm" variant="flat" color="primary" onPress={handleAddItem} className="self-start">
                        + Add Item
                    </Button>
                </div>
            </div>
        );
    }

    // Default to Input
    return (
        <Input
            label={label}
            placeholder={`Enter ${name}`}
            type={schema.type === 'number' || schema.type === 'integer' ? 'number' : 'text'}
            value={value || ''}
            onValueChange={(val) => {
                const finalVal = (schema.type === 'number' || schema.type === 'integer') ? Number(val) : val;
                onChange(finalVal);
            }}
            className="mb-4"
            description={description}
            isRequired={isRequired}
        />
    );
};

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
        // We could initiate default args here if we wanted
    }, [schema]);

    const handleRun = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const output = await executeTool(toolName, args);
            setResult(output);
        } catch (err: any) {
            console.error("Tool execution failed", err);
            setError(err.message || "Failed to execute tool");
        } finally {
            setLoading(false);
        }
    };

    const properties = schema?.properties || {};
    const required = schema?.required || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                {Object.entries(properties).map(([key, prop]) => (
                    <DynamicFormInput
                        key={key}
                        name={key}
                        schema={prop}
                        value={args[key]}
                        onChange={(val) => setArgs(prev => ({ ...prev, [key]: val }))}
                        isRequired={required.includes(key)}
                    />
                ))}
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
