import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch } from '../lib/store/store';
import { RootState } from '../lib/store/store';
import { fetchAppointments, createAppointment, updateAppointment, cancelAppointment, clearAppointmentErrors } from '../lib/store/slices/appointmentsSlice';
import { fetchPatients } from '../lib/store/slices/patientsSlice';
import { fetchDoctors } from '../lib/store/slices/doctorsSlice';
import { refreshReceptionistData } from '../lib/store/slices/receptionistDataSlice';
import { useSidebar } from '../contexts/SidebarContext';
import { appointmentsApi } from '../lib/api/services/appointments';
import { doctorService } from '../lib/api/services/doctors';
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
  ChevronUp,
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
const isPatientObject = (patientId: string | { _id: string; name: string; firstName?: string; lastName?: string; email: string; phone: string }): patientId is { _id: string; name: string; firstName?: string; lastName?: string; email: string; phone: string } => {
  return typeof patientId === 'object' && patientId !== null;
};

const isDoctorObject = (doctorId: string | { _id: string; firstName: string; lastName: string; specialization: string } | undefined): doctorId is { _id: string; firstName: string; lastName: string; specialization: string } => {
  return typeof doctorId === 'object' && doctorId !== null;
};

interface Appointment {
  _id: string;
  patientId: string | {
    _id: string;
    name: string;
    firstName?: string; // For backward compatibility
    lastName?: string; // For backward compatibility
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
  const { isCollapsed: sidebarIsCollapsed } = useSidebar();
  
  // Dynamic UI based on sidebar state - syncs with SidebarContext
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(sidebarIsCollapsed);
  
  // Table sorting state with default sorting
  const [sortField, setSortField] = useState<keyof Appointment | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Doctor filter state - no "all" option, must select specific doctor
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  
  // Default sorting function for appointments
  const getDefaultSortValue = (appointment: any) => {
    const date = new Date(appointment.appointmentDate);
    const time = appointment.startTime;
    
    // Status priority: in_progress (1), scheduled (2), cancelled (3), completed (4), no_show (5)
    const statusPriority: Record<string, number> = {
      'in_progress': 1,
      'scheduled': 2,
      'cancelled': 3,
      'completed': 4,
      'no_show': 5
    };
    const status = statusPriority[appointment.status] || 6;
    
    // Convert time to sortable format (minutes since midnight)
    const [hours, minutes] = time.split(':');
    const timeInMinutes = parseInt(hours) * 60 + parseInt(minutes);
    
    // Return a sortable value: date + time + status priority
    return {
      date: date.getTime(),
      time: timeInMinutes,
      status: status
    };
  };
  
  // Sync with sidebar context changes for responsive UI
  useEffect(() => {
    setIsSidebarCollapsed(sidebarIsCollapsed);
  }, [sidebarIsCollapsed]);
  
  // Handle table sorting
  const handleSort = (field: keyof Appointment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Reset to default sorting
  const resetToDefaultSort = () => {
    setSortField(null);
    setSortDirection('asc');
  };
  
  // Helper function to render sort icon
  const renderSortIcon = (field: keyof Appointment) => {
    if (sortField !== field) {
      // Show default sort indicator for date field when no manual sort is active
      if (field === 'appointmentDate' && !sortField) {
        return <ChevronDown className="inline h-2 w-2 ml-1 text-blue-500 opacity-75" />;
      }
      return <ChevronDown className="inline h-2 w-2 ml-1 text-gray-400 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="inline h-2 w-2 ml-1 text-blue-600" />
      : <ChevronDown className="inline h-2 w-2 ml-1 text-blue-600" />;
  };
  
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
    appointmentData?: any;
    availableSlots?: Array<{ startTime: string; endTime: string; isAvailable: boolean; isPast?: boolean; isOutsideWorkingHours?: boolean; isAvailableDueToActiveDoctor?: boolean }>;
    selectedSlot?: string;
    isCheckingSlots?: boolean;
    slotError?: string;
    selectedDoctorId?: string;
    selectedDate?: string;
  }>({
    isOpen: false,
    appointmentId: null,
    title: '',
    message: '',
    appointmentData: null,
    availableSlots: [],
    selectedSlot: '',
    isCheckingSlots: false,
    slotError: '',
    selectedDoctorId: '',
    selectedDate: ''
  });
  
  const [doctorAssignmentModal, setDoctorAssignmentModal] = useState<{
    isOpen: boolean;
    appointmentId: string | null;
    appointmentData: any | null;
    selectedDoctorId: string;
  }>({
    isOpen: false,
    appointmentId: null,
    appointmentData: null,
    selectedDoctorId: '',
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

  // Clear all active doctors on dashboard load
  const clearAllActiveDoctorsOnLoad = async () => {
    try {
      const branchId = typeof branch === 'string' ? branch : (branch as any)?._id || (branch as any)?.id;
      if (!branchId) return;

      console.log('🔄 Clearing all active doctors on dashboard load');
      await doctorService.deactivateAllDoctorsInBranch(branchId);
      console.log('✅ All doctors deactivated on dashboard load');
    } catch (error: any) {
      console.error('❌ Error clearing active doctors on load:', error);
      // Don't show error toast for this background operation
    }
  };

  // Use pre-loaded receptionist data instead of fetching on mount
  useEffect(() => {
    // Only fetch if receptionist data is not available
    if (!receptionistDoctors.length && !isInitializing && !initializationError) {
      console.log('🔄 Receptionist data not available, fetching...');
    dispatch(fetchAppointments({}));
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
    }

    // Clear all active doctors on dashboard load (every time component mounts)
    clearAllActiveDoctorsOnLoad();
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

    // Initial check
    handleResize();

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
      const buttonWidth = isSidebarCollapsed ? 32 : 28; // Dynamic based on sidebar state
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
      const buttonWidth = isSidebarCollapsed ? 32 : 28; // Dynamic based on sidebar state
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
      const appointment = currentAppointments.find(apt => apt._id === appointmentId);
      if (!appointment) return;

      // Check if starting appointment and needs doctor assignment
      if (newStatus === 'in_progress' && needsDoctorAssignment(appointment)) {
        console.log('🔍 Opening doctor assignment modal with appointment data:', appointment);
        console.log('🔍 Patient data:', appointment.patientId);
        console.log('🔍 Patient data type:', typeof appointment.patientId);
        
        setDoctorAssignmentModal({
          isOpen: true,
          appointmentId: appointmentId,
          appointmentData: appointment,
          selectedDoctorId: selectedDoctor || ''
        });
        return;
      }

      // Check if rescheduling appointment (cancelled -> scheduled)
      if (newStatus === 'scheduled' && appointment.status === 'cancelled') {
        const formattedDate = new Date(appointment.appointmentDate).toISOString().split('T')[0];
        
        setConfirmationModal({
          isOpen: true,
          appointmentId: appointmentId,
          title: 'Reschedule Appointment',
          message: 'Are you sure you want to reschedule this cancelled appointment? This will make the appointment active again.',
          appointmentData: appointment,
          availableSlots: [],
          selectedSlot: '',
          isCheckingSlots: false,
          slotError: '',
          selectedDoctorId: selectedDoctor || '',
          selectedDate: formattedDate
        });
        
        // Check slot availability
        checkSlotAvailability(appointment);
        return;
      }

      // Update local state immediately for instant UI feedback
      setLocalAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment._id === appointmentId 
            ? { ...appointment, status: newStatus as any }
            : appointment
        )
      );
      
      
      // Show success message and close edit mode immediately
      const statusMessage = newStatus === 'cancelled' 
        ? 'Appointment cancelled successfully! Time slot is now available for new appointments.'
        : newStatus === 'in_progress'
        ? 'Appointment started successfully! Time slot remains occupied until completion.'
        : newStatus === 'completed'
        ? 'Appointment completed successfully! Time slot is now available for new appointments.'
        : 'Appointment status has been updated successfully.';
      showSuccessToast('Status Updated', statusMessage);
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
      setConfirmationModal({ 
        isOpen: false, 
        appointmentId: null, 
        title: '', 
        message: '', 
        appointmentData: null,
        availableSlots: [],
        selectedSlot: '',
        isCheckingSlots: false,
        slotError: ''
      });
      
      // Determine the action based on modal title
      if (confirmationModal.title === 'Reschedule Appointment') {
        // Handle rescheduling (cancelled -> scheduled)
        const newStartTime = confirmationModal.selectedSlot && confirmationModal.selectedSlot !== confirmationModal.appointmentData?.startTime 
          ? confirmationModal.selectedSlot 
          : undefined;
        
        const newDoctorId = confirmationModal.selectedDoctorId && confirmationModal.selectedDoctorId !== confirmationModal.appointmentData?.doctorId?._id
          ? confirmationModal.selectedDoctorId
          : undefined;
        
        const newDate = confirmationModal.selectedDate && confirmationModal.selectedDate !== new Date(confirmationModal.appointmentData?.appointmentDate).toISOString().split('T')[0]
          ? confirmationModal.selectedDate
          : undefined;
        
        await handleRescheduleAppointment(confirmationModal.appointmentId, newStartTime, newDoctorId, newDate);
      } else {
        // Handle cancellation (any status -> cancelled)
      await handleInlineStatusChange(confirmationModal.appointmentId, 'cancelled');
      }
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmationModal({ 
      isOpen: false, 
      appointmentId: null, 
      title: '', 
      message: '', 
      appointmentData: null,
      availableSlots: [],
      selectedSlot: '',
      isCheckingSlots: false,
      slotError: '',
      selectedDoctorId: '',
      selectedDate: ''
    });
  };

  // Handle undo start appointment (revert in-progress back to scheduled)
  const handleUndoStart = async (appointmentId: string) => {
    try {
      console.log('🔄 Undoing appointment start:', appointmentId);
      
      // Update local state immediately
      setLocalAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, status: 'scheduled' as any }
            : apt
        )
      );
      
      // Show success message
      showSuccessToast('Appointment Reverted', 'Appointment has been reverted to scheduled status');
      
      // Make API call in background
      await dispatch(updateAppointment({ 
        id: appointmentId, 
        appointmentData: { status: 'scheduled' } 
      })).unwrap();
      
      console.log('✅ Undo start completed successfully');
    } catch (error: any) {
      console.error('❌ Error undoing appointment start:', error);
      handleApiError(error, 'undo appointment start');
      
      // Revert local state if API fails
      dispatch(fetchAppointments({}));
    }
  };




