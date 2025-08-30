const BASE_URL = 'https://dental-backend-htv7.onrender.com';
// const BASE_URL = 'http://localhost:1337';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${BASE_URL}/api/auth/login`,
    REGISTER: `${BASE_URL}/api/auth/register`,
    PROFILE: `${BASE_URL}/api/auth/profile`,
    LOGOUT: `${BASE_URL}/api/auth/logout`,
    ME: `${BASE_URL}/api/auth/me`,
  },

  // User endpoints
  USERS: {
    BASE: `${BASE_URL}/api/users`,
    DOCTORS: `${BASE_URL}/api/users/doctors`,
    BY_ID: (id: string) => `${BASE_URL}/api/users/${id}`,
    CHANGE_PASSWORD: `${BASE_URL}/api/users/change-password`,
  },

  // Patient endpoints
  PATIENTS: {
    BASE: `${BASE_URL}/api/patients`,
    BY_ID: (id: string) => `${BASE_URL}/api/patients/${id}`,
    DETAILS: (id: string) => `${BASE_URL}/api/patients/${id}/details`,
  },

  // Appointment endpoints
  APPOINTMENTS: {
    BASE: `${BASE_URL}/api/appointments`,
    AVAILABLE_SLOTS: `${BASE_URL}/api/appointments/available-slots`,
    BY_ID: (id: string) => `${BASE_URL}/api/appointments/${id}`,
    CANCEL: (id: string) => `${BASE_URL}/api/appointments/${id}/cancel`,
  },

  SERVICES: {
    BASE: `${BASE_URL}/api/services`,
    BY_ID: (id: string) => `${BASE_URL}/api/services/${id}`,
  },

  TREATMENTS: {
    BASE: `${BASE_URL}/api/treatments`,
    BY_ID: (id: string) => `${BASE_URL}/api/treatments/${id}`,
  },

  // Invoice endpoints
  INVOICES: {
    BASE: `${BASE_URL}/api/invoices`,
    MARK_PAID: (id: string) => `${BASE_URL}/api/invoices/${id}/mark-paid`,
  },

  // Expense endpoints
  EXPENSES: {
    BASE: `${BASE_URL}/api/expenses`,
    BY_ID: (id: string) => `${BASE_URL}/api/expenses/${id}`,
    SUMMARY: `${BASE_URL}/api/expenses/summary`,
  },

  // Dashboard endpoints
  DASHBOARD: {
    BASE: `${BASE_URL}/api/dashboard`,
  },
} as const; 