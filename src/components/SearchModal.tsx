"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Search, MessageCircleCode, X, Plus, SquarePen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useChatbotCards } from "@/contexts/ChatbotCardsContext";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { appRoutes } from "@/config/site";

interface SearchResult {
    id: string;
    title: string;
    description?: string;
    icon: React.ReactNode;
    action: () => void;
    category: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();
    const { chatbotCards } = useChatbotCards();
    const cardDetailRoute = appRoutes.find((route) => route.name === "Cards")?.children?.find((route) => route.name === "Card Detail");
    const cardCreateRoute = appRoutes.find((route) => route.name === "Cards")?.children?.find((route) => route.name === "Create Card");
    const newChatRoute = appRoutes.find((route) => route.name === "New Chat");

    const staticItems: SearchResult[] = [
        {
            id: "new-chat",
            title: "New Chat",
            icon: <SquarePen size={20} />,
            action: () => navigate(newChatRoute?.path || "/new-chat"),
            category: "Chats",
        },
        {
            id: "create-card",
            title: "Create Card",
            icon: <Plus size={20} />,
            action: () => navigate(cardCreateRoute?.path || "/card/create"),
            category: "Cards",
        }
    ];

    // Define all searchable items
    const allItems = useMemo<SearchResult[]>(() => {
        // Add chatbot cards to search results
        const cardItems: SearchResult[] = (chatbotCards || []).map((card) => ({
            id: `card-${card._id}`,
            title: card.name,
            description: card.description || "Chatbot card",
            icon: <MessageCircleCode size={20} />,
            action: () => {
                if (!card._id || !cardDetailRoute?.path) return;
                navigate(cardDetailRoute.path.replace(":id", card._id));
            },
            category: "Cards",
        }));

        return [...staticItems, ...cardItems];
    }, [chatbotCards, navigate, cardDetailRoute]);

    // Filter items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) {
            return allItems;
        }

        const query = searchQuery.toLowerCase();
        return allItems.filter(
            (item) =>
                item.title.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
        );
    }, [searchQuery, allItems]);

    // Reset selected index when search query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    // Reset search query when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setSelectedIndex(0);
        }
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    filteredItems[selectedIndex].action();
                    onClose();
                }
            }
        },
        [filteredItems, selectedIndex, onClose]
    );

    const handleItemClick = (item: SearchResult) => {
        item.action();
        onClose();
    };

    return (
        <Modal
            isKeyboardDismissDisabled
            isOpen={isOpen}
            onClose={onClose}
            hideCloseButton
            size="2xl"
            placement="auto"
            backdrop="opaque"
        >
            <ModalContent className="max-sm:h-screen max-sm:rounded-none max-sm:pt-4">
                <ModalHeader className="flex flex-col gap-0 p-0">
                    <div className="flex flex-row items-center gap-2 px-2">
                        <Input
                            ref={inputRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            radius="none"
                            placeholder="Search..."
                            classNames={{
                                inputWrapper: "bg-transparent shadow-none py-8 data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent hover:bg-transparent",
                                input: "text-base",
                            }}
                        />
                        <Button
                            isIconOnly
                            radius="full"
                            variant="light"
                            size="sm"
                            className="text-default-500"
                            onPress={onClose}
                        >
                            <X size={18} />
                        </Button>
                    </div>
                    <Divider />
                </ModalHeader>

                <ModalBody className="min-h-[40vh] p-0 overflow-y-auto max-sm:max-h-[calc(100vh-80px)]">
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-default-400">
                            <Search size={48} className="mb-4 opacity-50" />
                            <p className="text-lg">No results found</p>
                            <p className="text-sm">Try searching for something else</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map((item, index) => {
                                    const isSelected = index === selectedIndex;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.15, delay: index * 0.02 }}
                                            onClick={() => handleItemClick(item)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`
                                                flex items-center gap-2 p-3 text-sm m-2 rounded-xl cursor-pointer
                                                transition-all duration-150
                                                ${isSelected
                                                    ? "bg-content2"
                                                    : "hover:bg-content2"
                                                }
                                            `}
                                        >
                                            {item.icon}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-sm truncate">{item.title}</div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
