import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface Branch {
  _id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  organizationId: string;
  organizationName?: string;
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Statistics
  totalStaff?: number;
  totalPatients?: number;
  totalDoctors?: number;
  totalReceptionists?: number;
  // Additional metadata
  tags?: string[];
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
}

export interface CreateBranchData {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  tags?: string[];
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
}

export interface UpdateBranchData extends Partial<CreateBranchData> {
  isActive?: boolean;
}

export interface BranchStats {
  totalBranches: number;
  activeBranches: number;
  inactiveBranches: number;
  totalStaff: number;
  totalPatients: number;
  totalDoctors: number;
  totalReceptionists: number;
}

export interface BranchFilters {
  search?: string;
  isActive?: boolean;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BranchResponse {
  success: boolean;
  data: Branch[];
  total: number;
  page: number;
  totalPages: number;
  message?: string;
}

export interface SingleBranchResponse {
  success: boolean;
  data: Branch;
  message?: string;
}

export interface BranchStatsResponse {
  success: boolean;
  data: BranchStats;
  message?: string;
}

export const branchService = {
  // Get all branches for the organization
  async getBranches(filters: BranchFilters = {}): Promise<BranchResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.city) params.append('city', filters.city);
    if (filters.state) params.append('state', filters.state);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`${API_ENDPOINTS.BRANCHES}?${params.toString()}`);
    return response.data;
  },

  // Get single branch by ID
  async getBranchById(id: string): Promise<SingleBranchResponse> {
    const response = await api.get(`${API_ENDPOINTS.BRANCHES}/${id}`);
    return response.data;
  },

  // Create new branch
  async createBranch(branchData: CreateBranchData): Promise<SingleBranchResponse> {
    const response = await api.post(API_ENDPOINTS.BRANCHES, branchData);
    return response.data;
  },

  // Update branch
  async updateBranch(id: string, branchData: UpdateBranchData): Promise<SingleBranchResponse> {
    const response = await api.put(`${API_ENDPOINTS.BRANCHES}/${id}`, branchData);
    return response.data;
  },

  // Delete branch (soft delete)
  async deleteBranch(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`${API_ENDPOINTS.BRANCHES}/${id}`, {
      data: { reason }
    });
    return response.data;
  },

  // Restore deleted branch
  async restoreBranch(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`${API_ENDPOINTS.BRANCHES}/${id}/restore`, { reason });
    return response.data;
  },

  // Get branch statistics
  async getBranchStats(): Promise<BranchStatsResponse> {
    const response = await api.get(`${API_ENDPOINTS.BRANCHES}/stats`);
    return response.data;
  },

  // Toggle branch status (active/inactive)
  async toggleBranchStatus(id: string): Promise<SingleBranchResponse> {
    const response = await api.patch(`${API_ENDPOINTS.BRANCHES}/${id}/toggle-status`);
    return response.data;
  },

  // Get branches with deleted ones (for admin)
  async getBranchesWithDeleted(filters: BranchFilters = {}): Promise<BranchResponse> {
    const params = new URLSearchParams();
    params.append('includeDeleted', 'true');
    
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.city) params.append('city', filters.city);
    if (filters.state) params.append('state', filters.state);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`${API_ENDPOINTS.BRANCHES}?${params.toString()}`);
    return response.data;
  },

  // Get branch staff/users
  async getBranchUsers(id: string): Promise<{
    success: boolean;
    data: {
      doctors: any[];
      receptionists: any[];
      branchAdmins: any[];
      total: number;
    };
  }> {
    const response = await api.get(`${API_ENDPOINTS.BRANCHES}/${id}/users`);
    return response.data;
  },

  // Get unique cities for filtering
  async getBranchCities(): Promise<{ success: boolean; data: string[] }> {
    const response = await api.get(`${API_ENDPOINTS.BRANCHES}/cities`);
    return response.data;
  },

  // Get unique states for filtering
  async getBranchStates(): Promise<{ success: boolean; data: string[] }> {
    const response = await api.get(`${API_ENDPOINTS.BRANCHES}/states`);
    return response.data;
  }
};

export default branchService;
