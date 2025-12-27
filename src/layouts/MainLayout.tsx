import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AiAssistant } from "@/components/ai/AiAssistant";
import authService from "@/services/authService";
import { CreditCard, Home, LogOut, Settings, Users } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

// Menu items
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Groups",
    url: "/groups",
    icon: Users,
  },
  {
    title: "Transactions",
    url: "/transactions", // Placeholder if we have a dedicated page
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function MainLayout() {
    const location = useLocation()

  const handleLogout = () => {
    authService.logout()
  }
  return (
    <SidebarProvider>
      <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>KinMan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
      <SidebarInset>
        <main className="w-full">
          <div className="p-4 flex items-center gap-2 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">KinMan</h1>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Outlet />
          </div>
          <AiAssistant />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
