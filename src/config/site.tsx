import IndexPage from "@/pages/index";
import AuthPage from "@/pages/auth/auth";
import AuthCallback from "@/pages/auth/auth-callback";
import FeatureListPage from "@/pages/admin/feature-list";
import UserListPage from "@/pages/admin/user-list";
import PageNotFound from "@/pages/page-not-found";
import AllLinks from "@/pages/admin/all-links";
import AdminPage from "@/pages/admin/admin";
import ProfilePage from "@/pages/profile";
import CreateCardPage from "@/pages/card/create-card";
import CardListPage from "@/pages/card/card-list";
import CardDetailPage from "@/pages/card/card-detail";
import EditCardPage from "@/pages/card/edit-card";
import ServiceHealthPage from "@/pages/admin/serivce-health";
import CardChatPage from "@/pages/card/card-chat";
import AgentExecutionPage from "@/pages/admin/agent-execution";
import AgentNodeExecutionPage from "@/pages/admin/agent-node-execution";
import RequestLogsPage from "@/pages/admin/request-logs";
import AIModelsPage from "@/pages/admin/ai-models";
import AgentArchitecturePage from "@/pages/admin/agent-architecture";
import AgentNodesPage from "@/pages/admin/agent-nodes";
import McpAdminPage from "@/pages/admin/mcp-admin";

export interface Route {
  name: string;
  path?: string;
  element?: React.ReactNode;
  protected: boolean;
  children?: Route[];
}

export const appRoutes: Route[] = [
  {
    name: "New Chat",
    path: "/",
    element: <IndexPage />,
    protected: false,
  },

  // NEW
  {
    name: "Profile",
    path: "/profile",
    element: <ProfilePage />,
    protected: true,
  },

  // NEW
  {
    name: "Cards",
    protected: true,
    children: [
      {
        name: "Card List",
        path: "/card",
        element: <CardListPage />,
        protected: true,
      },
      {
        name: "Create Card",
        path: "/card/create",
        element: <CreateCardPage />,
        protected: true,
      },
      {
        name: "Edit Card",
        path: "/card/:id/edit",
        element: <EditCardPage />,
        protected: true,
      },
      {
        name: "Card Detail",
        path: "/card/:id",
        element: <CardDetailPage />,
        protected: true,
      },
      {
        name: "Card Chat",
        path: "/card/:id/chat/:guid",
        element: <CardChatPage />,
        protected: true,
      }
    ],
  },

  {
    name: "Admin",
    protected: true,
    children: [
      {
        name: "Admin Home",
        path: "/admin",
        element: <AdminPage />,
        protected: true,
      },
      {
        name: "All Links",
        path: "/admin/links",
        element: <AllLinks />,
        protected: true,
      },
      {
        name: "Features",
        path: "/admin/features",
        element: <FeatureListPage />,
        protected: true,
      },
      {
        name: "Users",
        path: "/admin/users",
        element: <UserListPage />,
        protected: true,
      },
      {
        name: "Service Health",
        path: "/admin/health",
        element: <ServiceHealthPage />,
        protected: true,
      },
      {
        name: "Agent Execution",
        path: "/admin/agent-execution",
        element: <AgentExecutionPage />,
        protected: true,
      },
      {
        name: "Agent Node Execution",
        path: "/admin/agent-execution/:id",
        element: <AgentNodeExecutionPage />,
        protected: true,
      },
      {
        name: "Request Logs",
        path: "/admin/logs",
        element: <RequestLogsPage />,
        protected: true,
      },
      {
        name: "AI Models",
        path: "/admin/models",
        element: <AIModelsPage />,
        protected: true,
      },
      {
        name: "Agent Architecture",
        path: "/admin/agent-architecture",
        element: <AgentArchitecturePage />,
        protected: true,
      },
      {
        name: "Agent Nodes",
        path: "/admin/agent-nodes",
        element: <AgentNodesPage />,
        protected: true,
      },
      {
        name: "MCP Management",
        path: "/admin/mcp",
        element: <McpAdminPage />,
        protected: true,
      }
    ],
  },

  {
    name: "Auth",
    path: "/auth",
    element: <AuthPage />,
    protected: false,
  },
  {
    name: "Auth Callback",
    path: "/auth/callback",
    element: <AuthCallback />,
    protected: false,
  },

  {
    name: "Page Not Found",
    path: "*",
    element: <PageNotFound />,
    protected: false,
  },
];

export const DEFAULT_CARD_ID = "6953b2b94a37e9a96771d91a";
