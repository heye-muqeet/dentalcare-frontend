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
  FiUserX,
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

export default function OrganizationAdminDashboard() {
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
          // Load organization statistics
          const orgStats = await organizationService.getOrganizationStats(user.organizationId);
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
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'warning':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'info':
      default:
        return <FiActivity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Welcome to your organization dashboard for {user?.organization?.name || 'your organization'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Branches</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBranches}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiHome className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiUserCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiDollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiUserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Doctors</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.totalDoctors}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiUsers className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Receptionists</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.totalReceptionists}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiUsers className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Patients</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.totalPatients}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/branches')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiHome className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Manage Branches</span>
            </button>
            <button
              onClick={() => navigate('/users')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiUsers className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Manage Users</span>
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiCalendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">View Appointments</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${getSeverityColor(activity.severity)}`}>
                  {getSeverityIcon(activity.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <FiClock className="w-3 h-3 mr-1" />
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
