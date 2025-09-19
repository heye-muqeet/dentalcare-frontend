import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { useState, useEffect } from 'react';
import CompactSuperAdminDashboard from './CompactSuperAdminDashboard';
import CompactOrganizationAdminDashboard from './CompactOrganizationAdminDashboard';
import BranchAdminDashboard from './BranchAdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import { 
  FiCalendar, 
  FiUsers, 
  FiActivity, 
  FiDollarSign, 
  FiTrendingUp, 
  FiClock,
  FiHeart,
  FiShield,
  FiStar,
  FiArrowRight,
  FiPlus,
  FiEye
} from 'react-icons/fi';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  // Show role-specific dashboard based on user role
  if (user?.role === 'super_admin') {
    return <CompactSuperAdminDashboard />;
  }
  
  if (user?.role === 'organization_admin') {
    return <CompactOrganizationAdminDashboard />;
  }
  
  if (user?.role === 'branch_admin') {
    return <BranchAdminDashboard />;
  }
  
  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }
  
  // Dashboard state
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for demonstration
  const stats = {
    todayAppointments: 12,
    totalPatients: 156,
    revenue: 12500,
    completedTreatments: 8,
    successRate: 95,
    appointmentChange: 15,
    patientGrowth: 8
  };

  const quickActions = [
    { 
      title: 'Schedule Appointment', 
      description: 'Book a new appointment', 
      icon: FiPlus, 
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/add-appointment'),
      available: ['organization_admin', 'branch_admin', 'receptionist'].includes(user?.role || '')
    },
    { 
      title: 'View Patients', 
      description: 'Manage patient records', 
      icon: FiUsers, 
      color: 'from-green-500 to-green-600',
      action: () => navigate('/patients'),
      available: ['organization_admin', 'branch_admin', 'doctor', 'receptionist'].includes(user?.role || '')
    },
    { 
      title: 'Today\'s Schedule', 
      description: 'Check appointments', 
      icon: FiEye, 
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/appointments'),
      available: ['organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient'].includes(user?.role || '')
    },
    { 
      title: 'Treatment Records', 
      description: 'View treatment history', 
      icon: FiActivity, 
      color: 'from-pink-500 to-pink-600',
      action: () => navigate('/appointments'),
      available: ['organization_admin', 'branch_admin', 'doctor'].includes(user?.role || '')
    },
    { 
      title: 'Manage Services', 
      description: 'Add or edit services', 
      icon: FiActivity, 
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/services'),
      available: ['organization_admin', 'branch_admin', 'receptionist'].includes(user?.role || '')
    },
    { 
      title: 'View Invoices', 
      description: 'Billing and payments', 
      icon: FiDollarSign, 
      color: 'from-emerald-500 to-emerald-600',
      action: () => navigate('/invoice'),
      available: ['organization_admin', 'branch_admin', 'receptionist'].includes(user?.role || '')
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleMessage = () => {
    switch (user?.role) {
      case 'super_admin':
        return "Welcome back to your dental clinic dashboard. You have full administrative access.";
      case 'organization_admin':
        return "Manage your organization's dental clinics and operations.";
      case 'branch_admin':
        return "Oversee your branch operations and staff management.";
      case 'doctor':
        return "Your patients are waiting. Let's make their smiles brighter!";
      case 'receptionist':
        return "Ready to manage appointments and assist patients today.";
      case 'patient':
        return "Welcome to your patient portal. Manage your appointments and health records.";
      default:
        return "Welcome to MI Dental Clinic dashboard.";
    }
  };

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
                      {getGreeting()}, {user?.firstName || user?.name || 'User'}! 👋
                    </h1>
                    <p className="text-lg text-slate-600 mb-4">
                      {getRoleMessage()}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full border border-blue-200/50">
                        <FiShield className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-700 capitalize">{user?.role || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-full border border-green-200/50">
                        <FiClock className="text-green-600" />
                        <span className="text-sm font-medium text-green-700">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                      <span className="text-4xl text-white">🦷</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiCalendar className="text-white text-xl" />
                </div>
                <div className="text-right">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-slate-800">{stats.todayAppointments}</p>
                  )}
                  <p className="text-sm text-slate-500">Today</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Appointments</h3>
              <p className="text-sm text-slate-500">Scheduled for today</p>
              {!isLoading && stats.appointmentChange !== 0 && (
                <div className={`mt-3 flex items-center text-sm ${stats.appointmentChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <FiTrendingUp className="mr-1" />
                  <span>{stats.appointmentChange > 0 ? '+' : ''}{stats.appointmentChange}% from yesterday</span>
                </div>
              )}
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
                    <p className="text-2xl font-bold text-slate-800">{stats.totalPatients}</p>
                  )}
                  <p className="text-sm text-slate-500">Total</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Patients</h3>
              <p className="text-sm text-slate-500">Registered patients</p>
              {!isLoading && stats.patientGrowth !== 0 && (
                <div className={`mt-3 flex items-center text-sm ${stats.patientGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <FiTrendingUp className="mr-1" />
                  <span>+{stats.patientGrowth}% this month</span>
                </div>
              )}
            </div>

            {['super_admin', 'organization_admin', 'branch_admin', 'receptionist'].includes(user?.role || '') && (
              <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiDollarSign className="text-white text-xl" />
                  </div>
                  <div className="text-right">
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-20 bg-gray-300 rounded"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-slate-800">${stats.revenue.toLocaleString()}</p>
                    )}
                    <p className="text-sm text-slate-500">This Month</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Revenue</h3>
                <p className="text-sm text-slate-500">Monthly earnings</p>
              </div>
            )}

            <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiHeart className="text-white text-xl" />
                </div>
                <div className="text-right">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-slate-800">{stats.completedTreatments}</p>
                  )}
                  <p className="text-sm text-slate-500">This Month</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Treatments</h3>
              <p className="text-sm text-slate-500">Completed successfully</p>
              {!isLoading && stats.successRate > 0 && (
                <div className="mt-3 flex items-center text-green-600 text-sm">
                  <FiStar className="mr-1" />
                  <span>{stats.successRate}% success rate</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - Now Full Width */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <FiActivity className="mr-3 text-blue-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.filter(action => action.available).map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="group bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="text-white text-xl" />
                    </div>
                    <FiArrowRight className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{action.title}</h3>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
