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
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deletedReason?: string;
  organizationAdminIds?: string[];
  organizationAdmins?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    dateOfBirth?: string;
    isActive: boolean;
    createdAt: string;
  }[];
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

export interface CascadeDeleteResult {
  modelName: string;
  deletedCount: number;
  documents: Array<{
    id: string;
    organizationId: string;
  }>;
}

export interface CascadeDeleteResponse {
  success: boolean;
  message: string;
  data: {
    organization: Organization;
    cascadeResults: CascadeDeleteResult[];
  };
}

export interface CascadeRestoreResult {
  modelName: string;
  restoredCount: number;
  documents: Array<{
    id: string;
    organizationId: string;
  }>;
}

export interface CascadeRestoreResponse {
  success: boolean;
  message: string;
  data: {
    organization: Organization;
    cascadeResults: CascadeRestoreResult[];
  };
}

export interface SoftDeleteStats {
  total: number;
  active: number;
  deleted: number;
  deletedToday: number;
  deletedThisWeek: number;
  deletedThisMonth: number;
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
      console.log('Fetching organization with ID:', id);
      
      // First get the organization
      const orgResponse = await api.get(API_ENDPOINTS.ORGANIZATIONS.BY_ID(id));
      const organization = orgResponse.data;
      console.log('Organization data:', organization);
      
      // Then get the organization admins
      const adminsResponse = await api.get(API_ENDPOINTS.ORGANIZATIONS.ADMINS(id));
      const admins = adminsResponse.data || [];
      console.log('Organization admins data:', admins);
      
      // Combine the data
      const result = {
        ...organization,
        organizationAdmins: admins,
        organizationAdminIds: admins.map((admin: any) => admin._id)
      };
      
      console.log('Combined organization data:', result);
      return result;
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

  // Delete organization with cascade (Super Admin only)
  deleteOrganization: async (id: string, reason?: string): Promise<CascadeDeleteResponse> => {
    try {
      const response = await api.delete(API_ENDPOINTS.ORGANIZATIONS.BY_ID(id), {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete organization:', error);
      throw error;
    }
  },

  // Restore organization with cascade (Super Admin only)
  restoreOrganization: async (id: string, reason?: string): Promise<CascadeRestoreResponse> => {
    try {
      const response = await api.put(`${API_ENDPOINTS.ORGANIZATIONS.BY_ID(id)}/restore`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Failed to restore organization:', error);
      throw error;
    }
  },

  // Get organizations including soft deleted ones
  getOrganizationsWithDeleted: async (includeDeleted = false): Promise<Organization[]> => {
    try {
      const params = includeDeleted ? { includeDeleted: 'true' } : {};
      const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.BASE, { params });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      return [];
    }
  },

  // Get soft delete statistics
  getSoftDeleteStats: async (organizationId?: string): Promise<SoftDeleteStats> => {
    try {
      const endpoint = organizationId 
        ? `/soft-delete/organization/stats?organizationId=${organizationId}`
        : '/soft-delete/organization/stats';
      const response = await api.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch soft delete stats:', error);
      return {
        total: 0,
        active: 0,
        deleted: 0,
        deletedToday: 0,
        deletedThisWeek: 0,
        deletedThisMonth: 0
      };
    }
  },

  // Get deleted organizations
  getDeletedOrganizations: async (page = 1, limit = 10): Promise<{
    organizations: Organization[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    try {
      const response = await api.get('/soft-delete/organization/deleted', {
        params: { page, limit }
      });
      return {
        organizations: response.data.data.documents,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      console.error('Failed to fetch deleted organizations:', error);
      return {
        organizations: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
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

  // Assign existing admin to organization
  assignAdminToOrganization: async (organizationId: string, adminId: string) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.ORGANIZATIONS.ADMINS(organizationId)}/assign`, { adminId });
      return response.data;
    } catch (error) {
      console.error('Failed to assign admin to organization:', error);
      throw error;
    }
  },

  // Remove admin from organization
  removeAdminFromOrganization: async (organizationId: string, adminId: string) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.ORGANIZATIONS.ADMINS(organizationId)}/${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove admin from organization:', error);
      throw error;
    }
  },

  // Update admin status in organization
  updateAdminStatus: async (organizationId: string, adminId: string, isActive: boolean) => {
    try {
      const response = await api.patch(`${API_ENDPOINTS.ORGANIZATIONS.ADMINS(organizationId)}/${adminId}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Failed to update admin status:', error);
      throw error;
    }
  },

  // Get available admins (not assigned to any organization)
  getAvailableAdmins: async () => {
    try {
      console.log('Fetching available admins...');
      // For now, we'll get all users with organization_admin role
      // The backend should filter out those already assigned to organizations
      const response = await api.get(`${API_ENDPOINTS.USERS.BASE}?role=organization_admin&available=true`);
      const admins = response.data || [];
      console.log('Available admins data:', admins);
      return admins;
    } catch (error) {
      console.error('Failed to fetch available admins:', error);
      return [];
    }
  },

  // Get organization statistics
  getOrganizationStats: async (id: string): Promise<OrganizationStats> => {
    try {
      console.log('Calling organization stats API with ID:', id);
      const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.STATS(id));
      console.log('Organization stats response:', response.data);
      
      // Handle both direct data and wrapped response formats
      const data = response.data?.data || response.data;
      
      return {
        totalBranches: data.totalBranches || 0,
        totalUsers: data.totalUsers || 0,
        totalDoctors: data.totalDoctors || 0,
        totalReceptionists: data.totalReceptionists || 0,
        totalPatients: data.totalPatients || 0,
        monthlyRevenue: data.monthlyRevenue || 0,
        activeUsers: data.activeUsers || 0
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
