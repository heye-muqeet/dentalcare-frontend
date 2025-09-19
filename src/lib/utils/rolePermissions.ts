import type { UserRole } from '../constants/roles';

// Re-export UserRole for convenience
export type { UserRole };

export const getRedirectPath = (userRole: UserRole, _currentPath: string): string => {
  // Define default redirect paths for each role
  const defaultPaths: Record<UserRole, string> = {
    super_admin: '/dashboard',
    organization_admin: '/dashboard',
    branch_admin: '/dashboard',
    doctor: '/appointments',
    receptionist: '/appointments',
    patient: '/profile',
  };

  // If user is trying to access a path they can't access, redirect to their default
  return defaultPaths[userRole] || '/dashboard';
};

export const getAccessibleRoutes = (userRole: UserRole): string[] => {
  // Define which routes each role can access
  const roleRoutes: Record<UserRole, string[]> = {
    super_admin: [
      '/dashboard',
      '/organizations',
      '/system-users', 
      '/system-logs',
      '/analytics',
      '/system-settings',
      '/security',
      '/profile'
    ],
    organization_admin: [
      '/dashboard',
      '/branches',
      '/doctors',
      '/patients',
      '/appointments',
      '/services',
      '/treatments',
      '/invoices',
      '/expenses',
      '/profile',
    ],
    branch_admin: [
      '/dashboard',
      '/doctors',
      '/patients',
      '/appointments',
      '/services',
      '/treatments',
      '/invoices',
      '/expenses',
      '/profile',
    ],
    doctor: [
      '/dashboard',
      '/patients',
      '/appointments',
      '/treatments',
      '/profile',
    ],
    receptionist: [
      '/dashboard',
      '/patients',
      '/appointments',
      '/services',
      '/invoices',
      '/expenses',
      '/profile',
    ],
    patient: [
      '/dashboard',
      '/appointments',
      '/treatments',
      '/profile',
    ],
  };

  return roleRoutes[userRole] || ['/dashboard'];
};

export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const accessibleRoutes = getAccessibleRoutes(userRole);
  return accessibleRoutes.includes(route);
};

// Additional exports needed by Sidebar component
export interface RoutePermission {
  path: string;
  label: string;
  icon: string;
  allowedRoles: UserRole[];
  divider?: boolean;
  isLogout?: boolean;
}

// Define route permissions based on user roles
export const routePermissions: RoutePermission[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    allowedRoles: ['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient']
  },
  // Branch Management
  {
    path: '/branches',
    label: 'Branches',
    icon: 'building',
    allowedRoles: ['organization_admin']
  },
  // Clinical Management
  {
    path: '/patients',
    label: 'Patients',
    icon: 'users',
    allowedRoles: ['organization_admin', 'branch_admin', 'doctor', 'receptionist']
  },
  {
    path: '/doctors',
    label: 'Doctors',
    icon: 'stethoscope',
    allowedRoles: ['organization_admin', 'branch_admin', 'receptionist']
  },
  {
    path: '/appointments',
    label: 'Appointments',
    icon: 'calendar',
    allowedRoles: ['organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient']
  },
  {
    path: '/services',
    label: 'Services',
    icon: 'treatments',
    allowedRoles: ['organization_admin', 'branch_admin', 'receptionist']
  },
  // Financial Management
  {
    path: '/invoices',
    label: 'Invoices',
    icon: 'billing',
    allowedRoles: ['organization_admin', 'branch_admin', 'receptionist'],
    divider: true
  },
  {
    path: '/expenses',
    label: 'Expenses',
    icon: 'expenses',
    allowedRoles: ['organization_admin', 'branch_admin', 'receptionist']
  },
  // User Management
  {
    path: '/profile',
    label: 'Account',
    icon: 'user',
    allowedRoles: ['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient'],
    divider: true
  },
  // Super Admin specific routes
  {
    path: '/organizations',
    label: 'Organizations',
    icon: 'organizations',
    allowedRoles: ['super_admin'],
    divider: true
  },
  {
    path: '/system-users',
    label: 'System Users',
    icon: 'user_check',
    allowedRoles: ['super_admin']
  },
  {
    path: '/system-logs',
    label: 'System Logs',
    icon: 'database',
    allowedRoles: ['super_admin']
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: 'analytics',
    allowedRoles: ['super_admin']
  },
  {
    path: '/system-settings',
    label: 'System Settings',
    icon: 'settings',
    allowedRoles: ['super_admin']
  },
  {
    path: '/security',
    label: 'Security Monitor',
    icon: 'security',
    allowedRoles: ['super_admin']
  },
];

export const hasRouteAccess = (userRole: UserRole, routePath: string): boolean => {
  const route = routePermissions.find(r => r.path === routePath);
  if (route) {
    return route.allowedRoles.includes(userRole);
  }
  return false;
};

export const getFilteredRoutes = (userRole: UserRole): RoutePermission[] => {
  return routePermissions.filter(route => route.allowedRoles.includes(userRole));
};
