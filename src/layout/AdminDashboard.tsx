import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import { UserAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect} from "react";

export function AdminDashboardLayout() {
  const { session, profile, loading } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = () => {
      if (!loading && !session) {
        navigate("/");
        return;
      }
      if(!loading && profile) {
        if(profile.role !== 'admin') {
          navigate("/");
          return;
        }
      }
    };
    loadSession();
  }, [session, profile, loading]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium text-foreground">Admin Dashboard</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
