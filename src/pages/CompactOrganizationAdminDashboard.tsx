import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { organizationService } from '../lib/api/services/organizations';
import { 
  FiUsers, 
  FiHome, 
  FiActivity, 
  FiShield,
  FiTrendingUp,
  FiCalendar,
  FiDollarSign,
  FiUserCheck,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';

interface OrganizationStats {
  totalBranches: number;
  totalUsers: number;
  totalDoctors: number;
  totalReceptionists: number;
  totalPatients: number;
  monthlyRevenue: number;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'user_created' | 'branch_created' | 'appointment_created' | 'system';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export default function CompactOrganizationAdminDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  const [stats, setStats] = useState<OrganizationStats>({
    totalBranches: 0,
    totalUsers: 0,
    totalDoctors: 0,
    totalReceptionists: 0,
    totalPatients: 0,
    monthlyRevenue: 0,
    activeUsers: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load organization data from API
  useEffect(() => {
    const loadOrganizationData = async () => {
      setIsLoading(true);
      
      try {
        if (user?.organizationId) {
          console.log('User object:', user);
          console.log('Organization ID:', user.organizationId);
          console.log('Organization ID type:', typeof user.organizationId);
          
          // Ensure organizationId is a string
          const organizationId = typeof user.organizationId === 'string' 
            ? user.organizationId 
            : (user.organizationId as any)?._id || (user.organizationId as any)?.id || String(user.organizationId);
            
          console.log('Processed Organization ID:', organizationId);
          
          // Load organization statistics
          const orgStats = await organizationService.getOrganizationStats(organizationId);
          setStats(orgStats);

          // Mock recent activity for now
          setRecentActivity([
            {
              id: '1',
              type: 'user_created',
              message: 'New doctor registered: Dr. Sarah Johnson',
              timestamp: '2024-09-14T10:30:00Z',
              severity: 'info'
            },
            {
              id: '2',
              type: 'branch_created',
              message: 'New branch created: Downtown Location',
              timestamp: '2024-09-14T09:15:00Z',
              severity: 'info'
            },
            {
              id: '3',
              type: 'appointment_created',
              message: 'High appointment volume today: 45 appointments',
              timestamp: '2024-09-14T08:45:00Z',
              severity: 'warning'
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to load organization data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizationData();
  }, [user?.organizationId]);

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
          <p className="text-sm text-gray-600">{user?.organization?.name || 'Organization'} Dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
          <p className="text-xs text-green-600">● Organization Active</p>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiHome className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-500">Branches</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.totalBranches}</p>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiUsers className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500">Users</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.totalUsers}</p>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiUserCheck className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.activeUsers}</p>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiDollarSign className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-gray-500">Revenue</span>
          </div>
          <p className="text-lg font-bold text-gray-900">${(stats.monthlyRevenue / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Staff Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Staff Overview</h3>
          </div>
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-100 rounded">
                  <FiUserCheck className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Doctors</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.totalDoctors}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-green-100 rounded">
                  <FiUsers className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Receptionists</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.totalReceptionists}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-purple-100 rounded">
                  <FiUsers className="w-3 h-3 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">Patients</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.totalPatients}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-3 space-y-2">
            <button
              onClick={() => navigate('/branches')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
            >
              <FiHome className="w-4 h-4 text-blue-600" />
              <span>Manage Branches</span>
            </button>
            <button
              onClick={() => navigate('/users')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
            >
              <FiUsers className="w-4 h-4 text-green-600" />
              <span>Manage Users</span>
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
            >
              <FiCalendar className="w-4 h-4 text-purple-600" />
              <span>View Appointments</span>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
            >
              <FiActivity className="w-4 h-4 text-orange-600" />
              <span>Reports</span>
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Monthly Growth</p>
              <p className="text-sm font-bold text-green-600">+12.5%</p>
            </div>
            <FiTrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Active Branches</p>
              <p className="text-sm font-bold text-blue-600">{stats.totalBranches}</p>
            </div>
            <FiHome className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">User Satisfaction</p>
              <p className="text-sm font-bold text-purple-600">4.8/5</p>
            </div>
            <FiShield className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
