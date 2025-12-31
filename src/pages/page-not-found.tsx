import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/button';
import { useEffect } from 'react';
import { appRoutes } from '@/config/site';

function PageNotFound() {
    const navigate = useNavigate();
    const newChatRoute = appRoutes.find((route) => route.name === "New Chat");
    useEffect(() => {
        document.title = "Page Not Found";
    }, []);

    return (
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 min-h-[60vh]">
            <div className="text-center">
                <div className="text-2xl font-bold text-danger mb-2">404 Error</div>
                <div className="text-default-500">Page Not Found</div>
                <Button onPress={() => navigate(newChatRoute?.path || '/')}>
                    Go to Home
                </Button>
            </div>
        </section>
    );
}

export default PageNotFound;
