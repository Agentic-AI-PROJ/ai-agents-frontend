import { getChatbotCardById } from '@/api/chatbot-cards.api';
import { title } from '@/components/primitives';
import { ChatbotCard } from '@/types/ChatbotCard';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import PromptInput from '@/components/prompt-input';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import { Link as RouterLink } from 'react-router-dom';
import { Chip } from '@heroui/chip';
import { useAlert } from '@/contexts/AlertContext';
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@heroui/dropdown';
import { Ellipsis } from 'lucide-react';
import { appRoutes } from '@/config/site';
import { createConversationCard, deleteConversationCard, getConversationCards } from '@/api/conversation-cards.api';
import { ConversationCard } from '@/types/ConversationCard';

interface CardDetailViewProps {
    cardId: string;
    showDescription?: boolean;
    showEditButton?: boolean;
    showVisibility?: boolean;
}

export default function CardDetailView({ cardId, showDescription = true, showEditButton = true, showVisibility = true }: CardDetailViewProps) {
    const [card, setCard] = useState<ChatbotCard | null>(null);
    const [conversations, setConversations] = useState<ConversationCard[]>([]);
    const { showError } = useAlert();
    const navigate = useNavigate();
    const cardChatRoute = appRoutes.find((route) => route.name === "Cards")?.children?.find((route) => route.name === "Card Chat");
    const cardEditRoute = appRoutes.find((route) => route.name === "Cards")?.children?.find((route) => route.name === "Edit Card");

    function formatToMonthDay(isoString: string): string {
        return new Date(isoString)
            .toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    const fetchCard = async () => {
        try {
            if (cardId) {
                const card = await getChatbotCardById(cardId);
                setCard(card);
                // Only update document title if it's the main view, maybe? Or always?
                // document.title = `${card?.name} | Chatbot Cards`;
            }
        } catch (error) {
            console.error(error);
            showError("Failed to fetch card");
        }
    };

    const fetchConversationCard = async () => {
        try {
            if (cardId) {
                const conversationCards = await getConversationCards(cardId);
                setConversations(conversationCards);
            }
        } catch (error) {
            console.error(error);
            showError("Failed to fetch conversation cards");
        }
    };

    const handleCreateConversation = async (value: string, attachments: any[] = []) => {
        try {
            if (cardId) {
                const conversationCard = await createConversationCard(cardId);
                navigate(cardChatRoute?.path?.replace(':id', cardId || '').replace(':guid', conversationCard.guid || '') || '', {
                    state: {
                        prompt: value,
                        attachments // Pass attachments to CardChatPage
                    }
                });
            }
        } catch (error) {
            console.error(error);
            showError("Failed to create conversation card");
        }
    };

    const handleDeleteConversation = async (guid: string) => {
        try {
            if (guid) {
                await deleteConversationCard(guid);
                fetchConversationCard();
            }
        } catch (error) {
            console.error(error);
            showError("Failed to delete conversation card");
        }
    };

    useEffect(() => {
        fetchCard();
        fetchConversationCard();
    }, [cardId]);

    const hasHistory = conversations.length > 0;
    return (
        <section className={`flex flex-col items-center px-2 justify-center gap-4 py-16 md:py-10 ${!hasHistory ? "justify-center min-h-[80vh]" : "justify-start"}`}>
            <div className="flex flex-col items-center w-full max-w-4xl text-center justify-center gap-4">
                <div className="w-full max-w-4xl flex flex-row justify-between items-center">
                    <div className='flex flex-col items-start gap-2 justify-start'>
                        <div className='flex flex-row items-center gap-4'>
                            <h1 className={title()}>{card?.name}</h1>
                            {showVisibility && <Chip variant='flat' color={card?.visibility === 'public' ? 'default' : 'primary'}>
                                {card?.visibility}
                            </Chip>}
                        </div>
                        {showDescription && <h4 className='text-foreground/50 text-left'>{card?.description}</h4>}
                    </div>

                    {showEditButton && <Button color='primary' radius='full' variant='solid' as={Link} href={cardEditRoute?.path?.replace(':id', cardId || '')}>Edit</Button>}
                </div>
                <PromptInput onSend={(value, attachments) => { handleCreateConversation(value, attachments); }} />
                <div className="w-full max-w-4xl">
                    <ul className="flex flex-col">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.guid}
                                className="flex justify-between group items-center border-b border-default-200 p-2 hover:bg-content1 last:border-b-0 cursor-pointer"
                            >
                                <RouterLink to={cardChatRoute?.path?.replace(":id", card?._id || "").replace(":guid", conversation.guid || "") || ""} className='flex-1'>
                                    <span className='flex flex-col items-start'>
                                        <span>
                                            {conversation.name}
                                        </span>
                                        <span className="text-xs text-default-500">
                                            {conversation.summary}
                                        </span>
                                    </span>
                                </RouterLink>

                                <div className="relative w-12 flex items-center justify-center">
                                    {/* date */}
                                    <span className='absolute opacity-100 group-hover:opacity-0 transition-opacity duration-200 text-xs text-default-500'>
                                        {formatToMonthDay(conversation.createdAt || '')}
                                    </span>

                                    {/* dropdown */}
                                    <Dropdown placement="right">
                                        <DropdownTrigger>
                                            <span
                                                className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-default-500 hover:text-default-900"
                                            >
                                                <Ellipsis size={16} />
                                            </span>
                                        </DropdownTrigger>
                                        <DropdownMenu>
                                            <DropdownSection showDivider>
                                                <DropdownItem as={Link} href={`/card/${card?._id}/newChat`} key="renameConversation" className="text-foreground">
                                                    Rename Chat
                                                </DropdownItem>
                                            </DropdownSection>
                                            <DropdownItem
                                                key="delete"
                                                className="text-danger"
                                                color="danger"
                                                onPress={() => { handleDeleteConversation(conversation.guid || ''); }}
                                            >
                                                Delete
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}
