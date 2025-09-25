import { useState, useEffect } from 'react';
import SidebarIcon from '../Icons/SidebarIcon';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { logoutUser } from '../../lib/store/slices/authSlice';
import { getFilteredRoutes, hasRouteAccess } from '../../lib/utils/rolePermissions';
import type { UserRole } from '../../lib/utils/rolePermissions';
import type { RootState } from '../../lib/store/store';
import SessionStatus from '../SessionStatus';
import { showErrorToast, showSuccessToast, showWarningToast } from '../../lib/utils/errorHandler';

interface MenuItemProps {
  icon: string;
  text: string;
  onClick: () => void;
  isActive?: boolean;
}

// Super Admin Sidebar
function SuperAdminSidebar() {
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
    <aside className="w-74 min-h-screen h-screen flex justify-center">
      <div className="bg-gradient-to-b from-purple-900 to-blue-900 w-64 h-screen rounded-lg mt-5 drop-shadow-lg flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <div 
            className="text-2xl flex items-center gap-2 cursor-pointer font-bold text-white"
            onClick={() => navigate('/dashboard')}
          >
            <span className="text-3xl">⚡</span>
            <div className="text-center">
              <div className="text-lg">Dental Care</div>
              <div className="text-xs text-purple-200">Management System</div>
            </div>
          </div>
        </div>
        
        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 custom-scrollbar">
          {allowedRoutes.map((route) => (
            <MenuItem
              key={route.path}
              icon={route.icon}
              text={route.label}
              onClick={() => handleNavigation(route.path)}
              isActive={location.pathname === route.path}
            />
          ))}
        </div>
        
        {/* Footer - Fixed */}
        <div className="flex-shrink-0 border-t border-white/10">
          <div className="p-3">
            <SessionStatus className="mb-2" />
          </div>
          <div className="p-3 pt-0">
            <MenuItem
              icon="logout"
              text="Logout"
              onClick={() => handleNavigation('', true)}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

// Organization Admin Sidebar
function OrganizationAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  // Dynamic data states
  const [organizationData, setOrganizationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract organization ID safely
  const organizationId = typeof user?.organizationId === 'string' 
    ? user.organizationId 
    : (user?.organizationId as any)?._id || (user?.organizationId as any)?.id || String(user?.organizationId);

  // Use dynamic data with fallbacks
  const organizationName = organizationData?.name || user?.organization?.name || 'Organization';

  // Load organization data from backend
  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        if (organizationId) {
          console.log('OrganizationAdminSidebar - Loading organization data:', { organizationId });
          
          // Import organizationService dynamically to avoid circular imports
          const { organizationService } = await import('../../lib/api/services/organizations');
          const orgData = await organizationService.getOrganization(organizationId);
          
          if (orgData) {
            console.log('OrganizationAdminSidebar - Organization data loaded:', orgData);
            setOrganizationData(orgData);
          }
        }
      } catch (error) {
        console.error('OrganizationAdminSidebar - Failed to load organization data:', error);
        // Keep fallback values
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizationData();
  }, [organizationId]);

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
    <aside className="w-74 min-h-screen h-screen flex justify-center">
      <div className="bg-gradient-to-b from-blue-900 to-cyan-900 w-64 h-screen rounded-lg mt-5 drop-shadow-lg flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-white/10">
          <div 
            className="cursor-pointer group"
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-xl">🏥</span>
              </div>
              <div className="flex-1">
                <h1 className="text-white font-bold text-lg leading-tight">
                  {isLoading ? (
                    <div className="animate-pulse bg-white/20 h-5 w-32 rounded"></div>
                  ) : (
                    organizationName
                  )}
                </h1>
                <p className="text-cyan-200 text-xs font-medium">
                  Organization Control
                </p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-cyan-400/20 rounded-full flex items-center justify-center">
                    <span className="text-xs">👑</span>
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-medium">Admin Access</p>
                    <p className="text-cyan-200/80 text-xs">Full Organization Control</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 custom-scrollbar">
          {allowedRoutes.map((route) => (
            <MenuItem
              key={route.path}
              icon={route.icon}
              text={route.label}
              onClick={() => handleNavigation(route.path)}
              isActive={location.pathname === route.path}
            />
          ))}
        </div>
        
        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-4 border-t border-white/10">
          <MenuItem
            icon="logout"
            text="Logout"
            onClick={() => handleNavigation('', true)}
          />
        </div>
      </div>
    </aside>
  );
}

// Branch Admin Sidebar
function BranchAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  // Dynamic data states
  const [branchData, setBranchData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  // Use dynamic data with fallbacks
  const branchName = branchData?.name || user?.branch?.name || 'Branch';
  const organizationName = branchData?.organizationId?.name || user?.organization?.name || 'Organization';

  // Load branch data from backend
  useEffect(() => {
    const loadBranchData = async () => {
      try {
        if (branchId) {
          console.log('BranchAdminSidebar - Loading branch data:', { branchId });
          
          // Import branchService dynamically to avoid circular imports
          const { branchService } = await import('../../lib/api/services/branches');
          const branchResponse = await branchService.getBranchById(branchId);
          
          if (branchResponse.success) {
            console.log('BranchAdminSidebar - Branch data loaded:', branchResponse.data);
            setBranchData(branchResponse.data);
          }
        }
      } catch (error) {
        console.error('BranchAdminSidebar - Failed to load branch data:', error);
        // Keep fallback values
      } finally {
        setIsLoading(false);
      }
    };

    loadBranchData();
  }, [branchId]);

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
    <aside className="w-74 min-h-screen h-screen flex justify-center">
      <div className="bg-gradient-to-b from-green-900 to-emerald-900 w-64 h-screen rounded-lg mt-5 drop-shadow-lg flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-white/10">
          <div 
            className="cursor-pointer group"
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-xl">🏥</span>
              </div>
              <div className="flex-1">
                <h1 className="text-white font-bold text-lg leading-tight">
                  {isLoading ? (
                    <div className="animate-pulse bg-white/20 h-5 w-24 rounded"></div>
                  ) : (
                    branchName
                  )}
                </h1>
                <p className="text-emerald-200 text-xs font-medium">
                  Branch Administration
                </p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-emerald-400/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">🏢</span>
                </div>
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-medium">
                    {isLoading ? (
                      <div className="animate-pulse bg-white/20 h-4 w-32 rounded"></div>
                    ) : (
                      organizationName
                    )}
                  </p>
                  <p className="text-emerald-200/80 text-xs">Parent Organization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 custom-scrollbar">
          {allowedRoutes.map((route) => (
            <MenuItem
              key={route.path}
              icon={route.icon}
              text={route.label}
              onClick={() => handleNavigation(route.path)}
              isActive={location.pathname === route.path}
            />
          ))}
        </div>
        
        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-4 border-t border-white/10">
          <MenuItem
            icon="logout"
            text="Logout"
            onClick={() => handleNavigation('', true)}
          />
        </div>
      </div>
    </aside>
  );
}

