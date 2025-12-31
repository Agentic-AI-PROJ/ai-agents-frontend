"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PanelLeftClose, PanelLeft, Sun, Moon, LogOut, ShieldUser, User, Plus, Search, SquarePen } from "lucide-react";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { useTheme } from "@heroui/use-theme";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Logo } from "./icons";
import { useChatbotCards } from "@/contexts/ChatbotCardsContext";
import SidebarAccordian from "./sidebarAccordian";
import SidebarButtons from "./sidebarButtons";
import { Link } from "@heroui/link";
import { User as UserHerouiComponent } from "@heroui/user";
import { Avatar } from "@heroui/avatar";
import { useShortcut } from "@/hooks/useShortcuts";
import { SHORTCUTS } from "@/config/shortcuts";
import { keysToDisplayString } from "@/utils/shortcutUtils";
import { Tooltip } from "@heroui/tooltip";
import SearchModal from "./SearchModal";
import { appRoutes } from "@/config/site";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { setTheme, theme } = useTheme();
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const prevMobileRef = useRef(false);
    const { chatbotCards } = useChatbotCards();
    const newChatRoute = appRoutes.find((route) => route.name === "New Chat");
    const cardCreateRoute = appRoutes.find((route) => route.name === "Cards")?.children?.find((route) => route.name === "Create Card");
    const profileRoute = appRoutes.find((route) => route.name === "Profile");
    const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");
    const authRoute = appRoutes.find((route) => route.name === "Auth");

    // Keyboard shortcuts with actual actions
    useShortcut(SHORTCUTS.HOME, () => {
        navigate(newChatRoute?.path || "/");
    });

    useShortcut(SHORTCUTS.SEARCH, () => {
        setIsSearchOpen(!isSearchOpen);
    });

    useShortcut(SHORTCUTS.CREATE_CARD, () => {
        navigate(cardCreateRoute?.path || "/card/create");
    });

    useShortcut(SHORTCUTS.TOGGLE_SIDEBAR, () => {
        if (isMobile) {
            setIsOpen(!isOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    });

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;

            // Only update if mobile state actually changed
            if (mobile !== prevMobileRef.current) {
                const wasMobile = prevMobileRef.current;
                setIsMobile(mobile);
                prevMobileRef.current = mobile;

                // Reset collapsed state ONLY when switching FROM desktop TO mobile
                // This ensures all elements are visible when sidebar opens on mobile
                if (mobile && !wasMobile && isCollapsed) {
                    setIsCollapsed(false);
                }
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const handleLogout = () => {
        logout();
        navigate(authRoute?.path || "/auth");
        // Close sidebar on mobile after logout
        if (isMobile) {
            setIsOpen(false);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <>
            {/* Mobile Menu Button - Fixed position */}
            <Button
                isIconOnly
                className="fixed top-3 left-4 z-50 md:hidden"
                onPress={toggleSidebar}
                variant="light"
            >
                <Menu className="w-5 h-5" />
            </Button>

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: isMobile ? (isOpen ? 0 : "-100%") : 0,
                    width: isMobile ? "16rem" : (isCollapsed ? "4rem" : "16rem"),
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                }}
                className="fixed md:sticky top-0 left-0 h-screen bg-content1 border-r border-divider z-50 md:z-10 flex flex-col overflow-hidden"
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4">
                    <motion.div
                        animate={{ opacity: isCollapsed ? 0 : 1 }}
                        className="text-lg font-semibold truncate flex"
                    >
                        <Logo size={30} />
                        AI Agents
                    </motion.div>

                    {/* Close button for mobile */}
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="md:hidden"
                        onPress={toggleSidebar}
                    >
                        <X className="w-4 h-4" />
                    </Button>

                    {/* Collapse button for desktop */}
                    <Tooltip content={<div className="flex flex-row gap-2">
                        <span>{isCollapsed ? "open sidebar" : "close sidebar"}</span><span className="text-foreground/50">{keysToDisplayString(SHORTCUTS.TOGGLE_SIDEBAR)}</span>
                    </div>
                    }>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="hidden md:flex cursor-e-resize"
                            onPress={toggleCollapse}
                        >
                            {isCollapsed ? (
                                <PanelLeft className="w-4 h-4" />
                            ) : (
                                <PanelLeftClose className="w-4 h-4" />
                            )}
                        </Button>
                    </Tooltip>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-2">
                    <nav className="space-y-2">
                        <div className="flex flex-col items-center">
                            <SidebarButtons
                                href={newChatRoute?.path}
                                label="New Chat"
                                startContent={<SquarePen size={16} />}
                                isCollapsed={isCollapsed}
                                shortcut={keysToDisplayString(SHORTCUTS.HOME)}
                            />
                            <SidebarButtons
                                onClick={() => setIsSearchOpen(true)}
                                label="Search"
                                startContent={<Search size={16} />}
                                isCollapsed={isCollapsed}
                                shortcut={keysToDisplayString(SHORTCUTS.SEARCH)}
                            />
                            <SidebarButtons
                                href={cardCreateRoute?.path}
                                label="Create Card"
                                startContent={<Plus size={16} />}
                                isCollapsed={isCollapsed}
                                shortcut={keysToDisplayString(SHORTCUTS.CREATE_CARD)}
                            />
                        </div>
                        {
                            !isCollapsed && (
                                <SidebarAccordian accordionTitle="My Cards" accordionContent={chatbotCards} accordianEmptyMessage="No cards found" />
                            )
                        }
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="p-2 border-t border-divider">
                    <Dropdown placement="top">
                        <DropdownTrigger>
                            <motion.div
                                className={`flex items-center gap-3 rounded-lg cursor-pointer ${isCollapsed ? "justify-center" : ""
                                    } `}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isCollapsed ? (
                                    <Avatar src={user?.avatar} />
                                ) : (
                                    <UserHerouiComponent avatarProps={{ src: user?.avatar }} name={user?.displayName} description={user?.email} />
                                )}
                            </motion.div>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="User menu">
                            <DropdownItem
                                key="theme"
                                startContent={theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                onPress={() => toggleTheme()}
                            >
                                Switch Theme
                            </DropdownItem>
                            <DropdownItem
                                as={Link}
                                className="text-foreground"
                                href={profileRoute?.path}
                                key="profile"
                                startContent={<User className="w-4 h-4" />}
                            >
                                Profile
                            </DropdownItem>
                            {user?.role?.name === "admin" ? (
                                <DropdownItem
                                    as={Link}
                                    className="text-foreground"
                                    href={adminRoute?.path}
                                    key="auto"
                                    startContent={<ShieldUser className="w-4 h-4" />}
                                >
                                    Admin
                                </DropdownItem>
                            ) : null}
                            <DropdownItem
                                key="logout"
                                className="text-danger"
                                color="danger"
                                startContent={<LogOut className="w-4 h-4" />}
                                onPress={handleLogout}
                            >
                                Logout
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </motion.aside>

            {/* Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
