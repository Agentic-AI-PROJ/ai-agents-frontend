import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAlert } from "@/contexts/AlertContext";
import CardDetailView from "@/components/card/CardDetailView";
import { DEFAULT_CARD_ID } from "@/config/site";

export default function IndexPage() {
  const [searchParams] = useSearchParams();
  const { showAlert } = useAlert();
  const effectRan = useRef(false);

  useEffect(() => {
    document.title = "HomePage";

    // Prevent double execution in React StrictMode
    if (effectRan.current) return;
    effectRan.current = true;

    // Check if there's an error in URL params and show alert
    const errorParam = searchParams.get('error');
    if (errorParam) {
      showAlert({
        title: 'Error',
        description: decodeURIComponent(errorParam),
        variant: 'danger',
        timeout: 8000
      });
      // Clean up URL by removing error param
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('error');
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return (
    <CardDetailView cardId={DEFAULT_CARD_ID} showDescription={false} showEditButton={false} showVisibility={false} />
  );
}
