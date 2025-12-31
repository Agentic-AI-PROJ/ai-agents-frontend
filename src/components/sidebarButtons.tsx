import { appRoutes } from "@/config/site";
import { useChatbotCards } from "@/contexts/ChatbotCardsContext";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@heroui/dropdown";
import { Link } from "@heroui/link";
import { Ellipsis } from "lucide-react";

interface SidebarButtonsProps {
    href?: string;
    label: string;
    startContent?: React.ReactNode;
    isCollapsed?: boolean;
    hasEllipsis?: boolean;
    shortcut?: string;
    id?: string;
    onClick?: () => void;
}

export default function SidebarButtons({
    href,
    label,
    startContent,
    isCollapsed,
    hasEllipsis,
    shortcut,
    id,
    onClick,
}: SidebarButtonsProps) {
    const { handleDeleteChatbotCard } = useChatbotCards();
    const cardEditRoute = appRoutes.find((route) => route.name === "Cards")?.children?.find((route) => route.name === "Edit Card");
    return (
        <div className={`relative group w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <Button
                as={onClick ? undefined : Link}
                href={onClick ? undefined : href}
                onPress={onClick}
                isIconOnly={isCollapsed}
                size="sm"
                variant="light"
                className={`p-2 h-fit w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} ${hasEllipsis && !isCollapsed ? 'pr-8' : ''}`}
            >
                <span className={`flex items-center gap-2 ${!isCollapsed ? 'flex-grow text-left' : 'justify-center'}`}>
                    {startContent}
                    {!isCollapsed && label}
                </span>
            </Button>

            {/* Ellipsis: hidden, only visible on hover */}
            {hasEllipsis && !isCollapsed && (
                <div className="absolute right-2 z-10">
                    <Dropdown placement="right">
                        <DropdownTrigger>
                            <span
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-default-500 hover:text-default-900"
                            >
                                <Ellipsis size={16} />
                            </span>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownSection showDivider>
                                <DropdownItem as={Link} href={`${href}/newChat`} key="newChat" className="text-foreground">
                                    New Chat
                                </DropdownItem>
                                <DropdownItem as={Link} href={cardEditRoute?.path?.replace(":id", id || "")} key="edit" className="text-foreground">
                                    Edit
                                </DropdownItem>
                            </DropdownSection>
                            <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                onPress={() => handleDeleteChatbotCard(id)}
                            >
                                Delete
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            )}
            {
                shortcut && !isCollapsed && (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-2 z-10 text-foreground/50 text-sm">
                        {shortcut}
                    </span>
                )
            }
        </div>
    )
}
