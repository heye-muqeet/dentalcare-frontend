import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { logoutUser } from '../../lib/store/slices/authSlice';
import { getFilteredRoutes, hasRouteAccess } from '../../lib/utils/rolePermissions';
import type { UserRole } from '../../lib/utils/rolePermissions';
import type { RootState } from '../../lib/store/store';
import SidebarIcon from '../Icons/SidebarIcon';
import { showErrorToast, showSuccessToast, showWarningToast } from '../../lib/utils/errorHandler';

interface MenuItemProps {
  icon: string;
  text: string;
  onClick: () => void;
  isActive?: boolean;
}

// Compact Menu Item Component
function CompactMenuItem({ icon, text, onClick, isActive = false }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-white/30 text-white shadow-lg border-l-4 border-white/60 font-semibold' 
          : 'text-white/80 hover:bg-white/15 hover:text-white font-medium'
      }`}
    >
      <SidebarIcon 
        name={icon} 
        className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/80'}`} 
      />
      <span className="truncate">{text}</span>
      {isActive && (
        <div className="absolute right-2 w-1 h-1 bg-white rounded-full opacity-90"></div>
      )}
    </button>
  );
}

// Super Admin Compact Sidebar
function SuperAdminCompactSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      try {
        console.log('🚪 Starting logout process...');
        const result = await dispatch(logoutUser()).unwrap();
        console.log('✅ Logout successful, navigating to login...');
        
        if (result.message?.includes('with warnings')) {
          showWarningToast('Logged Out Successfully', 'You have been logged out successfully (with some warnings).');
        } else {
          showSuccessToast('Logged Out Successfully', 'You have been logged out successfully.');
        }
        navigate('/login');
      } catch (error) {
        console.error('❌ Logout failed:', error);
        showErrorToast('Logout Warning', 'There was an issue during logout, but you have been logged out locally.');
        navigate('/login');
      }
    } else {
      if (userRole && hasRouteAccess(userRole, path)) {
        navigate(path);
      } else {
        console.warn(`Access denied to ${path} for role ${userRole}`);
      }
    }
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-purple-900 to-blue-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Dental Care</h2>
            <p className="text-xs text-purple-200">System Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
        {allowedRoutes.map((route) => (
          <CompactMenuItem
            key={route.path}
            icon={route.icon}
            text={route.label}
            onClick={() => handleNavigation(route.path)}
            isActive={location.pathname === route.path}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <CompactMenuItem
          icon="logout"
          text="Logout"
          onClick={() => handleNavigation('', true)}
        />
      </div>
    </aside>
  );
}

// Organization Admin Compact Sidebar
function OrganizationAdminCompactSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      try {
        console.log('🚪 Starting logout process...');
        const result = await dispatch(logoutUser()).unwrap();
        console.log('✅ Logout successful, navigating to login...');
        
        if (result.message?.includes('with warnings')) {
          showWarningToast('Logged Out Successfully', 'You have been logged out successfully (with some warnings).');
        } else {
          showSuccessToast('Logged Out Successfully', 'You have been logged out successfully.');
        }
        navigate('/login');
      } catch (error) {
        console.error('❌ Logout failed:', error);
        showErrorToast('Logout Warning', 'There was an issue during logout, but you have been logged out locally.');
        navigate('/login');
      }
    } else {
      if (userRole && hasRouteAccess(userRole, path)) {
        navigate(path);
      } else {
        console.warn(`Access denied to ${path} for role ${userRole}`);
      }
    }
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-blue-900 to-cyan-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">🏥</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{user?.organization?.name || 'Organization'}</h2>
            <p className="text-xs text-cyan-200">Org Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
        {allowedRoutes.map((route) => (
          <CompactMenuItem
            key={route.path}
            icon={route.icon}
            text={route.label}
            onClick={() => handleNavigation(route.path)}
            isActive={location.pathname === route.path}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <CompactMenuItem
          icon="logout"
          text="Logout"
          onClick={() => handleNavigation('', true)}
        />
      </div>
    </aside>
  );
}

// Branch Admin Compact Sidebar
function BranchAdminCompactSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      try {
        console.log('🚪 Starting logout process...');
        const result = await dispatch(logoutUser()).unwrap();
        console.log('✅ Logout successful, navigating to login...');
        
        if (result.message?.includes('with warnings')) {
          showWarningToast('Logged Out Successfully', 'You have been logged out successfully (with some warnings).');
        } else {
          showSuccessToast('Logged Out Successfully', 'You have been logged out successfully.');
        }
        navigate('/login');
      } catch (error) {
        console.error('❌ Logout failed:', error);
        showErrorToast('Logout Warning', 'There was an issue during logout, but you have been logged out locally.');
        navigate('/login');
      }
    } else {
      if (userRole && hasRouteAccess(userRole, path)) {
        navigate(path);
      } else {
        console.warn(`Access denied to ${path} for role ${userRole}`);
      }
    }
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-green-900 to-emerald-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">🏥</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{user?.branch?.name || 'Branch'}</h2>
            <p className="text-xs text-emerald-200">{user?.organization?.name || 'Organization'}</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
        {allowedRoutes.map((route) => (
          <CompactMenuItem
            key={route.path}
            icon={route.icon}
            text={route.label}
            onClick={() => handleNavigation(route.path)}
            isActive={location.pathname === route.path}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <CompactMenuItem
          icon="logout"
          text="Logout"
          onClick={() => handleNavigation('', true)}
        />
      </div>
    </aside>
  );
}

// Doctor Compact Sidebar
function DoctorCompactSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      try {
        console.log('🚪 Starting logout process...');
        const result = await dispatch(logoutUser()).unwrap();
        console.log('✅ Logout successful, navigating to login...');
        
        if (result.message?.includes('with warnings')) {
          showWarningToast('Logged Out Successfully', 'You have been logged out successfully (with some warnings).');
        } else {
          showSuccessToast('Logged Out Successfully', 'You have been logged out successfully.');
        }
        navigate('/login');
      } catch (error) {
        console.error('❌ Logout failed:', error);
        showErrorToast('Logout Warning', 'There was an issue during logout, but you have been logged out locally.');
        navigate('/login');
      }
    } else {
      if (userRole && hasRouteAccess(userRole, path)) {
        navigate(path);
      } else {
        console.warn(`Access denied to ${path} for role ${userRole}`);
      }
    }
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">👨‍⚕️</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Dr. {user?.lastName}</h2>
            <p className="text-xs text-purple-200">{user?.branch?.name || 'Branch'}</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
        {allowedRoutes.map((route) => (
          <CompactMenuItem
            key={route.path}
            icon={route.icon}
            text={route.label}
            onClick={() => handleNavigation(route.path)}
            isActive={location.pathname === route.path}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <CompactMenuItem
          icon="logout"
          text="Logout"
          onClick={() => handleNavigation('', true)}
        />
      </div>
    </aside>
  );
}

// Receptionist Compact Sidebar
function ReceptionistCompactSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      try {
        console.log('🚪 Starting logout process...');
        const result = await dispatch(logoutUser()).unwrap();
        console.log('✅ Logout successful, navigating to login...');
        
        if (result.message?.includes('with warnings')) {
          showWarningToast('Logged Out Successfully', 'You have been logged out successfully (with some warnings).');
        } else {
          showSuccessToast('Logged Out Successfully', 'You have been logged out successfully.');
        }
        navigate('/login');
      } catch (error) {
        console.error('❌ Logout failed:', error);
        showErrorToast('Logout Warning', 'There was an issue during logout, but you have been logged out locally.');
        navigate('/login');
      }
    } else {
      if (userRole && hasRouteAccess(userRole, path)) {
        navigate(path);
      } else {
        console.warn(`Access denied to ${path} for role ${userRole}`);
      }
    }
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-pink-900 to-rose-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">👩‍💼</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Reception</h2>
            <p className="text-xs text-rose-200">{user?.branch?.name || 'Branch'}</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
        {allowedRoutes.map((route) => (
          <CompactMenuItem
            key={route.path}
            icon={route.icon}
            text={route.label}
            onClick={() => handleNavigation(route.path)}
            isActive={location.pathname === route.path}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <CompactMenuItem
          icon="logout"
          text="Logout"
          onClick={() => handleNavigation('', true)}
        />
      </div>
    </aside>
  );
}

// Patient Compact Sidebar
function PatientCompactSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      try {
        console.log('🚪 Starting logout process...');
        const result = await dispatch(logoutUser()).unwrap();
        console.log('✅ Logout successful, navigating to login...');
        
        if (result.message?.includes('with warnings')) {
          showWarningToast('Logged Out Successfully', 'You have been logged out successfully (with some warnings).');
        } else {
          showSuccessToast('Logged Out Successfully', 'You have been logged out successfully.');
        }
        navigate('/login');
      } catch (error) {
        console.error('❌ Logout failed:', error);
        showErrorToast('Logout Warning', 'There was an issue during logout, but you have been logged out locally.');
        navigate('/login');
      }
    } else {
      if (userRole && hasRouteAccess(userRole, path)) {
        navigate(path);
      } else {
        console.warn(`Access denied to ${path} for role ${userRole}`);
      }
    }
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-teal-900 to-cyan-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Patient Portal</h2>
            <p className="text-xs text-cyan-200">{user?.branch?.name || 'Branch'}</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
        {allowedRoutes.map((route) => (
          <CompactMenuItem
            key={route.path}
            icon={route.icon}
            text={route.label}
            onClick={() => handleNavigation(route.path)}
            isActive={location.pathname === route.path}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <CompactMenuItem
          icon="logout"
          text="Logout"
          onClick={() => handleNavigation('', true)}
        />
      </div>
    </aside>
  );
}

// Main Compact Sidebar Component
export function CompactSidebar() {
  const { user } = useAppSelector((state: RootState) => state.auth);

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminCompactSidebar />;
    case 'organization_admin':
      return <OrganizationAdminCompactSidebar />;
    case 'branch_admin':
      return <BranchAdminCompactSidebar />;
    case 'doctor':
      return <DoctorCompactSidebar />;
    case 'receptionist':
      return <ReceptionistCompactSidebar />;
    case 'patient':
      return <PatientCompactSidebar />;
    default:
      return <SuperAdminCompactSidebar />; // Fallback
  }
}
