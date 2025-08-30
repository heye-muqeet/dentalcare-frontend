import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import type { AIAnalysisResult } from './aiAnalysis';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface ServiceUsed {
  id: string;
  name: string;
  price: number;
}

export interface TreatmentReport {
  testName: string;
  result: string;
  imageUrl?: string; // Cloudinary image URL
  imagePublicId?: string; // Cloudinary public ID for image management
  aiAnalysis?: AIAnalysisResult;
}

export interface Treatment {
  id: string;
  appointment: string;
  patient: string;
  doctor: string;
  diagnosis: string;
  prescribedMedications: Medication[];
  notes: string;
  servicesUsed: ServiceUsed[];
  reports: TreatmentReport[];
  followUpRecommended: boolean;
  followUpDate?: string;
  followUpTime?: string;
  organization: string;
  location: string;
  invoice: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreatmentData {
  appointment: string;
  patient: string;
  diagnosis: string;
  prescribedMedications: Medication[];
  notes: string;
  servicesUsed: ServiceUsed[];
  reports: TreatmentReport[];
  followUpRecommended: boolean;
  followUpDate?: string;
  followUpTime?: string;
}

export interface UpdateTreatmentData {
  diagnosis?: string;
  prescribedMedications?: Medication[];
  notes?: string;
  servicesUsed?: ServiceUsed[];
  reports?: TreatmentReport[];
  followUpRecommended?: boolean;
  followUpDate?: string;
  followUpTime?: string;
}

export const treatmentService = {
  getTreatments: async (): Promise<Treatment[]> => {
    const response = await api.get(API_ENDPOINTS.TREATMENTS.BASE);
    return response.data.data;
  },

  getTreatment: async (id: string): Promise<Treatment> => {
    const response = await api.get(API_ENDPOINTS.TREATMENTS.BY_ID(id));
    return response.data.data;
  },

  createTreatment: async (treatmentData: CreateTreatmentData): Promise<Treatment> => {
    const response = await api.post(API_ENDPOINTS.TREATMENTS.BASE, treatmentData);
    return response.data.data;
  },

  updateTreatment: async (id: string, treatmentData: UpdateTreatmentData): Promise<Treatment> => {
    const response = await api.put(API_ENDPOINTS.TREATMENTS.BY_ID(id), treatmentData);
    return response.data.data;
  },

  deleteTreatment: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.TREATMENTS.BY_ID(id));
  },
}; 