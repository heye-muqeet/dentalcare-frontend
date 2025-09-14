import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../lib/api/services/auth';
import { RoleBasedSidebar } from '../components/Sidebar/RoleBasedSidebar';
import { RoleBasedTopbar } from '../components/Topbar/RoleBasedTopbar';

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
      <RoleBasedTopbar />
      <div className="flex flex-1 overflow-hidden bg-gray-50">
        <div className="w-[290px] h-full">
          <RoleBasedSidebar />
        </div>
        <div className="flex-1">
          <main className="h-[calc(100vh-52px)] overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}