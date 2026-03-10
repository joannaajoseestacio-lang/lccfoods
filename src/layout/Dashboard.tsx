import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { UserAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, LogOut } from "lucide-react";

function StoreStatusDialog({
  status,
  onLogout,
}: {
  status: string;
  onLogout: () => void;
}) {
  const isPending = status === "pending";
  const isRejected = status === "rejected";
  const isBlocked = isPending || isRejected;

  if (!isBlocked) return null;

  const config = isPending
    ? {
        icon: <Clock className="w-6 h-6" />,
        title: "Your Store is Under Review",
        description:
          "Our team is verifying your store details. This typically takes 1–2 business days. You'll be notified once approved.",
        badgeClass:
          "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
        borderClass: "border-t-4 border-amber-400",
        iconColorClass: "text-amber-500",
        dismissClass: "bg-amber-500 hover:bg-amber-600 text-white",
      }
    : {
        icon: <XCircle className="w-6 h-6" />,
        title: "Store Application Rejected",
        description:
          "Your store did not meet our requirements. Please review our guidelines or contact support to appeal or reapply.",
        badgeClass:
          "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
        borderClass: "border-t-4 border-red-500",
        iconColorClass: "text-red-500",
        dismissClass: "bg-red-500 hover:bg-red-600 text-white",
      };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent
        className={`max-w-md rounded-2xl overflow-hidden p-0 shadow-xl bg-white dark:bg-gray-900 ${config.borderClass}`}
      >
        <div className="px-6 pt-6 pb-6">
          <AlertDialogHeader className="gap-3">
            <div className="flex items-center justify-between gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.iconColorClass}`}
              >
                {config.icon}
              </div>
              <span
                className={`text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full ${config.badgeClass}`}
              >
                {status}
              </span>
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50 leading-snug">
                {config.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {config.description}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <div className="flex items-center gap-3 mt-5">
            <Button
              variant="outline"
              className="flex-1 rounded-xl font-medium gap-2 text-gray-600 dark:text-gray-300"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DashboardLayout() {
  const { session, profile, loading, signOut } = UserAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !session) {
      navigate("/");
      return;
    }
    if (!loading && profile && profile.role !== "staff") {
      navigate("/");
    }
  }, [session, profile, loading]);


  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarProvider>
      {profile && (
        <StoreStatusDialog
          status={profile.shop_status}
          onLogout={handleLogout}
        />
      )}

      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium text-foreground">Dashboard</h1>

            {profile?.shop_status === "pending" && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                Pending
              </span>
            )}
            {profile?.shop_status === "rejected" && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                Rejected
              </span>
            )}
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}