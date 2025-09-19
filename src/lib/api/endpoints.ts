const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${BASE_URL}/auth/token/refresh`,
    REVOKE_TOKEN: `${BASE_URL}/auth/token/revoke`,
    REVOKE_ALL_TOKENS: `${BASE_URL}/auth/token/revoke-all`,
    // Role-specific registration endpoints
    SUPER_ADMIN: `${BASE_URL}/auth/super-admin`,
    ORGANIZATION_ADMIN: `${BASE_URL}/auth/organization-admin`,
    BRANCH_ADMIN: `${BASE_URL}/auth/branch-admin`,
    DOCTOR: `${BASE_URL}/auth/doctor`,
    RECEPTIONIST: `${BASE_URL}/auth/receptionist`,
    PATIENT: `${BASE_URL}/auth/patient`,
  },

  // User endpoints
  USERS: {
    BASE: `${BASE_URL}/users`,
    DOCTORS: `${BASE_URL}/users/doctors`,
    BY_ID: (id: string) => `${BASE_URL}/users/${id}`,
    CHANGE_PASSWORD: `${BASE_URL}/users/change-password`,
  },

  // Organization endpoints
  ORGANIZATIONS: {
    BASE: `${BASE_URL}/organizations`,
    BY_ID: (id: string) => `${BASE_URL}/organizations/${id}`,
    ADMINS: (id: string) => `${BASE_URL}/organizations/${id}/admins`,
    STATS: (id: string) => `${BASE_URL}/organizations/${id}/stats`,
  },

  // Branch endpoints
  BRANCHES: `${BASE_URL}/branches`,
  BRANCH_ENDPOINTS: {
    BASE: `${BASE_URL}/branches`,
    BY_ID: (id: string) => `${BASE_URL}/branches/${id}`,
    ADMINS: (id: string) => `${BASE_URL}/branches/${id}/admins`,
    DOCTORS: (id: string) => `${BASE_URL}/branches/${id}/doctors`,
    RECEPTIONISTS: (id: string) => `${BASE_URL}/branches/${id}/receptionists`,
    PATIENTS: (id: string) => `${BASE_URL}/branches/${id}/patients`,
    STATS: (id: string) => `${BASE_URL}/branches/${id}/stats`,
  },

  // Patient endpoints
  PATIENTS: {
    BASE: `${BASE_URL}/patients`,
    BY_ID: (id: string) => `${BASE_URL}/patients/${id}`,
    DETAILS: (id: string) => `${BASE_URL}/patients/${id}/details`,
  },

  // Appointment endpoints
  APPOINTMENTS: {
    BASE: `${BASE_URL}/appointments`,
    AVAILABLE_SLOTS: `${BASE_URL}/appointments/available-slots`,
    BY_ID: (id: string) => `${BASE_URL}/appointments/${id}`,
    CANCEL: (id: string) => `${BASE_URL}/appointments/${id}/cancel`,
  },

  // Services endpoints
  SERVICES: {
    BASE: `${BASE_URL}/services`,
    BY_ID: (id: string) => `${BASE_URL}/services/${id}`,
  },

  // Treatments endpoints
  TREATMENTS: {
    BASE: `${BASE_URL}/treatments`,
    BY_ID: (id: string) => `${BASE_URL}/treatments/${id}`,
  },

  // Invoice endpoints
  INVOICES: {
    BASE: `${BASE_URL}/invoices`,
    MARK_PAID: (id: string) => `${BASE_URL}/invoices/${id}/mark-paid`,
  },

  // Expense endpoints
  EXPENSES: {
    BASE: `${BASE_URL}/expenses`,
    BY_ID: (id: string) => `${BASE_URL}/expenses/${id}`,
    SUMMARY: `${BASE_URL}/expenses/summary`,
  },

  // Upload endpoints
  UPLOAD: {
    IMAGE: `${BASE_URL}/upload/image`,
    DOCUMENT: `${BASE_URL}/upload/document`,
    BY_ID: (id: string) => `${BASE_URL}/upload/${id}`,
  },

  // Audit endpoints
  AUDIT: {
    LOGS: `${BASE_URL}/audit/logs`,
    STATS: `${BASE_URL}/audit/stats`,
    USER_ACTIVITY: (userId: string) => `${BASE_URL}/audit/user/${userId}/activity`,
    SECURITY_EVENTS: `${BASE_URL}/audit/security-events`,
    CLEANUP: `${BASE_URL}/audit/cleanup`,
  },

  // Dashboard endpoints
  DASHBOARD: {
    BASE: `${BASE_URL}/dashboard`,
    STATS: `${BASE_URL}/dashboard/stats`,
    SYSTEM_STATS: `${BASE_URL}/dashboard/system-stats`,
    HEALTH: `${BASE_URL}/dashboard/health`,
    SYSTEM_USERS: `${BASE_URL}/dashboard/system-users`,
  },
} as const;
