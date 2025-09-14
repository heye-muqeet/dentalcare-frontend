import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../lib/api/services/auth';
import { CompactSidebar } from '../components/Sidebar/CompactSidebar';
import { DynamicTopbar } from '../components/Topbar/DynamicTopbar';

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  useEffect(() => {
    console.log('DashboardLayout rendered with user:', user);
  }, [user]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DynamicTopbar />
      <div className="flex flex-1 overflow-hidden bg-gray-50">
        <CompactSidebar />
        <div className="flex-1">
          <main className="h-[calc(100vh-60px)] overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}