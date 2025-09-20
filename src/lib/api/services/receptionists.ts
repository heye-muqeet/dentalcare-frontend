import api from '../axios';

export interface Receptionist {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branchId: {
    _id: string;
    name: string;
  };
  organizationId: {
    _id: string;
    name: string;
  };
  address?: string;
  dateOfBirth?: string;
  employeeId?: string;
  languages?: string[];
  workingHours?: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  permissions?: string[];
  experienceYears?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReceptionistData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  employeeId?: string;
  languages?: string[];
  workingHours?: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  permissions?: string[];
  experienceYears?: number;
  isActive?: boolean;
}

export interface UpdateReceptionistData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  employeeId?: string;
  languages?: string[];
  workingHours?: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  permissions?: string[];
  experienceYears?: number;
  isActive?: boolean;
}

export interface ReceptionistsResponse {
  success: boolean;
  data: Receptionist[];
}

export interface ReceptionistResponse {
  success: boolean;
  data: Receptionist;
  message?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export const receptionistService = {
  // Get all receptionists for a branch
  getBranchReceptionists: async (branchId: string): Promise<ReceptionistsResponse> => {
    console.log('🔍 Fetching receptionists for branch:', branchId);
    
    try {
      const response = await api.get(`/receptionists/branch/${branchId}`);
      console.log('✅ Receptionists fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching receptionists:', error);
      throw error;
    }
  },

  // Get single receptionist
  getReceptionistById: async (receptionistId: string): Promise<ReceptionistResponse> => {
    console.log('🔍 Fetching receptionist:', receptionistId);
    
    try {
      const response = await api.get(`/receptionists/${receptionistId}`);
      console.log('✅ Receptionist fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching receptionist:', error);
      throw error;
    }
  },

  // Create new receptionist
  createReceptionist: async (branchId: string, receptionistData: CreateReceptionistData): Promise<ReceptionistResponse> => {
    console.log('📝 Creating receptionist for branch:', branchId, receptionistData);
    
    try {
      const response = await api.post(`/receptionists/branch/${branchId}`, receptionistData);
      console.log('✅ Receptionist created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating receptionist:', error);
      throw error;
    }
  },

  // Update receptionist
  updateReceptionist: async (receptionistId: string, receptionistData: UpdateReceptionistData): Promise<ReceptionistResponse> => {
    console.log('📝 Updating receptionist:', receptionistId, receptionistData);
    
    try {
      const response = await api.patch(`/receptionists/${receptionistId}`, receptionistData);
      console.log('✅ Receptionist updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating receptionist:', error);
      throw error;
    }
  },

  // Delete receptionist (soft delete)
  deleteReceptionist: async (receptionistId: string): Promise<DeleteResponse> => {
    console.log('🗑️ Deleting receptionist:', receptionistId);
    
    try {
      const response = await api.delete(`/receptionists/${receptionistId}`);
      console.log('✅ Receptionist deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting receptionist:', error);
      throw error;
    }
  },

  // Restore receptionist
  restoreReceptionist: async (receptionistId: string): Promise<ReceptionistResponse> => {
    console.log('🔄 Restoring receptionist:', receptionistId);
    
    try {
      const response = await api.post(`/receptionists/${receptionistId}/restore`);
      console.log('✅ Receptionist restored successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error restoring receptionist:', error);
      throw error;
    }
  }
};
