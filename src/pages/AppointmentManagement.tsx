import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../lib/store/store';
import { RootState } from '../lib/store/store';
import { fetchAppointments, createAppointment, updateAppointment, cancelAppointment, clearAppointmentErrors } from '../lib/store/slices/appointmentsSlice';
import { fetchPatients } from '../lib/store/slices/patientsSlice';
import { fetchDoctors } from '../lib/store/slices/doctorsSlice';
import { refreshReceptionistData } from '../lib/store/slices/receptionistDataSlice';
import CreateAppointmentModal from '../components/Modals/CreateAppointmentModal';
import EditAppointmentModal from '../components/Modals/EditAppointmentModal';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CalendarDays,
  Users,
  Activity
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isYesterday, startOfDay, endOfDay } from 'date-fns';
import { 
  showErrorToast, 
  showSuccessToast, 
  showWarningToast,
  handleApiError 
} from '../lib/utils/errorHandler';

// Type guards for appointment data
const isPatientObject = (patientId: string | { _id: string; name?: string; firstName?: string; lastName?: string; email: string; phone: string }): patientId is { _id: string; name?: string; firstName?: string; lastName?: string; email: string; phone: string } => {
  return typeof patientId === 'object' && patientId !== null;
};

const isDoctorObject = (doctorId: string | { _id: string; firstName: string; lastName: string; specialization: string } | undefined): doctorId is { _id: string; firstName: string; lastName: string; specialization: string } => {
  return typeof doctorId === 'object' && doctorId !== null;
};

