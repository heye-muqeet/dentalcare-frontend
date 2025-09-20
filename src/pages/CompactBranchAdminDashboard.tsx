import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { branchService } from '../lib/api/services/branches';
import { 
  FiUsers, 
  FiActivity, 
  FiCalendar,
  FiDollarSign,
  FiUserCheck,
  FiClock,
  FiAlertCircle,
  FiClipboard,
  FiSettings,
  FiHome,
  FiTrendingUp
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

export default function CompactBranchAdminDashboard() {
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
  
  const [branchData, setBranchData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  // Load branch data from backend
  useEffect(() => {
    const loadBranchData = async () => {
      setIsLoading(true);
      
      try {
        if (branchId) {
          console.log('CompactBranchAdminDashboard - Loading branch data:', { branchId });
          
          const branchResponse = await branchService.getBranchById(branchId);
          
          if (branchResponse.success) {
            console.log('CompactBranchAdminDashboard - Branch data loaded:', branchResponse.data);
            setBranchData(branchResponse.data);
            
            // Set stats from branch data
            setStats({
              totalStaff: (branchResponse.data.totalDoctors || 0) + (branchResponse.data.totalReceptionists || 0),
              totalDoctors: branchResponse.data.totalDoctors || 0,
              totalReceptionists: branchResponse.data.totalReceptionists || 0,
              totalPatients: branchResponse.data.totalPatients || 0,
              todayAppointments: 0, // This would come from appointments API
              monthlyRevenue: 0, // This would come from revenue API
              activeUsers: branchResponse.data.totalStaff || 0
            });
          }
        }

        // Mock recent activity for now
        setRecentActivity([
          {
            id: '1',
            type: 'appointment_created',
            message: 'New appointment scheduled for 2:30 PM',
            timestamp: new Date().toISOString(),
            severity: 'info'
          },
          {
            id: '2',
            type: 'patient_registered',
            message: 'New patient registered: John Smith',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            severity: 'info'
          },
          {
            id: '3',
            type: 'staff_added',
            message: 'New receptionist added to the team',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
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
  }, [branchId]);

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

  const branchName = branchData?.name || user?.branch?.name || 'Branch';
  const organizationName = branchData?.organizationId?.name || user?.organization?.name || 'Organization';

  return (
    <div className="p-4 space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{getGreeting()}, {user?.firstName}!</h1>
          <p className="text-sm text-gray-600">{branchName} • {organizationName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
          <p className="text-xs text-green-600">● Branch Active</p>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiUserCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-500">Doctors</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.totalDoctors}</p>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiUsers className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500">Reception</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.totalReceptionists}</p>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiUsers className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-500">Patients</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.totalPatients}</p>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiCalendar className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-gray-500">Today</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.todayAppointments}</p>
        </div>
      </div>

      {/* Compact Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <FiSettings className="w-4 h-4 mr-2 text-gray-600" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/appointments')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-sm"
            >
              <FiCalendar className="w-4 h-4 text-blue-600" />
              <span>Appointments</span>
            </button>
            <button
              onClick={() => navigate('/patients')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-sm"
            >
              <FiUsers className="w-4 h-4 text-green-600" />
              <span>Patients</span>
            </button>
            <button
              onClick={() => navigate('/staff')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-sm"
            >
              <FiUserCheck className="w-4 h-4 text-purple-600" />
              <span>Staff</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <FiActivity className="w-4 h-4 mr-2 text-gray-600" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentActivity.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-2">
                <div className={`p-1 rounded-full ${getSeverityColor(activity.severity)}`}>
                  {getSeverityIcon(activity.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 leading-tight">{activity.message}</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <FiClock className="w-3 h-3 mr-1" />
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Overview */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <FiHome className="w-4 h-4 mr-2 text-gray-600" />
            Branch Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUserCheck className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-xs text-gray-700">Doctors</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.totalDoctors}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-xs text-gray-700">Reception</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.totalReceptionists}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-3 h-3 text-purple-600" />
                </div>
                <span className="text-xs text-gray-700">Patients</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.totalPatients}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <FiCalendar className="w-4 h-4 mr-2 text-blue-600" />
            Today's Schedule
          </h3>
          <div className="text-center py-6">
            <FiClipboard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-3">No appointments scheduled</p>
            <button
              onClick={() => navigate('/appointments')}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
            >
              Manage Schedule
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <FiTrendingUp className="w-4 h-4 mr-2 text-green-600" />
            Branch Performance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Staff Efficiency</span>
              <div className="flex items-center space-x-1">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-12 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-xs text-green-600 font-medium">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Patient Satisfaction</span>
              <div className="flex items-center space-x-1">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-14 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-xs text-blue-600 font-medium">92%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Revenue Target</span>
              <div className="flex items-center space-x-1">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-10 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-xs text-yellow-600 font-medium">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
