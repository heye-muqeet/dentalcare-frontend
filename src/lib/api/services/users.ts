import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'organization_admin' | 'branch_admin' | 'doctor' | 'receptionist' | 'patient';
  gender?: string;
  dateOfBirth?: string;
  profileImage?: string;
  specialization?: string;
  licenseNumber?: string;
  licenseDocumentUrl?: string;
  experience?: number;
  education?: string;
  qualifications?: string[];
  languages?: string[];
  consultationFee?: {
    amount: number;
    currency: string;
  };
  createdAt?: string;
  updatedAt?: string;
  availability?: any[];
  status: 'active' | 'inactive' | 'suspended';
  organizationId?: string;
  branchId?: string;
  organization?: {
    id: string;
    name: string;
    address: string;
  };
  branch?: {
    id: string;
    name: string;
    address: string;
  };
  // Patient-specific fields
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'super_admin' | 'organization_admin' | 'branch_admin' | 'doctor' | 'receptionist' | 'patient';
  gender?: string;
  dateOfBirth?: string;
  profileImage?: string;
  specialization?: string;
  licenseNumber?: string;
  licenseDocumentUrl?: string;
  experience?: number;
  education?: string;
  qualifications?: string[];
  languages?: string[];
  consultationFee?: {
    amount: number;
    currency: string;
  };
  availability?: any[];
  organizationId?: string;
  branchId?: string;
  // Patient-specific fields
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userService = {
  getUsers: async () => {
    const response = await api.get(API_ENDPOINTS.USERS.BASE);
    return response.data;
  },

  getDoctors: async () => {
    const response = await api.get(API_ENDPOINTS.USERS.DOCTORS);
    return response.data;
  },

  createUser: async (data: CreateUserData) => {
    const response = await api.post(API_ENDPOINTS.USERS.BASE, data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<CreateUserData>) => {
    console.log(`API: Updating user ${id} with data:`, data);
    try {
      const response = await api.put(API_ENDPOINTS.USERS.BY_ID(id), data);
      console.log('API: Update user response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(API_ENDPOINTS.USERS.BY_ID(id));
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await api.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);
    return response.data;
  }
};
