import api from '../axios';

export interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  area: string;
  city: string;
  medicalHistory: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    previousSurgeries: string[];
  };
  branchId: {
    _id: string;
    name: string;
  };
  organizationId: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  lastVisit?: string;
  totalVisits?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  area: string;
  city: string;
  medicalHistory: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    previousSurgeries: string[];
  };
  isActive?: boolean;
}

export interface UpdatePatientData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  area?: string;
  city?: string;
  medicalHistory?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    previousSurgeries: string[];
  };
  isActive?: boolean;
}

export interface PatientsResponse {
  success: boolean;
  data: Patient[];
}

export interface PatientResponse {
  success: boolean;
  data: Patient;
  message?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export const patientService = {
  // Get all patients for a branch
  getBranchPatients: async (branchId: string): Promise<PatientsResponse> => {
    console.log('🔍 Fetching patients for branch:', branchId);
    
    try {
      const response = await api.get(`/branches/${branchId}/patients`);
      console.log('✅ Patients fetched successfully:', response.data);
      
      // Handle different response structures
      let patientsData = response.data;
      
      // If response has a data property, use that
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        patientsData = response.data.data;
      }
      
      // If patientsData is not an array, default to empty array
      if (!Array.isArray(patientsData)) {
        console.log('⚠️ Patients data is not an array, defaulting to empty array:', patientsData);
        patientsData = [];
      }
      
      // Convert backend data to frontend format
      const patients = patientsData.map((patient: any) => ({
        ...patient,
        name: patient.name,
        area: patient.area || patient.address || '',
        city: patient.city || ''
      }));
      
      return {
        success: true,
        data: patients
      };
    } catch (error: any) {
      console.error('❌ Error fetching patients:', error);
      throw error;
    }
  },

  // Get single patient
  getPatientById: async (patientId: string): Promise<PatientResponse> => {
    console.log('🔍 Fetching patient:', patientId);
    
    try {
      const response = await api.get(`/patients/${patientId}`);
      console.log('✅ Patient fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching patient:', error);
      throw error;
    }
  },

  // Create new patient
  createPatient: async (branchId: string, patientData: CreatePatientData): Promise<PatientResponse> => {
    console.log('📝 Creating patient for branch:', branchId, patientData);
    
    try {
      console.log('📝 Sending to backend:', patientData);
      
      const response = await api.post(`/branches/${branchId}/patients`, patientData);
      console.log('✅ Patient created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating patient:', error);
      throw error;
    }
  },

  // Update patient
  updatePatient: async (patientId: string, patientData: UpdatePatientData): Promise<PatientResponse> => {
    console.log('📝 Updating patient:', patientId, patientData);
    
    try {
      const response = await api.patch(`/patients/${patientId}`, patientData);
      console.log('✅ Patient updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating patient:', error);
      throw error;
    }
  },

  // Delete patient (soft delete)
  deletePatient: async (patientId: string): Promise<DeleteResponse> => {
    console.log('🗑️ Deleting patient:', patientId);
    
    try {
      const response = await api.delete(`/patients/${patientId}`);
      console.log('✅ Patient deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting patient:', error);
      throw error;
    }
  },

  // Restore patient
  restorePatient: async (patientId: string): Promise<PatientResponse> => {
    console.log('🔄 Restoring patient:', patientId);
    
    try {
      const response = await api.post(`/patients/${patientId}/restore`);
      console.log('✅ Patient restored successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error restoring patient:', error);
      throw error;
    }
  },

  // Check for potential duplicate patients
  checkDuplicatePatients: async (branchId: string, patientData: {
    name: string;
    phone: string;
    dateOfBirth: string;
    email?: string;
  }): Promise<{
    success: boolean;
    data: {
      hasDuplicates: boolean;
      potentialDuplicates: Patient[];
      similarityScore: number;
    };
  }> => {
    console.log('🔍 Checking for duplicate patients:', { branchId, patientData });
    console.log('🔍 API URL:', `/branches/${branchId}/patients/check-duplicates`);
    
    try {
      const response = await api.post(`/branches/${branchId}/patients/check-duplicates`, patientData);
      console.log('✅ Duplicate check completed (API):', response.data);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error checking for duplicates:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      console.log('🔄 Falling back to mock data...');
      
      // Fallback to mock if API fails
      try {
        const { checkDuplicatePatientsMock } = await import('../mocks/duplicateCheckMock');
        const result = await checkDuplicatePatientsMock(branchId, patientData);
        console.log('✅ Duplicate check completed (mock fallback):', result);
        return result;
      } catch (mockError) {
        console.error('❌ Mock fallback also failed:', mockError);
        throw error; // Throw original API error
      }
    }
  }
};
