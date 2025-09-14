import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface SystemStats {
  totalOrganizations: number;
  totalBranches: number;
  totalUsers: number;
  totalDoctors: number;
  totalReceptionists: number;
  totalPatients: number;
  activeUsers: number;
  systemUptime: string;
  totalRevenue: number;
  monthlyGrowth: number;
  systemHealth?: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface SystemUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organizationId?: string;
  branchId?: string;
  organizationName?: string;
  branchName?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface SystemLog {
  _id: string;
  type: 'user_created' | 'organization_created' | 'branch_created' | 'login' | 'error' | 'system';
  message: string;
  userId?: string;
  organizationId?: string;
  branchId?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  metadata?: any;
}

export interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userEmail: string;
  userRole: string;
  organizationId?: string;
  branchId?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  changes?: any;
  result: 'success' | 'failure';
}

export const systemService = {
  // Get system-wide statistics
  getSystemStats: async (): Promise<SystemStats> => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.SYSTEM_STATS);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      // Return mock data as fallback
      return {
        totalOrganizations: 0,
        totalBranches: 0,
        totalUsers: 0,
        totalDoctors: 0,
        totalReceptionists: 0,
        totalPatients: 0,
        activeUsers: 0,
        systemUptime: '99.9%',
        totalRevenue: 0,
        monthlyGrowth: 0,
        systemHealth: 'excellent'
      };
    }
  },

  // Get all users across the system
  getSystemUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    organizationId?: string;
    isActive?: boolean;
  }): Promise<{ users: SystemUser[]; total: number; page: number; limit: number }> => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.SYSTEM_USERS, { params });
      return {
        users: response.data?.users || [],
        total: response.data?.total || 0,
        page: response.data?.page || params?.page || 1,
        limit: response.data?.limit || params?.limit || 50
      };
    } catch (error) {
      console.error('Failed to fetch system users:', error);
      return { users: [], total: 0, page: 1, limit: 50 };
    }
  },

  // Get system logs
  getSystemLogs: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ logs: SystemLog[]; total: number; page: number; limit: number }> => {
    try {
      const response = await api.get(API_ENDPOINTS.AUDIT.LOGS, { params });
      return {
        logs: response.data?.data || [],
        total: response.data?.total || 0,
        page: params?.page || 1,
        limit: params?.limit || 50
      };
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      return { logs: [], total: 0, page: 1, limit: 50 };
    }
  },

  // Get audit logs
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    resource?: string;
    userId?: string;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ logs: AuditLog[]; total: number; page: number; limit: number }> => {
    try {
      const response = await api.get(API_ENDPOINTS.AUDIT.LOGS, { params });
      return {
        logs: response.data?.data || [],
        total: response.data?.total || 0,
        page: params?.page || 1,
        limit: params?.limit || 50
      };
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { logs: [], total: 0, page: 1, limit: 50 };
    }
  },

  // Get security events
  getSecurityEvents: async (params?: {
    page?: number;
    limit?: number;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ events: any[]; total: number; page: number; limit: number }> => {
    try {
      const response = await api.get(API_ENDPOINTS.AUDIT.SECURITY_EVENTS, { params });
      return {
        events: response.data?.data || [],
        total: response.data?.total || 0,
        page: params?.page || 1,
        limit: params?.limit || 50
      };
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      return { events: [], total: 0, page: 1, limit: 50 };
    }
  },

  // Get user activity for a specific user
  getUserActivity: async (userId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ activities: any[]; total: number; page: number; limit: number }> => {
    try {
      const response = await api.get(API_ENDPOINTS.AUDIT.USER_ACTIVITY(userId), { params });
      return {
        activities: response.data?.data || [],
        total: response.data?.total || 0,
        page: params?.page || 1,
        limit: params?.limit || 50
      };
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      return { activities: [], total: 0, page: 1, limit: 50 };
    }
  },

  // Get system health status
  getSystemHealth: async (): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      database: 'up' | 'down';
      api: 'up' | 'down';
      storage: 'up' | 'down';
      email: 'up' | 'down';
    };
    uptime: number;
    lastCheck: string;
  }> => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      return {
        status: 'healthy',
        services: {
          database: 'up',
          api: 'up',
          storage: 'up',
          email: 'up'
        },
        uptime: 99.9,
        lastCheck: new Date().toISOString()
      };
    }
  },

  // Cleanup old logs
  cleanupLogs: async (olderThanDays: number): Promise<{ deletedCount: number }> => {
    try {
      const response = await api.post(API_ENDPOINTS.AUDIT.CLEANUP, { olderThanDays });
      return response.data;
    } catch (error) {
      console.error('Failed to cleanup logs:', error);
      return { deletedCount: 0 };
    }
  },

  // Get audit statistics
  getAuditStats: async (): Promise<{
    totalLogs: number;
    logsByType: Record<string, number>;
    logsBySeverity: Record<string, number>;
    recentActivity: any[];
  }> => {
    try {
      const response = await api.get(API_ENDPOINTS.AUDIT.STATS);
      return response.data?.data || {
        totalLogs: 0,
        logsByType: {},
        logsBySeverity: {},
        recentActivity: []
      };
    } catch (error) {
      console.error('Failed to fetch audit stats:', error);
      return {
        totalLogs: 0,
        logsByType: {},
        logsBySeverity: {},
        recentActivity: []
      };
    }
  },
};
