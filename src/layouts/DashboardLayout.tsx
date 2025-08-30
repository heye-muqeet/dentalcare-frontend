import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../lib/api/services/users';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Topbar } from '../components/Topbar/Topbar';

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
      <Topbar />
      <div className="flex flex-1 overflow-hidden bg-gray-50">
        <div className="w-[290px] h-full">
          <Sidebar />
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