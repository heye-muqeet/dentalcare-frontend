import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { logoutUser } from '../../lib/store/slices/authSlice';
import { topbarService, type TopbarStats } from '../../lib/api/services/topbar';
import type { RootState } from '../../lib/store/store';
import { showErrorToast, showSuccessToast, showWarningToast } from '../../lib/utils/errorHandler';
import { useSidebar } from '../../contexts/SidebarContext';
import { Menu, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';

// Super Admin Compact Topbar
function SuperAdminCompactTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [stats, setStats] = useState<TopbarStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    systemUptime: '99.9%'
  });
  const [isLoading, setIsLoading] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const systemStats = await topbarService.getSystemStats();
        setStats(systemStats);
      } catch (error) {
        console.error('Failed to load system stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap();
      if (result.message?.includes('with warnings')) {
        showWarningToast('Logged Out Successfully', 'You have been logged out successfully (with some warnings).');
      } else {
        showSuccessToast('Logged Out Successfully', 'You have been logged out successfully.');
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showErrorToast('Logout Warning', 'There was an issue during logout, but you have been logged out locally.');
      navigate('/login');
    }
  };

  return (
    <header className="h-12 bg-gradient-to-r from-purple-800 to-blue-800 border-b border-white/10 px-4 flex items-center justify-between">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="h-6 w-px bg-white/20"></div>
        <h1 className="text-sm font-semibold text-white">System Administration</h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Quick Stats */}
        <div className="flex items-center gap-3 text-xs text-white/80">
          <span>Organizations: {stats.totalOrganizations}</span>
          <span>Users: {stats.totalUsers}</span>
          <span>Uptime: {stats.systemUptime}</span>
        </div>

        {/* Notifications */}
        <button className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-xs font-medium">{user?.firstName}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <User className="w-3 h-3" />
                Profile
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Settings className="w-3 h-3" />
                Settings
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Receptionist Compact Topbar
function ReceptionistCompactTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap();
      if (result.message?.includes('with warnings')) {
        showWarningToast('Logged Out Successfully', 'You have been logged out successfully (with some warnings).');
      } else {
        showSuccessToast('Logged Out Successfully', 'You have been logged out successfully.');
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showErrorToast('Logout Warning', 'There was an issue during logout, but you have been logged out locally.');
      navigate('/login');
    }
  };

  return (
    <header className="h-12 bg-gradient-to-r from-pink-800 to-rose-800 border-b border-white/10 px-4 flex items-center justify-between">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="h-6 w-px bg-white/20"></div>
        <h1 className="text-sm font-semibold text-white">Reception Desk</h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-xs font-medium">{user?.firstName}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <User className="w-3 h-3" />
                Profile
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Settings className="w-3 h-3" />
                Settings
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Doctor Compact Topbar
function DoctorCompactTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap();
      if (result.message?.includes('with warnings')) {
        showWarningToast('Logged Out Successfully', 'You have been logged out successfully (with some warnings).');
      } else {
        showSuccessToast('Logged Out Successfully', 'You have been logged out successfully.');
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showErrorToast('Logout Warning', 'There was an issue during logout, but you have been logged out locally.');
      navigate('/login');
    }
  };

  return (
    <header className="h-12 bg-gradient-to-r from-indigo-800 to-purple-800 border-b border-white/10 px-4 flex items-center justify-between">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="h-6 w-px bg-white/20"></div>
        <h1 className="text-sm font-semibold text-white">Doctor Portal</h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-xs font-medium">Dr. {user?.lastName}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <User className="w-3 h-3" />
                Profile
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Settings className="w-3 h-3" />
                Settings
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Main Compact Topbar Component
export function CompactTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminCompactTopbar />;
    case 'organization_admin':
      return <SuperAdminCompactTopbar />; // Similar to super admin
    case 'branch_admin':
      return <SuperAdminCompactTopbar />; // Similar to super admin
    case 'doctor':
      return <DoctorCompactTopbar />;
    case 'receptionist':
      return <ReceptionistCompactTopbar />;
    case 'patient':
      return <ReceptionistCompactTopbar />; // Similar to receptionist
    default:
      return <SuperAdminCompactTopbar />; // Fallback
  }
}