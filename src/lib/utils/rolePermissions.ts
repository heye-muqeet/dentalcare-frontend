export type UserRole = 'owner' | 'receptionist' | 'doctor';

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
    allowedRoles: ['owner', 'receptionist', 'doctor']
  },
  {
    path: '/doctors',
    label: 'Doctors',
    icon: 'calender_add',
    allowedRoles: ['owner', 'receptionist']
  },
  {
    path: '/appointments',
    label: 'Appointments',
    icon: 'vase',
    allowedRoles: ['owner', 'receptionist', 'doctor']
  },
  {
    path: '/patients',
    label: 'Patients',
    icon: 'users',
    allowedRoles: ['owner', 'receptionist', 'doctor']
  },
  {
    path: '/services',
    label: 'Services',
    icon: 'document_chart',
    allowedRoles: ['owner', 'receptionist']
  },
  {
    path: '/invoice',
    label: 'Invoice',
    icon: 'document_chart',
    allowedRoles: ['owner', 'receptionist'],
    divider: true
  },
  {
    path: '/expense',
    label: 'Expense',
    icon: 'document_chart',
    allowedRoles: ['owner', 'receptionist']
  },
  {
    path: '/account',
    label: 'Account',
    icon: 'user',
    allowedRoles: ['owner', 'receptionist', 'doctor']
  },
  {
    path: '/logout',
    label: 'Log Out',
    icon: 'logout',
    allowedRoles: ['owner', 'receptionist', 'doctor'],
    divider: true,
    isLogout: true
  }
];

// Special routes that require additional permission checks
export const specialRoutePermissions = {
  '/appointment-details': {
    allowedRoles: ['owner', 'doctor'] as UserRole[], // Receptionist cannot access
    redirectPath: '/appointments' // Where to redirect if access denied
  }
};

// Utility functions
export const hasRouteAccess = (userRole: UserRole, routePath: string): boolean => {
  // Check regular routes
  const route = routePermissions.find(r => r.path === routePath);
  if (route) {
    return route.allowedRoles.includes(userRole);
  }

  // Check special routes
  const specialRoute = specialRoutePermissions[routePath as keyof typeof specialRoutePermissions];
  if (specialRoute) {
    return specialRoute.allowedRoles.includes(userRole);
  }

  // Default: deny access to unknown routes
  return false;
};

export const getFilteredRoutes = (userRole: UserRole): RoutePermission[] => {
  return routePermissions.filter(route => route.allowedRoles.includes(userRole));
};

export const getRedirectPath = (userRole: UserRole, attemptedPath: string): string => {
  // Check if user has access to the attempted path
  if (hasRouteAccess(userRole, attemptedPath)) {
    return attemptedPath;
  }

  // Check special routes for redirect path
  const specialRoute = specialRoutePermissions[attemptedPath as keyof typeof specialRoutePermissions];
  if (specialRoute && !specialRoute.allowedRoles.includes(userRole)) {
    return specialRoute.redirectPath;
  }

  // Default redirects based on role
  switch (userRole) {
    case 'owner':
    case 'receptionist':
      return '/dashboard';
    case 'doctor':
      return '/appointments';
    default:
      return '/dashboard';
  }
}; 