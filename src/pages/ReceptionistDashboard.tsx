import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { refreshReceptionistData } from '../lib/store/slices/receptionistDataSlice';
import { 
  showErrorToast, 
  showSuccessToast, 
  showWarningToast,
  handleApiError 
} from '../lib/utils/errorHandler';
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
  FiTrendingUp,
  FiPlus,
  FiEye,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiUserPlus,
  FiPhone,
  FiMail,
  FiMapPin
} from 'react-icons/fi';

interface ReceptionistStats {
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  totalDoctors: number;
  activeDoctors: number;
  walkInAppointments: number;
  scheduledAppointments: number;
}

interface UpcomingAppointment {
  _id: string;
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  visitType: 'walk_in' | 'scheduled';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reasonForVisit: string;
  isEmergency: boolean;
}

interface RecentActivity {
  id: string;
  type: 'appointment_created' | 'appointment_updated' | 'patient_registered' | 'appointment_cancelled';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  patientName?: string;
  doctorName?: string;
}

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  // Use pre-loaded receptionist data
  const { 
    receptionist, 
    branch, 
    doctors: receptionistDoctors, 
    patients: receptionistPatients, 
    appointments: receptionistAppointments,
    isInitializing,
    initializationError 
  } = useAppSelector((state: RootState) => state.receptionistData);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Calculate receptionist stats
  const calculateStats = (): ReceptionistStats => {
    console.log('🔍 Receptionist Dashboard - Data Debug:', {
      receptionistDoctors: receptionistDoctors,
      receptionistDoctorsLength: receptionistDoctors?.length,
      receptionistPatients: receptionistPatients,
      receptionistPatientsLength: receptionistPatients?.length,
      receptionistAppointments: receptionistAppointments,
      receptionistAppointmentsLength: receptionistAppointments?.length
    });

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayAppointments = receptionistAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= todayStart && aptDate < todayEnd;
    });

    return {
      totalAppointments: receptionistAppointments.length,
      todayAppointments: todayAppointments.length,
      completedAppointments: todayAppointments.filter(apt => apt.status === 'completed').length,
      pendingAppointments: todayAppointments.filter(apt => apt.status === 'scheduled').length,
      totalPatients: receptionistPatients.length,
      totalDoctors: receptionistDoctors.length,
      activeDoctors: receptionistDoctors.filter(doc => doc.isActive).length,
      walkInAppointments: todayAppointments.filter(apt => apt.visitType === 'walk_in').length,
      scheduledAppointments: todayAppointments.filter(apt => apt.visitType === 'scheduled').length,
    };
  };

  const stats = calculateStats();

  // Get upcoming appointments (next 3 hours)
  const getUpcomingAppointments = (): UpcomingAppointment[] => {
    const now = new Date();
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    return [...receptionistAppointments]
      .filter(apt => {
        const aptDateTime = new Date(`${apt.appointmentDate}T${apt.startTime}`);
        return aptDateTime >= now && aptDateTime <= threeHoursFromNow && apt.status === 'scheduled';
      })
      .sort((a, b) => {
        const aTime = new Date(`${a.appointmentDate}T${a.startTime}`);
        const bTime = new Date(`${b.appointmentDate}T${b.startTime}`);
        return aTime.getTime() - bTime.getTime();
      })
      .slice(0, 5)
      .map(apt => ({
        _id: apt._id,
        patientName: typeof apt.patientId === 'string' ? 'Unknown Patient' : (apt.patientId as any).name,
        doctorName: apt.doctorId ? (typeof apt.doctorId === 'string' ? 'Unknown Doctor' : `${(apt.doctorId as any).firstName} ${(apt.doctorId as any).lastName}`) : 'No Doctor Assigned',
        appointmentTime: `${apt.appointmentDate} ${apt.startTime}`,
        visitType: apt.visitType,
        status: apt.status,
        reasonForVisit: apt.reasonForVisit,
        isEmergency: apt.isEmergency
      }));
  };

  const upcomingAppointments = getUpcomingAppointments();

  // Initialize recent activities
  useEffect(() => {
    const activities: RecentActivity[] = [];
    
    // Add recent appointments
    [...receptionistAppointments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .forEach(apt => {
        activities.push({
          id: apt._id,
          type: 'appointment_created',
          message: `New appointment scheduled for ${typeof apt.patientId === 'string' ? 'Unknown Patient' : `${(apt.patientId as any).firstName} ${(apt.patientId as any).lastName}`}`,
          timestamp: apt.createdAt,
          severity: 'info',
          patientName: typeof apt.patientId === 'string' ? 'Unknown Patient' : (apt.patientId as any).name,
          doctorName: apt.doctorId ? (typeof apt.doctorId === 'string' ? 'Unknown Doctor' : `${(apt.doctorId as any).firstName} ${(apt.doctorId as any).lastName}`) : 'No Doctor'
        });
      });

    // Add recent patients
    [...receptionistPatients]
      .sort((a, b) => b._id.localeCompare(a._id))
      .slice(0, 3)
      .forEach(patient => {
        activities.push({
          id: patient._id,
          type: 'patient_registered',
          message: `New patient registered: ${patient.name}`,
          timestamp: new Date().toISOString(),
          severity: 'info',
          patientName: patient.name
        });
      });

    setRecentActivity(activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6));
  }, [receptionistAppointments, receptionistPatients]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(refreshReceptionistData('all')).unwrap();
      showSuccessToast('Data Refreshed', 'Dashboard data has been updated successfully.');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      handleApiError(error, 'refresh dashboard data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get severity color
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

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment_created': return <FiCalendar className="w-3 h-3" />;
      case 'appointment_updated': return <FiActivity className="w-3 h-3" />;
      case 'patient_registered': return <FiUserPlus className="w-3 h-3" />;
      case 'appointment_cancelled': return <FiXCircle className="w-3 h-3" />;
      default: return <FiActivity className="w-3 h-3" />;
    }
  };

  if (isInitializing) {
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

  if (initializationError) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <FiAlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-4">Failed to load dashboard data</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const branchName = branch?.name || 'Branch';
  const organizationName = 'Organization'; // Simplified for now

  return (
    <div className="p-4 space-y-4">
      {/* Compact Header */}
                <div className="flex items-center justify-between">
                  <div>
          <h1 className="text-xl font-bold text-gray-900">{getGreeting()}, {receptionist?.firstName || user?.firstName || 'Receptionist'}!</h1>
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
            <FiCalendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-500">Today</span>
                </div>
          <p className="text-lg font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiUsers className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500">Patients</span>
                </div>
          <p className="text-lg font-bold text-gray-900">{stats.totalPatients}</p>
            </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiUserCheck className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-500">Doctors</span>
                </div>
          <p className="text-lg font-bold text-gray-900">{stats.totalDoctors}</p>
            </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <FiCheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-gray-500">Completed</span>
                </div>
          <p className="text-lg font-bold text-gray-900">{stats.completedAppointments}</p>
            </div>
          </div>

          {/* Main Content Grid */}
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
              onClick={() => navigate('/doctors')}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-sm"
            >
              <FiUserCheck className="w-4 h-4 text-purple-600" />
              <span>Doctors</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full flex items-center space-x-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-sm disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
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
            {recentActivity.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-2">
                <div className={`p-1 rounded-full ${getSeverityColor(activity.severity)}`}>
                        {getActivityIcon(activity.type)}
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
                  <FiCalendar className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-xs text-gray-700">Today's Appointments</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.todayAppointments}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-xs text-gray-700">Total Patients</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.totalPatients}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiUserCheck className="w-3 h-3 text-purple-600" />
                </div>
                <span className="text-xs text-gray-700">Active Doctors</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.activeDoctors}</span>
                </div>
              </div>
            </div>
          </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <FiCalendar className="w-4 h-4 mr-2 text-blue-600" />
            Today's Schedule
          </h3>
          <div className="text-center py-6">
            <FiClipboard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-3">No upcoming appointments</p>
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
              <span className="text-xs text-gray-600">Appointment Efficiency</span>
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
              <span className="text-xs text-gray-600">Staff Utilization</span>
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
