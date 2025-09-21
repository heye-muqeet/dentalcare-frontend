// Base URL is now handled by axios baseURL configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },

  // User endpoints
  USERS: {
    BASE: '/api/users',
    DOCTORS: '/api/users/doctors',
    BY_ID: (id: string) => `/api/users/${id}`,
    CHANGE_PASSWORD: '/api/users/change-password',
  },

  // Patient endpoints
  PATIENTS: {
    BASE: '/api/patients',
    BY_ID: (id: string) => `/api/patients/${id}`,
    DETAILS: (id: string) => `/api/patients/${id}/details`,
  },

  // Appointment endpoints
  APPOINTMENTS: {
    BASE: '/api/appointments',
    AVAILABLE_SLOTS: '/api/appointments/available-slots',
    BY_ID: (id: string) => `/api/appointments/${id}`,
    CANCEL: (id: string) => `/api/appointments/${id}/cancel`,
  },

  SERVICES: {
    BASE: '/api/services',
    BY_ID: (id: string) => `/api/services/${id}`,
  },

  TREATMENTS: {
    BASE: '/api/treatments',
    BY_ID: (id: string) => `/api/treatments/${id}`,
  },

  // Invoice endpoints
  INVOICES: {
    BASE: '/api/invoices',
    MARK_PAID: (id: string) => `/api/invoices/${id}/mark-paid`,
  },

  // Expense endpoints
  EXPENSES: {
    BASE: '/api/expenses',
    BY_ID: (id: string) => `/api/expenses/${id}`,
    SUMMARY: '/api/expenses/summary',
  },

  // Dashboard endpoints
  DASHBOARD: {
    BASE: '/api/dashboard',
  },
} as const; 