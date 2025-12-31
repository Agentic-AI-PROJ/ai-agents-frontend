import { title } from "@/components/primitives";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Button } from "@heroui/button";
import { apiClient } from "@/api/apiClient";
import { useAlert } from "@/contexts/AlertContext";
import { appRoutes } from "@/config/site";
import { useEffect } from "react";

type BackendService = {
  name: string;
  healthPath: string;
  dbPath?: string;
};

export default function ServiceHealthPage() {
  const { showSuccess, showError } = useAlert()
  const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");
  const flatRoutes: BackendService[] = [
    {
      name: "api-gateway",
      healthPath: "/health",
      dbPath: "/db-health"
    },
    {
      name: "auth-service",
      healthPath: "/auth/health",
      dbPath: "/auth/db-health"
    },
    {
      name: "user-service",
      healthPath: "/users/health",
      dbPath: "/users/db-health"
    },
    {
      name: "feature-service",
      healthPath: "/features/health",
      dbPath: "/features/db-health"
    },
    {
      name: "chatbot-cards-service",
      healthPath: "/chatbot-cards/health",
      dbPath: "/chatbot-cards/db-health"
    },
    {
      name: "llm-chat-service",
      healthPath: "/llm-chat/health",
      dbPath: "/llm-chat/db-health",
    },
    {
      name: "agent-service",
      healthPath: "/agent-executions/health",
      dbPath: "/agent-executions/db-health"
    }
  ];

  const checkHealth = async (healthPath: string | undefined, name: string, message?: string) => {
    if (!healthPath) return;
    try {
      const res = await apiClient.get(healthPath);
      console.log(res);
      if (res === "RUNNING") {
        showSuccess(`${name} ${message ? `${message}` : ""} is running`);
      }
    } catch (error) {
      console.error(error);
      showError(`${name} ${message ? `${message}` : ""} is not running`);
    }
  };

  useEffect(() => {
    document.title = "Service Health";
  }, []);

  return (
    <section className="flex flex-col items-center gap-6 py-8 px-8 md:py-10">
      <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
        <h1 className={title()}>Backend service Health</h1>
        <Breadcrumbs>
          <BreadcrumbItem href={adminRoute?.path}>Admin</BreadcrumbItem>
          <BreadcrumbItem>Service Health</BreadcrumbItem>
        </Breadcrumbs>
      </div>

      <div className="w-full max-w-6xl mt-6 px-4">
        <div className="flex flex-col gap-3">
          {flatRoutes.map((route) => (
            <div
              key={route.healthPath}
              className={`flex justify-between items-center border-b border-default-200 pb-2`}
            >
              <span>
                {route.name}{" "}
              </span>

              <div>
                {
                  route.dbPath && (
                    <Button color="primary" className="ml-2" onPress={() => { checkHealth(route.dbPath, route.name, "MongoDB") }}>
                      Check DB Health
                    </Button>
                  )
                }
                <Button color="primary" className="ml-2" onPress={() => { checkHealth(route.healthPath, route.name) }}>
                  Check Health
                </Button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
