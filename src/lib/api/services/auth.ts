import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import sessionManager from '../../services/sessionManager';
// Define User type locally since users service might not be available
export interface User {
  _id: string;
  id?: string; // Alternative ID field
  email: string;
  name: string; // Updated to match backend schema
  firstName?: string; // For backward compatibility
  lastName?: string; // For backward compatibility
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

export interface CreateOrganizationAdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
}

export interface OrganizationAdmin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organizationId: string;
  createdBy: string;
  isActive: boolean;
  role: string;
  profileImage?: string;
  address?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
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
      // Only attempt logout API call if we have a valid token
      const session = sessionManager.getSession();
      if (session && sessionManager.isSessionActive()) {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT);
        console.log('✅ Logout API call successful');
      } else {
        console.log('⚠️ No valid session - skipping logout API call');
      }
    } catch (error) {
      // Logout might fail if token is invalid, but we still want to clear local storage
      console.warn('⚠️ Logout API call failed (this is usually fine):', error);
      // Don't throw error - we still want to clear local session
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
