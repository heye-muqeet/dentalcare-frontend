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
  createdAt: string;
  updatedAt: string;
  branchCount?: number;
  userCount?: number;
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
    const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.BASE);
    return response.data;
  },

  // Get specific organization
  getOrganization: async (id: string): Promise<Organization> => {
    const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.BY_ID(id));
    return response.data;
  },

  // Create new organization (Super Admin only)
  createOrganization: async (data: CreateOrganizationData): Promise<Organization> => {
    const response = await api.post(API_ENDPOINTS.ORGANIZATIONS.BASE, data);
    return response.data;
  },

  // Update organization
  updateOrganization: async (id: string, data: Partial<CreateOrganizationData>): Promise<Organization> => {
    const response = await api.put(API_ENDPOINTS.ORGANIZATIONS.BY_ID(id), data);
    return response.data;
  },

  // Delete organization (Super Admin only)
  deleteOrganization: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ORGANIZATIONS.BY_ID(id));
  },

  // Get organization admins
  getOrganizationAdmins: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.ADMINS(id));
    return response.data;
  },

  // Create organization admin (Super Admin only)
  createOrganizationAdmin: async (organizationId: string, adminData: any) => {
    const response = await api.post(API_ENDPOINTS.ORGANIZATIONS.ADMINS(organizationId), adminData);
    return response.data;
  },

  // Get organization statistics
  getOrganizationStats: async (id: string): Promise<OrganizationStats> => {
    const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.STATS(id));
    return response.data;
  },
};
