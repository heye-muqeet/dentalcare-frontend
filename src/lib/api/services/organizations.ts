import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface Organization {
  _id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  tags: string[];
  isActive: boolean;
  organizationAdminId?: string;
  organizationAdmin?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    dateOfBirth?: string;
  };
  createdAt: string;
  updatedAt: string;
  branchCount: number;
  userCount: number;
}

export interface CreateOrganizationData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  tags: string[];
  isActive?: boolean;
}

export interface OrganizationStats {
  totalBranches: number;
  totalUsers: number;
  totalDoctors: number;
  totalReceptionists: number;
  totalPatients: number;
  monthlyRevenue: number;
  activeUsers: number;
}

export const organizationService = {
  // Get all organizations (Super Admin only)
  getOrganizations: async (): Promise<Organization[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.BASE);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      return [];
    }
  },

  // Get specific organization
  getOrganization: async (id: string): Promise<Organization> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      throw error;
    }
  },

  // Get organization with admin details
  getOrganizationWithAdmin: async (id: string): Promise<Organization> => {
    try {
      const response = await api.get(`${API_ENDPOINTS.ORGANIZATIONS.BY_ID(id)}?populate=organizationAdmin`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch organization with admin:', error);
      throw error;
    }
  },

  // Create new organization (Super Admin only)
  createOrganization: async (data: CreateOrganizationData): Promise<Organization> => {
    try {
      const response = await api.post(API_ENDPOINTS.ORGANIZATIONS.BASE, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create organization:', error);
      throw error;
    }
  },

  // Update organization
  updateOrganization: async (id: string, data: Partial<CreateOrganizationData>): Promise<Organization> => {
    try {
      const response = await api.patch(API_ENDPOINTS.ORGANIZATIONS.BY_ID(id), data);
      return response.data;
    } catch (error) {
      console.error('Failed to update organization:', error);
      throw error;
    }
  },

  // Delete organization (Super Admin only)
  deleteOrganization: async (id: string): Promise<void> => {
    try {
      await api.delete(API_ENDPOINTS.ORGANIZATIONS.BY_ID(id));
    } catch (error) {
      console.error('Failed to delete organization:', error);
      throw error;
    }
  },

  // Get organization admins
  getOrganizationAdmins: async (id: string) => {
    try {
      const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.ADMINS(id));
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch organization admins:', error);
      return [];
    }
  },

  // Create organization admin (Super Admin only)
  createOrganizationAdmin: async (organizationId: string, adminData: any) => {
    try {
      const response = await api.post(API_ENDPOINTS.ORGANIZATIONS.ADMINS(organizationId), adminData);
      return response.data;
    } catch (error) {
      console.error('Failed to create organization admin:', error);
      throw error;
    }
  },

  // Get organization statistics
  getOrganizationStats: async (id: string): Promise<OrganizationStats> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.STATS(id));
      return response.data || {
        totalBranches: 0,
        totalUsers: 0,
        totalDoctors: 0,
        totalReceptionists: 0,
        totalPatients: 0,
        monthlyRevenue: 0,
        activeUsers: 0
      };
    } catch (error) {
      console.error('Failed to fetch organization stats:', error);
      return {
        totalBranches: 0,
        totalUsers: 0,
        totalDoctors: 0,
        totalReceptionists: 0,
        totalPatients: 0,
        monthlyRevenue: 0,
        activeUsers: 0
      };
    }
  },
};
