import { ChatbotCard } from "@/types/ChatbotCard";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import SidebarButtons from "./sidebarButtons";
import { appRoutes } from "@/config/site";

interface SidebarAccordianProps {
    accordionTitle: string;
    accordionContent: ChatbotCard[] | null;
    accordianEmptyMessage: string;
}

const SidebarAccordian: React.FC<SidebarAccordianProps> = ({ accordionTitle, accordionContent, accordianEmptyMessage }) => {
    const [open, setOpen] = useState<boolean>(true);
    const cardRoute = appRoutes.find((route) => route.name === "Cards")?.children?.find((route) => route.name === "Card List");
    const cardDetailRoute = appRoutes.find((route) => route.name === "Cards")?.children?.find((route) => route.name === "Card Detail");

    return (
        <div className="w-full">
            <div
                className="w-full cursor-pointer p-2 text-sm flex gap-2 text-foreground/50 justify-between"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-2">
                    <h2 className="w-fit">{accordionTitle}</h2>
                    {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
                <Button as={Link} href={cardRoute?.path} size="sm" variant="flat" className="w-fit h-fit p-1" radius="full" color="primary">
                    show all
                </Button>
            </div>

            {open && (
                <div className="flex flex-col">
                    {accordionContent?.map((card: ChatbotCard) => (
                        <SidebarButtons
                            key={card._id}
                            href={cardDetailRoute?.path?.replace(":id", card._id || "")}
                            label={card.name}
                            hasEllipsis={true}
                            id={card._id}
                        />
                    ))}
                    {accordionContent?.length === 0 && (
                        <div className="w-full p-2 text-sm text-foreground/50">
                            {accordianEmptyMessage}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SidebarAccordian;
