export const APP_CONFIG = {
  NAME: 'MI Dental',
  VERSION: '1.0.0',
  DESCRIPTION: 'Dental Care Management System',
} as const;

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DOCTORS: '/doctors',
  PATIENTS: '/patients',
  APPOINTMENTS: '/appointments',
  SERVICES: '/services',
  TREATMENTS: '/treatments',
  INVOICES: '/invoices',
  EXPENSES: '/expenses',
  PROFILE: '/profile',
} as const;
