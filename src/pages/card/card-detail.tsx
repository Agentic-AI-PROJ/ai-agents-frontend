import { useParams, useNavigate } from 'react-router-dom'
import CardDetailView from '@/components/card/CardDetailView';
import { appRoutes } from '@/config/site';
import { useAlert } from '@/contexts/AlertContext';
import { useEffect } from 'react';

export default function CardDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError } = useAlert();
    const cardsRoute = appRoutes.find((route) => route.name === "Cards");

    useEffect(() => {
        if (!id) {
            showError("Invalid Card ID");
            navigate(cardsRoute?.path || '/card');
        }
    }, [id]);

    if (!id) return null;

    return <CardDetailView cardId={id} />;
}
