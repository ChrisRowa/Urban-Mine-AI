import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  BarChart3,
  ListChecks,
  Recycle,
  Building2,
  Trash2,
  Search,
  Bell,
  User,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Plan", href: "/plan", icon: ListChecks },
  { name: "Reuse", href: "/reuse", icon: Recycle },
  { name: "Rebuild", href: "/rebuild", icon: Building2 },
];

export function ModernSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:block lg:static lg:inset-0
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                <Recycle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">UrbanMine AI</h1>
                <p className="text-xs text-gray-500">Circular Construction</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`
                    h-4 w-4 flex-shrink-0
                    ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-emerald-600" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-gray-200 p-4">
            <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Pro Tip</h3>
              <p className="text-xs text-gray-600 mb-3">
                Upload building data to get AI-powered material analysis
              </p>
              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

export function ModernHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search components, materials..."
              className="pl-10 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* User profile */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-700" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
