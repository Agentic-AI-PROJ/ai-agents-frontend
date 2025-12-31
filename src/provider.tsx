import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { AlertProvider } from "@/contexts/AlertContext";
import { UserProvider } from "@/contexts/UserContext";
import { ToastProvider } from "@heroui/toast";
import DefaultLayout from "./layouts/default";
import { ChatbotCardsProvider } from "./contexts/ChatbotCardsContext";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <AlertProvider>
        <UserProvider>
          <ChatbotCardsProvider>
            <DefaultLayout>
              {children}
            </DefaultLayout>
          </ChatbotCardsProvider>
        </UserProvider>
      </AlertProvider>
      <ToastProvider placement="top-right" />
    </HeroUIProvider>
  );
}
