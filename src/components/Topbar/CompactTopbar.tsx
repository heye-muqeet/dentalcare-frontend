import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { logoutUser } from '../../lib/store/slices/authSlice';
import type { RootState } from '../../lib/store/store';

// Super Admin Compact Topbar
function SuperAdminCompactTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
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

      {/* Center: Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">12</div>
          <div className="text-xs text-purple-200">Organizations</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">1,247</div>
          <div className="text-xs text-purple-200">Users</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">99.9%</div>
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

// Organization Admin Compact Topbar
function OrganizationAdminCompactTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const organizationName = user?.organization?.name || 'Organization';

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

      {/* Center: Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">5</div>
          <div className="text-xs text-cyan-200">Branches</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">234</div>
          <div className="text-xs text-cyan-200">Users</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">$45K</div>
          <div className="text-xs text-cyan-200">Revenue</div>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
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
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Organization Settings
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

// Branch Admin Compact Topbar
function BranchAdminCompactTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const branchName = user?.branch?.name || 'Branch';
  const organizationName = user?.organization?.name || 'Organization';

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

      {/* Center: Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">12</div>
          <div className="text-xs text-emerald-200">Staff</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">156</div>
          <div className="text-xs text-emerald-200">Patients</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">23</div>
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

// Doctor Compact Topbar
function DoctorCompactTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const branchName = user?.branch?.name || 'Branch';

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

      {/* Center: Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">8</div>
          <div className="text-xs text-purple-200">Today</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">5</div>
          <div className="text-xs text-purple-200">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">4.8</div>
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

// Receptionist Compact Topbar
function ReceptionistCompactTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const branchName = user?.branch?.name || 'Branch';

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

      {/* Center: Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">15</div>
          <div className="text-xs text-rose-200">Appointments</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">3</div>
          <div className="text-xs text-rose-200">New Patients</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">2</div>
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

// Patient Compact Topbar
function PatientCompactTopbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const branchName = user?.branch?.name || 'Branch';

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

      {/* Center: Quick Stats */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-semibold">2</div>
          <div className="text-xs text-cyan-200">Appointments</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">1</div>
          <div className="text-xs text-cyan-200">Upcoming</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">5</div>
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
      return <OrganizationAdminCompactTopbar />;
    case 'branch_admin':
      return <BranchAdminCompactTopbar />;
    case 'doctor':
      return <DoctorCompactTopbar />;
    case 'receptionist':
      return <ReceptionistCompactTopbar />;
    case 'patient':
      return <PatientCompactTopbar />;
    default:
      return <SuperAdminCompactTopbar />; // Fallback
  }
}
