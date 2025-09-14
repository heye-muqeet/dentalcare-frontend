import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../lib/store/store';
import { getRedirectPath } from '../../lib/utils/rolePermissions';
import type { UserRole } from '../../lib/constants/roles';

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
  const { user, isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A0F56]"></div>
      </div>
    );
  }

  // Only redirect to login if we're sure the user is not authenticated
  if (!isAuthenticated || !user) {
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
