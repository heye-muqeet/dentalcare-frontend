import { icons } from "../../assets";
import Icon from "../Icons";
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { logoutUser } from '../../lib/store/slices/authSlice';
import { getFilteredRoutes, hasRouteAccess } from '../../lib/utils/rolePermissions';
import type { UserRole } from '../../lib/utils/rolePermissions';
import type { RootState } from '../../lib/store/store';

interface MenuItemProps {
  icon: keyof typeof icons;
  text: string;
  onClick: () => void;
}

export function Sidebar() {
  const navigate = useNavigate();
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
      <div className="bg-white w-64 h-screen rounded-lg mt-5 drop-shadow-md p-4">
        <div className="flex items-center justify-center w-full pb-3">
          <span 
            className="text-3xl flex items-center gap-2 cursor-pointer font-bold text-[#0A0F56]"
            onClick={() => navigate('/dashboard')}
          >
            MI Dental
          </span>
        </div>

        <div className="bg-gray-100 h-0.5 w-full mb-6"></div>

        <nav className="flex-1 flex flex-col gap-1">
          {allowedRoutes.map((route: any, idx: number) => {
            const elements = [];
            
            // Add divider before the route if it has divider: true
            if (route.divider && idx > 0) {
              elements.push(
                <div key={`divider-${idx}`} className="bg-gray-100 h-0.5 w-full my-3"></div>
              );
            }
            
            // Add the menu item
            elements.push(
              <MenuItem
                key={route.label}
                icon={route.icon as keyof typeof icons}
                text={route.label}
                onClick={() => handleNavigation(route.path, route.isLogout)}
              />
            );
            
            return elements;
          })}
        </nav>
      </div>
    </aside>
  );
}

function MenuItem({ icon, text, onClick }: MenuItemProps) {
  return (
    <div
      className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer text-gray-700 text-[15px] font-medium hover:bg-blue-50 transition-all duration-200"
      onClick={onClick}
    >
      <Icon name={icon} width="w-5" height="h-5" />
      <span>{text}</span>
    </div>
  );
}