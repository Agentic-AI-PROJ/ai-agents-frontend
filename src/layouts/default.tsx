import Sidebar from "@/components/sidebar";
import { useUser } from "@/contexts/UserContext";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();

  return (
    <div className="relative flex h-screen overflow-hidden">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
