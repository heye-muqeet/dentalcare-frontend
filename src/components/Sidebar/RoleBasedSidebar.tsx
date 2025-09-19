import SidebarIcon from '../Icons/SidebarIcon';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { logoutUser } from '../../lib/store/slices/authSlice';
import { getFilteredRoutes, hasRouteAccess } from '../../lib/utils/rolePermissions';
import type { UserRole } from '../../lib/utils/rolePermissions';
import type { RootState } from '../../lib/store/store';
import SessionStatus from '../SessionStatus';

interface MenuItemProps {
  icon: string;
  text: string;
  onClick: () => void;
  isActive?: boolean;
}

// Super Admin Sidebar
function SuperAdminSidebar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      await dispatch(logoutUser());
      navigate('/login');
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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      await dispatch(logoutUser());
      navigate('/login');
    } else {
      if (userRole && hasRouteAccess(userRole, path)) {
        navigate(path);
      } else {
        console.warn(`Access denied to ${path} for role ${userRole}`);
      }
    }
  };

  const organizationName = user?.organization?.name || 'Organization';

  return (
    <aside className="w-74 min-h-screen h-screen flex justify-center">
      <div className="bg-gradient-to-b from-blue-900 to-cyan-900 w-64 h-screen rounded-lg mt-5 drop-shadow-lg flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <div 
            className="text-2xl flex items-center gap-2 cursor-pointer font-bold text-white"
            onClick={() => navigate('/dashboard')}
          >
            <span className="text-3xl">🏥</span>
            <div className="text-center">
              <div className="text-lg">{organizationName}</div>
              <div className="text-xs text-cyan-200">Organization Admin</div>
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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      await dispatch(logoutUser());
      navigate('/login');
    } else {
      if (userRole && hasRouteAccess(userRole, path)) {
        navigate(path);
      } else {
        console.warn(`Access denied to ${path} for role ${userRole}`);
      }
    }
  };

  const branchName = user?.branch?.name || 'Branch';
  const organizationName = user?.organization?.name || 'Organization';

  return (
    <aside className="w-74 min-h-screen h-screen flex justify-center">
      <div className="bg-gradient-to-b from-green-900 to-emerald-900 w-64 h-screen rounded-lg mt-5 drop-shadow-lg flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <div 
            className="text-2xl flex items-center gap-2 cursor-pointer font-bold text-white"
            onClick={() => navigate('/dashboard')}
          >
            <span className="text-3xl">🏥</span>
            <div className="text-center">
              <div className="text-lg">{branchName}</div>
              <div className="text-xs text-emerald-200">{organizationName}</div>
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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      await dispatch(logoutUser());
      navigate('/login');
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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      await dispatch(logoutUser());
      navigate('/login');
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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      await dispatch(logoutUser());
      navigate('/login');
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
function MenuItem({ icon, text, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors text-left"
    >
      <SidebarIcon name={icon} className="w-5 h-5 text-white" />
      <span className="text-sm font-medium">{text}</span>
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
