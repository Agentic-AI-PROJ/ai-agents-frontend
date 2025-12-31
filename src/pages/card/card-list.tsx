import { title } from '@/components/primitives';
import { appRoutes } from '@/config/site';
import { useChatbotCards } from '@/contexts/ChatbotCardsContext';
import { Button } from '@heroui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Link } from '@heroui/link';
import { useEffect } from 'react';

export default function CardListPage() {
    const { chatbotCards, handleDeleteChatbotCard } = useChatbotCards();
    const cardDetailRoute = appRoutes.find((route) => route.name === "Cards")?.children?.find((route) => route.name === "Card Detail");
    const cardEditRoute = appRoutes.find((route) => route.name === "Cards")?.children?.find((route) => route.name === "Edit Card");
    useEffect(() => {
        document.title = 'Chatbot Cards';
    }, []);
    return (
        <div>
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 className={title()}>Chatbot Cards</h1>
                </div>
            </section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {chatbotCards?.map((card) => (
                    <Card key={card._id} className="max-w-[400px]">
                        <CardHeader className="flex gap-3">
                            <div className="flex flex-row gap-2">
                                <Link size='lg' color='foreground' href={cardDetailRoute?.path?.replace(":id", card._id || "")}>{card.name}</Link>
                                <Chip color={card?.visibility === 'public' ? 'default' : 'primary'} variant='flat'>
                                    {card?.visibility}
                                </Chip>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <p>{card.description}</p>
                        </CardBody>
                        <Divider />
                        <CardFooter className="flex gap-3">
                            <Link href={cardEditRoute?.path?.replace(":id", card._id || "")} >Edit</Link>
                            <Button color='danger' onPress={() => handleDeleteChatbotCard(card._id)} >Delete</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {
                chatbotCards?.length === 0 && (
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-center text-foreground/50">No chatbot cards found</p>
                    </div>
                )
            }
        </div>
    )
}
