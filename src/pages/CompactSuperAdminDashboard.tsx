import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { systemService } from '../lib/api/services/system';
import { organizationService } from '../lib/api/services/organizations';
import { 
  FiUsers, 
  FiHome, 
  FiActivity, 
  FiShield,
  FiDollarSign,
  FiUserCheck,
  FiClock,
  FiAlertCircle,
  FiEye,
  FiEdit
} from 'react-icons/fi';

interface SystemStats {
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

interface Organization {
  _id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
  createdAt: string;
  branchCount: number;
  userCount: number;
}

interface RecentActivity {
  id: string;
  type: 'user_created' | 'organization_created' | 'branch_created' | 'login' | 'error' | 'system';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export default function CompactSuperAdminDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  const [systemStats, setSystemStats] = useState<SystemStats>({
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
  });
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load system data from API
  useEffect(() => {
    const loadSystemData = async () => {
      setIsLoading(true);
      
      try {
        // Load system statistics
        const stats = await systemService.getSystemStats();
        setSystemStats(stats);

        // Load organizations
        const orgs = await organizationService.getOrganizations();
        setOrganizations(orgs);

        // Load recent activity (system logs)
        const activityData = await systemService.getSystemLogs({ limit: 5 });
        const activities = activityData.logs.map((log: any) => ({
          id: log._id,
          type: log.activityType || 'system',
          message: log.message || log.description,
          timestamp: log.timestamp || log.createdAt,
          severity: (log.level === 'ERROR' ? 'error' : 
                   log.level === 'WARNING' ? 'warning' : 'info') as 'info' | 'warning' | 'error' | 'critical'
        }));
        setRecentActivity(activities);

      } catch (error) {
        console.error('Failed to load system data:', error);
        
        // Fallback to mock data if API fails
        setSystemStats({
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
        });

        setOrganizations([]);
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSystemData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return 'text-red-500 bg-red-50';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50';
      case 'info':
      default:
        return 'text-blue-500 bg-blue-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return <FiAlertCircle className="w-3 h-3" />;
      case 'warning':
        return <FiAlertCircle className="w-3 h-3" />;
      case 'info':
      default:
        return <FiActivity className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{getGreeting()}, {user?.firstName}!</h1>
          <p className="text-sm text-gray-600">System Administration Dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
          <p className="text-xs text-green-600">● System Operational</p>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiHome className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-500">Organizations</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{systemStats.totalOrganizations}</p>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiUsers className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500">Total Users</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{systemStats.totalUsers.toLocaleString()}</p>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiUserCheck className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-500">Active Users</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{systemStats.activeUsers.toLocaleString()}</p>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiDollarSign className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-gray-500">Revenue</span>
          </div>
          <p className="text-lg font-bold text-gray-900">${(systemStats.totalRevenue / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* System Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">System Overview</h3>
          </div>
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-100 rounded">
                  <FiHome className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Branches</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{systemStats.totalBranches}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-green-100 rounded">
                  <FiUserCheck className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Doctors</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{systemStats.totalDoctors}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-purple-100 rounded">
                  <FiUsers className="w-3 h-3 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">Patients</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{systemStats.totalPatients.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-yellow-100 rounded">
                  <FiShield className="w-3 h-3 text-yellow-600" />
                </div>
                <span className="text-sm text-gray-700">Uptime</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{systemStats.systemUptime}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">System Management</h3>
          </div>
          <div className="p-3 space-y-2">
            <button
              onClick={() => navigate('/organizations')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
            >
              <FiHome className="w-4 h-4 text-blue-600" />
              <span>Manage Organizations</span>
            </button>
            <button
              onClick={() => navigate('/system-users')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
            >
              <FiUsers className="w-4 h-4 text-green-600" />
              <span>System Users</span>
            </button>
            <button
              onClick={() => navigate('/system-logs')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
            >
              <FiActivity className="w-4 h-4 text-purple-600" />
              <span>System Logs</span>
            </button>
            <button
              onClick={() => navigate('/system-health')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
            >
              <FiShield className="w-4 h-4 text-red-600" />
              <span>System Health</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-3 space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-2">
                <div className={`p-1 rounded-full ${getSeverityColor(activity.severity)}`}>
                  {getSeverityIcon(activity.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <FiClock className="w-3 h-3 mr-1" />
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Organizations</h3>
          <button
            onClick={() => navigate('/organizations')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branches</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizations.slice(0, 5).map((org) => (
                <tr key={org._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      <div className="text-xs text-gray-500">{org.city}, {org.state}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{org.branchCount}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{org.userCount}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      org.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {org.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FiEye className="w-3 h-3" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <FiEdit className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">System Health</p>
              <p className="text-sm font-bold text-green-600 capitalize">{systemStats.systemHealth}</p>
            </div>
            <FiShield className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Active Organizations</p>
              <p className="text-sm font-bold text-blue-600">{systemStats.totalOrganizations}</p>
            </div>
            <FiHome className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Branches</p>
              <p className="text-sm font-bold text-purple-600">{systemStats.totalBranches}</p>
            </div>
            <FiHome className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">System Uptime</p>
              <p className="text-sm font-bold text-green-600">{systemStats.systemUptime}</p>
            </div>
            <FiActivity className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
