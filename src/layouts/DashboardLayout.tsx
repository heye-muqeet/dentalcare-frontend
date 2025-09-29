import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../lib/api/services/auth';
import { CollapsibleSidebar } from '../components/Sidebar/CollapsibleSidebar';
import { CompactTopbar } from '../components/Topbar/CompactTopbar';
import { SidebarProvider } from '../contexts/SidebarContext';

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  useEffect(() => {
    console.log('DashboardLayout rendered with user:', user);
  }, [user]);

  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <CompactTopbar />
        <div className="flex flex-1 overflow-hidden bg-gray-50">
          <CollapsibleSidebar />
          <div className="flex-1">
            <main className="h-[calc(100vh-48px)] overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}