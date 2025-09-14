import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { 
  FiUsers, 
  FiActivity, 
  FiCalendar,
  FiDollarSign,
  FiUserCheck,
  FiClock,
  FiAlertCircle,
  FiClipboard,
  FiSettings
} from 'react-icons/fi';

interface BranchStats {
  totalStaff: number;
  totalDoctors: number;
  totalReceptionists: number;
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment_created' | 'patient_registered' | 'staff_added' | 'system';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export default function BranchAdminDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  const [stats, setStats] = useState<BranchStats>({
    totalStaff: 0,
    totalDoctors: 0,
    totalReceptionists: 0,
    totalPatients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    activeUsers: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load branch data
  useEffect(() => {
    const loadBranchData = async () => {
      setIsLoading(true);
      
      try {
        // Mock data for now - would be replaced with actual API calls
        setStats({
          totalStaff: 12,
          totalDoctors: 4,
          totalReceptionists: 3,
          totalPatients: 156,
          todayAppointments: 23,
          monthlyRevenue: 45000,
          activeUsers: 8
        });

        setRecentActivity([
          {
            id: '1',
            type: 'appointment_created',
            message: 'New appointment scheduled for 2:30 PM',
            timestamp: '2024-09-14T10:30:00Z',
            severity: 'info'
          },
          {
            id: '2',
            type: 'patient_registered',
            message: 'New patient registered: John Smith',
            timestamp: '2024-09-14T09:15:00Z',
            severity: 'info'
          },
          {
            id: '3',
            type: 'staff_added',
            message: 'New receptionist added to the team',
            timestamp: '2024-09-14T08:45:00Z',
            severity: 'info'
          }
        ]);
      } catch (error) {
        console.error('Failed to load branch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBranchData();
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
          Welcome to your branch dashboard for {user?.branch?.name || 'your branch'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStaff}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Patients</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
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

      {/* Detailed Stats and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Overview</h3>
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
                <span className="text-sm font-medium text-gray-700">Total Patients</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.totalPatients}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/appointments')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiCalendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Manage Appointments</span>
            </button>
            <button
              onClick={() => navigate('/patients')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiUsers className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Manage Patients</span>
            </button>
            <button
              onClick={() => navigate('/staff')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiUserCheck className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Manage Staff</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiSettings className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Branch Settings</span>
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

      {/* Today's Schedule Preview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
        <div className="text-center py-8">
          <FiClipboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Today's appointment schedule will be displayed here</p>
          <button
            onClick={() => navigate('/appointments')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Full Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
