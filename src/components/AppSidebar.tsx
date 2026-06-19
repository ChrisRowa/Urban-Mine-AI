import { Home, Upload, BarChart3, ListChecks, Recycle, Building2, Settings, Trash2, ShoppingBag, Leaf, ChevronDown, Rocket } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Upload Data", url: "/upload", icon: Upload },
  { title: "Analysis Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Sustainability Analytics", url: "/analytics", icon: Leaf },
  { title: "Deconstruction Plan", url: "/plan", icon: ListChecks },
  { title: "Reuse Opportunities", url: "/reuse", icon: Recycle },
  { title: "Rebuild Materials", url: "/rebuild", icon: Building2 },
  { title: "Waste Disposal", url: "/waste-disposal", icon: Trash2 },
  { title: "Configuration", url: "/configuration", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">UrbanMine PRO</span>
            </div>
            
            {/* Project Switcher Stub */}
            <div className="px-1">
              <button className="w-full flex items-center justify-between p-2 rounded-lg bg-sidebar-accent/50 border border-sidebar-border hover:bg-sidebar-accent transition-colors">
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Active Project</span>
                  <span className="text-xs font-medium truncate">Brigade Tech Gardens...</span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Rocket className="h-4 w-4 text-white" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
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
      </SidebarContent>
    </Sidebar>
  );
}