// Doctor Sidebar
function DoctorSidebar() {
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

  const branchName = user?.branch?.name || 'Branch';

  return (
    <aside className="w-74 min-h-screen h-screen flex justify-center">
      <div className="bg-gradient-to-b from-indigo-900 to-purple-900 w-64 h-screen rounded-lg mt-5 drop-shadow-lg p-4">
        <div className="flex items-center justify-center w-full pb-3">
          <div 
            className="text-2xl flex items-center gap-2 cursor-pointer font-bold text-white"
            onClick={() => navigate('/dashboard')}
          >
            <span className="text-3xl">👨‍⚕️</span>
            <div className="text-center">
              <div className="text-lg">Dr. {user?.lastName}</div>
              <div className="text-xs text-purple-200">{branchName}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {allowedRoutes.map((route) => (
            <MenuItem
              key={route.path}
              icon={route.icon}
              text={route.label}
              onClick={() => handleNavigation(route.path)}
              isActive={location.pathname === route.path}
            />
          ))}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <MenuItem
            icon="logout"
            text="Logout"
            onClick={() => handleNavigation('', true)}
          />
        </div>
      </div>
    </aside>
  );
}

// Receptionist Sidebar
function ReceptionistSidebar() {
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

  const branchName = user?.branch?.name || 'Branch';

  return (
    <aside className="w-74 min-h-screen h-screen flex justify-center">
      <div className="bg-gradient-to-b from-pink-900 to-rose-900 w-64 h-screen rounded-lg mt-5 drop-shadow-lg p-4">
        <div className="flex items-center justify-center w-full pb-3">
          <div 
            className="text-2xl flex items-center gap-2 cursor-pointer font-bold text-white"
            onClick={() => navigate('/dashboard')}
          >
            <span className="text-3xl">👩‍💼</span>
            <div className="text-center">
              <div className="text-lg">Reception</div>
              <div className="text-xs text-rose-200">{branchName}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {allowedRoutes.map((route) => (
            <MenuItem
              key={route.path}
              icon={route.icon}
              text={route.label}
              onClick={() => handleNavigation(route.path)}
              isActive={location.pathname === route.path}
            />
          ))}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <MenuItem
            icon="logout"
            text="Logout"
            onClick={() => handleNavigation('', true)}
          />
        </div>
      </div>
    </aside>
  );
}

// Patient Sidebar
function PatientSidebar() {
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

  const branchName = user?.branch?.name || 'Branch';

  return (
    <aside className="w-74 min-h-screen h-screen flex justify-center">
      <div className="bg-gradient-to-b from-teal-900 to-cyan-900 w-64 h-screen rounded-lg mt-5 drop-shadow-lg p-4">
        <div className="flex items-center justify-center w-full pb-3">
          <div 
            className="text-2xl flex items-center gap-2 cursor-pointer font-bold text-white"
            onClick={() => navigate('/dashboard')}
          >
            <span className="text-3xl">👤</span>
            <div className="text-center">
              <div className="text-lg">Patient Portal</div>
              <div className="text-xs text-cyan-200">{branchName}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {allowedRoutes.map((route) => (
            <MenuItem
              key={route.path}
              icon={route.icon}
              text={route.label}
              onClick={() => handleNavigation(route.path)}
              isActive={location.pathname === route.path}
            />
          ))}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <MenuItem
            icon="logout"
            text="Logout"
            onClick={() => handleNavigation('', true)}
          />
        </div>
      </div>
    </aside>
  );
}

// Menu Item Component
function MenuItem({ icon, text, onClick, isActive = false }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
        isActive 
          ? 'bg-white/30 text-white shadow-lg border-l-4 border-white/60' 
          : 'text-white/80 hover:bg-white/15 hover:text-white'
      }`}
    >
      <SidebarIcon 
        name={icon} 
        className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/80'}`} 
      />
      <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{text}</span>
      {isActive && (
        <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
      )}
    </button>
  );
}

// Main Role-Based Sidebar Component
export function RoleBasedSidebar() {
  const { user } = useAppSelector((state: RootState) => state.auth);

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminSidebar />;
    case 'organization_admin':
      return <OrganizationAdminSidebar />;
    case 'branch_admin':
      return <BranchAdminSidebar />;
    case 'doctor':
      return <DoctorSidebar />;
    case 'receptionist':
      return <ReceptionistSidebar />;
    case 'patient':
      return <PatientSidebar />;
    default:
      return <SuperAdminSidebar />; // Fallback
  }
}
