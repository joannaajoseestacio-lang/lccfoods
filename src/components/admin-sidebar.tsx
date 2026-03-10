import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  UserCircle,
  DoorOpen,
  ShieldUser,
  UserStar,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.jpg"

const navItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    href: "/admin/students",
    icon: UserStar,
  },
  {
    title: "Teachers",
    href: "/admin/teachers",
    icon: ShieldUser,
  },
  {
    title: "Canteen Stores",
    href: "/admin/stores",
    icon: Store,
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, signOut } = UserAuth();
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <Link to="#" className="flex items-center gap-2">
          <div className="flex h-8 w-8">
            <img className="h-8 w-8 rounded-2xl" src={logo} alt="logo" />
          </div>
          <span className="text-md font-semibold tracking-tight text-blue-500 font-serif">
            LCC Canteen <span className="text-xs font-mono bg-primary text-white px-1.5 rounded py-[1px]">Admin</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link to={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={signOut}
                  className="bg-red-50 text-red-400 hover:text-red-500 hover:bg-red-100"
                  tooltip={"Logout"}
                >
                  <DoorOpen />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
            <UserCircle className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">
              {profile?.name}
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              {profile?.email}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