  const handleRescheduleAppointment = async (appointmentId: string, newStartTime?: string, newDoctorId?: string, newDate?: string) => {
    try {
      const appointmentData: any = { status: 'scheduled', isReschedule: true };
      
      if (newStartTime) {
        appointmentData.startTime = newStartTime;
      }
      
      if (newDoctorId) {
        appointmentData.doctorId = newDoctorId;
      }
      
      if (newDate) {
        appointmentData.appointmentDate = newDate;
      }
      
      console.log('🔄 Rescheduling appointment with data:', appointmentData);
      
      // Update local state immediately for instant UI feedback
        setLocalAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment._id === appointmentId 
              ? { 
                  ...appointment, 
                  status: 'scheduled' as any, 
                  ...(newStartTime && { startTime: newStartTime }),
                  ...(newDoctorId && { doctorId: newDoctorId }),
                  ...(newDate && { appointmentDate: newDate })
                }
              : appointment
          )
        );
      
      // Show success message and close edit mode immediately
      let successMessage = 'Appointment has been rescheduled successfully!';
      if (newDate && newStartTime && newDoctorId) {
        const doctor = currentDoctors.find(d => d._id === newDoctorId);
        successMessage = `Appointment rescheduled successfully to ${format(new Date(newDate), 'MMM dd, yyyy')} at ${getTimeLabel(newStartTime, '')} with ${doctor?.firstName || 'selected doctor'}!`;
      } else if (newDate && newStartTime) {
        successMessage = `Appointment rescheduled successfully to ${format(new Date(newDate), 'MMM dd, yyyy')} at ${getTimeLabel(newStartTime, '')}!`;
      } else if (newDate && newDoctorId) {
        const doctor = currentDoctors.find(d => d._id === newDoctorId);
        successMessage = `Appointment rescheduled successfully to ${format(new Date(newDate), 'MMM dd, yyyy')} with ${doctor?.firstName || 'selected doctor'}!`;
      } else if (newStartTime && newDoctorId) {
        const doctor = currentDoctors.find(d => d._id === newDoctorId);
        successMessage = `Appointment rescheduled successfully to ${getTimeLabel(newStartTime, '')} with ${doctor?.firstName || 'selected doctor'}!`;
      } else if (newStartTime) {
        successMessage = `Appointment rescheduled successfully to ${getTimeLabel(newStartTime, '')}!`;
      } else if (newDoctorId) {
        const doctor = currentDoctors.find(d => d._id === newDoctorId);
        successMessage = `Appointment rescheduled successfully with ${doctor?.firstName || 'selected doctor'}!`;
      } else if (newDate) {
        successMessage = `Appointment rescheduled successfully to ${format(new Date(newDate), 'MMM dd, yyyy')}!`;
      }
      showSuccessToast('Appointment Rescheduled', successMessage);
      setEditingAppointmentId(null);
      
