import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { logoutUser } from '../../lib/store/slices/authSlice';
import { getFilteredRoutes, hasRouteAccess } from '../../lib/utils/rolePermissions';
import type { UserRole } from '../../lib/utils/rolePermissions';
import type { RootState } from '../../lib/store/store';
import SidebarIcon from '../Icons/SidebarIcon';

interface MenuItemProps {
  icon: string;
  text: string;
  onClick: () => void;
  isActive?: boolean;
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  // Get filtered routes based on user role
  const userRole = user?.role as UserRole;
  const allowedRoutes = userRole ? getFilteredRoutes(userRole) : [];

  const handleNavigation = async (path: string, isLogout?: boolean) => {
    if (isLogout) {
      await dispatch(logoutUser());
      navigate('/login');
    } else {
      // Check if user has access to the route before navigating
      if (userRole && hasRouteAccess(userRole, path)) {
        navigate(path);
      } else {
        // Optionally show a toast or alert here
        console.warn(`Access denied to ${path} for role ${userRole}`);
      }
    }
  };

  return (
    <aside className="w-74 min-h-screen h-screen flex justify-center">
      <div className="bg-white w-64 h-screen rounded-lg mt-5 drop-shadow-md flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-center w-full">
            <span 
              className="text-3xl flex items-center gap-2 cursor-pointer font-bold text-[#0A0F56]"
              onClick={() => navigate('/dashboard')}
            >
              MI Dental
            </span>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 custom-scrollbar light">
          {allowedRoutes.map((route: any, idx: number) => {
            const elements = [];
            
            // Add divider before the route if it has divider: true
            if (route.divider && idx > 0) {
              elements.push(
                <div key={`divider-${idx}`} className="bg-gray-200 h-0.5 w-full my-3"></div>
              );
            }
            
            // Add the menu item
            elements.push(
              <MenuItem
                key={route.label}
                icon={route.icon}
                text={route.label}
                onClick={() => handleNavigation(route.path, route.isLogout)}
                isActive={location.pathname === route.path}
              />
            );
            
            return elements;
          })}
        </nav>
      </div>
    </aside>
  );
}

function MenuItem({ icon, text, onClick, isActive = false }: MenuItemProps) {
  return (
    <div
      className={`relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer text-[15px] font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md border-l-4 border-blue-300' 
          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
      }`}
      onClick={onClick}
    >
      <SidebarIcon 
        name={icon} 
        className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} 
      />
      <span className={isActive ? 'font-semibold' : ''}>{text}</span>
      {isActive && (
        <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-80"></div>
      )}
    </div>
  );
}