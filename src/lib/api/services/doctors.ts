import api from '../axios';

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
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
  qualifications?: string[];
  experienceYears?: number;
  languages?: string[];
  availability?: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };
  services?: string[];
  isActive: boolean;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  address?: string;
  dateOfBirth?: string;
  employeeId?: string;
  qualifications?: string[];
  experienceYears?: number;
  languages?: string[];
  availability?: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };
  services?: string[];
  isActive?: boolean;
}

export interface UpdateDoctorData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  address?: string;
  dateOfBirth?: string;
  employeeId?: string;
  qualifications?: string[];
  experienceYears?: number;
  languages?: string[];
  availability?: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };
  services?: string[];
  isActive?: boolean;
}

export interface DoctorsResponse {
  success: boolean;
  data: Doctor[];
}

export interface DoctorResponse {
  success: boolean;
  data: Doctor;
  message?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export const doctorService = {
  // Get all doctors for a branch
  getBranchDoctors: async (branchId: string): Promise<DoctorsResponse> => {
    console.log('🔍 Fetching doctors for branch:', branchId);
    
    try {
      const response = await api.get(`/doctors/branch/${branchId}`);
      console.log('✅ Doctors fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching doctors:', error);
      throw error;
    }
  },

  // Get single doctor
  getDoctorById: async (doctorId: string): Promise<DoctorResponse> => {
    console.log('🔍 Fetching doctor:', doctorId);
    
    try {
      const response = await api.get(`/doctors/${doctorId}`);
      console.log('✅ Doctor fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching doctor:', error);
      throw error;
    }
  },

  // Create new doctor
  createDoctor: async (branchId: string, doctorData: CreateDoctorData): Promise<DoctorResponse> => {
    console.log('📝 Creating doctor for branch:', branchId, doctorData);
    
    try {
      const response = await api.post(`/doctors/branch/${branchId}`, doctorData);
      console.log('✅ Doctor created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating doctor:', error);
      throw error;
    }
  },

  // Update doctor
  updateDoctor: async (doctorId: string, doctorData: UpdateDoctorData): Promise<DoctorResponse> => {
    console.log('📝 Updating doctor:', doctorId, doctorData);
    
    try {
      const response = await api.patch(`/doctors/${doctorId}`, doctorData);
      console.log('✅ Doctor updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating doctor:', error);
      throw error;
    }
  },

  // Delete doctor (soft delete)
  deleteDoctor: async (doctorId: string): Promise<DeleteResponse> => {
    console.log('🗑️ Deleting doctor:', doctorId);
    
    try {
      const response = await api.delete(`/doctors/${doctorId}`);
      console.log('✅ Doctor deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting doctor:', error);
      throw error;
    }
  },

  // Restore doctor
  restoreDoctor: async (doctorId: string): Promise<DoctorResponse> => {
    console.log('🔄 Restoring doctor:', doctorId);
    
    try {
      const response = await api.post(`/doctors/${doctorId}/restore`);
      console.log('✅ Doctor restored successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error restoring doctor:', error);
      throw error;
    }
  }
};
