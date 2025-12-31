
import { useState, useEffect } from 'react';
import { ExecutionStep, ExecutionStepType } from '@/types/Chat';
import MarkdownRenderer from '../markdownRenderer';
import { getToolLogo } from '@/api/mcp-client.api';
import { Avatar } from "@heroui/avatar"; // Assuming Avatar is available or use img
import {
    Brain,
    Calendar,
    Code,
    Terminal,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Search
} from 'lucide-react';

interface ExecutionStepCardProps {
    step: ExecutionStep;
    resultStep?: ExecutionStep;
}

const StepIcon = ({ type, iconUrl, title }: { type: ExecutionStepType, iconUrl?: string, title?: string }) => {
    if (iconUrl) {
        return <Avatar src={iconUrl} name={title?.substring(0, 2).toUpperCase()} className="w-6 h-6" size="sm" />;
    }

    switch (type) {
        case 'metadata': return <Search className="w-4 h-4" />;
        case 'planning': return <Calendar className="w-4 h-4" />;
        case 'tool_call': return <Terminal className="w-4 h-4" />;
        case 'tool_result': return <Code className="w-4 h-4" />;
        case 'replan': return <RefreshCw className="w-4 h-4" />;
        case 'thought': return <Brain className="w-4 h-4" />;
        case 'error': return <AlertCircle className="w-4 h-4" />;
        case 'final_answer': return <CheckCircle2 className="w-4 h-4" />;
        default: return <Brain className="w-4 h-4" />;
    }
};

const StepTitle = ({ step }: { step: ExecutionStep }) => {
    switch (step.type) {
        case 'metadata': return <span>Execution Started</span>;
        case 'planning': return <span>Plan</span>;
        case 'tool_call': return <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{step.title}</span>;
        case 'tool_result': return <span>Tool Result</span>;
        case 'replan': return <span>Replanning</span>;
        case 'thought': return <span>Thought</span>;
        case 'error': return <span>Error</span>;
        default: return <span>{step.title}</span>;
    }
};

export default function ExecutionStepCard({ step, resultStep }: ExecutionStepCardProps) {
    const showAllSteps = import.meta.env.VITE_SHOW_ALL_EXECUTION_STEPS === 'true';
    const allowedTypes: ExecutionStepType[] = ['tool_call', 'tool_result', 'final_answer'];

    if (!showAllSteps && !allowedTypes.includes(step.type)) {
        return null;
    }

    const [expanded, setExpanded] = useState(false);
    const [toolIcon, setToolIcon] = useState<string | undefined>(undefined);

    const toggleExpanded = () => setExpanded(!expanded);

    useEffect(() => {
        const fetchIcon = async () => {
            if (step.type === 'tool_call' || step.type === 'tool_result') {
                // The step.title often contains the tool name for these types, or logic to extract it
                // Assuming step.title IS the tool name for tool_call. 
                // For tool_result, we might need relation, but let's try title first.
                if (step.title) {
                    const logo = await getToolLogo(step.title);
                    setToolIcon(logo);
                }
            }
        };
        fetchIcon();
    }, [step]);


    // Dynamic styles based on type
    const getBorderColor = () => {
        switch (step.type) {
            case 'error': return 'border-destructive/50';
            case 'planning': return 'border-blue-500/30';
            case 'tool_call': return 'border-purple-500/30';
            case 'tool_result': return 'border-green-500/30';
            case 'replan': return 'border-orange-500/30';
            default: return 'border-border';
        }
    };

    const getBgColor = () => {
        switch (step.type) {
            case 'error': return 'bg-destructive/10';
            default: return 'bg-card/50';
        }
    };

    return (
        <div className={`rounded-lg border ${getBorderColor()} ${getBgColor()} overflow-hidden transition-all duration-200`}>
            {/* Header */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                onClick={toggleExpanded}
            >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <StepIcon type={step.type} iconUrl={toolIcon} title={step.title} />
                    <StepTitle step={step} />
                </div>
                <div className="flex items-center gap-2">
                    {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
            </div>

            {/* Content */}
            {expanded && (
                <div className="p-3 border-t bg-background/50 text-sm">
                    {renderContent(step, resultStep)}
                </div>
            )}
        </div>
    );
}

function renderContent(step: ExecutionStep, resultStep?: ExecutionStep) {
    if (step.type === 'tool_call') {
        const { reasoning, args } = step.content;

        const markdownContentRequest = `\`\`\`Request
${JSON.stringify(args, null, 2)}
\`\`\``;

        return (
            <div className="space-y-3">
                {reasoning && (
                    <div className="text-muted-foreground italic">
                        {reasoning}
                    </div>
                )}

                <div className="space-y-1">
                    <div className="bg-muted rounded p-2 text-xs">
                        <MarkdownRenderer content={markdownContentRequest} />
                    </div>
                </div>

                {resultStep && (
                    <div className="space-y-1">
                        {renderResultContent(resultStep)}
                    </div>
                )}
            </div>
        );
    }

    if (step.type === 'tool_result') {
        return renderResultContent(step);
    }

    if (step.type === 'planning' || step.type === 'replan') {
        return <MarkdownRenderer content={step.content} />;
    }

    if (step.type === 'thought') {
        return <MarkdownRenderer content={step.content} />;
    }

    if (step.type === 'metadata') {
        return <div className="text-muted-foreground font-mono text-xs">{step.content}</div>;
    }

    if (step.type === 'error') {
        return <div className="text-destructive font-mono">{step.content}</div>;
    }

    return (
        <div className="whitespace-pre-wrap">
            {typeof step.content === 'string' ? step.content : JSON.stringify(step.content, null, 2)}
        </div>
    );
}

function renderResultContent(step: ExecutionStep) {
    let content = step.content;

    // Clean up specific prefix if present
    if (typeof content === 'string') {
        const prefix = "Tool completed successfully.Key result: ";
        if (content.startsWith(prefix)) {
            content = content.substring(prefix.length);
        }
        // Try parsing to verify/format JSON
        try {
            content = JSON.parse(content);
        } catch { }
    }

    const resultStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

    const markdownContentResponse = `\`\`\`Response
${resultStr}
\`\`\``;

    return (
        <div className="bg-muted/30 rounded p-2 overflow-x-auto max-h-60">
            <MarkdownRenderer content={markdownContentResponse} />
        </div>
    );
}
