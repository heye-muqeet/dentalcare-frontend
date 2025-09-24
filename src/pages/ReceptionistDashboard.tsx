import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { refreshReceptionistData } from '../lib/store/slices/receptionistDataSlice';
import { 
  Calendar, 
  Clock, 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCheck,
  Plus,
  Eye,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Bell,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';

interface TodayStats {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  walkInAppointments: number;
  scheduledAppointments: number;
  totalPatients: number;
  newPatientsToday: number;
  totalDoctors: number;
  activeDoctors: number;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'>('all');

  // Calculate today's stats
  const calculateTodayStats = (): TodayStats => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayAppointments = receptionistAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= todayStart && aptDate < todayEnd;
    });

    const newPatientsToday = receptionistPatients.filter(patient => {
      // Since PatientData doesn't have createdAt, we'll skip this filter for now
      // In a real app, you'd need to add createdAt to PatientData interface
      return false; // No new patients today since we don't have createdAt
    });

    return {
      totalAppointments: todayAppointments.length,
      completedAppointments: todayAppointments.filter(apt => apt.status === 'completed').length,
      pendingAppointments: todayAppointments.filter(apt => apt.status === 'scheduled').length,
      cancelledAppointments: todayAppointments.filter(apt => apt.status === 'cancelled').length,
      noShowAppointments: todayAppointments.filter(apt => apt.status === 'no_show').length,
      walkInAppointments: todayAppointments.filter(apt => apt.visitType === 'walk_in').length,
      scheduledAppointments: todayAppointments.filter(apt => apt.visitType === 'scheduled').length,
      totalPatients: receptionistPatients.length,
      newPatientsToday: newPatientsToday.length,
      totalDoctors: receptionistDoctors.length,
      activeDoctors: receptionistDoctors.filter(doc => doc.isActive).length,
    };
  };

  const stats = calculateTodayStats();

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
        patientName: typeof apt.patientId === 'string' ? 'Unknown Patient' : `${(apt.patientId as any).firstName} ${(apt.patientId as any).lastName}`,
        doctorName: apt.doctorId ? (typeof apt.doctorId === 'string' ? 'Unknown Doctor' : `${(apt.doctorId as any).firstName} ${(apt.doctorId as any).lastName}`) : 'No Doctor Assigned',
        appointmentTime: `${apt.appointmentDate} ${apt.startTime}`,
        visitType: apt.visitType,
        status: apt.status,
        reasonForVisit: apt.reasonForVisit,
        isEmergency: apt.isEmergency
      }));
  };

  const upcomingAppointments = getUpcomingAppointments();

  // Get recent activities
  const getRecentActivities = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    // Add recent appointments
    [...receptionistAppointments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .forEach(apt => {
        activities.push({
          id: apt._id,
          type: 'appointment_created',
          message: `New appointment scheduled for ${typeof apt.patientId === 'string' ? 'Unknown Patient' : `${(apt.patientId as any).firstName} ${(apt.patientId as any).lastName}`}`,
          timestamp: apt.createdAt,
          patientName: typeof apt.patientId === 'string' ? 'Unknown Patient' : `${(apt.patientId as any).firstName} ${(apt.patientId as any).lastName}`,
          doctorName: apt.doctorId ? (typeof apt.doctorId === 'string' ? 'Unknown Doctor' : `${(apt.doctorId as any).firstName} ${(apt.doctorId as any).lastName}`) : 'No Doctor'
        });
      });

    // Add recent patients
    [...receptionistPatients]
      .sort((a, b) => {
        // Since PatientData doesn't have createdAt, we'll sort by _id instead
        return b._id.localeCompare(a._id);
      })
      .slice(0, 5)
      .forEach(patient => {
        activities.push({
          id: patient._id,
          type: 'patient_registered',
          message: `New patient registered: ${patient.firstName} ${patient.lastName}`,
          timestamp: new Date().toISOString(), // Use current time since PatientData doesn't have createdAt
          patientName: `${patient.firstName} ${patient.lastName}`
        });
      });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  };

  const recentActivities = getRecentActivities();

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(refreshReceptionistData('all')).unwrap();
    } catch (error) {
      console.error('Failed to refresh data:', error);
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

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment_created': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'appointment_updated': return <Activity className="h-4 w-4 text-yellow-600" />;
      case 'patient_registered': return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'appointment_cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading receptionist dashboard...</p>
        </div>
      </div>
    );
  }

  if (initializationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-4">Failed to load dashboard data</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-blue-600/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                      {getGreeting()}, {receptionist?.firstName || user?.firstName || 'Receptionist'}! 👋
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                      Welcome to your receptionist dashboard. Manage appointments and assist patients efficiently.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-blue-600/10 rounded-full border border-emerald-200/50">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">{branch?.name || 'Branch'}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-full border border-blue-200/50">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/30 rounded-lg hover:bg-white/70 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-2xl text-white">🏥</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Appointments */}
            <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="text-white text-xl" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</p>
                  <p className="text-sm text-gray-500">Today</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Appointments</h3>
              <p className="text-sm text-gray-500">Scheduled for today</p>
              <div className="mt-3 flex items-center text-sm text-blue-600">
                <TrendingUp className="mr-1 h-4 w-4" />
                <span>{stats.scheduledAppointments} scheduled</span>
              </div>
            </div>

            {/* Patients */}
            <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-white text-xl" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{stats.totalPatients}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Patients</h3>
              <p className="text-sm text-gray-500">Registered patients</p>
              <div className="mt-3 flex items-center text-sm text-green-600">
                <UserPlus className="mr-1 h-4 w-4" />
                <span>{stats.newPatientsToday} new today</span>
              </div>
            </div>

            {/* Doctors */}
            <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="text-white text-xl" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{stats.totalDoctors}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Doctors</h3>
              <p className="text-sm text-gray-500">Available doctors</p>
              <div className="mt-3 flex items-center text-sm text-purple-600">
                <CheckCircle className="mr-1 h-4 w-4" />
                <span>{stats.activeDoctors} active</span>
              </div>
            </div>

            {/* Completed Appointments */}
            <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="text-white text-xl" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{stats.completedAppointments}</p>
                  <p className="text-sm text-gray-500">Today</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Completed</h3>
              <p className="text-sm text-gray-500">Finished appointments</p>
              <div className="mt-3 flex items-center text-sm text-emerald-600">
                <Activity className="mr-1 h-4 w-4" />
                <span>{stats.pendingAppointments} pending</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Clock className="mr-3 text-blue-600" />
                    Upcoming Appointments
                  </h2>
                  <button
                    onClick={() => navigate('/appointments')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View All
                  </button>
                </div>
                
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming appointments in the next 3 hours</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment._id} className="bg-white/50 rounded-xl p-4 border border-white/30 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-800">{appointment.patientName}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status.replace('_', ' ')}
                              </span>
                              {appointment.isEmergency && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                  Emergency
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Dr. {appointment.doctorName}</p>
                            <p className="text-sm text-gray-500">{appointment.reasonForVisit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-800">
                              {new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(appointment.appointmentTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Activity className="mr-3 text-green-600" />
                  Recent Activities
                </h2>
                
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-white/30">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 mb-1">{activity.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Plus className="mr-3 text-emerald-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/appointments')}
                  className="group bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Plus className="text-white text-lg" />
                    </div>
                    <Calendar className="text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">New Appointment</h3>
                  <p className="text-sm text-gray-600">Schedule a new appointment</p>
                </button>

                <button
                  onClick={() => navigate('/patients')}
                  className="group bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <UserPlus className="text-white text-lg" />
                    </div>
                    <Users className="text-green-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">New Patient</h3>
                  <p className="text-sm text-gray-600">Register a new patient</p>
                </button>

                <button
                  onClick={() => navigate('/appointments')}
                  className="group bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Eye className="text-white text-lg" />
                    </div>
                    <Activity className="text-purple-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">View Schedule</h3>
                  <p className="text-sm text-gray-600">Check today's schedule</p>
                </button>

                <button
                  onClick={() => navigate('/patients')}
                  className="group bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-4 border border-orange-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Search className="text-white text-lg" />
                    </div>
                    <Users className="text-orange-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">Find Patient</h3>
                  <p className="text-sm text-gray-600">Search patient records</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
