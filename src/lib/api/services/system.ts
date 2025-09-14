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
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
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
    const response = await api.get(`${API_ENDPOINTS.DASHBOARD.BASE}/system-stats`);
    return response.data;
  },

  // Get all users across the system
  getSystemUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    organizationId?: string;
    isActive?: boolean;
  }): Promise<{ users: SystemUser[]; total: number; page: number; limit: number }> => {
    const response = await api.get(`${API_ENDPOINTS.USERS.BASE}/system`, { params });
    return response.data;
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
    const response = await api.get(API_ENDPOINTS.AUDIT.LOGS, { params });
    return response.data;
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
    const response = await api.get(API_ENDPOINTS.AUDIT.LOGS, { params });
    return response.data;
  },

  // Get security events
  getSecurityEvents: async (params?: {
    page?: number;
    limit?: number;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ events: any[]; total: number; page: number; limit: number }> => {
    const response = await api.get(API_ENDPOINTS.AUDIT.SECURITY_EVENTS, { params });
    return response.data;
  },

  // Get user activity for a specific user
  getUserActivity: async (userId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ activities: any[]; total: number; page: number; limit: number }> => {
    const response = await api.get(API_ENDPOINTS.AUDIT.USER_ACTIVITY(userId), { params });
    return response.data;
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
    const response = await api.get(`${API_ENDPOINTS.DASHBOARD.BASE}/health`);
    return response.data;
  },

  // Cleanup old logs
  cleanupLogs: async (olderThanDays: number): Promise<{ deletedCount: number }> => {
    const response = await api.post(API_ENDPOINTS.AUDIT.CLEANUP, { olderThanDays });
    return response.data;
  },

  // Get audit statistics
  getAuditStats: async (): Promise<{
    totalLogs: number;
    logsByType: Record<string, number>;
    logsBySeverity: Record<string, number>;
    recentActivity: any[];
  }> => {
    const response = await api.get(API_ENDPOINTS.AUDIT.STATS);
    return response.data;
  },
};
