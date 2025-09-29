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
import ConfirmationModal from '../components/Modals/ConfirmationModal';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  MoreHorizontal,
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
  X,
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
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
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
  // Fallback for old statuses that might still exist in data
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
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    appointmentId: string | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    appointmentId: null,
    title: '',
    message: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today'); // Default to today for receptionist
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [timePeriod, setTimePeriod] = useState('today');
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dayOffset, setDayOffset] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

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

  // Sync local appointments with Redux appointments
  useEffect(() => {
    const currentAppointments = user?.role === 'receptionist' ? receptionistAppointments : appointments;
    if (currentAppointments && currentAppointments.length > 0) {
      setLocalAppointments(currentAppointments as Appointment[]);
    }
  }, [appointments, receptionistAppointments, user?.role]);

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
      // Use the same calculation as getDynamicDayCount
      const buttonWidth = 32; // w-8 = 32px
      const gapWidth = 2; // gap-0.5 = 2px
      const navButtonWidth = 20; // w-5 = 20px
      const containerPadding = 12; // p-1.5 = 6px * 2
      const monthNameWidth = 120; // Approximate width for month name
      const todayButtonWidth = 60; // Approximate width for "Today" button
      const extraMargin = 24; // Safety margin
      
      const availableWidth = windowWidth - (navButtonWidth * 2) - containerPadding - monthNameWidth - todayButtonWidth - extraMargin;
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
      // Use the same calculation as getDynamicDayCount
      const buttonWidth = 32; // w-8 = 32px
      const gapWidth = 2; // gap-0.5 = 2px
      const navButtonWidth = 20; // w-5 = 20px
      const containerPadding = 12; // p-1.5 = 6px * 2
      const monthNameWidth = 120; // Approximate width for month name
      const todayButtonWidth = 60; // Approximate width for "Today" button
      const extraMargin = 24; // Safety margin
      
      const availableWidth = windowWidth - (navButtonWidth * 2) - containerPadding - monthNameWidth - todayButtonWidth - extraMargin;
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

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await dispatch(cancelAppointment({ id: appointmentId, cancellationReason: 'Deleted by user' })).unwrap();
        showSuccessToast('Appointment Deleted Successfully', 'The appointment has been deleted successfully.');
        dispatch(fetchAppointments({}));
      } catch (error: any) {
        handleApiError(error, 'delete appointment');
      }
    }
  };

  const handleInlineStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      // Update local state immediately for instant UI feedback
      setLocalAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment._id === appointmentId 
            ? { ...appointment, status: newStatus as any }
            : appointment
        )
      );
      
      // Show success message and close edit mode immediately
      showSuccessToast('Status Updated', 'Appointment status has been updated successfully.');
      setEditingAppointmentId(null);
      
      // Make the API call in the background
      await dispatch(updateAppointment({ id: appointmentId, appointmentData: { status: newStatus } })).unwrap();
      
    } catch (error: any) {
      // If API call fails, revert local state and refetch data
      dispatch(fetchAppointments({}));
      handleApiError(error, 'update appointment status');
      setEditingAppointmentId(null);
    }
  };

  const handleCancelConfirmation = (appointmentId: string) => {
    setConfirmationModal({
      isOpen: true,
      appointmentId,
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment? This action cannot be undone.'
    });
  };

  const handleConfirmCancel = async () => {
    if (confirmationModal.appointmentId) {
      // Close modal immediately
      setConfirmationModal({ isOpen: false, appointmentId: null, title: '', message: '' });
      // Then handle the status change
      await handleInlineStatusChange(confirmationModal.appointmentId, 'cancelled');
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmationModal({ isOpen: false, appointmentId: null, title: '', message: '' });
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

  // Use local appointments for instant updates, fallback to Redux data
  const currentAppointments = localAppointments.length > 0 ? localAppointments : (receptionistAppointments.length > 0 ? receptionistAppointments : appointments);
  const currentDoctors = receptionistDoctors.length > 0 ? receptionistDoctors : doctors;
  const currentPatients = receptionistPatients.length > 0 ? receptionistPatients : patients;

  const filteredAppointments = currentAppointments.filter((appointment) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Patient information search
    const patientMatches = isPatientObject(appointment.patientId) && (
      (appointment.patientId.name || `${appointment.patientId.firstName || ''} ${appointment.patientId.lastName || ''}`).toLowerCase().includes(searchLower) ||
      appointment.patientId.email.toLowerCase().includes(searchLower) ||
      appointment.patientId.phone.toLowerCase().includes(searchLower)
    );
    
    // Doctor information search
    const doctorMatches = appointment.doctorId && isDoctorObject(appointment.doctorId) && (
      appointment.doctorId.firstName.toLowerCase().includes(searchLower) ||
      appointment.doctorId.lastName.toLowerCase().includes(searchLower) ||
      `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`.toLowerCase().includes(searchLower)
    );
    
    // Other search fields
    const otherMatches = appointment.reasonForVisit.toLowerCase().includes(searchLower);
    
    const matchesSearch = patientMatches || doctorMatches || otherMatches;
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const appointmentDate = new Date(appointment.appointmentDate);
    
    // Date filtering logic
    let matchesDateFilter = true;
    
    if (dateFilter === 'custom' && selectedDate) {
      // Custom date selection - show appointments for the selected date only
      matchesDateFilter = isSameDay(appointmentDate, selectedDate);
    } else if (dateFilter === 'time_period' || dateFilter === 'today') {
      // Time period filtering
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      if (timePeriod === 'today') {
        matchesDateFilter = isToday(appointmentDate);
      } else if (timePeriod === 'this_month') {
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        // Ensure we're comparing dates properly by setting time to start/end of day
        const appointmentDateStart = startOfDay(appointmentDate);
        const monthStartDay = startOfDay(monthStart);
        const monthEndDay = endOfDay(monthEnd);
        matchesDateFilter = appointmentDateStart >= monthStartDay && appointmentDateStart <= monthEndDay;
      } else if (timePeriod === 'next_month') {
        const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
        const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0);
        const appointmentDateStart = startOfDay(appointmentDate);
        const nextMonthStartDay = startOfDay(nextMonthStart);
        const nextMonthEndDay = endOfDay(nextMonthEnd);
        matchesDateFilter = appointmentDateStart >= nextMonthStartDay && appointmentDateStart <= nextMonthEndDay;
      } else if (timePeriod === 'previous_month') {
        const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const prevMonthEnd = new Date(currentYear, currentMonth, 0);
        const appointmentDateStart = startOfDay(appointmentDate);
        const prevMonthStartDay = startOfDay(prevMonthStart);
        const prevMonthEndDay = endOfDay(prevMonthEnd);
        matchesDateFilter = appointmentDateStart >= prevMonthStartDay && appointmentDateStart <= prevMonthEndDay;
      } else if (timePeriod === 'this_year') {
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        const appointmentDateStart = startOfDay(appointmentDate);
        const yearStartDay = startOfDay(yearStart);
        const yearEndDay = endOfDay(yearEnd);
        matchesDateFilter = appointmentDateStart >= yearStartDay && appointmentDateStart <= yearEndDay;
      }
    }

    return matchesSearch && matchesStatus && matchesDateFilter;
  });

  const getDateLabel = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return 'Today';
    if (isTomorrow(appointmentDate)) return 'Tomorrow';
    if (isYesterday(appointmentDate)) return 'Yesterday';
    return format(appointmentDate, 'MMM dd, yyyy');
  };

  const getTimeLabel = (startTime: string, endTime: string) => {
    return startTime;
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
      // Fallback for old statuses that might still exist in data
      case 'no_show':
        return <AlertCircle className="h-4 w-4" />;
      case 'walk_in':
        return <User className="h-4 w-4" />;
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
    // Don't change timePeriod - keep it independent
    
    // Update current month to the month of the selected date
    setCurrentMonth(date);
    
    // Center the selected date in the visible row
    // Use the same logic as getHorizontalCalendarDays to get the extended day range
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const nextMonthStart = startOfMonth(addMonths(date, 1));
    
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

  const handleResetToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setDateFilter('time_period');
    setTimePeriod('today');
    
    // Center today in the calendar
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
      const dynamicDayCount = getDynamicDayCount();
      const centerOffset = Math.max(0, todayIndex - Math.floor(dynamicDayCount / 2));
      setDayOffset(centerOffset);
    }
  };

  const handleMonthSelect = (month: number, year: number) => {
    const newDate = new Date(year, month, 1);
    setCurrentMonth(newDate);
    setDayOffset(0); // Reset day offset when changing months
    setIsMonthPickerOpen(false);
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
    const monthNameWidth = 120; // Approximate width for month name
    const todayButtonWidth = 60; // Approximate width for "Today" button
    const extraMargin = 24; // Additional margin for safety
    
    // Calculate available width for day buttons
    const availableWidth = windowWidth - (navButtonWidth * 2) - containerPadding - monthNameWidth - todayButtonWidth - extraMargin;
    
    // Calculate how many day buttons can fit
    const daysPerRow = Math.floor(availableWidth / (buttonWidth + gapWidth));
    
    // Ensure we show between 7 and 25 days (increased max since buttons are smaller)
    const dynamicCount = Math.max(7, Math.min(daysPerRow, 25));
    
    return dynamicCount;
  }, [windowWidth]);


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
      const todayMonth = today.getMonth();
      
      if (timePeriod === 'today') {
        return isToday(appointmentDate);
      } else if (timePeriod === 'this_month') {
        // Always use today's month for "This Month" filter
        const monthStart = new Date(currentYear, todayMonth, 1);
        const monthEnd = new Date(currentYear, todayMonth + 1, 0);
        return appointmentDate >= monthStart && appointmentDate <= monthEnd;
      } else if (timePeriod === 'next_month') {
        const nextMonthStart = new Date(currentYear, todayMonth + 1, 1);
        const nextMonthEnd = new Date(currentYear, todayMonth + 2, 0);
        return appointmentDate >= nextMonthStart && appointmentDate <= nextMonthEnd;
      } else if (timePeriod === 'previous_month') {
        const prevMonthStart = new Date(currentYear, todayMonth - 1, 1);
        const prevMonthEnd = new Date(currentYear, todayMonth, 0);
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
      completed: periodAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: periodAppointments.filter(apt => apt.status === 'cancelled').length,
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
                placeholder="Search by patient, doctor, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200"
              />
            </div>


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

      {/* Combined Stats and Calendar Card */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        {/* Stats Section */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
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
                onChange={(e) => {
                  setTimePeriod(e.target.value);
                  setDateFilter('time_period'); // Reset to time period filtering
                }}
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
        </div>

        {/* Calendar Section */}
        <div className="p-4">
          <div className="w-full overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 rounded-md p-1.5 border border-gray-100">
          <div className="flex items-center gap-0.5">
            {/* Month Name - Clickable */}
            <button
              onClick={() => setIsMonthPickerOpen(true)}
              className="flex-shrink-0 mr-2 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Select month and year"
            >
              {getHorizontalCalendarDays().length > 0 ? format(getHorizontalCalendarDays()[0], 'MMMM yyyy') : ''}
            </button>
            
            {/* Reset to Today Button */}
            <button
              onClick={handleResetToToday}
              className="flex-shrink-0 px-2 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md transition-colors mr-2"
              title="Reset to today"
            >
              Today
            </button>
            
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
                      ${isTodayDate 
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                        : isSelected 
                          ? 'bg-blue-600 text-white' 
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
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

      {/* Appointments Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-900">Appointments List</h3>
              <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                {filteredAppointments.length} appointments
              </span>
            </div>
            <button className="p-0.5 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-4 text-center">
            <Calendar className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <h3 className="text-xs font-medium text-gray-900 mb-1">No appointments found</h3>
            <p className="text-xs text-gray-500 mb-2">
              {searchTerm || statusFilter !== 'all' || timePeriod !== 'today'
                ? 'Try adjusting your filters to see more appointments.'
                : 'Get started by creating your first appointment.'}
            </p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors flex items-center gap-1 mx-auto"
            >
              <Plus className="h-3 w-3" />
              Create Appointment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Patient Name
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Phone
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Date
                    <ChevronDown className="inline h-2.5 w-2.5 ml-1" />
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Time
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Doctor
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Status
                    <ChevronDown className="inline h-2.5 w-2.5 ml-1" />
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Type
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                    {/* Patient Name */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">
                          {isPatientObject(appointment.patientId) ? (appointment.patientId.name || `${appointment.patientId.firstName || ''} ${appointment.patientId.lastName || ''}`).trim() : 'Unknown Patient'}
                      </div>
                          <div className="text-xs text-gray-500">
                            {isPatientObject(appointment.patientId) ? appointment.patientId.email : 'N/A'}
                    </div>
                      </div>
                      </div>
                    </td>
                    
                    {/* Phone Number */}
                    <td className="px-2 py-2">
                      <span className="text-xs text-gray-900">
                        {isPatientObject(appointment.patientId) ? appointment.patientId.phone : 'N/A'}
                          </span>
                    </td>
                    
                    {/* Date */}
                    <td className="px-2 py-2">
                      <span className="text-xs text-gray-900">{getDateLabel(appointment.appointmentDate)}</span>
                    </td>
                    
                    {/* Time */}
                    <td className="px-2 py-2">
                      <span className="text-xs text-gray-900">{getTimeLabel(appointment.startTime, appointment.endTime)}</span>
                    </td>
                    
                    {/* Doctor */}
                    <td className="px-2 py-2">
                      <span className="text-xs text-gray-900 truncate block">
                        {appointment.doctorId && isDoctorObject(appointment.doctorId) 
                          ? `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}` 
                          : 'No Doctor'}
                      </span>
                    </td>
                    
                    {/* Status */}
                    <td className="px-2 py-2">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-full ${statusColors[appointment.status]}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    
                    {/* Visit Type */}
                    <td className="px-2 py-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full ${visitTypeColors[appointment.visitType]}`}>
                        {appointment.visitType.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-2 py-2 w-32">
                      <div className="flex items-center gap-1">
                        {editingAppointmentId === appointment._id ? (
                          <div className="flex gap-1">
                            {/* Status Change Buttons */}
                            <div className="flex flex-col gap-1">
                              {appointment.status === 'scheduled' && (
                                <button
                                  onClick={() => handleInlineStatusChange(appointment._id, 'in_progress')}
                                  className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors rounded"
                                  title="Start appointment"
                                >
                                  Start
                                </button>
                              )}
                              {appointment.status === 'in_progress' && (
                                <button
                                  onClick={() => handleInlineStatusChange(appointment._id, 'completed')}
                                  className="px-2 py-1 text-xs bg-green-100 text-green-800 hover:bg-green-200 transition-colors rounded"
                                  title="Set to Completed"
                                >
                                  Completed
                                </button>
                              )}
                              {appointment.status === 'cancelled' && (
                                <>
                                  <button
                                    onClick={() => handleInlineStatusChange(appointment._id, 'scheduled')}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors rounded"
                                    title="Reschedule appointment"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() => handleInlineStatusChange(appointment._id, 'completed')}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-800 hover:bg-green-200 transition-colors rounded"
                                    title="Mark as completed"
                                  >
                                    Completed
                                  </button>
                                </>
                              )}
                              {appointment.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleCancelConfirmation(appointment._id)}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-800 hover:bg-red-200 transition-colors rounded"
                                  title="Set to Cancelled"
                                >
                                  Cancelled
                                </button>
                              )}
                            </div>
                            {/* Cancel Edit Button */}
                            <button
                              onClick={() => setEditingAppointmentId(null)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded self-center"
                              title="Cancel edit"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {/* Edit Button - Always show for all statuses */}
                            <button
                              onClick={() => setEditingAppointmentId(appointment._id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
                              title="Edit status"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            
                            {/* Only show delete button for non-receptionist users */}
                            {user?.role !== 'receptionist' && (
                              <button
                                onClick={() => handleDeleteAppointment(appointment._id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded"
                                title="Delete appointment"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                  </div>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmCancel}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Cancel Appointment"
        cancelText="Keep Appointment"
        type="danger"
      />

      {/* Month Picker Modal */}
      {isMonthPickerOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Month & Year</h3>
              <button
                onClick={() => setIsMonthPickerOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Month Picker */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleMonthSelect(i, currentMonth.getFullYear())}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      i === currentMonth.getMonth()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {format(new Date(2024, i, 1), 'MMM')}
                  </button>
                ))}
              </div>

              {/* Year Picker */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 12))}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>
                <span className="text-lg font-medium text-gray-900">
                  {currentMonth.getFullYear()}
                </span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 12))}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setIsMonthPickerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsMonthPickerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
