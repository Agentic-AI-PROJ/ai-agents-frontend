import { getChatbotCardById } from '@/api/chatbot-cards.api';
import { ChatbotCard } from '@/types/ChatbotCard';
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import PromptInput from '@/components/prompt-input';
import { useAlert } from '@/contexts/AlertContext';
import { appRoutes } from '@/config/site';
import { getConversationCardById } from '@/api/conversation-cards.api';
import { ConversationCard } from '@/types/ConversationCard';
import { streamChat } from '@/api/streamChatClient';
import MarkdownRenderer from '@/components/markdownRenderer';
import { Message, ExecutionStep } from '@/types/Chat';
import ExecutionStepCard from '@/components/chat/ExecutionStepCard';

export default function CardChatPage() {
    const location = useLocation();
    const { id, guid } = useParams();
    const [card, setCard] = useState<ChatbotCard | null>(null);
    const [conversation, setConversation] = useState<ConversationCard | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const { showError } = useAlert();
    const effectRan = useRef(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const cardsRoute = appRoutes.find((route) => route.name === "Cards");
    const [loading, setLoading] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);

    const fetchCard = async () => {
        try {
            if (id) {
                const card = await getChatbotCardById(id);
                setCard(card);
                document.title = `${card?.name} | Chatbot Cards`;
            }
        } catch (error) {
            console.error(error);
            showError("Failed to fetch card");
            navigate(cardsRoute?.path || '/card');
        }
    };

    const fetchConversation = async () => {
        try {
            if (guid) {
                const conversationObtained = await getConversationCardById(guid);
                setConversation(conversationObtained?.conversation || null);
                if (conversationObtained?.messages) {
                    const processedMessages: Message[] = [];
                    let stepBuffer: ExecutionStep[] = [];

                    conversationObtained.messages.forEach(msg => {
                        if (msg.role === 'tool_call') {
                            let content: any = msg.content;
                            if (typeof content === 'string') {
                                try { content = JSON.parse(content); } catch { }
                            }
                            stepBuffer.push({
                                id: msg._id || crypto.randomUUID(),
                                type: 'tool_call',
                                title: content.toolName || 'Tool Call',
                                content: content,
                                timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now()
                            });
                        } else if (msg.role === 'tool_result') {
                            let content: any = msg.content;
                            if (typeof content === 'string') {
                                try { content = JSON.parse(content); } catch { }
                            }
                            stepBuffer.push({
                                id: msg._id || crypto.randomUUID(),
                                type: 'tool_result',
                                title: 'Tool Result',
                                content: content.result || content,
                                timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now()
                            });
                        } else if (msg.role === 'assistant') {
                            processedMessages.push({
                                ...msg,
                                role: 'assistant',
                                steps: [...stepBuffer]
                            });
                            stepBuffer = [];
                        } else {
                            // User or system messages
                            processedMessages.push({
                                ...msg,
                                role: msg.role as 'user' | 'system'
                            });
                        }
                    });

                    // If we have leftover steps (e.g. agent still running or ended with error), create a placeholder assistant message
                    if (stepBuffer.length > 0) {
                        processedMessages.push({
                            role: 'assistant',
                            content: '', // Pending or empty content
                            steps: stepBuffer,
                            _id: crypto.randomUUID() // Temp ID
                        });
                    }

                    setMessages(processedMessages);
                } else {
                    setMessages([]);
                }
                document.title = `${conversationObtained?.conversation?.name} | Chatbot Cards`;
                setInitialLoaded(true);
            }
        } catch (error) {
            console.error(error);
            showError("Failed to fetch card");
            navigate(cardsRoute?.path || '/card');
        }
    };

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;
        fetchCard();
        fetchConversation();
    }, [id]);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const autoSentRef = useRef(false);

    useEffect(() => {
        if (!initialLoaded) return;
        if (!autoSentRef.current && location.state?.prompt && guid) {
            autoSentRef.current = true;
            const promptText = location.state.prompt;
            const attachments = location.state.attachments || [];

            // Clean state immediately to prevent re-send
            window.history.replaceState({}, document.title);

            // Execute send
            handleSend(promptText, attachments);

            // Focus input
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [guid, location.state, initialLoaded]);

    useEffect(() => {
        if (shouldAutoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setShouldAutoScroll(false);
        }
    }, [messages, shouldAutoScroll]);



    const abortControllerRef = useRef<(() => void) | null>(null);

    const handleStop = async () => {
        if (abortControllerRef.current) {
            await abortControllerRef.current();
            setLoading(false);
        }
    };

    const handleSend = async (value: string, attachments: any[] = []) => {
        if (!guid) return;
        setLoading(true);

        const userMessage: Message = { role: 'user', content: value, attachments };
        setMessages(prev => [...prev, userMessage]);

        // Add placeholder for assistant message
        setMessages(prev => [...prev, { role: 'assistant', content: "", steps: [] }]);
        setShouldAutoScroll(true);

        let incomingContent = "";
        let displayedContent = "";
        let isComplete = false;

        // Typewriter interval
        const intervalId = setInterval(() => {
            if (displayedContent.length < incomingContent.length) {
                // Determine chunk size - small enough to be smooth, large enough to keep up reasonably
                // "Word by word" approximation: take characters until next space or a few chars
                let chunkSize = 1;

                // If it's a space, just take it. If not, maybe take a few more characters to simulate typing speed?
                // Or just do fixed 3-5 chars per 30ms for smoothness. 
                // Let's try variable speed: fast if far behind, slow if close.
                const diff = incomingContent.length - displayedContent.length;
                if (diff > 50) chunkSize = 5;
                else if (diff > 20) chunkSize = 2;
                else chunkSize = 1;

                const chunk = incomingContent.slice(displayedContent.length, displayedContent.length + chunkSize);
                displayedContent += chunk;

                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    const lastMessage = { ...newMessages[lastIndex] };

                    if (lastMessage.role === 'assistant') {
                        lastMessage.content = displayedContent;
                        newMessages[lastIndex] = lastMessage;
                    }
                    return newMessages;
                });
            } else if (isComplete && displayedContent.length === incomingContent.length) {
                // Only clear interval if content is fully displayed AND stream is complete
                clearInterval(intervalId);
                setLoading(false);
            }
        }, 20); // 20ms update rate

        // Helper to add a step to the last message
        const addStep = (step: ExecutionStep) => {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                const lastMessage = { ...newMessages[lastIndex] };

                if (lastMessage.role === 'assistant') {
                    // Create a shallow copy of steps array
                    const newSteps = lastMessage.steps ? [...lastMessage.steps] : [];
                    newSteps.push(step);
                    lastMessage.steps = newSteps;
                    newMessages[lastIndex] = lastMessage;
                }
                return newMessages;
            });
        };

        try {
            const { result, abort } = streamChat(guid, value, attachments, (type: string, text: string) => {
                const timestamp = Date.now();
                const id = crypto.randomUUID();

                if (type === "metadata") {
                    const data = JSON.parse(text);
                    if (data.run_id) {
                        addStep({
                            id,
                            type: 'metadata',
                            title: 'Execution Started',
                            content: `Run ID: ${data.run_id}`,
                            timestamp
                        });
                    }
                    if (data.title) {
                        console.log(data.title);

                        setConversation(prev => prev ? { ...prev, name: data.title } : null);
                        document.title = `${data.title} | Chatbot Cards`;
                    }
                }
                if (type === "planning") {
                    const content = JSON.parse(text)["plan"];
                    addStep({
                        id,
                        type: 'planning',
                        title: 'Plan',
                        content,
                        timestamp
                    });
                }
                if (type === "tool_call") {
                    const data = JSON.parse(text);
                    addStep({
                        id,
                        type: 'tool_call',
                        title: data.toolName,
                        content: {
                            toolName: data.toolName,
                            reasoning: data.reasoning,
                            args: data.args
                        },
                        timestamp
                    });
                }
                if (type === "tool_result") {
                    const data = JSON.parse(text);
                    addStep({
                        id,
                        type: 'tool_result',
                        title: 'Tool Result',
                        content: data.result,
                        timestamp
                    });
                }
                if (type === "replan") {
                    const data = JSON.parse(text);
                    addStep({
                        id,
                        type: 'replan',
                        title: `Replanning (Count: ${data.replanCount})`,
                        content: `**Reason:** ${data.reason}\n\n**New Plan:**\n${data.plan}`,
                        timestamp
                    });
                }
                if (type === "thought") {
                    const data = JSON.parse(text);
                    addStep({
                        id,
                        type: 'thought',
                        title: 'Thought',
                        content: data.content,
                        timestamp
                    });
                }
                if (type === "error") {
                    const data = JSON.parse(text);
                    addStep({
                        id,
                        type: 'error',
                        title: 'Error',
                        content: data.message,
                        timestamp
                    });
                }
                if (type === "final_answer") {
                    const content = JSON.parse(text)["content"];
                    // Clean and append to incoming buffer, do NOT update state directly
                    incomingContent += clean(content);
                }
                if (type === "complete") {
                    console.log("complete");
                    isComplete = true; // Signal typewriter to finish
                }
            });

            abortControllerRef.current = abort;
            await result;

            // catch-up if needed handled by interval
        } catch (error) {
            console.error(error);
            showError("Failed to send message");
            isComplete = true;
            clearInterval(intervalId);
            setLoading(false);
        } finally {
            // Ensure we don't leave interval running forever if something breaks, but keep it if we are just finishing typing
            // We set isComplete=true so interval will self-destruct.
            isComplete = true;
        }
    };

    function clean(text: string) {
        return text.replace(/\\"/g, '"')
            .replace(/\\\\\"/g, '\\"')   // unescape once
            .replace(/\\n/g, "\n");
    }


    return (
        <section className={`flex flex-col items-center justify-center h-[100vh]`}>
            <div className="flex flex-col items-center w-full text-center justify-between h-full">
                <div className="w-full flex flex-row justify-center items-center py-2 h-16 border-b border-divider">
                    <h2>{card?.name} - {conversation?.name}</h2>
                </div>
                <div ref={chatContainerRef} className='max-w-4xl w-full flex-1 overflow-y-auto p-4 pb-20 space-y-4'>
                    {messages.map((msg, index) => (
                        <div key={msg._id || index} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start text-left'}`}>
                            {msg.role === 'assistant' && msg.steps && msg.steps.length > 0 && (
                                <div className="w-full space-y-2">
                                    {(() => {
                                        const renderedSteps = [];
                                        const steps = msg.steps || [];
                                        for (let i = 0; i < steps.length; i++) {
                                            const step = steps[i];
                                            if (step.type === 'tool_call') {
                                                const nextStep = steps[i + 1];
                                                if (nextStep && nextStep.type === 'tool_result' && true /* Add logic to match IDs if needed, but sequential is safe assumption for now */) {
                                                    renderedSteps.push(<ExecutionStepCard key={step.id} step={step} resultStep={nextStep} />);
                                                    i++; // Skip next step
                                                    continue;
                                                }
                                            }
                                            renderedSteps.push(<ExecutionStepCard key={step.id} step={step} />);
                                        }
                                        return renderedSteps;
                                    })()}
                                </div>
                            )}
                            {msg.reasoning && ( // Backward compatibility or if string reasoning is still used
                                <div className="p-3 rounded-lg bg-muted/50 text-muted-foreground text-sm border-l-2 border-primary">
                                    <MarkdownRenderer content={msg.reasoning} />
                                </div>
                            )}
                            {
                                msg.role === 'assistant' ? (
                                    (msg.content && <div className={`p-3 rounded-lg bg-muted`}>
                                        <MarkdownRenderer content={msg.content} />
                                    </div>)
                                ) : (
                                    <div className={`p-3 rounded-lg bg-primary-50 text-primary-foreground`}>
                                        <p className='text-left'>{msg.content}</p>
                                    </div>)
                            }
                            {msg.role === 'user' && msg.attachments && msg.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-1 justify-end order-first">
                                    {msg.attachments.map((att, i) => (
                                        <div key={i} className="relative rounded-lg overflow-hidden border border-default-200">
                                            <img src={att.url} alt={att.name || 'attachment'} className="h-32 w-auto object-cover max-w-xs" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className='max-w-4xl w-full pb-4'>
                    <PromptInput ref={inputRef} onSend={handleSend} onStop={handleStop} isLoading={loading} />
                </div>
            </div>
        </section >
    )
}
