import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  address: string;
  medicalHistory?: string;
  allergies?: string;
  balance: number;
}

// Extended interface for patient details page
export interface PatientDetailsResponse {
  patientInfo: {
    createdAt: number;
    updatedAt: number;
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    dob: string;
    address: string;
    medicalHistory?: string;
    allergies?: string;
    balance: number;
    deletedAt: number;
    organization: string;
    location: string;
    addedBy: string;
  };
  treatmentHistory: TreatmentHistoryItem[];
  statistics: {
    totalVisits: number;
    totalSpent: number;
    lastVisit: string;
    status: string;
  };
}

export interface TreatmentHistoryItem {
  id: string;
  appointmentId: string;
  diagnosis: string;
  servicesProvided: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  doctorName: string;
  date: string;
  total: number;
}

// Keep the old interfaces for backward compatibility
export interface PatientDetails extends Patient {
  username?: string;
  age?: number;
  sex?: string;
  bloodType?: string;
  disease?: string;
  reason?: string;
  emergencyContact?: string;
  createdAt?: string;
  appointmentHistory?: AppointmentHistoryItem[];
}

export interface AppointmentHistoryItem {
  id: string;
  appointmentDate: string;
  doctor: string;
  totalAmount: number;
  status: string;
  services: Array<{
    name: string;
    amount: number;
  }>;
  notes: string;
}

export interface CreatePatientData {
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  address: string;
  medicalHistory?: string;
  allergies?: string;
}

export const patientService = {
  getPatients: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PATIENTS.BASE);
      console.log('Get patients API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  getPatient: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.PATIENTS.BY_ID(id));
    return response.data;
  },

  getPatientDetails: async (id: string): Promise<PatientDetailsResponse> => {
    const response = await api.get(API_ENDPOINTS.PATIENTS.DETAILS(id));
    return response.data.data;
  },

  createPatient: async (data: CreatePatientData) => {
    try {
      console.log('Creating patient with data:', data);
      const response = await api.post(API_ENDPOINTS.PATIENTS.BASE, data);
      console.log('Create patient API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  updatePatient: async (id: string, data: Partial<CreatePatientData>) => {
    try {
      console.log(`Updating patient ${id} with data:`, data);
      const response = await api.put(API_ENDPOINTS.PATIENTS.BY_ID(id), data);
      console.log('Update patient API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }
}; 