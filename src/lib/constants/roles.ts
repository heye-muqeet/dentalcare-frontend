export type UserRole = 
  | 'super_admin' 
  | 'organization_admin' 
  | 'branch_admin' 
  | 'doctor' 
  | 'receptionist' 
  | 'patient';

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin' as const,
  ORGANIZATION_ADMIN: 'organization_admin' as const,
  BRANCH_ADMIN: 'branch_admin' as const,
  DOCTOR: 'doctor' as const,
  RECEPTIONIST: 'receptionist' as const,
  PATIENT: 'patient' as const,
} as const;

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 6,
  organization_admin: 5,
  branch_admin: 4,
  doctor: 3,
  receptionist: 2,
  patient: 1,
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'manage_organizations',
    'manage_organization_admins',
    'view_all_data',
    'manage_system_settings',
    'view_audit_logs',
    'manage_tokens',
  ],
  organization_admin: [
    'manage_branches',
    'manage_branch_admins',
    'manage_doctors',
    'manage_receptionists',
    'view_organization_data',
    'manage_organization_settings',
  ],
  branch_admin: [
    'manage_doctors',
    'manage_receptionists',
    'manage_patients',
    'view_branch_data',
    'manage_appointments',
    'manage_services',
  ],
  doctor: [
    'view_patients',
    'manage_appointments',
    'create_treatments',
    'view_medical_records',
    'manage_prescriptions',
  ],
  receptionist: [
    'manage_patients',
    'manage_appointments',
    'view_services',
    'manage_invoices',
    'view_basic_reports',
  ],
  patient: [
    'view_own_profile',
    'view_own_appointments',
    'view_own_treatments',
    'book_appointments',
  ],
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  super_admin: 'Super Administrator',
  organization_admin: 'Organization Administrator',
  branch_admin: 'Branch Administrator',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  patient: 'Patient',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-red-100 text-red-800',
  organization_admin: 'bg-purple-100 text-purple-800',
  branch_admin: 'bg-blue-100 text-blue-800',
  doctor: 'bg-green-100 text-green-800',
  receptionist: 'bg-yellow-100 text-yellow-800',
  patient: 'bg-gray-100 text-gray-800',
};

export const getRoleDisplayName = (role: UserRole): string => {
  return ROLE_DISPLAY_NAMES[role] || role;
};

export const getRoleColor = (role: UserRole): string => {
  return ROLE_COLORS[role] || 'bg-gray-100 text-gray-800';
};

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const canAccessRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
};
