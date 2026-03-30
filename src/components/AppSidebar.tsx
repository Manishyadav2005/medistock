import {
  LayoutDashboard, Pill, ShoppingCart, Users, BarChart3, Bell, Package, Settings, LogOut, Activity,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { useUserRole } from "@/hooks/useUserRole";
const mainNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Inventory', url: '/inventory', icon: Pill },
  { title: 'Billing / POS', url: '/billing', icon: ShoppingCart },
  { title: 'Suppliers', url: '/suppliers', icon: Users },
  { title: 'Purchases', url: '/purchases', icon: Package },
  { title: 'Staff', url: '/staff', icon: Users }
];

const analyticsNav = [
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Alerts', url: '/alerts', icon: Bell },
  { title: 'Reorder', url: '/reorder', icon: Activity },
];

export function AppSidebar() {
  const { role } = useUserRole();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-5">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Pill className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-sidebar-foreground font-display">PharmaCare</h1>
                <p className="text-[10px] text-sidebar-foreground/50">Inventory System</p>
              </div>
            </div>
          ) : (
            <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center mx-auto">
              <Pill className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
             {mainNav
  .filter((item) => {
    // ❌ Staff के लिए hide करो
    if (role === "staff") {
      return !["Inventory", "Suppliers", "Purchases"].includes(item.title);
    }
    return true; // admin के लिए सब
  })
  .map((item) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={isActive(item.url)}>
        <NavLink
          to={item.url}
          end
          className="hover:bg-sidebar-accent/50"
          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
        >
          <item.icon className="mr-2 h-4 w-4" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
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
            <SidebarMenuButton asChild>
              <NavLink to="/settings" className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent">
                <Settings className="mr-2 h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
