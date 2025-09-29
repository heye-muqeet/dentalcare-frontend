import React, { useState, useEffect, useCallback } from 'react';
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
import { format, parseISO, isToday, isTomorrow, isYesterday, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays } from 'date-fns';
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
  const [showStatsFilters, setShowStatsFilters] = useState(true);
  const [timePeriod, setTimePeriod] = useState('today');
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dayOffset, setDayOffset] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

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

  // Window resize listener for dynamic day count
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Center today's date on initial load and when window size changes
  useEffect(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const nextMonthStart = startOfMonth(addMonths(today, 1));
    
    const currentMonthDays = eachDayOfInterval({ 
      start: startOfDay(monthStart), 
      end: endOfDay(monthEnd) 
    });
    
    const nextMonthDays = eachDayOfInterval({ 
      start: startOfDay(nextMonthStart), 
      end: startOfDay(addDays(nextMonthStart, 14))
    });
    
    const allDays = [...currentMonthDays, ...nextMonthDays];
    
    const todayIndex = allDays.findIndex(day => isSameDay(day, today));
    if (todayIndex !== -1) {
      // Calculate dynamic day count inline to avoid dependency issues
      const buttonWidth = 32; // w-8 = 32px (reduced from w-10)
      const gapWidth = 2; // gap-0.5 = 2px (reduced from gap-1)
      const navButtonWidth = 20; // w-5 = 20px (reduced from w-6)
      const containerPadding = 12; // p-1.5 = 6px * 2 (reduced from p-2)
      const extraMargin = 24; // Safety margin (increased from 20)
      
      const availableWidth = windowWidth - (navButtonWidth * 2) - containerPadding - extraMargin;
      const daysPerRow = Math.floor(availableWidth / (buttonWidth + gapWidth));
      const dynamicDayCount = Math.max(7, Math.min(daysPerRow, 25));
      
      const centerOffset = Math.max(0, todayIndex - Math.floor(dynamicDayCount / 2));
      setDayOffset(centerOffset);
      // Today centered successfully
    }
  }, [windowWidth]); // Re-center when window size changes

  // Also center today on initial component mount
  useEffect(() => {
    const today = new Date();
    setCurrentMonth(today); // Set current month to today's month
    setSelectedDate(today); // Set today as selected by default
    
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const nextMonthStart = startOfMonth(addMonths(today, 1));
    
    const currentMonthDays = eachDayOfInterval({ 
      start: startOfDay(monthStart), 
      end: endOfDay(monthEnd) 
    });
    
    const nextMonthDays = eachDayOfInterval({ 
      start: startOfDay(nextMonthStart), 
      end: startOfDay(addDays(nextMonthStart, 14))
    });
    
    const allDays = [...currentMonthDays, ...nextMonthDays];
    
    const todayIndex = allDays.findIndex(day => isSameDay(day, today));
    if (todayIndex !== -1) {
      // Calculate dynamic day count inline to avoid dependency issues
      const buttonWidth = 32; // w-8 = 32px (reduced from w-10)
      const gapWidth = 2; // gap-0.5 = 2px (reduced from gap-1)
      const navButtonWidth = 20; // w-5 = 20px (reduced from w-6)
      const containerPadding = 12; // p-1.5 = 6px * 2 (reduced from p-2)
      const extraMargin = 24; // Safety margin (increased from 20)
      
      const availableWidth = windowWidth - (navButtonWidth * 2) - containerPadding - extraMargin;
      const daysPerRow = Math.floor(availableWidth / (buttonWidth + gapWidth));
      const dynamicDayCount = Math.max(7, Math.min(daysPerRow, 25));
      
      const centerOffset = Math.max(0, todayIndex - Math.floor(dynamicDayCount / 2));
      setDayOffset(centerOffset);
      // Initial centering complete
    }
  }, [windowWidth]); // Include windowWidth dependency

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
    
    // Time period filtering (replaces date filtering)
    let matchesTimePeriod = true;
      const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    if (timePeriod === 'today') {
      matchesTimePeriod = isToday(appointmentDate);
    } else if (timePeriod === 'this_month') {
      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = new Date(currentYear, currentMonth + 1, 0);
      matchesTimePeriod = appointmentDate >= monthStart && appointmentDate <= monthEnd;
    } else if (timePeriod === 'next_month') {
      const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
      const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0);
      matchesTimePeriod = appointmentDate >= nextMonthStart && appointmentDate <= nextMonthEnd;
    } else if (timePeriod === 'previous_month') {
      const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
      const prevMonthEnd = new Date(currentYear, currentMonth, 0);
      matchesTimePeriod = appointmentDate >= prevMonthStart && appointmentDate <= prevMonthEnd;
    } else if (timePeriod === 'this_year') {
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31);
      matchesTimePeriod = appointmentDate >= yearStart && appointmentDate <= yearEnd;
    }

    return matchesSearch && matchesStatus && matchesTimePeriod;
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

  // Calendar helper functions
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfDay(monthStart);
    const endDate = endOfDay(monthEnd);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const getHorizontalCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const nextMonthStart = startOfMonth(addMonths(currentMonth, 1));
    const nextMonthEnd = endOfMonth(addMonths(currentMonth, 1));
    
    // Get all days in the current month
    const currentMonthDays = eachDayOfInterval({ 
      start: startOfDay(monthStart), 
      end: endOfDay(monthEnd) 
    });
    
    // Get some days from the next month to ensure we can always center properly
    const nextMonthDays = eachDayOfInterval({ 
      start: startOfDay(nextMonthStart), 
      end: startOfDay(addDays(nextMonthStart, 14)) // Get first 15 days of next month
    });
    
    // Combine current month and next month days
    const allDays = [...currentMonthDays, ...nextMonthDays];
    
    // Get dynamic number of days based on window width
    const maxDays = getDynamicDayCount();
    
    // Show calculated number of days at a time, with offset for navigation
    const startIndex = Math.max(0, dayOffset);
    const endIndex = Math.min(startIndex + maxDays, allDays.length);
    
    return allDays.slice(startIndex, endIndex);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setDateFilter('custom');
    
    // Center the selected date in the visible row
    // Use the same logic as getHorizontalCalendarDays to get the extended day range
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const nextMonthStart = startOfMonth(addMonths(currentMonth, 1));
    
    const currentMonthDays = eachDayOfInterval({ 
      start: startOfDay(monthStart), 
      end: endOfDay(monthEnd) 
    });
    
    const nextMonthDays = eachDayOfInterval({ 
      start: startOfDay(nextMonthStart), 
      end: startOfDay(addDays(nextMonthStart, 14))
    });
    
    const allDays = [...currentMonthDays, ...nextMonthDays];
    
    const selectedIndex = allDays.findIndex(day => isSameDay(day, date));
    if (selectedIndex !== -1) {
      const dynamicDayCount = getDynamicDayCount();
      const centerOffset = Math.max(0, selectedIndex - Math.floor(dynamicDayCount / 2));
      setDayOffset(centerOffset);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setDayOffset(0); // Reset day offset when changing months
  };

  const getDynamicDayCount = useCallback(() => {
    // More accurate measurements for responsive design
    const buttonWidth = 32; // w-8 = 32px (reduced from w-10)
    const gapWidth = 2; // gap-0.5 = 2px
    const navButtonWidth = 20; // w-5 = 20px (reduced from w-6)
    const containerPadding = 12; // p-1.5 = 6px on each side (reduced from p-2)
    const extraMargin = 24; // Additional margin for safety (reduced from 32)
    
    // Calculate available width for day buttons
    const availableWidth = windowWidth - (navButtonWidth * 2) - containerPadding - extraMargin;
    
    // Calculate how many day buttons can fit
    const daysPerRow = Math.floor(availableWidth / (buttonWidth + gapWidth));
    
    // Ensure we show between 7 and 25 days (increased max since buttons are smaller)
    const dynamicCount = Math.max(7, Math.min(daysPerRow, 25));
    
    // Dynamic calculation complete
    
    return dynamicCount;
  }, [windowWidth]);

  const getCurrentDateRange = () => {
    const visibleDays = getHorizontalCalendarDays();
    if (visibleDays.length === 0) return '';
    
    const firstDay = visibleDays[0];
    const lastDay = visibleDays[visibleDays.length - 1];
    
    const firstMonth = format(firstDay, 'MMM');
    const lastMonth = format(lastDay, 'MMM');
    const firstDate = format(firstDay, 'dd');
    const lastDate = format(lastDay, 'dd');
    
    // If same month, show "Jan 15 - 25"
    if (firstMonth === lastMonth) {
      return `${firstMonth} ${firstDate} - ${lastDate}`;
    }
    
    // If different months, show "Jan 25 - Feb 05"
    return `${firstMonth} ${firstDate} - ${lastMonth} ${lastDate}`;
  };

  const handlePrevDays = () => {
    const dynamicDayCount = getDynamicDayCount();
    
    if (dayOffset - dynamicDayCount < 0) {
      // Go to previous month
      const prevMonth = subMonths(currentMonth, 1);
      setCurrentMonth(prevMonth);
      
      // Calculate the extended day range for the previous month
      const prevMonthStart = startOfMonth(prevMonth);
      const prevMonthEnd = endOfMonth(prevMonth);
      const prevNextMonthStart = startOfMonth(addMonths(prevMonth, 1));
      
      const prevMonthDays = eachDayOfInterval({ 
        start: startOfDay(prevMonthStart), 
        end: endOfDay(prevMonthEnd) 
      });
      
      const prevNextMonthDays = eachDayOfInterval({ 
        start: startOfDay(prevNextMonthStart), 
        end: startOfDay(addDays(prevNextMonthStart, 14))
      });
      
      const prevAllDays = [...prevMonthDays, ...prevNextMonthDays];
      setDayOffset(Math.max(0, prevAllDays.length - dynamicDayCount));
    } else {
      setDayOffset(Math.max(0, dayOffset - dynamicDayCount));
    }
  };

  const handleNextDays = () => {
    const dynamicDayCount = getDynamicDayCount();
    
    // Calculate the extended day range for current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const nextMonthStart = startOfMonth(addMonths(currentMonth, 1));
    
    const currentMonthDays = eachDayOfInterval({ 
      start: startOfDay(monthStart), 
      end: endOfDay(monthEnd) 
    });
    
    const nextMonthDays = eachDayOfInterval({ 
      start: startOfDay(nextMonthStart), 
      end: startOfDay(addDays(nextMonthStart, 14))
    });
    
    const allDays = [...currentMonthDays, ...nextMonthDays];
    
    if (dayOffset + dynamicDayCount >= allDays.length) {
      // Go to next month
      setCurrentMonth(addMonths(currentMonth, 1));
      setDayOffset(0);
    } else {
      setDayOffset(Math.min(dayOffset + dynamicDayCount, allDays.length - dynamicDayCount));
    }
  };

  const getQuickStats = () => {
    // Use receptionist appointments for receptionist users, otherwise use appointments slice
    const appointmentsData = user?.role === 'receptionist' ? receptionistAppointments : appointments;
    
    // Filter appointments based on time period
    const periodAppointments = appointmentsData.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDate);
    const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      if (timePeriod === 'today') {
        return isToday(appointmentDate);
      } else if (timePeriod === 'this_month') {
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        return appointmentDate >= monthStart && appointmentDate <= monthEnd;
      } else if (timePeriod === 'next_month') {
        const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
        const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0);
        return appointmentDate >= nextMonthStart && appointmentDate <= nextMonthEnd;
      } else if (timePeriod === 'previous_month') {
        const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const prevMonthEnd = new Date(currentYear, currentMonth, 0);
        return appointmentDate >= prevMonthStart && appointmentDate <= prevMonthEnd;
      } else if (timePeriod === 'this_year') {
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        return appointmentDate >= yearStart && appointmentDate <= yearEnd;
      }
      return true;
    });
    
    return {
      total: periodAppointments.length,
      scheduled: periodAppointments.filter(apt => apt.status === 'scheduled').length,
      inProgress: periodAppointments.filter(apt => apt.status === 'in_progress').length,
      completed: periodAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: periodAppointments.filter(apt => apt.status === 'cancelled').length,
      noShow: periodAppointments.filter(apt => apt.status === 'no_show').length,
      walkIn: periodAppointments.filter(apt => (apt as any).status === 'walk_in').length,
    };
  };

  const stats = getQuickStats();

  // For receptionist users, use receptionist data loading state
  // For other users, use appointments slice loading state
  const shouldShowLoader = user?.role === 'receptionist' 
    ? isInitializing 
    : isLoading;

  // Debug logging
  console.log('🔍 Loading state check:', {
    userRole: user?.role,
    isInitializing,
    isLoading,
    shouldShowLoader,
    hasReceptionistAppointments: receptionistAppointments?.length || 0,
    hasAppointments: appointments?.length || 0
  });

  if (shouldShowLoader) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header Section */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
          {/* Left Side - Page Title */}
          <div className="flex items-center space-x-3">
        <div>
              <h1 className="text-lg font-semibold text-gray-900">Appointments</h1>
              <p className="text-xs text-gray-500">Manage patient appointments</p>
        </div>
          </div>

          {/* Right Side - Search, Filter, and Add Button */}
        <div className="flex items-center space-x-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Filter Button */}
          <button 
              onClick={() => setShowStatsFilters(!showStatsFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition-all duration-200 ${
                showStatsFilters 
                  ? 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300' 
                  : 'text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              {showStatsFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

            {/* Add Button */}
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all duration-200 shadow-sm"
          >
              <Plus className="h-3.5 w-3.5" />
              Add Appointment
          </button>
            </div>
          </div>
        </div>
        
      {/* Main Content */}
      <div className="p-4 space-y-4">

      {/* Interactive Quick Stats */}
      {showStatsFilters && (
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
        <button 
          onClick={() => {
            setStatusFilter('scheduled');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            statusFilter === 'scheduled' 
              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          Scheduled ({stats.scheduled})
        </button>
        
        <button 
          onClick={() => {
            setStatusFilter('in_progress');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            statusFilter === 'in_progress' 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          In Progress ({stats.inProgress})
        </button>
        
        <button 
          onClick={() => {
            setStatusFilter('completed');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            statusFilter === 'completed' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          Completed ({stats.completed})
        </button>
        
        <button 
          onClick={() => {
            setStatusFilter('cancelled');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            statusFilter === 'cancelled' 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          Cancelled ({stats.cancelled})
        </button>
        
        <button 
          onClick={() => {
            setStatusFilter('no_show');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            statusFilter === 'no_show' 
              ? 'bg-gray-100 text-gray-800 border border-gray-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          No Show ({stats.noShow})
        </button>
        
        <button 
          onClick={() => {
            setStatusFilter('walk_in');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            statusFilter === 'walk_in' 
              ? 'bg-orange-100 text-orange-800 border border-orange-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          Walk In ({stats.walkIn || 0})
        </button>
        
        <button 
          onClick={() => {
            setStatusFilter('all');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            statusFilter === 'all' 
              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          Total ({stats.total})
        </button>
        </div>
        
          {/* Time Period Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Time Period:</span>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="this_month">This Month</option>
              <option value="previous_month">Previous Month</option>
              <option value="next_month">Next Month</option>
              <option value="this_year">This Year</option>
            </select>
            </div>
            </div>
      )}

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

        {/* Calendar Component */}
        <div className="w-full overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 rounded-md p-1.5 border border-gray-100">
          {/* Date Range Indicator */}
          <div className="flex justify-center mb-1">
            <span className="text-xs text-gray-600 bg-white px-1.5 py-0.5 rounded-full shadow-sm">
              {getCurrentDateRange()}
            </span>
            </div>
          
          <div className="flex items-center gap-0.5">
            {/* Previous Button */}
              <button
              onClick={handlePrevDays}
              className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors flex-shrink-0"
              >
              <ChevronDown className="h-2.5 w-2.5 text-gray-600 rotate-90" />
              </button>
            
            {/* Days Row */}
            <div className="flex items-center gap-0.5 flex-1 justify-center">
              {getHorizontalCalendarDays().map((date, index) => {
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isTodayDate = isToday(date);
                const dayName = format(date, 'EEE'); // Mon, Tue, etc.
                
                return (
            <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`
                      flex flex-col items-center justify-center w-8 h-8 text-xs font-medium rounded-md transition-colors flex-shrink-0
                      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${isSelected 
                        ? 'bg-blue-600 text-white' 
                        : isTodayDate 
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                          : 'hover:bg-purple-100 hover:text-purple-600'
                      }
                    `}
                  >
                    <span className="text-xs opacity-75 leading-none">{dayName}</span>
                    <span className="text-xs font-semibold leading-none">{format(date, 'd')}</span>
            </button>
                );
              })}
      </div>

            {/* Next Button */}
            <button
              onClick={handleNextDays}
              className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors flex-shrink-0"
            >
              <ChevronDown className="h-2.5 w-2.5 text-gray-600 -rotate-90" />
            </button>
          </div>
        </div>


      {/* Compact Appointments List */}
      <div className="space-y-1.5">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 text-center">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-xs text-gray-500 mb-3">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters to see more appointments.'
                : 'Get started by creating your first appointment.'}
            </p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <Plus className="h-3 w-3" />
              Create Appointment
            </button>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {isPatientObject(appointment.patientId) ? (appointment.patientId.name || `${appointment.patientId.firstName || ''} ${appointment.patientId.lastName || ''}`).trim() : 'Unknown Patient'}
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${statusColors[appointment.status]}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${visitTypeColors[appointment.visitType]}`}>
                        {appointment.visitType.replace('_', ' ').toUpperCase()}
                      </span>
                      {appointment.isEmergency && (
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">EMERGENCY</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{getDateLabel(appointment.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{getTimeLabel(appointment.startTime, appointment.endTime)}</span>
                      </div>
                      {appointment.doctorId && (
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="h-3 w-3 text-gray-400" />
                          <span className="font-medium">
                            {isDoctorObject(appointment.doctorId) ? `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}` : 'No Doctor Assigned'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-500">Reason:</span>
                        <span className="font-medium">{appointment.reasonForVisit}</span>
                      </div>
                    </div>

                    {/* Patient Contact Info */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
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
                      <div className="mt-2 p-2 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-700">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1.5 flex-shrink-0 ml-2">
                    {/* Status Change Buttons */}
                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusChange(appointment._id, 'in_progress')}
                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {appointment.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(appointment._id, 'completed')}
                        className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    
                    {/* Action Menu */}
                    <div className="relative">
                      <button className="h-6 w-6 p-0 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-3 w-3" />
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
    </div>
  );
}
