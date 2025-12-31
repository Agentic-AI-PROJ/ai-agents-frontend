import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@heroui/button";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/dropdown";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Copy, Download, Check, FileImage, FileCode, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { useAlert } from "../contexts/AlertContext";

type MermaidProps = {
    chart: string;
    theme: "light" | "dark";
};

interface InteractiveMermaidProps {
    chart: string;
    theme: "light" | "dark";
    isModal?: boolean;
}

function InteractiveMermaid({ chart, theme, isModal = false }: InteractiveMermaidProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgWrapperRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>("");
    const { showSuccess, showError } = useAlert();
    const [isCopied, setIsCopied] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Zoom and pan state
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        let cancelled = false;

        mermaid.initialize({
            startOnLoad: false,
            theme: theme === "dark" ? "dark" : "default",
            themeVariables:
                theme === "dark"
                    ? {
                        background: "#0f0f0f",
                        primaryColor: "#1e1e1e",
                        primaryTextColor: "#ffffff",
                        lineColor: "#9e9e9e",
                        fontFamily: "Inter, sans-serif",
                    }
                    : {
                        background: "#ffffff",
                        primaryColor: "#f5f5f5",
                        primaryTextColor: "#000000",
                        lineColor: "#555555",
                        fontFamily: "Inter, sans-serif",
                    },
        });


        const render = async () => {
            try {
                // Ensure unique ID for this render
                const id = `mermaid-${crypto.randomUUID()}`;

                // Try to parse - if incomplete (streaming), this throws
                try {
                    await mermaid.parse(chart);
                } catch (parseError) {
                    console.warn("Mermaid Parse Error:", parseError);
                    throw parseError; // Re-throw to hit catch block below
                }

                const { svg } = await mermaid.render(id, chart);

                if (!cancelled) {
                    const isErrorSVG = svg.includes('aria-roledescription="error"') || svg.includes('class="error-icon"');
                    console.log("Mermaid Render Result:", { isErrorSVG, svgLength: svg.length, hasErrorState: hasError });

                    if (isErrorSVG) {
                        setHasError(true);
                        setSvgContent("");
                    } else if (containerRef.current) {
                        setHasError(false);
                        setSvgContent(svg);
                        containerRef.current.innerHTML = svg;
                    }
                }
            } catch (err: any) {
                // If parsing fails (e.g. incomplete streaming), fallback to code block
                console.error("Mermaid Render/Parse Exception:", err);
                if (!cancelled) {
                    setHasError(true);
                    setSvgContent("");
                }
            }
        };

        render();

        return () => {
            cancelled = true;
        };
    }, [chart, theme]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(chart);
            setIsCopied(true);
            showSuccess("Mermaid code copied to clipboard");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            showError("Failed to copy code");
            console.error("Copy failed:", err);
        }
    };

    const handleSave = async (format: 'svg' | 'jpg') => {
        if (!svgContent) return;

        try {
            if (format === 'svg') {
                const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                downloadFile(url, `chart.svg`);
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            const svgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));

            img.onload = () => {
                const svgElement = containerRef.current?.querySelector('svg');
                if (svgElement) {
                    const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number);
                    const width = viewBox ? viewBox[2] : svgElement.clientWidth || 800;
                    const height = viewBox ? viewBox[3] : svgElement.clientHeight || 600;

                    const scale = 2;
                    canvas.width = width * scale;
                    canvas.height = height * scale;

                    if (ctx) {
                        ctx.scale(scale, scale);
                        ctx.fillStyle = theme === 'dark' ? '#0f0f0f' : '#ffffff';
                        ctx.fillRect(0, 0, width, height);

                        try {
                            ctx.drawImage(img, 0, 0, width, height);
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                            downloadFile(dataUrl, `chart.${format}`);
                        } catch (e) {
                            console.error("Canvas export error:", e);
                            showError("Browser security prevented image export. Please Save as SVG.");
                        }
                    }
                }
            };

            img.onerror = (e) => {
                console.error("Image load error:", e);
                showError("Failed to render image for download");
            };

            img.src = svgData;

        } catch (err) {
            console.error("Save error:", err);
            showError(`Failed to save as ${format.toUpperCase()}`);
        }
    };

    const downloadFile = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Zoom controls
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.2, 0.5));
    };

    const handleResetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Pan controls
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="relative w-full h-full">
            {/* Top-right toolbar (Copy & Save) */}
            {!hasError && (
                <div className={`absolute top-2 right-2 flex gap-2 ${isModal ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-10`}>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={handleCopy}
                        className="bg-content2/80 backdrop-blur-md"
                        title="Copy Code"
                    >
                        {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>

                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                className="bg-content2/80 backdrop-blur-md"
                                title="Save As..."
                            >
                                <Download size={16} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Save chart options">
                            <DropdownItem
                                key="save-svg"
                                startContent={<FileCode size={16} />}
                                onPress={() => handleSave('svg')}
                            >
                                Save as SVG
                            </DropdownItem>
                            <DropdownItem
                                key="save-jpg"
                                startContent={<FileImage size={16} />}
                                onPress={() => handleSave('jpg')}
                            >
                                Save as JPG
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            )}

            {/* Bottom-right zoom controls */}
            {!hasError && (
                <div className={`absolute bottom-2 right-2 flex flex-col gap-2 ${isModal ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-10`}>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={handleZoomIn}
                        className="bg-content2/80 backdrop-blur-md"
                        title="Zoom In"
                    >
                        <ZoomIn size={16} />
                    </Button>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={handleZoomOut}
                        className="bg-content2/80 backdrop-blur-md"
                        title="Zoom Out"
                    >
                        <ZoomOut size={16} />
                    </Button>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={handleResetView}
                        className="bg-content2/80 backdrop-blur-md"
                        title="Reset View"
                    >
                        <RotateCcw size={16} />
                    </Button>
                </div>
            )}

            {hasError ? (
                <div className="w-full h-full overflow-auto p-4 font-mono text-sm whitespace-pre">
                    {chart}
                </div>
            ) : (
                <div
                    ref={svgWrapperRef}
                    className={`flex items-center justify-center p-4 min-h-[100px] overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div
                        ref={containerRef}
                        style={{
                            transform: !hasError ? `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` : 'none',
                            transformOrigin: 'center center',
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default function Mermaid({ chart, theme }: MermaidProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="relative group border border-default-200 rounded-lg overflow-hidden bg-content1/50">
                {/* Enlarge button */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={() => setIsModalOpen(true)}
                        className="bg-content2/80 backdrop-blur-md"
                        title="View Fullscreen"
                    >
                        <Maximize2 size={16} />
                    </Button>
                </div>

                <InteractiveMermaid chart={chart} theme={theme} />
            </div>

            {/* Fullscreen Modal */}
            <Modal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                size="5xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Mermaid Diagram
                        </ModalHeader>
                        <ModalBody className="p-0">
                            <div className="relative h-fit w-full">
                                <InteractiveMermaid chart={chart} theme={theme} isModal />
                            </div>
                        </ModalBody>
                    </>
                </ModalContent>
            </Modal>
        </>
    );
}
