import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { hasRouteAccess } from '../utils/rolePermissions';
import type { UserRole } from '../utils/rolePermissions';

export function useRoleAccess() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role as UserRole;

  const canAccess = (routePath: string): boolean => {
    if (!userRole) return false;
    return hasRouteAccess(userRole, routePath);
  };

  const canAccessAppointmentDetails = (): boolean => {
    return canAccess('/appointment-details');
  };

  const isOwner = (): boolean => {
    return userRole === 'owner';
  };

  const isReceptionist = (): boolean => {
    return userRole === 'receptionist';
  };

  const isDoctor = (): boolean => {
    return userRole === 'doctor';
  };

  return {
    userRole,
    canAccess,
    canAccessAppointmentDetails,
    isOwner,
    isReceptionist,
    isDoctor,
  };
} 