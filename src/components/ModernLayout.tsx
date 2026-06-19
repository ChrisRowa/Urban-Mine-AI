import { ReactNode } from "react";
import { ModernSidebar, ModernHeader } from "./ModernSidebar";

interface ModernLayoutProps {
  children: ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <ModernSidebar />
        <div className="flex-1 lg:ml-0">
          <ModernHeader />
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