      // Make the API call in the background
      await dispatch(updateAppointment({ id: appointmentId, appointmentData })).unwrap();
      
    } catch (error: any) {
      // If API call fails, revert local state and refetch data
      dispatch(fetchAppointments({}));
      handleApiError(error, 'reschedule appointment');
      setEditingAppointmentId(null);
    }
  };

  const checkSlotAvailability = async (appointmentData: any) => {
    try {
      console.log('🔍 Checking slot availability for:', appointmentData);
      setConfirmationModal(prev => ({ ...prev, isCheckingSlots: true, slotError: '' }));
      
      // Check if original slot is still available
      // Use selected doctor or fallback to appointment's doctor
      const doctorId = confirmationModal.selectedDoctorId || appointmentData.doctorId?._id || appointmentData.doctorId;
      const patientId = appointmentData.patientId._id || appointmentData.patientId;
      
      console.log('🔍 Validation data:', {
        doctorId,
        appointmentDate: appointmentData.appointmentDate,
        appointmentDateType: typeof appointmentData.appointmentDate,
        appointmentDateValue: new Date(appointmentData.appointmentDate),
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        patientId,
        excludeAppointmentId: appointmentData._id
      });

      // Ensure date is in correct format for API
      const formattedDate = new Date(appointmentData.appointmentDate).toISOString().split('T')[0];
      
      const validationPayload = {
        doctorId,
        appointmentDate: formattedDate,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        patientId,
        excludeAppointmentId: appointmentData._id,
        isReschedule: true // Add flag to indicate this is a reschedule operation
      };
      
      console.log('🔍 Sending validation payload:', validationPayload);
      
      const originalSlotValidation = await appointmentsApi.validateSlot(validationPayload as any);

      console.log('🔍 Original slot validation result:', originalSlotValidation);
      console.log('🔍 Validation success:', originalSlotValidation.success);
      console.log('🔍 Validation data:', originalSlotValidation.data);
      console.log('🔍 Is available:', originalSlotValidation.data?.available);

      if (originalSlotValidation.success && originalSlotValidation.data?.available) {
        // Check if slot is in the past
        const now = new Date();
        const appointmentDateObj = new Date(appointmentData.appointmentDate);
        const [hours, minutes] = appointmentData.startTime.split(':').map(Number);
        const slotDateTime = new Date(appointmentDateObj);
        slotDateTime.setHours(hours, minutes, 0, 0);
        
        const isPast = slotDateTime < now;
        
        if (isPast) {
          console.log('⚠️ Original slot is in the past, treating as unavailable');
          // Slot is in the past, continue to load alternatives
        } else {
          // Original slot is available and not in the past
          console.log('✅ Original slot is still available and not in the past');
          setConfirmationModal(prev => ({ 
            ...prev, 
            isCheckingSlots: false, 
            availableSlots: [],
            selectedSlot: appointmentData.startTime
          }));
          return;
        }
      }

      console.log('⚠️ Original slot validation failed or slot not available');
      console.log('🔍 Validation response details:', {
        success: originalSlotValidation.success,
        available: originalSlotValidation.data?.available,
        message: originalSlotValidation.message || 'No message',
        error: originalSlotValidation.error || 'No error'
      });

      // Original slot not available, get alternative slots
      console.log('⚠️ Original slot not available, getting alternatives...');
      console.log('🔍 Getting slots for:', {
        date: appointmentData.appointmentDate,
        doctorId: doctorId,
        dateType: typeof appointmentData.appointmentDate,
        dateISO: new Date(appointmentData.appointmentDate).toISOString(),
        dateLocal: new Date(appointmentData.appointmentDate).toLocaleDateString(),
        formattedDate: formattedDate
      });
      
      const availableSlotsResponse = await appointmentsApi.getAvailableSlots(
        formattedDate,
        doctorId
      );

      console.log('🔍 Available slots response:', availableSlotsResponse);
      console.log('🔍 Available slots response type:', typeof availableSlotsResponse);
      console.log('🔍 Available slots response length:', availableSlotsResponse?.length);

      // Log each slot to see the structure
      if (availableSlotsResponse && Array.isArray(availableSlotsResponse)) {
        console.log(`🔍 Total slots returned: ${availableSlotsResponse.length}`);
        let availableCount = 0;
        let unavailableCount = 0;
        
        availableSlotsResponse.forEach((slot: any, index: number) => {
          console.log(`🔍 Slot ${index}:`, {
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable,
            doctorId: slot.doctorId,
            doctorName: slot.doctorName
          });
          
          if (slot.isAvailable === true) {
            availableCount++;
          } else {
            unavailableCount++;
          }
        });
        
        console.log(`🔍 Summary: ${availableCount} available, ${unavailableCount} unavailable`);
      }

      // Show ALL slots (both available and unavailable) with their availability status
      // Also check if slot is in the past
      const now = new Date();
      const appointmentDateObj = new Date(appointmentData.appointmentDate);
      const isToday = appointmentDateObj.toDateString() === now.toDateString();
      
      // Get selected doctor for working hours validation
      const selectedDoctor = currentDoctors.find(d => d._id === confirmationModal.selectedDoctorId);
      
        const allSlotsWithAvailability = (availableSlotsResponse || []).map((slot: any) => {
          let isPast = false;
          let isOutsideWorkingHours = false;
          let isAvailableDueToActiveDoctor = false;
          
          // Check if slot is in the past (only for today's appointments)
          if (isToday) {
            const [hours, minutes] = slot.startTime.split(':').map(Number);
            const slotDateTime = new Date();
            slotDateTime.setHours(hours, minutes, 0, 0);
            isPast = slotDateTime < now;
          }
          
          // Check if slot is within doctor's working hours
          if (selectedDoctor && confirmationModal.selectedDate) {
            const withinWorkingHours = isSlotWithinWorkingHours(slot.startTime, selectedDoctor, confirmationModal.selectedDate);
            isOutsideWorkingHours = !withinWorkingHours;
            
            // If slot would be outside working hours but doctor is currently active, mark it as available due to active doctor
            if (isOutsideWorkingHours && (selectedDoctor as any).isCurrentlyActiveInBranch && slot.isAvailable && !isPast) {
              isAvailableDueToActiveDoctor = true;
              isOutsideWorkingHours = false; // Override the working hours check
            }
          }
          
          return {
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable && !isPast && !isOutsideWorkingHours, // Mark as unavailable if in the past or outside working hours
            isPast: isPast,
            isOutsideWorkingHours: isOutsideWorkingHours,
            isAvailableDueToActiveDoctor: isAvailableDueToActiveDoctor
          };
        });

      console.log('🔍 All slots with availability:', allSlotsWithAvailability);
      console.log('🔍 Total slots:', allSlotsWithAvailability.length);
      console.log('🔍 Available slots:', allSlotsWithAvailability.filter(s => s.isAvailable).length);
      console.log('🔍 Unavailable slots:', allSlotsWithAvailability.filter(s => !s.isAvailable).length);
      console.log('🔍 Past slots:', allSlotsWithAvailability.filter(s => s.isPast).length);

      // Select first available slot by default
      const firstAvailableSlot = allSlotsWithAvailability.find(s => s.isAvailable);

      setConfirmationModal(prev => ({ 
        ...prev, 
        isCheckingSlots: false, 
        availableSlots: allSlotsWithAvailability, // Store all slots with availability info
        selectedSlot: firstAvailableSlot?.startTime || '',
        slotError: !firstAvailableSlot ? 'No available slots found for this date' : ''
      }));

    } catch (error) {
      console.error('❌ Error checking slot availability:', error);
      setConfirmationModal(prev => ({ 
        ...prev, 
        isCheckingSlots: false, 
        slotError: 'Failed to check slot availability'
      }));
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

  // Use local appointments for instant updates, fallback to Redux data
  const currentAppointments = localAppointments.length > 0 ? localAppointments : (receptionistAppointments.length > 0 ? receptionistAppointments : appointments);
  const currentDoctors = receptionistDoctors.length > 0 ? receptionistDoctors : doctors;
  const currentPatients = receptionistPatients.length > 0 ? receptionistPatients : patients;

  // Auto-select doctor with data on component mount
  useEffect(() => {
    // Check if doctor is already selected in session
    const savedDoctor = localStorage.getItem('selectedDoctor');
    
    if (savedDoctor && currentDoctors.some(doctor => doctor._id === savedDoctor)) {
      setSelectedDoctor(savedDoctor);
    }
    // No auto-selection - user must manually select a doctor
  }, [currentDoctors, currentAppointments]);
  
  // Save doctor selection to session and auto-activate the selected doctor
  const handleDoctorChange = async (doctorId: string) => {
    setSelectedDoctor(doctorId);
    
    const branchId = typeof branch === 'string' ? branch : (branch as any)?._id || (branch as any)?.id;
    if (!branchId) return;

    if (doctorId === '') {
      localStorage.removeItem('selectedDoctor');
      
      // When "Select Doctor" is chosen, deactivate all doctors
      try {
        const currentlyActiveDoctors = currentDoctors.filter(d => (d as any).isCurrentlyActiveInBranch);
        
        if (currentlyActiveDoctors.length > 0) {
          console.log(`🔄 Deactivating all doctors - user selected "Select Doctor"`);
          await doctorService.deactivateAllDoctorsInBranch(branchId);
          showSuccessToast('All Doctors Deactivated', 'No doctor is currently active in the branch');
          
          // Refresh the doctors data to update the UI
          if (user?.role === 'receptionist') {
            await dispatch(refreshReceptionistData('doctors'));
          } else {
            await dispatch(fetchDoctors());
          }
        }
      } catch (error: any) {
        console.error('❌ Error deactivating all doctors:', error);
        handleApiError(error, 'deactivate doctors');
      }
      
      return;
    } else {
      localStorage.setItem('selectedDoctor', doctorId);
    }

    // Auto-activate the selected doctor and deactivate others
    try {
      console.log(`🔄 Auto-activating doctor ${doctorId} in branch ${branchId}`);
      
      // First, deactivate all currently active doctors to ensure only one is active
      const currentlyActiveDoctors = currentDoctors.filter(d => (d as any).isCurrentlyActiveInBranch);
      
      if (currentlyActiveDoctors.length > 0) {
        console.log(`🔄 Deactivating ${currentlyActiveDoctors.length} currently active doctor(s)`);
        await doctorService.deactivateAllDoctorsInBranch(branchId);
      }

      // Then activate the selected doctor (if not already active)
      const selectedDoctorData = currentDoctors.find(d => d._id === doctorId);
      if (selectedDoctorData && !(selectedDoctorData as any).isCurrentlyActiveInBranch) {
        console.log(`🔄 Activating selected doctor: ${doctorId}`);
        await doctorService.setDoctorActiveInBranch(doctorId, branchId);
        showSuccessToast('Doctor Activated', `Dr. ${selectedDoctorData.firstName} ${selectedDoctorData.lastName} is now active in the branch`);
      }

      // Refresh the doctors data to update the UI
      if (user?.role === 'receptionist') {
        await dispatch(refreshReceptionistData('doctors'));
      } else {
        await dispatch(fetchDoctors());
      }

    } catch (error: any) {
      console.error('❌ Error auto-activating doctor:', error);
      handleApiError(error, 'activate doctor');
    }
  };
  
  // Clear doctor selection on logout/session expiry
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedDoctor' && e.newValue === null) {
        setSelectedDoctor('');
      }
    };
    
    const handleBeforeUnload = () => {
      // Optionally clear on page unload
      // localStorage.removeItem('selectedDoctor');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Helper function to check if actions should be disabled
  const isActionDisabled = (appointment?: any) => {
    // Disable if no doctor selected
    if (!selectedDoctor || selectedDoctor === '') {
      return true;
    }
    
    // Disable if appointment is cancelled or completed
    if (appointment && (appointment.status === 'cancelled' || appointment.status === 'completed')) {
      return true;
    }
    
    return false;
  };

  // Helper function to get disabled action tooltip message
  const getDisabledActionTooltip = (appointment?: any) => {
    if (!selectedDoctor || selectedDoctor === '') {
      return "Please select a doctor first";
    }
    
    if (appointment?.status === 'cancelled') {
      return "Cannot edit cancelled appointments";
    }
    
    if (appointment?.status === 'completed') {
      return "Cannot edit completed appointments";
    }
    
    return "Action disabled";
  };
  
  // Helper function to check if appointment needs doctor assignment
  const needsDoctorAssignment = (appointment: any) => {
    if (!selectedDoctor || selectedDoctor === '') return false;
    
    // Check if appointment has no doctor assigned
    if (!appointment.doctorId) return true;
    
    // Check if appointment is assigned to a different doctor
    const appointmentDoctorId = isDoctorObject(appointment.doctorId) 
      ? appointment.doctorId._id 
      : appointment.doctorId;
    
    return appointmentDoctorId !== selectedDoctor;
  };
  
  // Handle doctor assignment for starting appointments
  const handleDoctorAssignment = async (appointmentId: string, doctorId: string) => {
    try {
      const appointment = currentAppointments.find(apt => apt._id === appointmentId);
      if (!appointment || !doctorId) return;
      
      console.log('🔍 Assigning doctor and starting appointment:', {
        appointmentId,
        doctorId,
        currentStatus: appointment.status
      });
      
      // Find the selected doctor data to populate the appointment
      const selectedDoctorData = currentDoctors.find(d => d._id === doctorId);
      
      // Update local state immediately for instant UI feedback (same pattern as handleInlineStatusChange)
      setLocalAppointments(prevAppointments => {
        const updatedAppointments = prevAppointments.map(apt => 
          apt._id === appointmentId 
            ? { 
                ...apt, 
                doctorId: selectedDoctorData ? {
                  _id: selectedDoctorData._id,
                  firstName: selectedDoctorData.firstName,
                  lastName: selectedDoctorData.lastName,
                  specialization: selectedDoctorData.specialization || 'General'
                } : doctorId, // Fallback to string if doctor data not found
                status: 'in_progress' as any 
              }
            : apt
        );
        
        console.log('🔍 Local appointments before update:', prevAppointments.length);
        console.log('🔍 Local appointments after update:', updatedAppointments.length);
        console.log('🔍 Updated appointment:', updatedAppointments.find(apt => apt._id === appointmentId));
        console.log('🔍 Selected doctor data:', selectedDoctorData);
        
        return updatedAppointments;
      });
      
      
      // Show success message and close modal immediately
      showSuccessToast('Doctor Assigned', 'Doctor assigned and appointment started successfully!');
      setDoctorAssignmentModal({ isOpen: false, appointmentId: null, appointmentData: null, selectedDoctorId: '' });
      
      // Make the API call in the background (same pattern as handleInlineStatusChange)
      const updateData = {
        doctorId: doctorId,
        status: 'in_progress'
      };
      
      console.log('🔍 Making background API call with data:', updateData);
      await dispatch(updateAppointment({ 
        id: appointmentId, 
        appointmentData: updateData 
      })).unwrap();
      
      console.log('✅ Background API call completed successfully');
    } catch (error: any) {
      console.error('❌ Error assigning doctor:', error);
      
      // Handle specific error cases
      if (error?.message?.includes('Doctor already has an appointment at this time')) {
        showErrorToast('Conflict', 'This doctor already has an appointment at this time. Please select a different doctor.');
      } else if (error?.message?.includes('Slot not available')) {
        showErrorToast('Unavailable', 'This time slot is no longer available. Please try again.');
      } else {
        showErrorToast('Assignment Failed', 'Failed to assign doctor and start appointment. Please try again.');
      }
      
      // If API call fails, revert local state and refetch data (same pattern as handleInlineStatusChange)
      dispatch(fetchAppointments({}));
    }
  };

  const filteredAppointments = currentAppointments.filter((appointment) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Patient information search
    const patientMatches = isPatientObject(appointment.patientId as any) && (
      ((appointment.patientId as any).name || `${(appointment.patientId as any).firstName || ''} ${(appointment.patientId as any).lastName || ''}`).toLowerCase().includes(searchLower) ||
      (appointment.patientId as any).email.toLowerCase().includes(searchLower) ||
      (appointment.patientId as any).phone.toLowerCase().includes(searchLower)
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
    
    // Doctor selection is for display purposes only - no filtering
    // const matchesDoctor = selectedDoctor && selectedDoctor !== '' && (
    //   (appointment.doctorId && isDoctorObject(appointment.doctorId) && appointment.doctorId._id === selectedDoctor) ||
    //   (appointment.doctorId && !isDoctorObject(appointment.doctorId) && appointment.doctorId === selectedDoctor)
    // );
    
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

    const finalMatch = matchesSearch && matchesStatus && matchesDateFilter;
    
    // Debug filtering for appointments that just got updated
    if (appointment._id === doctorAssignmentModal.appointmentId && doctorAssignmentModal.isOpen) {
      console.log('🔍 Filtering debug for assigned appointment:', {
        appointmentId: appointment._id,
        status: appointment.status,
        appointmentDate: appointment.appointmentDate,
        dateFilter,
        timePeriod,
        matchesSearch,
        matchesStatus,
        matchesDateFilter,
        finalMatch
      });
    }
    
    return finalMatch;
  });

  // Apply sorting to filtered appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    // If no specific field is selected, use default sorting (date → time → status)
    if (!sortField) {
      const aDefault = getDefaultSortValue(a);
      const bDefault = getDefaultSortValue(b);
      
      // First sort by date
      if (aDefault.date !== bDefault.date) {
        return aDefault.date - bDefault.date;
      }
      
      // Then by time
      if (aDefault.time !== bDefault.time) {
        return aDefault.time - bDefault.time;
      }
      
      // Finally by status priority
      return aDefault.status - bDefault.status;
    }

    // Manual sorting by specific field
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'patientId':
        if (isPatientObject(a.patientId as any) && isPatientObject(b.patientId as any)) {
          aValue = (a.patientId as any).name || `${(a.patientId as any).firstName || ''} ${(a.patientId as any).lastName || ''}`;
          bValue = (b.patientId as any).name || `${(b.patientId as any).firstName || ''} ${(b.patientId as any).lastName || ''}`;
        } else {
          aValue = String(a.patientId);
          bValue = String(b.patientId);
        }
        break;
      case 'doctorId':
        if (isDoctorObject(a.doctorId) && isDoctorObject(b.doctorId)) {
          aValue = `${a.doctorId.firstName} ${a.doctorId.lastName}`;
          bValue = `${b.doctorId.firstName} ${b.doctorId.lastName}`;
        } else {
          aValue = a.doctorId ? String(a.doctorId) : '';
          bValue = b.doctorId ? String(b.doctorId) : '';
        }
        break;
      case 'appointmentDate':
        aValue = new Date(a.appointmentDate);
        bValue = new Date(b.appointmentDate);
        break;
      case 'startTime':
        // Convert time to sortable format (minutes since midnight)
        const [aHours, aMinutes] = a.startTime.split(':');
        const [bHours, bMinutes] = b.startTime.split(':');
        aValue = parseInt(aHours) * 60 + parseInt(aMinutes);
        bValue = parseInt(bHours) * 60 + parseInt(bMinutes);
        break;
      case 'status':
        // For status, use the priority order
        const statusPriority = {
          'in_progress': 1,
          'scheduled': 2,
          'cancelled': 3,
          'completed': 4,
          'no_show': 5
        };
        aValue = statusPriority[a.status as keyof typeof statusPriority] || 6;
        bValue = statusPriority[b.status as keyof typeof statusPriority] || 6;
        break;
      case 'visitType':
        aValue = a.visitType;
        bValue = b.visitType;
        break;
      default:
        aValue = a[sortField];
        bValue = b[sortField];
    }

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

    // Compare values
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getDateLabel = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return 'Today';
    if (isTomorrow(appointmentDate)) return 'Tomorrow';
    if (isYesterday(appointmentDate)) return 'Yesterday';
    return format(appointmentDate, 'MMM dd, yyyy');
  };

  const getTimeLabel = (startTime: string, endTime: string) => {
    // Convert 24-hour format to 12-hour AM/PM format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return formatTime(startTime);
  };

  // Helper function to check if a slot is within doctor's working hours
  const isSlotWithinWorkingHours = (slotTime: string, doctor: any, appointmentDate: string) => {
    if (!doctor || !doctor.availability) return true; // If no doctor or availability, allow all slots
    
    // If doctor is currently active in the branch, bypass working hours validation
    if (doctor.isCurrentlyActiveInBranch) {
      console.log('🟢 Doctor is currently active in branch, bypassing working hours for slot:', slotTime);
      return true;
    }
    
    const date = new Date(appointmentDate);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const doctorAvailability = doctor.availability[dayOfWeek];
    
    if (!doctorAvailability || !doctorAvailability.isAvailable) {
      return false; // Doctor not available on this day
    }
    
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const slotMinutes = timeToMinutes(slotTime);
    const doctorStartMinutes = timeToMinutes(doctorAvailability.start);
    const doctorEndMinutes = timeToMinutes(doctorAvailability.end);
    
    return slotMinutes >= doctorStartMinutes && slotMinutes < doctorEndMinutes;
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
    // Dynamic button width based on sidebar state
    const buttonWidth = isSidebarCollapsed ? 32 : 28; // w-8 = 32px when collapsed, w-7 = 28px when expanded
    const gapWidth = 2; // gap-0.5 = 2px
    const navButtonWidth = 20; // w-5 = 20px
    const containerPadding = 12; // p-1.5 = 6px on each side
    const monthNameWidth = 120; // Approximate width for month name
    const todayButtonWidth = 60; // Approximate width for "Today" button
    const extraMargin = 24; // Additional margin for safety
    
    // Calculate available width for day buttons
    const availableWidth = windowWidth - (navButtonWidth * 2) - containerPadding - monthNameWidth - todayButtonWidth - extraMargin;
    
    // Calculate how many day buttons can fit
    const daysPerRow = Math.floor(availableWidth / (buttonWidth + gapWidth));
    
    // Ensure we show between 7 and 25 days
    const dynamicCount = Math.max(7, Math.min(daysPerRow, 25));
    
    return dynamicCount;
  }, [windowWidth, isSidebarCollapsed]);


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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden">
      {/* Compact Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left Side - Page Title */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg flex-shrink-0">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                Appointments
              </h1>
              <p className="text-xs text-gray-600 font-medium truncate">Manage appointments</p>
        </div>
          </div>

          {/* Right Side - Search, Doctor Filter and Add Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Compact Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 sm:w-56 lg:w-64 pl-8 pr-3 py-2 text-sm bg-white/80 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Doctor Filter */}
            <div className="relative">
              <Stethoscope className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <select
                value={selectedDoctor}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-32 sm:w-40 pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 appearance-none cursor-pointer shadow-sm"
                disabled={currentDoctors.length === 0}
              >
                {currentDoctors.length === 0 ? (
                  <option value="">No Doctors Available</option>
                ) : (
                  <>
                    <option value="">Select Doctor</option>
                    {currentDoctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                        {(doctor as any).isCurrentlyActiveInBranch ? ' 🟢' : ''}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Dynamic Add Button */}
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
              <Plus className="h-3.5 w-3.5" />
              <span className={isSidebarCollapsed ? 'inline' : 'hidden sm:inline'}>
                {isSidebarCollapsed ? 'Add Appointment' : 'Add'}
              </span>
          </button>
            </div>
          </div>
        </div>
        
      {/* Main Content - Responsive */}
      <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">

      {/* Enhanced Stats and Calendar Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        {/* Compact Stats Section */}
        <div className="px-3 py-3 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30">
          <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
          <button 
                onClick={() => setStatusFilter('scheduled')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            statusFilter === 'scheduled' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'scheduled' ? 'bg-white' : 'bg-blue-500'}`}></div>
                  <span className="hidden sm:inline">Scheduled ({stats.scheduled})</span>
                  <span className="sm:hidden">Sched ({stats.scheduled})</span>
                </div>
          </button>
        
          <button 
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            statusFilter === 'completed' 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'completed' ? 'bg-white' : 'bg-emerald-500'}`}></div>
                  <span className="hidden sm:inline">Completed ({stats.completed})</span>
                  <span className="sm:hidden">Done ({stats.completed})</span>
                </div>
          </button>
        
        <button 
                onClick={() => setStatusFilter('cancelled')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            statusFilter === 'cancelled' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-red-50 hover:border-red-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'cancelled' ? 'bg-white' : 'bg-red-500'}`}></div>
                  <span className="hidden sm:inline">Cancelled ({stats.cancelled})</span>
                  <span className="sm:hidden">Cancel ({stats.cancelled})</span>
                </div>
        </button>
        
        <button 
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            statusFilter === 'all' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-purple-50 hover:border-purple-200'
          }`}
        >
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'all' ? 'bg-white' : 'bg-purple-500'}`}></div>
          Total ({stats.total})
                </div>
        </button>
        </div>
        
            {/* Compact Time Period Dropdown */}
          <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700">Period:</span>
            <select
              value={timePeriod}
                onChange={(e) => {
                  setTimePeriod(e.target.value);
                  setDateFilter('time_period');
                }}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="today">Today</option>
              <option value="this_month">This Month</option>
                <option value="previous_month">Prev Month</option>
              <option value="next_month">Next Month</option>
              <option value="this_year">This Year</option>
            </select>
        </div>
      </div>
            </div>

        {/* Compact Calendar Section */}
        <div className="p-3">
          <div className="w-full overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-2 border border-gray-200/50 shadow-inner">
            <div className="flex items-center gap-2">
              {/* Calendar Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Month Name - Clickable */}
                <button
                  onClick={() => setIsMonthPickerOpen(true)}
                  className="px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-white/60 rounded-lg transition-all duration-200"
                  title="Select month and year"
                >
                  {getHorizontalCalendarDays().length > 0 ? format(getHorizontalCalendarDays()[0], 'MMM yyyy') : ''}
                </button>
                
                {/* Reset to Today Button */}
                <button
                  onClick={handleResetToToday}
                  className="px-2 py-1 text-xs font-medium bg-white/80 text-gray-700 hover:bg-white hover:text-blue-600 rounded-lg transition-all duration-200"
                  title="Reset to today"
                >
                  Today
                </button>
            </div>
          
              {/* Calendar Navigation and Days */}
              <div className="flex items-center gap-1 flex-1">
            {/* Previous Button */}
              <button
              onClick={handlePrevDays}
                  className="w-6 h-6 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-md transition-all duration-200 flex-shrink-0"
              >
                  <ChevronDown className="h-3 w-3 text-gray-600 rotate-90" />
              </button>
            
            {/* Days Row */}
                <div className="flex items-center gap-0.5 flex-1 justify-center overflow-x-auto">
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
                          flex flex-col items-center justify-center ${isSidebarCollapsed ? 'w-8 h-8' : 'w-7 h-7'} text-xs font-medium rounded-lg transition-all duration-200 flex-shrink-0
                      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                          ${isTodayDate 
                            ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300 shadow-sm' 
                            : isSelected 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md' 
                              : 'hover:bg-white/60 hover:text-purple-600 hover:shadow-sm'
                          }
                        `}
                      >
                        {isSidebarCollapsed && (
                    <span className="text-xs opacity-75 leading-none">{dayName}</span>
                        )}
                        <span className="text-xs font-bold leading-none">{format(date, 'd')}</span>
              </button>
                );
              })}
          </div>
          
            {/* Next Button */}
            <button
              onClick={handleNextDays}
                  className="w-6 h-6 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-md transition-all duration-200 flex-shrink-0"
            >
                  <ChevronDown className="h-3 w-3 text-gray-600 -rotate-90" />
            </button>
              </div>
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

      {/* Enhanced Appointments Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        {/* Compact Table Header */}
        <div className="px-3 py-3 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <CalendarDays className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Appointments List</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 rounded-full shadow-sm">
                    {sortedAppointments.length} appointments
              </span>
                  {sortField && (
                    <button
                      onClick={resetToDefaultSort}
                      className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                      title="Reset to default sorting (Date → Time → Status)"
                    >
                      Reset Sort
                    </button>
                  )}
            </div>
              </div>
            </div>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mx-auto w-fit mb-4">
              <Calendar className="h-12 w-12 text-blue-500 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || timePeriod !== 'today'
                ? 'Try adjusting your filters to see more appointments.'
                : 'Get started by creating your first appointment.'}
            </p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Create Appointment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Compact Table Header */}
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200/50">
                <tr>
                  <th 
                    className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort('patientId')}
                  >
                    Patient Name
                    {renderSortIcon('patientId')}
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20 hidden sm:table-cell">
                    Phone
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort('appointmentDate')}
                  >
                    Date
                    {renderSortIcon('appointmentDate')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort('startTime')}
                  >
                    Time
                    {renderSortIcon('startTime')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16 hidden md:table-cell cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort('doctorId')}
                  >
                    Doctor
                    {renderSortIcon('doctorId')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {renderSortIcon('status')}
                  </th>
                  <th 
                    className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12 hidden lg:table-cell cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort('visitType')}
                  >
                    Type
                    {renderSortIcon('visitType')}
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {sortedAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200">
                    {/* Compact Patient Name */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-gray-900 truncate">
                          {isPatientObject(appointment.patientId as any) ? 
                            ((appointment.patientId as any).name || `${(appointment.patientId as any).firstName || ''} ${(appointment.patientId as any).lastName || ''}`).trim() || 'Unknown Patient'
                            : 'Unknown Patient'}
                      </div>
                          <div className="text-xs text-gray-500 truncate">
                            {isPatientObject(appointment.patientId as any) ? (appointment.patientId as any).email : 'N/A'}
                    </div>
                          {/* Show phone on mobile */}
                          <div className="text-xs text-gray-500 sm:hidden">
                            {isPatientObject(appointment.patientId as any) ? (appointment.patientId as any).phone : 'N/A'}
                    </div>
                      </div>
                      </div>
                    </td>
                    
                    {/* Phone Number - Hidden on mobile */}
                    <td className="px-2 py-2 hidden sm:table-cell">
                      <span className="text-xs font-medium text-gray-900">
                            {isPatientObject(appointment.patientId as any) ? (appointment.patientId as any).phone : 'N/A'}
                          </span>
                    </td>
                    
                    {/* Date */}
                    <td className="px-2 py-2">
                      <span className="text-xs font-semibold text-gray-900">{getDateLabel(appointment.appointmentDate)}</span>
                    </td>
                    
                    {/* Time */}
                    <td className="px-2 py-2">
                      <span className="text-xs font-medium text-gray-900">{getTimeLabel(appointment.startTime, appointment.endTime)}</span>
                    </td>
                    
                    {/* Doctor - Hidden on mobile/tablet */}
                    <td className="px-2 py-2 hidden md:table-cell">
                      <span className="text-xs font-medium text-gray-900 truncate block">
                        {appointment.doctorId && isDoctorObject(appointment.doctorId) 
                          ? `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}` 
                          : 'No Doctor'}
                      </span>
                    </td>
                    
                    {/* Status */}
                    <td className="px-2 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg shadow-sm ${statusColors[appointment.status]}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="hidden sm:inline">{appointment.status.replace('_', ' ').toUpperCase()}</span>
                        <span className="sm:hidden">{appointment.status.charAt(0).toUpperCase()}</span>
                      </span>
                    </td>
                    
                    {/* Visit Type - Hidden on mobile/tablet */}
                    <td className="px-2 py-2 hidden lg:table-cell">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-lg shadow-sm ${visitTypeColors[appointment.visitType]}`}>
                        {appointment.visitType.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-2 py-2 w-16">
                      <div className="flex items-center gap-1">
                        {editingAppointmentId === appointment._id ? (
                          <div className="flex gap-1">
                            {/* Status Change Buttons */}
                            <div className="flex flex-col gap-0.5">
                              {appointment.status === 'scheduled' && (
                                <button
                                  onClick={() => handleInlineStatusChange(appointment._id, 'in_progress')}
                                  disabled={isActionDisabled(appointment)}
                                  className={`px-2 py-1 text-xs font-semibold transition-all duration-200 rounded-lg shadow-sm ${
                                    isActionDisabled(appointment) 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 hover:from-yellow-200 hover:to-yellow-300'
                                  }`}
                                  title={isActionDisabled(appointment) ? getDisabledActionTooltip(appointment) : "Start appointment"}
                                >
                                  <span className="hidden sm:inline">Start</span>
                                  <span className="sm:hidden">S</span>
                                </button>
                              )}
                              {appointment.status === 'in_progress' && (
                                <div className="flex gap-0.5">
                                  {/* Undo Start Button - always available for in-progress appointments */}
                                  <button
                                    onClick={() => handleUndoStart(appointment._id)}
                                    disabled={isActionDisabled(appointment)}
                                    className={`px-2 py-1 text-xs font-semibold transition-all duration-200 rounded-lg shadow-sm ${
                                      isActionDisabled(appointment)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-yellow-100 to-orange-200 text-orange-800 hover:from-yellow-200 hover:to-orange-300 border border-orange-300'
                                    }`}
                                    title={isActionDisabled(appointment) ? getDisabledActionTooltip(appointment) : "Undo start - revert to scheduled status"}
                                  >
                                    <span className="hidden sm:inline">Undo</span>
                                    <span className="sm:hidden">↶</span>
                                  </button>
                                  
                                  {/* Completed Button */}
                                  <button
                                    onClick={() => handleInlineStatusChange(appointment._id, 'completed')}
                                    disabled={isActionDisabled(appointment)}
                                    className={`px-2 py-1 text-xs font-semibold transition-all duration-200 rounded-lg shadow-sm ${
                                      isActionDisabled(appointment) 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 hover:from-emerald-200 hover:to-emerald-300'
                                    }`}
                                    title={isActionDisabled(appointment) ? getDisabledActionTooltip(appointment) : "Set to Completed"}
                                  >
                                    <span className="hidden sm:inline">Completed</span>
                                    <span className="sm:hidden">C</span>
                                  </button>
                                </div>
                              )}
                              {appointment.status === 'cancelled' && (
                                <>
                                  <button
                                    onClick={() => handleInlineStatusChange(appointment._id, 'scheduled')}
                                    disabled={isActionDisabled(appointment)}
                                    className={`px-2 py-1 text-xs font-semibold transition-all duration-200 rounded-lg shadow-sm ${
                                      isActionDisabled(appointment) 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300'
                                    }`}
                                    title={isActionDisabled(appointment) ? getDisabledActionTooltip(appointment) : "Reschedule appointment"}
                                  >
                                    <span className="hidden sm:inline">Reschedule</span>
                                    <span className="sm:hidden">R</span>
                                  </button>
                                  <button
                                    onClick={() => handleInlineStatusChange(appointment._id, 'completed')}
                                    disabled={isActionDisabled(appointment)}
                                    className={`px-2 py-1 text-xs font-semibold transition-all duration-200 rounded-lg shadow-sm ${
                                      isActionDisabled(appointment) 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 hover:from-emerald-200 hover:to-emerald-300'
                                    }`}
                                    title={isActionDisabled(appointment) ? getDisabledActionTooltip(appointment) : "Mark as completed"}
                                  >
                                    <span className="hidden sm:inline">Completed</span>
                                    <span className="sm:hidden">C</span>
                                  </button>
                                </>
                              )}
                              {appointment.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleCancelConfirmation(appointment._id)}
                                  disabled={isActionDisabled(appointment)}
                                  className={`px-2 py-1 text-xs font-semibold transition-all duration-200 rounded-lg shadow-sm ${
                                    isActionDisabled(appointment) 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300'
                                  }`}
                                  title={isActionDisabled(appointment) ? getDisabledActionTooltip(appointment) : "Set to Cancelled"}
                                >
                                  <span className="hidden sm:inline">Cancelled</span>
                                  <span className="sm:hidden">X</span>
                                </button>
                              )}
                            </div>
                            {/* Cancel Edit Button */}
                            <button
                              onClick={() => setEditingAppointmentId(null)}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 rounded-lg self-center"
                              title="Cancel edit"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => setEditingAppointmentId(appointment._id)}
                              disabled={isActionDisabled(appointment)}
                              className={`p-1 transition-all duration-200 rounded-lg ${
                                isActionDisabled(appointment) 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                              title={isActionDisabled(appointment) ? getDisabledActionTooltip(appointment) : "Edit status"}
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            
                            {/* Delete Button */}
                            {user?.role !== 'receptionist' && (
                              <button
                                onClick={() => handleDeleteAppointment(appointment._id)}
                                disabled={isActionDisabled(appointment)}
                                className={`p-1 transition-all duration-200 rounded-lg ${
                                  isActionDisabled(appointment) 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                }`}
                                title={isActionDisabled(appointment) ? getDisabledActionTooltip(appointment) : "Delete appointment"}
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
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200/50 my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className={`px-6 py-4 border-b border-gray-200/50 rounded-t-2xl flex-shrink-0 ${
              confirmationModal.title === 'Reschedule Appointment' 
                ? 'bg-gradient-to-r from-orange-50 to-yellow-50' 
                : 'bg-gradient-to-r from-red-50 to-pink-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  confirmationModal.title === 'Reschedule Appointment'
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-600'
                    : 'bg-gradient-to-r from-red-500 to-pink-600'
                }`}>
                  {confirmationModal.title === 'Reschedule Appointment' ? (
                    <Calendar className="h-5 w-5 text-white" />
                  ) : (
                    <X className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{confirmationModal.title}</h3>
                  <p className="text-sm text-gray-600">{confirmationModal.message}</p>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Appointment Details (only for reschedule) */}
              {confirmationModal.title === 'Reschedule Appointment' && confirmationModal.appointmentData && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Appointment Details
                  </h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Patient</p>
                        <p className="text-sm font-medium text-gray-900">
                           {typeof confirmationModal.appointmentData.patientId === 'object' 
                            ? confirmationModal.appointmentData.patientId.name || 
                              `${confirmationModal.appointmentData.patientId.firstName || ''} ${confirmationModal.appointmentData.patientId.lastName || ''}`.trim() ||
                              'N/A'
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(confirmationModal.appointmentData.appointmentDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Doctor</p>
                        <p className="text-sm font-medium text-gray-900">
                          {confirmationModal.appointmentData.doctorId ? (
                            isDoctorObject(confirmationModal.appointmentData.doctorId) 
                              ? `Dr. ${confirmationModal.appointmentData.doctorId.firstName} ${confirmationModal.appointmentData.doctorId.lastName}`
                              : 'Doctor assigned'
                          ) : 'No doctor assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Reason</p>
                        <p className="text-sm font-medium text-gray-900">
                          {confirmationModal.appointmentData.reasonForVisit || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date Selection (only for reschedule) */}
              {confirmationModal.title === 'Reschedule Appointment' && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Select Date
                  </h4>
                  <input
                    type="date"
                    value={confirmationModal.selectedDate || ''}
                    onChange={async (e) => {
                      const newDate = e.target.value;
                      setConfirmationModal(prev => ({ ...prev, selectedDate: newDate }));
                      
                      // Reload slots for the new date
                      if (confirmationModal.appointmentData && confirmationModal.selectedDoctorId) {
                        const updatedAppointmentData = {
                          ...confirmationModal.appointmentData,
                          appointmentDate: newDate,
                          doctorId: confirmationModal.selectedDoctorId
                        };
                        await checkSlotAvailability(updatedAppointmentData);
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Current: {format(new Date(confirmationModal.appointmentData?.appointmentDate), 'MMMM dd, yyyy')}
                    {confirmationModal.selectedDate && confirmationModal.selectedDate !== new Date(confirmationModal.appointmentData?.appointmentDate).toISOString().split('T')[0] && (
                      <span className="text-orange-600 font-medium ml-1">
                        → {format(new Date(confirmationModal.selectedDate), 'MMMM dd, yyyy')}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Doctor Selection (only for reschedule) */}
              {confirmationModal.title === 'Reschedule Appointment' && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    Select Doctor
                  </h4>
                  <select
                    value={confirmationModal.selectedDoctorId || ''}
                    onChange={async (e) => {
                      const newDoctorId = e.target.value;
                      console.log('🔍 Doctor changed to:', newDoctorId);
                      setConfirmationModal(prev => ({ ...prev, selectedDoctorId: newDoctorId }));
                      
                      // Reload slots for the new doctor
                      if (confirmationModal.appointmentData) {
                        const updatedAppointmentData = {
                          ...confirmationModal.appointmentData,
                          doctorId: newDoctorId,
                          appointmentDate: confirmationModal.selectedDate || confirmationModal.appointmentData.appointmentDate
                        };
                        await checkSlotAvailability(updatedAppointmentData);
                      }
                    }}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-200"
                  >
                    <option value="">Select a doctor...</option>
                    {currentDoctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.firstName} {doctor.lastName}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Current: {confirmationModal.appointmentData?.doctorId?.firstName ? `${confirmationModal.appointmentData.doctorId.firstName} ${confirmationModal.appointmentData.doctorId.lastName}` : 'No doctor assigned'}
                    {confirmationModal.selectedDoctorId && confirmationModal.selectedDoctorId !== confirmationModal.appointmentData?.doctorId?._id && (
                      <span className="text-orange-600 font-medium ml-1">
                        → {(() => {
                          const doctor = currentDoctors.find(d => d._id === confirmationModal.selectedDoctorId);
                          return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Selected doctor';
                        })()}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Slot Availability Check (only for reschedule) */}
              {confirmationModal.title === 'Reschedule Appointment' && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    Time Slot Availability
                  </h4>
                  
                  {confirmationModal.isCheckingSlots ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        <span className="text-sm text-gray-600">Checking slot availability...</span>
                      </div>
                    </div>
                  ) : confirmationModal.slotError ? (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">{confirmationModal.slotError}</span>
                      </div>
                    </div>
                  ) : confirmationModal.availableSlots && confirmationModal.availableSlots.length > 0 ? (
                    <div className="space-y-3">
                      {/* Show warning only if original slot is not available */}
                      {confirmationModal.availableSlots.find(s => s.startTime === confirmationModal.appointmentData?.startTime && !s.isAvailable) && (
                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-700">
                              Original time slot ({getTimeLabel(confirmationModal.appointmentData?.startTime, confirmationModal.appointmentData?.endTime)}) is no longer available.
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-xs text-gray-600 mb-2">
                          Select an available time slot ({confirmationModal.availableSlots.filter(s => s.isAvailable).length} available out of {confirmationModal.availableSlots.length}):
                        </p>
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                          {confirmationModal.availableSlots.map((slot) => (
                            <button
                              key={slot.startTime}
                              type="button"
                              onClick={() => slot.isAvailable && setConfirmationModal(prev => ({ ...prev, selectedSlot: slot.startTime }))}
                              disabled={!slot.isAvailable}
                       className={`px-2 py-1 text-xs rounded border transition-all duration-200 ${
                         !slot.isAvailable
                           ? slot.isPast
                             ? 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-40'
                             : slot.isOutsideWorkingHours
                             ? 'bg-purple-50 text-purple-400 border-purple-200 cursor-not-allowed opacity-50'
                             : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                           : confirmationModal.selectedSlot === slot.startTime
                             ? slot.isAvailableDueToActiveDoctor
                               ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600 shadow-sm ring-2 ring-green-300'
                               : 'bg-orange-600 text-white border-orange-600 shadow-sm'
                             : slot.isAvailableDueToActiveDoctor
                               ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 hover:from-green-100 hover:to-emerald-100 cursor-pointer shadow-sm'
                               : 'bg-white text-gray-700 border-gray-300 hover:bg-orange-50 hover:border-orange-300 cursor-pointer'
                       }`}
                              title={
                                !slot.isAvailable 
                                  ? slot.isPast 
                                    ? 'This time slot is in the past' 
                                    : slot.isOutsideWorkingHours
                                    ? 'This time slot is outside doctor\'s working hours'
                                    : 'This time slot is not available'
                                  : slot.isAvailableDueToActiveDoctor
                                    ? 'Available because doctor is currently active in the branch (outside normal working hours)'
                                    : ''
                              }
                            >
                              {getTimeLabel(slot.startTime, '')}
                            </button>
                          ))}
                        </div>
                        
                        {/* Show message if no available slots */}
                        {confirmationModal.availableSlots.filter(s => s.isAvailable).length === 0 && confirmationModal.availableSlots.length > 0 && (
                          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                            <p className="text-xs text-red-700">
                              <strong>Notice:</strong> All time slots for this date are currently unavailable.
                            </p>
                          </div>
                        )}
                        
                 {/* Show working hours info if doctor is selected */}
                 {confirmationModal.selectedDoctorId && (
                   <div className="mt-2 space-y-2">
                     <div className="p-2 bg-blue-50 rounded border border-blue-200">
                       <p className="text-xs text-blue-700">
                         <strong>Working Hours:</strong> {(() => {
                           const selectedDoctor = currentDoctors.find(d => d._id === confirmationModal.selectedDoctorId);
                           if (selectedDoctor && confirmationModal.selectedDate) {
                             const date = new Date(confirmationModal.selectedDate);
                             const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                             const availability = (selectedDoctor as any).availability?.[dayOfWeek];
                             if (availability && availability.isAvailable) {
                               return `${getTimeLabel(availability.start, '')} - ${getTimeLabel(availability.end, '')}`;
                             } else {
                               return 'Not available on this day';
                             }
                           }
                           return 'Not specified';
                         })()}
                       </p>
                     </div>
                     
                     {/* Show active doctor status */}
                     {(() => {
                       const selectedDoctor = currentDoctors.find(d => d._id === confirmationModal.selectedDoctorId);
                       if (selectedDoctor && (selectedDoctor as any).isCurrentlyActiveInBranch) {
                         return (
                           <div className="p-2 bg-green-50 rounded border border-green-200">
                             <p className="text-xs text-green-700 flex items-center gap-1">
                               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                               <strong>Doctor is currently active in the branch</strong> - Slots outside normal working hours are available
                             </p>
                           </div>
                         );
                       }
                       return null;
                     })()}
                     
                     {/* Slot color legend */}
                     <div className="p-2 bg-gray-50 rounded border border-gray-200">
                       <p className="text-xs text-gray-600 mb-1"><strong>Slot Colors:</strong></p>
                       <div className="grid grid-cols-2 gap-1 text-xs">
                         <div className="flex items-center gap-1">
                           <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                           <span className="text-gray-600">Normal hours</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <div className="w-3 h-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded"></div>
                           <span className="text-gray-600">Active doctor</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <div className="w-3 h-3 bg-purple-50 border border-purple-300 rounded opacity-50"></div>
                           <span className="text-gray-600">Outside hours</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <div className="w-3 h-3 bg-red-50 border border-red-300 rounded opacity-40"></div>
                           <span className="text-gray-600">Past time</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          Original time slot ({getTimeLabel(confirmationModal.appointmentData?.startTime, confirmationModal.appointmentData?.endTime)}) is still available.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer - Action Buttons (Fixed) */}
            <div className="px-6 py-4 border-t border-gray-200/50 bg-gray-50/50 rounded-b-2xl flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={handleCloseConfirmation}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {confirmationModal.title === 'Reschedule Appointment' ? 'Keep Cancelled' : 'Keep Appointment'}
                </button>
                 <button
                   onClick={handleConfirmCancel}
                   disabled={
                     confirmationModal.title === 'Reschedule Appointment' && 
                     (!confirmationModal.selectedSlot || !confirmationModal.selectedDoctorId || !confirmationModal.selectedDate)
                   }
                   className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 shadow-sm ${
                     confirmationModal.title === 'Reschedule Appointment'
                       ? (!confirmationModal.selectedSlot || !confirmationModal.selectedDoctorId || !confirmationModal.selectedDate)
                         ? 'bg-gray-400 cursor-not-allowed'
                         : 'bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700'
                       : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                   }`}
                 >
                   {confirmationModal.title === 'Reschedule Appointment' ? 'Reschedule' : 'Cancel Appointment'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Assignment Modal */}
      {doctorAssignmentModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200/50">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign Doctor</h3>
                  <p className="text-sm text-gray-600">Assign this appointment to a doctor</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Patient Details */}
              {doctorAssignmentModal.appointmentData && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Patient Details
                  </h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {typeof doctorAssignmentModal.appointmentData.patientId === 'object' 
                            ? doctorAssignmentModal.appointmentData.patientId.name || 
                              `${doctorAssignmentModal.appointmentData.patientId.firstName || ''} ${doctorAssignmentModal.appointmentData.patientId.lastName || ''}`.trim() ||
                              'N/A'
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-900">
                          {typeof doctorAssignmentModal.appointmentData.patientId === 'object' 
                            ? doctorAssignmentModal.appointmentData.patientId.email || 'N/A'
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Phone</p>
                        <p className="text-sm font-medium text-gray-900">
                          {typeof doctorAssignmentModal.appointmentData.patientId === 'object' 
                            ? doctorAssignmentModal.appointmentData.patientId.phone || 'N/A'
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Date & Time</p>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(doctorAssignmentModal.appointmentData.appointmentDate), 'MMM dd, yyyy')} at {getTimeLabel(doctorAssignmentModal.appointmentData.startTime, doctorAssignmentModal.appointmentData.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-green-500" />
                  Select Doctor
                </h4>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={doctorAssignmentModal.selectedDoctorId}
                    onChange={(e) => setDoctorAssignmentModal(prev => ({ ...prev, selectedDoctorId: e.target.value }))}
                    className="w-full pl-10 pr-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                  >
                    <option value="">Select a doctor</option>
                    {currentDoctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDoctorAssignmentModal({ isOpen: false, appointmentId: null, appointmentData: null, selectedDoctorId: '' })}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => doctorAssignmentModal.appointmentId && doctorAssignmentModal.selectedDoctorId && handleDoctorAssignment(doctorAssignmentModal.appointmentId, doctorAssignmentModal.selectedDoctorId)}
                  disabled={!doctorAssignmentModal.selectedDoctorId}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                    !doctorAssignmentModal.selectedDoctorId
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  Assign & Start
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Month Picker Modal - Responsive */}
      {isMonthPickerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full border border-gray-200/50">
            {/* Enhanced Header - Responsive */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Select Month & Year</h3>
              </div>
              <button
                onClick={() => setIsMonthPickerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-all duration-200 rounded-xl"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Enhanced Month Picker - Responsive */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleMonthSelect(i, currentMonth.getFullYear())}
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 ${
                      i === currentMonth.getMonth()
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
                    }`}
                  >
                    {format(new Date(2024, i, 1), 'MMM')}
                  </button>
                ))}
              </div>

              {/* Enhanced Year Picker - Responsive */}
              <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 sm:p-4">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 12))}
                  className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-all duration-200 rounded-xl"
                >
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 rotate-90" />
                </button>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  {currentMonth.getFullYear()}
                </span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 12))}
                  className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-all duration-200 rounded-xl"
                >
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 -rotate-90" />
                </button>
              </div>
            </div>

            {/* Enhanced Footer - Responsive */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200/50 bg-gray-50/50">
              <button
                onClick={() => setIsMonthPickerOpen(false)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsMonthPickerOpen(false)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
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
