import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { AIModel } from "@/types/AIModel";

interface AIModelFormProps {
    model: Partial<AIModel>;
    onChange: (model: Partial<AIModel>) => void;
}

export default function AIModelForm({ model, onChange }: AIModelFormProps) {
    // Local state to manage nested updates before propagating or direct propagation
    // Since we pass onChange, we can call it directly.

    const updateField = (field: keyof AIModel, value: any) => {
        onChange({ ...model, [field]: value });
    };

    const updateNestedField = (parent: "cost" | "limits" | "details" | "groundings", field: string, value: any) => {
        onChange({
            ...model,
            [parent]: {
                ...model[parent],
                [field]: value
            }
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                <Input
                    label="Name"
                    placeholder="Display Name"
                    value={model.name || ""}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="flex-1"
                />
                <div className="flex items-center gap-2">
                    <span className="text-small text-default-500">Active</span>
                    <Switch
                        isSelected={model.isActive ?? true}
                        onValueChange={(val) => updateField("isActive", val)}
                    />
                </div>
            </div>

            <Input
                label="Model ID"
                placeholder="e.g. gemini/gemini-pro"
                value={model.model_id || ""}
                onChange={(e) => updateField("model_id", e.target.value)}
            />

            <Input
                label="API Key"
                placeholder="API Key"
                type="password"
                value={model.api_key || ""}
                onChange={(e) => updateField("api_key", e.target.value)}
            />

            <Input
                label="Base URL"
                placeholder="Optional Base URL"
                value={model.base_url || ""}
                onChange={(e) => updateField("base_url", e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg border-default-200">
                <h3 className="col-span-2 text-small font-bold text-default-500">Token Limits</h3>
                <Input
                    label="Max Input Tokens"
                    type="number"
                    value={model.limits?.max_input_tokens?.toString() || ""}
                    onChange={(e) => updateNestedField("limits", "max_input_tokens", e.target.value ? parseInt(e.target.value) : null)}
                />
                <Input
                    label="Max Output Tokens"
                    type="number"
                    value={model.limits?.max_output_tokens?.toString() || ""}
                    onChange={(e) => updateNestedField("limits", "max_output_tokens", e.target.value ? parseInt(e.target.value) : null)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg border-default-200">
                <h3 className="col-span-2 text-small font-bold text-default-500">Rate Limits</h3>
                <Input
                    label="Requests Per Minute"
                    type="number"
                    value={model.details?.requests_per_minute?.toString() || ""}
                    onChange={(e) => updateNestedField("details", "requests_per_minute", e.target.value ? parseInt(e.target.value) : null)}
                />
                <Input
                    label="Requests Per Day"
                    type="number"
                    value={model.details?.requests_per_day?.toString() || ""}
                    onChange={(e) => updateNestedField("details", "requests_per_day", e.target.value ? parseInt(e.target.value) : null)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg border-default-200">
                <h3 className="col-span-2 text-small font-bold text-default-500">Grounding Limits</h3>

                <Input
                    label="Web Search Limit (Per Day)"
                    type="number"
                    placeholder="Enter limit or leave empty"
                    value={model.groundings?.websearch?.toString() || ""}
                    onChange={(e) => updateNestedField("groundings", "websearch", e.target.value ? parseInt(e.target.value) : null)}
                />
                {/* Placeholder for future grounding types */}
                <div className="hidden"></div>
            </div>


            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg border-default-200">
                <h3 className="col-span-2 text-small font-bold text-default-500">Cost (per million)</h3>
                <Input
                    label="Input Cost"
                    type="number"
                    step="0.01"
                    value={model.cost?.input_per_million?.toString() || "0"}
                    onChange={(e) => updateNestedField("cost", "input_per_million", parseFloat(e.target.value))}
                />
                <Input
                    label="Output Cost"
                    type="number"
                    step="0.01"
                    value={model.cost?.output_per_million?.toString() || "0"}
                    onChange={(e) => updateNestedField("cost", "output_per_million", parseFloat(e.target.value))}
                />
            </div>
        </div>
    );
}
