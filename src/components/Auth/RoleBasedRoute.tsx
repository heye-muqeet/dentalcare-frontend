import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../lib/store/store';
import { getRedirectPath } from '../../lib/utils/rolePermissions';
import type { UserRole } from '../../lib/utils/rolePermissions';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  redirectPath?: string;
}

export function RoleBasedRoute({ 
  children, 
  requiredRoles, 
  redirectPath 
}: RoleBasedRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role as UserRole;
  const hasAccess = requiredRoles.includes(userRole);

  if (!hasAccess) {
    const fallbackPath = redirectPath || getRedirectPath(userRole, window.location.pathname);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
} 