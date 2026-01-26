import { Button } from '@heroui/button'
import { Textarea } from '@heroui/input'
import { ArrowUp, Paperclip, Square, X } from 'lucide-react'
import { useEffect, useState, forwardRef, useRef } from 'react'
import { uploadFile } from '@/api/upload.api'
import { v4 as uuidv4 } from 'uuid';

interface PromptInputProps {
    onSend: (value: string, attachments: any[]) => void;
    onStop?: () => void;
    isLoading?: boolean;
    promptValue?: string;
}

interface Attachment {
    id: string;
    file: File;
    preview: string;
    url?: string;
    uploading: boolean;
}

const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(({ onSend, onStop, isLoading = false, promptValue }, ref) => {
    const [value, setValue] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isUploading = attachments.some(a => a.uploading);

    const processFiles = async (files: File[]) => {
        const newAttachments: Attachment[] = [];

        for (const file of files) {
            // if (!file.type.startsWith('image/')) continue; // Only images for now

            const id = uuidv4();
            const preview = URL.createObjectURL(file);
            newAttachments.push({
                id,
                file,
                preview,
                uploading: true
            });

            // Start upload (async)
            uploadFile(file)
                .then(url => {
                    setAttachments(prev => prev.map(a => a.id === id ? { ...a, url, uploading: false } : a));
                })
                .catch(err => {
                    console.error("Upload failed", err);
                    // Remove failed attachment or show error
                    setAttachments(prev => prev.filter(a => a.id !== id));
                });
        }

        setAttachments(prev => [...prev, ...newAttachments]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(Array.from(e.target.files));
        }
        // Reset input
        e.target.value = '';
    };

    const handlePaste = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
        // 'any' because onPaste event type is weird with @heroui/input sometimes, or just standard ClipboardEvent
        const clipboardData = e.clipboardData || (e as any).originalEvent?.clipboardData;
        if (clipboardData && clipboardData.files && clipboardData.files.length > 0) {
            const files = Array.from(clipboardData.files) as File[];
            if (files.some(f => f.type.startsWith('image/'))) {
                e.preventDefault();
                processFiles(files);
            }
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    const handleSubmit = () => {
        // Enforce text input requirement: if attachments exist but no text, don't send? 
        // User request: "promptinput should only send when the textfield is also there"
        // Interpretation: Text is required.
        if (!value.trim()) return;

        if (isUploading) return; // Prevent send while uploading

        // Separate text and attachments
        const currentAttachments = attachments.map(a => ({
            url: a.url || '', // Should ensure URL exists if not uploading
            name: a.file.name,
            contentType: a.file.type
        })).filter(a => a.url);

        onSend(value, currentAttachments);
        setValue('');
        setAttachments([]);
    }

    useEffect(() => {
        if (promptValue) {
            setValue(promptValue);
        }
    }, [promptValue]);

    return (
        <div className="relative overflow-visible w-full max-w-4xl shadow-medium rounded-3xl hover:rounded-3xl bg-content1 transition-all duration-300 focus-within:bg-content2">

            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="flex flex-row gap-2 p-4 pb-0 overflow-x-auto">
                    {attachments.map(att => (
                        <div key={att.id} className="relative group w-20 h-20 flex-shrink-0">
                            <img
                                src={att.preview}
                                alt="preview"
                                className="w-full h-full object-cover rounded-lg border border-default-200"
                            />
                            {att.uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-10">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <button
                                onClick={() => removeAttachment(att.id)}
                                className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                // accept="image/*"
                onChange={handleFileSelect}
            />

            <Textarea
                ref={ref}
                minRows={1}
                maxRows={8}
                radius="none"
                placeholder="Ask Anything..."
                classNames={{
                    inputWrapper: "bg-transparent shadow-none p-4 pb-12 hover:bg-transparent group-data-[focus=true]:bg-transparent data-[hover=true]:bg-transparent",
                    input: "text-base",
                }}
                value={value}
                onValueChange={setValue}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
                onPaste={handlePaste}
            />
            <div className="absolute bottom-2 left-2">
                <Button
                    isIconOnly
                    radius="full"
                    variant="light"
                    size="sm"
                    className="text-default-500"
                    onPress={() => fileInputRef.current?.click()}
                >
                    <Paperclip size={18} />
                </Button>
            </div>
            <div className="absolute bottom-2 right-2">
                {isLoading ? (
                    <Button
                        isIconOnly
                        radius="full"
                        color="primary"
                        variant="solid"
                        size="sm"
                        className="shadow-sm"
                        onPress={onStop}
                    >
                        <Square size={14} fill="currentColor" />
                    </Button>
                ) : (
                    <Button
                        isIconOnly
                        isDisabled={(!value.trim() && attachments.length === 0) || isUploading}
                        radius="full"
                        color="primary"
                        variant="solid"
                        size="sm"
                        className="shadow-sm"
                        onPress={handleSubmit}
                    >
                        <ArrowUp size={18} />
                    </Button>
                )}
            </div>
        </div>
    )
});

PromptInput.displayName = "PromptInput";

export default PromptInput;
