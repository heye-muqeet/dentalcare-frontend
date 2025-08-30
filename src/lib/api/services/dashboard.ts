import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface DashboardData {
  role: string;
  todayAppointments: number;
  totalPatients: number;
  monthlyTreatments: number;
  totalTreatments: number;
  successfulTreatments: number;
  successRate: number;
  appointmentChange: number;
  patientGrowth: number;
  revenue: number;
}

export interface DashboardResponse {
  status: string;
  data: DashboardData;
}

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardResponse>(API_ENDPOINTS.DASHBOARD.BASE);
    return response.data.data;
  }
}; 