interface Appointment {
  _id: string;
  patientId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  doctorId?: string | {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  visitType: 'walk_in' | 'scheduled';
  reasonForVisit: string;
  notes?: string;
  duration: number;
  isWalkIn: boolean;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
};

const visitTypeColors = {
  walk_in: 'bg-orange-100 text-orange-800',
  scheduled: 'bg-purple-100 text-purple-800',
};

export default function AppointmentManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, isLoading, error } = useSelector((state: RootState) => state.appointments);
  const { patients } = useSelector((state: RootState) => state.patients);
  const { doctors, isLoading: doctorsLoading, error: doctorsError } = useSelector((state: RootState) => state.doctors);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Use pre-loaded receptionist data
  const { 
    receptionist, 
    branch, 
    doctors: receptionistDoctors, 
    patients: receptionistPatients, 
    appointments: receptionistAppointments,
    isInitializing,
    initializationError 
  } = useSelector((state: RootState) => state.receptionistData);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today'); // Default to today for receptionist
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Use pre-loaded receptionist data instead of fetching on mount
  useEffect(() => {
    // Only fetch if receptionist data is not available
    if (!receptionistDoctors.length && !isInitializing && !initializationError) {
      console.log('🔄 Receptionist data not available, fetching...');
    dispatch(fetchAppointments({}));
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
    }
  }, [dispatch, receptionistDoctors.length, isInitializing, initializationError]);

  // Debug receptionist data
  useEffect(() => {
    console.log('🔍 Receptionist data:', {
      receptionist,
      branch,
      doctorsCount: receptionistDoctors?.length || 0,
      patientsCount: receptionistPatients?.length || 0,
      appointmentsCount: receptionistAppointments?.length || 0,
      isInitializing,
      initializationError
    });
  }, [receptionist, branch, receptionistDoctors, receptionistPatients, receptionistAppointments, isInitializing, initializationError]);

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      console.log('🚀 Starting appointment creation with data:', appointmentData);
      const result = await dispatch(createAppointment(appointmentData)).unwrap();
      console.log('✅ Appointment created successfully:', result);
      showSuccessToast('Appointment Created Successfully', 'The appointment has been scheduled successfully.');
      setIsCreateModalOpen(false);
      // Refresh appointments list
      dispatch(fetchAppointments({}));
    } catch (error: any) {
      console.error('❌ Error creating appointment:', error);
      handleApiError(error, 'create appointment');
    }
  };

  const handleAppointmentCreated = (appointmentData: any) => {
    console.log('🎉 Appointment created successfully in modal:', appointmentData);
    showSuccessToast('Appointment Created Successfully', 'The appointment has been scheduled successfully.');
    setIsCreateModalOpen(false);
    // Refresh appointments list
    dispatch(fetchAppointments({}));
  };

  const handleEditAppointment = async (appointmentData: any) => {
    if (selectedAppointment) {
      try {
        await dispatch(updateAppointment({ id: selectedAppointment._id, appointmentData })).unwrap();
        showSuccessToast('Appointment Updated Successfully', 'The appointment has been modified successfully.');
      setIsEditModalOpen(false);
      setSelectedAppointment(null);
        dispatch(fetchAppointments({}));
      } catch (error: any) {
        handleApiError(error, 'update appointment');
      }
    }
  };

  const handleCancelAppointment = async (appointmentId: string, reason: string) => {
    try {
      await dispatch(cancelAppointment({ id: appointmentId, cancellationReason: reason })).unwrap();
      showSuccessToast('Appointment Cancelled', 'The appointment has been cancelled successfully.');
      dispatch(fetchAppointments({}));
    } catch (error: any) {
      handleApiError(error, 'cancel appointment');
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await dispatch(updateAppointment({ 
        id: appointmentId, 
        appointmentData: { status: newStatus } 
      })).unwrap();
      showSuccessToast('Status Updated', `Appointment status has been changed to ${newStatus.replace('_', ' ')}.`);
      dispatch(fetchAppointments({}));
    } catch (error: any) {
      handleApiError(error, 'update appointment status');
    }
  };

  const handleEditClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  // Use pre-loaded data or fallback to old data
  const currentAppointments = receptionistAppointments.length > 0 ? receptionistAppointments : appointments;
  const currentDoctors = receptionistDoctors.length > 0 ? receptionistDoctors : doctors;
  const currentPatients = receptionistPatients.length > 0 ? receptionistPatients : patients;

  const filteredAppointments = currentAppointments.filter((appointment) => {
    const matchesSearch = 
      (isPatientObject(appointment.patientId) && (
        (appointment.patientId.name || `${appointment.patientId.firstName || ''} ${appointment.patientId.lastName || ''}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patientId.email.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      appointment.reasonForVisit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const appointmentDate = new Date(appointment.appointmentDate);
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = isToday(appointmentDate);
    } else if (dateFilter === 'tomorrow') {
      matchesDate = isTomorrow(appointmentDate);
    } else if (dateFilter === 'yesterday') {
      matchesDate = isYesterday(appointmentDate);
    } else if (dateFilter === 'thisWeek') {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      matchesDate = appointmentDate >= weekStart && appointmentDate <= weekEnd;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getDateLabel = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return 'Today';
    if (isTomorrow(appointmentDate)) return 'Tomorrow';
    if (isYesterday(appointmentDate)) return 'Yesterday';
    return format(appointmentDate, 'MMM dd, yyyy');
  };

  const getTimeLabel = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'in_progress':
        return <Activity className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'no_show':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getQuickStats = () => {
    const today = new Date();
    const todayAppointments = appointments.filter(apt => 
      isToday(new Date(apt.appointmentDate))
    );
    
    return {
      total: filteredAppointments.length,
      today: todayAppointments.length,
      scheduled: todayAppointments.filter(apt => apt.status === 'scheduled').length,
      inProgress: todayAppointments.filter(apt => apt.status === 'in_progress').length,
      completed: todayAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: todayAppointments.filter(apt => apt.status === 'cancelled').length,
      noShow: todayAppointments.filter(apt => apt.status === 'no_show').length,
    };
  };

  const stats = getQuickStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Receptionist Desk</h1>
          <p className="text-sm text-gray-600">Manage appointments and schedules</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              if (receptionistDoctors.length > 0) {
                // Refresh receptionist data
                dispatch(refreshReceptionistData('all'));
              } else {
                // Fallback to old method
                dispatch(fetchAppointments({}));
                dispatch(fetchPatients());
                dispatch(fetchDoctors());
              }
            }}
            className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-3 w-3" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-500">Total Today</p>
              <p className="text-lg font-bold text-gray-900">{stats.today}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-500">Scheduled</p>
              <p className="text-lg font-bold text-blue-600">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-yellow-100 rounded-lg">
              <Activity className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-500">In Progress</p>
              <p className="text-lg font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-500">Completed</p>
              <p className="text-lg font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-500">Cancelled</p>
              <p className="text-lg font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-gray-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-500">No Show</p>
              <p className="text-lg font-bold text-gray-600">{stats.noShow}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-500">Total</p>
              <p className="text-lg font-bold text-purple-600">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-emerald-600" />
            Filters & Search
          </h3>
          <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            {filteredAppointments.length} appointment(s) found
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <CalendarDays className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="all">All Dates</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Activity className="h-4 w-4" />
              Quick Actions
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Plus className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-emerald-900">New Appointment</span>
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Today's Schedule</span>
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Pending Appointments</span>
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Activity className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-900">In Progress</span>
            </button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-2">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters to see more appointments.'
                : 'Get started by creating your first appointment.'}
            </p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Appointment
            </button>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {isPatientObject(appointment.patientId) ? (appointment.patientId.name || `${appointment.patientId.firstName || ''} ${appointment.patientId.lastName || ''}`).trim() : 'Unknown Patient'}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusColors[appointment.status]}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${visitTypeColors[appointment.visitType]}`}>
                        {appointment.visitType.replace('_', ' ').toUpperCase()}
                      </span>
                      {appointment.isEmergency && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">EMERGENCY</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{getDateLabel(appointment.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{getTimeLabel(appointment.startTime, appointment.endTime)}</span>
                      </div>
                      {appointment.doctorId && (
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {isDoctorObject(appointment.doctorId) ? `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}` : 'No Doctor Assigned'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-500">Reason:</span>
                        <span className="font-medium">{appointment.reasonForVisit}</span>
                      </div>
                    </div>

                    {/* Patient Contact Info */}
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{isPatientObject(appointment.patientId) ? appointment.patientId.phone : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{isPatientObject(appointment.patientId) ? appointment.patientId.email : 'N/A'}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 flex-shrink-0 ml-3">
                    {/* Status Change Buttons */}
                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusChange(appointment._id, 'in_progress')}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {appointment.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(appointment._id, 'completed')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    
                    {/* Action Menu */}
                    <div className="relative">
                      <button className="h-8 w-8 p-0 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAppointmentCreated}
        patients={currentPatients.map(p => ({
          _id: p._id,
          name: (p as any).name || `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim(),
          email: p.email,
          phone: p.phone || '',
        }))}
        doctors={currentDoctors.map(d => ({
          _id: d._id,
          firstName: d.firstName,
          lastName: d.lastName,
          specialization: d.specialization || '',
        }))}
      />

      {selectedAppointment && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleEditAppointment}
          appointment={{
            ...selectedAppointment,
            patientId: isPatientObject(selectedAppointment.patientId) 
              ? {
                  _id: selectedAppointment.patientId._id,
                  name: selectedAppointment.patientId.name || `${selectedAppointment.patientId.firstName || ''} ${selectedAppointment.patientId.lastName || ''}`.trim(),
                  email: selectedAppointment.patientId.email,
                  phone: selectedAppointment.patientId.phone
                }
              : (() => {
                  const patient = currentPatients.find(p => p._id === selectedAppointment.patientId);
                  return patient ? {
                    _id: patient._id,
                    name: (patient as any).name || `${(patient as any).firstName || ''} ${(patient as any).lastName || ''}`.trim(),
                    email: patient.email,
                    phone: patient.phone || 'N/A'
                  } : {
                    _id: selectedAppointment.patientId as string,
                    name: 'Unknown Patient',
                    email: 'N/A',
                    phone: 'N/A'
                  };
                })(),
            doctorId: selectedAppointment.doctorId 
              ? (isDoctorObject(selectedAppointment.doctorId) 
                  ? selectedAppointment.doctorId 
                  : currentDoctors.find(d => d._id === selectedAppointment.doctorId) ? {
                      _id: selectedAppointment.doctorId as string,
                      firstName: currentDoctors.find(d => d._id === selectedAppointment.doctorId)?.firstName || 'Unknown',
                      lastName: currentDoctors.find(d => d._id === selectedAppointment.doctorId)?.lastName || 'Doctor',
                      specialization: currentDoctors.find(d => d._id === selectedAppointment.doctorId)?.specialization || 'General'
                    } : undefined)
              : undefined
          }}
          patients={currentPatients.map(p => ({
            _id: p._id,
            name: (p as any).name || `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim(),
            email: p.email,
            phone: p.phone || '',
          }))}
          doctors={currentDoctors.map(d => ({
            _id: d._id,
            firstName: d.firstName,
            lastName: d.lastName,
            specialization: d.specialization || '',
          }))}
        />
      )}
    </div>
  );
}
