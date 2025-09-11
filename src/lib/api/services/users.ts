import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'receptionist' | 'doctor';
  gender?: string;
  age?: number;
  profileImage?: string;
  specialization?: string;
  licenseNumber?: string;
  licenseDocumentUrl?: string;
  experience?: number;
  education?: string;
  createdAt?: number;
  availability?: any[];
  status: 'active' | 'inactive' | 'suspended';
  organization: {
    name: string;
    address: string;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'owner' | 'receptionist' | 'doctor';
  gender?: string;
  age?: number;
  profileImage?: string;
  specialization?: string;
  licenseNumber?: string;
  licenseDocumentUrl?: string;
  experience?: number;
  education?: string;
  availability?: any[];
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
    // According to the Postman collection, response should include a success property
    // and the actual data is within data property
    return response.data;
  },

  createUser: async (data: CreateUserData) => {
    const response = await api.post(API_ENDPOINTS.USERS.BASE, data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<CreateUserData>) => {
    const response = await api.put(API_ENDPOINTS.USERS.BY_ID(id), data);
    return response.data;
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