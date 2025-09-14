import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { 
  FiUsers, 
  FiHome, 
  FiActivity, 
  FiShield,
  FiSettings,
  FiBarChart,
  FiDatabase,
  FiGlobe,
  FiUserCheck,
  FiAlertTriangle,
  FiClock,
  FiDollarSign,
  FiArrowRight
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
  type: 'user_created' | 'organization_created' | 'branch_created' | 'login' | 'error';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  // State for system data
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
    monthlyGrowth: 0
  });
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    const loadSystemData = async () => {
      setIsLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        setSystemStats({
          totalOrganizations: 12,
          totalBranches: 45,
          totalUsers: 1247,
          totalDoctors: 156,
          totalReceptionists: 89,
          totalPatients: 1002,
          activeUsers: 1189,
          systemUptime: '99.9%',
          totalRevenue: 2450000,
          monthlyGrowth: 12.5
        });

        setOrganizations([
          {
            _id: '1',
            name: 'Dental Care Center',
            description: 'Premium dental care services',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            phone: '1234567890',
            email: 'info@dentalcare.com',
            website: 'https://dentalcare.com',
            isActive: true,
            createdAt: '2024-01-15',
            branchCount: 5,
            userCount: 234
          },
          {
            _id: '2',
            name: 'Smile Bright Clinic',
            description: 'Family dental practice',
            address: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            phone: '9876543210',
            email: 'contact@smilebright.com',
            website: 'https://smilebright.com',
            isActive: true,
            createdAt: '2024-02-20',
            branchCount: 3,
            userCount: 156
          }
        ]);

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
            type: 'organization_created',
            message: 'New organization created: Bright Smiles Clinic',
            timestamp: '2024-09-14T09:15:00Z',
            severity: 'info'
          },
          {
            id: '3',
            type: 'error',
            message: 'API rate limit exceeded for organization: Dental Care Center',
            timestamp: '2024-09-14T08:45:00Z',
            severity: 'warning'
          }
        ]);

        setIsLoading(false);
      }, 1500);
    };

    loadSystemData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    { 
      title: 'Manage Organizations', 
      description: 'View and manage all organizations', 
      icon: FiHome, 
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/organizations'),
      count: systemStats.totalOrganizations
    },
    { 
      title: 'System Users', 
      description: 'Manage all users across the system', 
      icon: FiUsers, 
      color: 'from-green-500 to-green-600',
      action: () => navigate('/system-users'),
      count: systemStats.totalUsers
    },
    { 
      title: 'System Logs', 
      description: 'View system audit logs and activities', 
      icon: FiDatabase, 
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/system-logs'),
      count: recentActivity.length
    },
    { 
      title: 'Analytics', 
      description: 'System-wide analytics and reports', 
      icon: FiBarChart, 
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/analytics'),
      count: systemStats.monthlyGrowth
    },
    { 
      title: 'System Settings', 
      description: 'Configure system-wide settings', 
      icon: FiSettings, 
      color: 'from-gray-500 to-gray-600',
      action: () => navigate('/system-settings'),
      count: null
    },
    { 
      title: 'Security Monitor', 
      description: 'Monitor system security and threats', 
      icon: FiShield, 
      color: 'from-red-500 to-red-600',
      action: () => navigate('/security'),
      count: null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-blue-600/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                      {getGreeting()}, {user?.firstName || 'Super Admin'}! 👋
                    </h1>
                    <p className="text-lg text-slate-600 mb-4">
                      Welcome to the system-wide control center. Monitor and manage all organizations, 
                      branches, and users across the entire dental care ecosystem.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-pink-600/10 rounded-full border border-red-200/50">
                        <FiShield className="text-red-600" />
                        <span className="text-sm font-medium text-red-700">Super Admin</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-full border border-green-200/50">
                        <FiClock className="text-green-600" />
                        <span className="text-sm font-medium text-green-700">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full border border-blue-200/50">
                        <FiGlobe className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">System Overview</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                      <span className="text-4xl text-white">👑</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiHome className="text-white text-xl" />
                </div>
                <div className="text-right">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-slate-800">{systemStats.totalOrganizations}</p>
                  )}
                  <p className="text-sm text-slate-500">Organizations</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Total Organizations</h3>
              <p className="text-sm text-slate-500">Active dental organizations</p>
            </div>

            <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiUsers className="text-white text-xl" />
                </div>
                <div className="text-right">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-slate-800">{systemStats.totalUsers}</p>
                  )}
                  <p className="text-sm text-slate-500">Total Users</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">System Users</h3>
              <p className="text-sm text-slate-500">All users across organizations</p>
            </div>

            <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiActivity className="text-white text-xl" />
                </div>
                <div className="text-right">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-slate-800">{systemStats.totalBranches}</p>
                  )}
                  <p className="text-sm text-slate-500">Branches</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Total Branches</h3>
              <p className="text-sm text-slate-500">Across all organizations</p>
            </div>

            <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiDollarSign className="text-white text-xl" />
                </div>
                <div className="text-right">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-20 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-slate-800">${(systemStats.totalRevenue / 1000000).toFixed(1)}M</p>
                  )}
                  <p className="text-sm text-slate-500">System Revenue</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Total Revenue</h3>
              <p className="text-sm text-slate-500">Across all organizations</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <FiSettings className="mr-3 text-blue-600" />
              System Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="group bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="text-white text-xl" />
                    </div>
                    <div className="flex items-center gap-2">
                      {action.count !== null && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {action.count}
                        </span>
                      )}
                      <FiArrowRight className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{action.title}</h3>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Organizations & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Organizations */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <FiHome className="mr-3 text-blue-600" />
                  Recent Organizations
                </h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {organizations.slice(0, 3).map((org) => (
                  <div key={org._id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-white/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <FiHome className="text-white text-sm" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{org.name}</h3>
                        <p className="text-sm text-slate-600">{org.city}, {org.state}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-800">{org.branchCount} branches</p>
                      <p className="text-xs text-slate-500">{org.userCount} users</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Activity */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <FiActivity className="mr-3 text-green-600" />
                  System Activity
                </h2>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View Logs
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-4 bg-white/50 rounded-lg border border-white/30">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.severity === 'error' ? 'bg-red-100' : 
                      activity.severity === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      {activity.severity === 'error' ? (
                        <FiAlertTriangle className="text-red-600 text-sm" />
                      ) : activity.severity === 'warning' ? (
                        <FiAlertTriangle className="text-yellow-600 text-sm" />
                      ) : (
                        <FiUserCheck className="text-green-600 text-sm" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">{activity.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
