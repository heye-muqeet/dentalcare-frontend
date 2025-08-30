export type UserRole = 'admin' | 'doctor' | 'receptionist';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
} 