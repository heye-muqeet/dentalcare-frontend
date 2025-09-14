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
  const allRoutes = [
    '/dashboard',
    '/doctors',
    '/patients',
    '/appointments',
    '/services',
    '/treatments',
    '/invoices',
    '/expenses',
    '/profile',
  ];

  // Define which routes each role can access
  const roleRoutes: Record<UserRole, string[]> = {
    super_admin: allRoutes,
    organization_admin: [
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
    icon: 'bar_chart',
    allowedRoles: ['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient']
  },
  {
    path: '/doctors',
    label: 'Doctors',
    icon: 'calender_add',
    allowedRoles: ['super_admin', 'organization_admin', 'branch_admin', 'receptionist']
  },
  {
    path: '/appointments',
    label: 'Appointments',
    icon: 'vase',
    allowedRoles: ['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient']
  },
  {
    path: '/patients',
    label: 'Patients',
    icon: 'users',
    allowedRoles: ['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist']
  },
  {
    path: '/services',
    label: 'Services',
    icon: 'document_chart',
    allowedRoles: ['super_admin', 'organization_admin', 'branch_admin', 'receptionist']
  },
  {
    path: '/invoice',
    label: 'Invoice',
    icon: 'document_chart',
    allowedRoles: ['organization_admin', 'branch_admin', 'receptionist'],
    divider: true
  },
  {
    path: '/expense',
    label: 'Expense',
    icon: 'document_chart',
    allowedRoles: ['organization_admin', 'branch_admin', 'receptionist']
  },
  {
    path: '/system-users',
    label: 'System Users',
    icon: 'users',
    allowedRoles: ['super_admin']
  },
  {
    path: '/system-logs',
    label: 'System Logs',
    icon: 'document_chart',
    allowedRoles: ['super_admin']
  },
  {
    path: '/system-health',
    label: 'System Health',
    icon: 'shield',
    allowedRoles: ['super_admin']
  },
  {
    path: '/account',
    label: 'Account',
    icon: 'user',
    allowedRoles: ['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient']
  },
  // Super Admin specific routes
  {
    path: '/organizations',
    label: 'Organizations',
    icon: 'building',
    allowedRoles: ['super_admin'],
    divider: true
  },
  {
    path: '/system-users',
    label: 'System Users',
    icon: 'users',
    allowedRoles: ['super_admin']
  },
  {
    path: '/system-logs',
    label: 'System Logs',
    icon: 'document_chart',
    allowedRoles: ['super_admin']
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: 'bar_chart',
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
    icon: 'shield',
    allowedRoles: ['super_admin']
  },
  {
    path: '/logout',
    label: 'Log Out',
    icon: 'logout',
    allowedRoles: ['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient'],
    divider: true,
    isLogout: true
  }
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
