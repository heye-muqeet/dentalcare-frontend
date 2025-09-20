import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface TopbarStats {
  // System-wide stats (for super admin)
  totalOrganizations?: number;
  totalUsers?: number;
  systemUptime?: string;
  
  // Organization stats (for organization admin)
  totalBranches?: number;
  monthlyRevenue?: number;
  
  // Branch stats (for branch admin)
  totalStaff?: number;
  totalPatients?: number;
  todayAppointments?: number;
  totalDoctors?: number;
  totalReceptionists?: number;
  
  // Doctor stats
  completedAppointments?: number;
  averageRating?: number;
  
  // Receptionist stats
  appointments?: number;
  newPatients?: number;
  waitingPatients?: number;
  
  // Patient stats
  upcomingAppointments?: number;
  appointmentHistory?: number;
}

export interface TopbarData {
  user: {
    firstName: string;
    lastName: string;
    role: string;
    organization?: {
      name: string;
    };
    branch?: {
      name: string;
    };
  };
  stats: TopbarStats;
  systemHealth?: 'excellent' | 'good' | 'warning' | 'critical';
}

export const topbarService = {
  // Get topbar data based on user role
  getTopbarData: async (): Promise<TopbarData> => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.STATS);
      const stats = response.data;
      
      // Get user data from auth context (this would be passed from the component)
      // For now, we'll return the stats and let the component handle user data
      return {
        user: {
          firstName: '',
          lastName: '',
          role: '',
        },
        stats: stats
      };
    } catch (error) {
      console.error('Failed to fetch topbar data:', error);
      throw error;
    }
  },

  // Get system-wide stats (super admin)
  getSystemStats: async (): Promise<TopbarStats> => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.SYSTEM_STATS);
      return {
        totalOrganizations: response.data.totalOrganizations,
        totalUsers: response.data.totalUsers,
        systemUptime: response.data.systemUptime || '99.9%'
      };
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      return {
        totalOrganizations: 0,
        totalUsers: 0,
        systemUptime: '99.9%'
      };
    }
  },

  // Get organization stats (organization admin)
  getOrganizationStats: async (organizationId: string): Promise<TopbarStats> => {
    try {
      console.log('Topbar service - calling organization stats with ID:', organizationId);
      const response = await api.get(API_ENDPOINTS.ORGANIZATIONS.STATS(organizationId));
      console.log('Topbar service - organization stats response:', response.data);
      
      // Handle both direct data and wrapped response formats
      const data = response.data?.data || response.data;
      
      return {
        totalBranches: data.totalBranches || 0,
        totalUsers: data.totalUsers || 0,
        monthlyRevenue: data.monthlyRevenue || 0
      };
    } catch (error) {
      console.error('Failed to fetch organization stats:', error);
      return {
        totalBranches: 0,
        totalUsers: 0,
        monthlyRevenue: 0
      };
    }
  },

  // Get branch stats (branch admin)
  getBranchStats: async (_branchId: string): Promise<TopbarStats> => {
    try {
      // This would need to be implemented in the backend
      // For now, return mock data
      return {
        totalStaff: 12,
        totalPatients: 156,
        todayAppointments: 23
      };
    } catch (error) {
      console.error('Failed to fetch branch stats:', error);
      return {
        totalStaff: 0,
        totalPatients: 0,
        todayAppointments: 0
      };
    }
  },

  // Get doctor stats
  getDoctorStats: async (_doctorId: string): Promise<TopbarStats> => {
    try {
      // This would need to be implemented in the backend
      // For now, return mock data
      return {
        todayAppointments: 8,
        completedAppointments: 5,
        averageRating: 4.8
      };
    } catch (error) {
      console.error('Failed to fetch doctor stats:', error);
      return {
        todayAppointments: 0,
        completedAppointments: 0,
        averageRating: 0
      };
    }
  },

  // Get receptionist stats
  getReceptionistStats: async (_receptionistId: string): Promise<TopbarStats> => {
    try {
      // This would need to be implemented in the backend
      // For now, return mock data
      return {
        appointments: 15,
        newPatients: 3,
        waitingPatients: 2
      };
    } catch (error) {
      console.error('Failed to fetch receptionist stats:', error);
      return {
        appointments: 0,
        newPatients: 0,
        waitingPatients: 0
      };
    }
  },

  // Get patient stats
  getPatientStats: async (_patientId: string): Promise<TopbarStats> => {
    try {
      // This would need to be implemented in the backend
      // For now, return mock data
      return {
        appointments: 2,
        upcomingAppointments: 1,
        appointmentHistory: 5
      };
    } catch (error) {
      console.error('Failed to fetch patient stats:', error);
      return {
        appointments: 0,
        upcomingAppointments: 0,
        appointmentHistory: 0
      };
    }
  }
};
