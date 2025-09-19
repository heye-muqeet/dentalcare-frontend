import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { logoutUser } from '../../lib/store/slices/authSlice';
import { topbarService, type TopbarStats } from '../../lib/api/services/topbar';
import type { RootState } from '../../lib/store/store';

// Super Admin Dynamic Topbar
function SuperAdminDynamicTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
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
        // Keep fallback values
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
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-700 to-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      {/* Left: System Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-lg">⚡</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">Dental Care System</h1>
          <p className="text-xs text-purple-200">System Administration</p>
        </div>
      </div>

      {/* Center: Dynamic Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.totalOrganizations}
          </div>
          <div className="text-xs text-purple-200">Organizations</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.totalUsers?.toLocaleString()}
          </div>
          <div className="text-xs text-purple-200">Users</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.systemUptime}
          </div>
          <div className="text-xs text-purple-200">Uptime</div>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-purple-200">Super Admin</p>
        </div>
        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-sm">👤</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  System Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Organization Admin Dynamic Topbar
function OrganizationAdminDynamicTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<TopbarStats>({
    totalBranches: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    appointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notifications] = useState([
    { id: 1, title: 'New Branch Added', message: 'Downtown Branch successfully created', type: 'success', time: '2 min ago' },
    { id: 2, title: 'User Registration', message: '3 new doctors registered today', type: 'info', time: '1 hour ago' },
    { id: 3, title: 'System Update', message: 'Maintenance scheduled for tonight', type: 'warning', time: '3 hours ago' }
  ]);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const organizationName = user?.organization?.name || 'Organization';

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user?.organizationId) {
          const orgStats = await topbarService.getOrganizationStats(user.organizationId);
          setStats(orgStats);
        }
      } catch (error) {
        console.error('Failed to load organization stats:', error);
        // Keep fallback values
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user?.organizationId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'view_reports':
        navigate('/reports');
        break;
      case 'settings':
        navigate('/organization/settings');
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-700 to-cyan-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      {/* Left: Organization Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-lg">🏥</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">{organizationName}</h1>
          <p className="text-xs text-cyan-200">Organization Admin</p>
        </div>
      </div>

      {/* Center: Enhanced Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.totalBranches}
          </div>
          <div className="text-xs text-cyan-200">Branches</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.totalUsers?.toLocaleString()}
          </div>
          <div className="text-xs text-cyan-200">Users</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.appointments || 0}
          </div>
          <div className="text-xs text-cyan-200">Active</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : `$${((stats.monthlyRevenue || 0) / 1000).toFixed(0)}K`}
          </div>
          <div className="text-xs text-cyan-200">Revenue</div>
        </div>
      </div>

      {/* Right: Tools & User Menu */}
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            title="Search"
          >
            <span className="text-sm">🔍</span>
          </button>

          {isSearchOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <form onSubmit={handleSearch} className="p-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search branches, users, appointments..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors relative"
            title="Notifications"
          >
            <span className="text-sm">🔔</span>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200">
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Info & Menu */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-cyan-200">Org Admin</p>
          </div>
          
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <span className="text-sm">👤</span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <button 
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span>👤</span>
                    <span>Profile Settings</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('settings')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span>⚙️</span>
                    <span>Organization Settings</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('view_reports')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span>Reports & Analytics</span>
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span>💬</span>
                    <span>Help & Support</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Branch Admin Dynamic Topbar
function BranchAdminDynamicTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [stats, setStats] = useState<TopbarStats>({
    totalStaff: 0,
    totalPatients: 0,
    todayAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const branchName = user?.branch?.name || 'Branch';
  const organizationName = user?.organization?.name || 'Organization';

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user?.branchId) {
          const branchStats = await topbarService.getBranchStats(user.branchId);
          setStats(branchStats);
        }
      } catch (error) {
        console.error('Failed to load branch stats:', error);
        // Keep fallback values
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user?.branchId]);

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
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-700 to-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      {/* Left: Branch Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-lg">🏥</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">{branchName}</h1>
          <p className="text-xs text-emerald-200">{organizationName}</p>
        </div>
      </div>

      {/* Center: Dynamic Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.totalStaff}
          </div>
          <div className="text-xs text-emerald-200">Staff</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.totalPatients}
          </div>
          <div className="text-xs text-emerald-200">Patients</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.todayAppointments}
          </div>
          <div className="text-xs text-emerald-200">Today</div>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-emerald-200">Branch Admin</p>
        </div>
        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-sm">👤</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Branch Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Doctor Dynamic Topbar
function DoctorDynamicTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [stats, setStats] = useState<TopbarStats>({
    todayAppointments: 0,
    completedAppointments: 0,
    averageRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const branchName = user?.branch?.name || 'Branch';

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user?.id) {
          const doctorStats = await topbarService.getDoctorStats(user.id);
          setStats(doctorStats);
        }
      } catch (error) {
        console.error('Failed to load doctor stats:', error);
        // Keep fallback values
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

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
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      {/* Left: Doctor Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-lg">👨‍⚕️</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">Dr. {user?.lastName}</h1>
          <p className="text-xs text-purple-200">{branchName}</p>
        </div>
      </div>

      {/* Center: Dynamic Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.todayAppointments}
          </div>
          <div className="text-xs text-purple-200">Today</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.completedAppointments}
          </div>
          <div className="text-xs text-purple-200">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.averageRating?.toFixed(1)}
          </div>
          <div className="text-xs text-purple-200">Rating</div>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium">Dr. {user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-purple-200">Doctor</p>
        </div>
        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-sm">👤</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Schedule
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Receptionist Dynamic Topbar
function ReceptionistDynamicTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [stats, setStats] = useState<TopbarStats>({
    appointments: 0,
    newPatients: 0,
    waitingPatients: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const branchName = user?.branch?.name || 'Branch';

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user?.id) {
          const receptionistStats = await topbarService.getReceptionistStats(user.id);
          setStats(receptionistStats);
        }
      } catch (error) {
        console.error('Failed to load receptionist stats:', error);
        // Keep fallback values
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

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
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-700 to-rose-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      {/* Left: Receptionist Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-lg">👩‍💼</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">Reception Desk</h1>
          <p className="text-xs text-rose-200">{branchName}</p>
        </div>
      </div>

      {/* Center: Dynamic Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.appointments}
          </div>
          <div className="text-xs text-rose-200">Appointments</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.newPatients}
          </div>
          <div className="text-xs text-rose-200">New Patients</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.waitingPatients}
          </div>
          <div className="text-xs text-rose-200">Waiting</div>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-rose-200">Receptionist</p>
        </div>
        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-sm">👤</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Appointments
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Patient Dynamic Topbar
function PatientDynamicTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [stats, setStats] = useState<TopbarStats>({
    appointments: 0,
    upcomingAppointments: 0,
    appointmentHistory: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const branchName = user?.branch?.name || 'Branch';

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user?.id) {
          const patientStats = await topbarService.getPatientStats(user.id);
          setStats(patientStats);
        }
      } catch (error) {
        console.error('Failed to load patient stats:', error);
        // Keep fallback values
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

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
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      {/* Left: Patient Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-lg">👤</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">Patient Portal</h1>
          <p className="text-xs text-cyan-200">{branchName}</p>
        </div>
      </div>

      {/* Center: Dynamic Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.appointments}
          </div>
          <div className="text-xs text-cyan-200">Appointments</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.upcomingAppointments}
          </div>
          <div className="text-xs text-cyan-200">Upcoming</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">
            {isLoading ? '...' : stats.appointmentHistory}
          </div>
          <div className="text-xs text-cyan-200">History</div>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-cyan-200">Patient</p>
        </div>
        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-sm">👤</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  My Appointments
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Dynamic Topbar Component
export function DynamicTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDynamicTopbar />;
    case 'organization_admin':
      return <OrganizationAdminDynamicTopbar />;
    case 'branch_admin':
      return <BranchAdminDynamicTopbar />;
    case 'doctor':
      return <DoctorDynamicTopbar />;
    case 'receptionist':
      return <ReceptionistDynamicTopbar />;
    case 'patient':
      return <PatientDynamicTopbar />;
    default:
      return <SuperAdminDynamicTopbar />; // Fallback
  }
}
