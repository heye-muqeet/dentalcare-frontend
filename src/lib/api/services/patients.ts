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
    const response = await api.get(API_ENDPOINTS.PATIENTS.BASE);
    return response.data;
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
    const response = await api.post(API_ENDPOINTS.PATIENTS.BASE, data);
    return response.data;
  },

  updatePatient: async (id: string, data: Partial<CreatePatientData>) => {
    const response = await api.put(API_ENDPOINTS.PATIENTS.BY_ID(id), data);
    return response.data;
  }
}; 