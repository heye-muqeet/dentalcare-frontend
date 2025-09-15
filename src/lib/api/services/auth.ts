import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';
// Define User type locally since users service might not be available
export interface User {
  _id: string;
  id?: string; // Alternative ID field
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // For backward compatibility
  role: string;
  organizationId?: string;
  branchId?: string;
  organization?: {
    name: string;
    address: string;
  };
  branch?: {
    name: string;
    address: string;
  };
  location?: {
    name: string;
    address: string;
  };
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
  isRememberMe?: boolean;
  deviceName?: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  organizationId?: string;
  branchId?: string;
  specialization?: string;
  licenseNumber?: string;
  qualifications?: string[];
  experienceYears?: number;
  languages?: string[];
  consultationFee?: {
    amount: number;
    currency: string;
  };
  dateOfBirth?: string;
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: User;
  user?: User;
  access_token?: string;
  token?: string;
  refresh_token?: string;
  expires_in?: number;
  role?: string;
  organizationId?: string;
  branchId?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  getProfile: async (): Promise<LoginResponse> => {
    // Since there's no dedicated profile endpoint, we'll simulate getting profile from login response
    // In a real app, you'd decode the JWT token or call a proper /me endpoint
    throw new Error('Profile endpoint not available. Please login again.');
  },

  logout: async (): Promise<void> => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Logout might fail if token is invalid, but we still want to clear local storage
      console.warn('Logout API call failed:', error);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    // Since there's no /me endpoint, we'll simulate getting current user
    // In a real app, you'd decode the JWT token or call a proper endpoint
    throw new Error('Current user endpoint not available. Please login again.');
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    );
    return response.data;
  },

  revokeToken: async (refreshToken: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.REVOKE_TOKEN, { refreshToken });
  },

  revokeAllTokens: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.REVOKE_ALL_TOKENS);
  },

  // Role-specific registration methods
  createSuperAdmin: async (data: RegisterData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.SUPER_ADMIN, data);
    return response.data;
  },

  createOrganizationAdmin: async (data: RegisterData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.ORGANIZATION_ADMIN, data);
    return response.data;
  },

  createBranchAdmin: async (data: RegisterData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.BRANCH_ADMIN, data);
    return response.data;
  },

  createDoctor: async (data: RegisterData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.DOCTOR, data);
    return response.data;
  },

  createReceptionist: async (data: RegisterData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.RECEPTIONIST, data);
    return response.data;
  },

  createPatient: async (data: RegisterData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.PATIENT, data);
    return response.data;
  },
};
