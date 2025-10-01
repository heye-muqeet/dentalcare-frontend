import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import type { RootState } from '../../lib/store/store';
import { refreshReceptionistData } from '../../lib/store/slices/receptionistDataSlice';
import { patientService } from '../../lib/api/services/patients';
import { appointmentsApi } from '../../lib/api/services/appointments';
import api from '../../lib/api/axios';
import { 
  showErrorToast, 
  showSuccessToast, 
  showWarningToast, 
  showInfoToast,
  handleApiError,
  handleValidationError,
  getErrorMessage
} from '../../lib/utils/errorHandler';
import type { Patient } from '../../lib/api/services/patients';
import { 
  X, 
  Calendar, 
  Plus,
  Search,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  User,
  RefreshCw
} from 'lucide-react';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointmentData: any) => void;
  patients: any[];
  doctors: any[];
}

interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
}

interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  visitType: 'walk_in' | 'scheduled';
  reasonForVisit: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialPatientFormData: PatientFormData = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  address: ''
};

const initialAppointmentFormData: AppointmentFormData = {
  patientId: '',
  doctorId: '',
  appointmentDate: '',
  startTime: '',
  endTime: '',
  visitType: 'scheduled',
  reasonForVisit: '',
  notes: ''
};

export default function CreateAppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  patients, 
  doctors 
}: CreateAppointmentModalProps) {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  
  // Debug doctors data
  console.log('🔍 CreateAppointmentModal - doctors received:', doctors);
  console.log('🔍 CreateAppointmentModal - doctors count:', doctors?.length || 0);
  
  // Form states
  const [patientFormData, setPatientFormData] = useState<PatientFormData>(initialPatientFormData);
  const [appointmentFormData, setAppointmentFormData] = useState<AppointmentFormData>(initialAppointmentFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotLoadingError, setSlotLoadingError] = useState<string | null>(null);
  const [isBranchOpen, setIsBranchOpen] = useState(true);
  const [branchHoursMessage, setBranchHoursMessage] = useState<string>('');
  const [existingAppointments, setExistingAppointments] = useState<{[patientId: string]: any}>({});
  
  // Dropdown states
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  
  // Duplicate detection state
  const [potentialDuplicates, setPotentialDuplicates] = useState<Patient[]>([]);
  const [similarityScore, setSimilarityScore] = useState(0);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');
  const [phoneCheckTimeout, setPhoneCheckTimeout] = useState<number | null>(null);
  const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);
  const [showAllDuplicates, setShowAllDuplicates] = useState(false);
  
  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => {
    const patientName = patient.name;
    return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           patient.phone.includes(searchTerm);
  });

  // Filter doctors based on search
  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const specialization = doctor.specialization?.toLowerCase() || '';
    return fullName.includes(doctorSearchTerm.toLowerCase()) ||
           specialization.includes(doctorSearchTerm.toLowerCase()) ||
           (doctor.email && doctor.email.toLowerCase().includes(doctorSearchTerm.toLowerCase()));
  });

  // Generate time slots (30-minute intervals from 9 AM to 6 PM)
  const generateTimeSlots = (selectedDate?: string) => {
    const slots = [];
    const now = new Date();
    const isToday = selectedDate && new Date(selectedDate).toDateString() === now.toDateString();
    
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Calculate end time with default 30-minute duration
        const startDateTime = new Date();
        startDateTime.setHours(hour, minute, 0, 0);
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // Add 30 minutes
        const endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;
        
        // Convert to 12-hour format for display
        const formatTime = (time24: string) => {
          const [hours, minutes] = time24.split(':').map(Number);
          const period = hours >= 12 ? 'PM' : 'AM';
          const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
          return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
        };
        
        // If it's today, check if the slot is in the future
        if (isToday) {
          const slotDateTime = new Date();
          slotDateTime.setHours(hour, minute, 0, 0);
          
          // Add 30 minutes buffer to current time to allow for booking
          const bufferTime = new Date(now.getTime() + 30 * 60 * 1000);
          
          if (slotDateTime < bufferTime) {
            console.log(`⏰ Skipping past slot: ${time} (current time: ${now.toTimeString().slice(0, 5)})`);
            continue; // Skip past slots
          }
        }
        
        slots.push({ 
          start: time, 
          end: endTime,
          displayStart: formatTime(time),
          displayEnd: formatTime(endTime)
        });
      }
    }
    return slots;
  };

  // Load available slots when date or doctor changes (only for scheduled appointments)
  useEffect(() => {
    if (appointmentFormData.visitType === 'scheduled' && appointmentFormData.appointmentDate) {
      loadAvailableSlots();
    } else if (appointmentFormData.visitType === 'walk_in') {
      // Clear slots for walk-in patients
      setAvailableSlots([]);
      setSlotLoadingError(null);
    }
  }, [appointmentFormData.appointmentDate, appointmentFormData.doctorId, appointmentFormData.visitType]);

  // Check if branch is currently open for walk-in appointments
  const checkBranchHours = () => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Default branch hours (9 AM to 6 PM, Monday to Friday)
    const defaultHours = {
      monday: { isOpen: true, open: '09:00', close: '18:00' },
      tuesday: { isOpen: true, open: '09:00', close: '18:00' },
      wednesday: { isOpen: true, open: '09:00', close: '18:00' },
      thursday: { isOpen: true, open: '09:00', close: '18:00' },
      friday: { isOpen: true, open: '09:00', close: '18:00' },
      saturday: { isOpen: true, open: '09:00', close: '17:00' },
      sunday: { isOpen: false, open: '09:00', close: '17:00' }
    };
    
    const todayHours = defaultHours[dayOfWeek as keyof typeof defaultHours];
    
    if (!todayHours || !todayHours.isOpen) {
      setIsBranchOpen(false);
      setBranchHoursMessage('Branch is closed on this day. Walk-in appointments are not available.');
      return false;
    }
    
    const currentMinutes = timeToMinutes(currentTime);
    const openMinutes = timeToMinutes(todayHours.open);
    const closeMinutes = timeToMinutes(todayHours.close);
    
    if (currentMinutes < openMinutes || currentMinutes > closeMinutes) {
      setIsBranchOpen(false);
      setBranchHoursMessage(`Branch is currently closed. Operating hours: ${todayHours.open} - ${todayHours.close}. Walk-in appointments are not available.`);
      return false;
    }
    
    setIsBranchOpen(true);
    setBranchHoursMessage('');
    return true;
  };

  // Helper function to convert time to minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Auto-set date and time for walk-in patients
  useEffect(() => {
    if (appointmentFormData.visitType === 'walk_in') {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);
      
      // Check if branch is open
      const branchOpen = checkBranchHours();
      
      if (branchOpen) {
        // Calculate end time (30 minutes from now)
        const endTime = new Date(now.getTime() + 30 * 60 * 1000);
        const endTimeString = endTime.toTimeString().slice(0, 5);
        
        setAppointmentFormData(prev => ({
          ...prev,
          appointmentDate: today,
          startTime: currentTime,
          endTime: endTimeString
        }));
        
        console.log('🕐 Auto-set walk-in appointment time:', {
          date: today,
          startTime: currentTime,
          endTime: endTimeString
        });
      } else {
        // If branch is closed, still set the date but clear times
        setAppointmentFormData(prev => ({
          ...prev,
          appointmentDate: today,
          startTime: '',
          endTime: ''
        }));
      }
    } else {
      // Reset branch status for scheduled appointments
      setIsBranchOpen(true);
      setBranchHoursMessage('');
    }
  }, [appointmentFormData.visitType]);

  // Helper function to convert 24-hour time to 12-hour format
  const formatTimeTo12Hour = (time24: string | undefined) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const loadAvailableSlots = async (retryCount = 0) => {
    if (!appointmentFormData.appointmentDate) {
      setAvailableSlots([]);
      setSlotLoadingError(null);
      return;
    }

    setIsLoadingSlots(true);
    setAvailableSlots([]);
    setSlotLoadingError(null);
    
    try {
      console.log('🔍 Loading available slots for:', {
        date: appointmentFormData.appointmentDate,
        doctorId: appointmentFormData.doctorId,
        retryCount
      });

      const allSlots = generateTimeSlots(appointmentFormData.appointmentDate);
      const availableSlotsList: string[] = [];

      // Check each slot for availability
      let validationErrors = 0;
      for (const slot of allSlots) {
        try {
          const validationData = {
            doctorId: appointmentFormData.doctorId || undefined,
            appointmentDate: appointmentFormData.appointmentDate,
            startTime: slot.start,
            endTime: slot.end,
            patientId: appointmentFormData.patientId || 'temp', // Use temp ID for validation
            excludeAppointmentId: undefined,
            isWalkIn: appointmentFormData.visitType === 'walk_in'
          };

          console.log('🔍 Validating slot:', slot.start, '-', slot.end);
          
          const validation = await appointmentsApi.validateSlot(validationData);
          
          if (validation.success && validation.data.available) {
            availableSlotsList.push(slot.start);
            console.log('✅ Slot available:', slot.start);
          } else {
            console.log('❌ Slot unavailable:', slot.start, validation.data.reason || 'Not available');
          }
        } catch (slotError) {
          console.error('❌ Error validating slot:', slot.start, slotError);
          validationErrors++;
          // If validation fails for a slot, consider it unavailable
        }
      }

      // If too many validation errors, fall back to showing all slots
      if (validationErrors > allSlots.length / 2) {
        console.warn('⚠️ Too many validation errors, falling back to showing all slots');
        setSlotLoadingError('Unable to validate slot availability. All slots are shown but may not be available.');
        setAvailableSlots(allSlots.map(slot => slot.start));
        return;
      }

      console.log('🔍 Available slots found:', availableSlotsList.length, 'out of', allSlots.length);
      setAvailableSlots(availableSlotsList);

      if (availableSlotsList.length === 0) {
        console.warn('⚠️ No available slots found for the selected date and doctor');
        setSlotLoadingError('No available time slots found for the selected date and doctor. Please choose a different date or doctor.');
        showWarningToast('No Available Time Slots', 'Please choose a different date or doctor.');
      }

    } catch (error: any) {
      console.error('❌ Error loading available slots:', error);
      
      const errorMessage = 'Unable to check slot availability. Please try again.';
      setSlotLoadingError(errorMessage);
      
      // Retry logic for network errors
      if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'))) {
        console.log('🔄 Retrying slot loading...', retryCount + 1);
        setTimeout(() => {
          loadAvailableSlots(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      // Fallback to showing all slots if validation fails
      console.log('🔄 Falling back to showing all slots due to validation errors');
      const allSlots = generateTimeSlots(appointmentFormData.appointmentDate);
      setAvailableSlots(allSlots.map(slot => slot.start));
      setSlotLoadingError('Slot validation unavailable. All slots are shown but availability is not guaranteed.');
      
      showWarningToast('Slot Validation Unavailable', 'All slots are shown but availability is not guaranteed.');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const validatePatientForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!patientFormData.name.trim()) newErrors.name = 'Patient name is required';
    if (patientFormData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientFormData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!patientFormData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!patientFormData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!patientFormData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAppointmentForm = (): boolean => {
    console.log('🔍 Validating appointment form with data:', appointmentFormData);
    console.log('🔍 Active tab:', activeTab);
    
    const newErrors: FormErrors = {};

    // For existing patients, check if patient is selected
    if (activeTab === 'existing' && !appointmentFormData.patientId) {
      newErrors.patientId = 'Patient selection is required';
      console.log('❌ Missing patient ID for existing patient');
    }
    
    // For new patients, validate patient form instead
    if (activeTab === 'new') {
      console.log('🔍 Validating new patient form');
      if (!validatePatientForm()) {
        console.log('❌ New patient form validation failed');
        return false;
      }
      console.log('✅ New patient form validation passed');
    }
    
    // Skip date and time validation for walk-in patients (auto-set)
    if (appointmentFormData.visitType === 'scheduled') {
      if (!appointmentFormData.appointmentDate) {
        newErrors.appointmentDate = 'Appointment date is required';
        console.log('❌ Missing appointment date');
      }
      if (!appointmentFormData.startTime) {
        newErrors.startTime = 'Appointment time is required';
        console.log('❌ Missing start time');
      }
    } else if (appointmentFormData.visitType === 'walk_in') {
      // For walk-in appointments, check if branch is open
      if (!isBranchOpen) {
        newErrors.visitType = branchHoursMessage || 'Walk-in appointments are not available at this time';
        console.log('❌ Branch is closed for walk-in appointments');
      }
    }
    if (!appointmentFormData.reasonForVisit.trim()) {
      newErrors.reasonForVisit = 'Reason for visit is required';
      console.log('❌ Missing reason for visit');
    }

    console.log('🔍 Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('🔍 Form is valid:', isValid);
    
    if (!isValid) {
      handleValidationError(newErrors);
    }
    
    return isValid;
  };

  const handlePatientInputChange = (field: keyof PatientFormData, value: string) => {
    setPatientFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Auto-generate email when name changes
  useEffect(() => {
    console.log('🔍 Email generation effect triggered:', {
      name: patientFormData.name,
      email: patientFormData.email,
      nameTrimmed: patientFormData.name.trim(),
      emailTrimmed: patientFormData.email.trim()
    });
    
    if (patientFormData.name.trim() && !patientFormData.email.trim()) {
      console.log('🔍 Generating email for name:', patientFormData.name);
      const generateEmail = async () => {
        try {
          const generatedEmail = await generateUniqueEmail(patientFormData.name);
          console.log('🔍 Generated email:', generatedEmail);
          if (generatedEmail) {
            setPatientFormData(prev => ({ ...prev, email: generatedEmail }));
          }
        } catch (error) {
          console.error('🔍 Error generating email:', error);
        }
      };
      generateEmail();
    }
  }, [patientFormData.name]);

  // Real-time phone number duplicate checking
  useEffect(() => {
    if (patientFormData.phone && patientFormData.phone.length >= 10) {
      checkPhoneDuplicates(patientFormData.phone);
    } else {
      setDuplicateWarning('');
    }

    // Cleanup timeout on unmount
    return () => {
      if (phoneCheckTimeout) {
        clearTimeout(phoneCheckTimeout);
      }
    };
  }, [patientFormData.phone]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsPatientDropdownOpen(false);
        setIsDoctorDropdownOpen(false);
      }
    };

    if (isPatientDropdownOpen || isDoctorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPatientDropdownOpen, isDoctorDropdownOpen]);

  // Real-time phone number checking for duplicates
  const checkPhoneDuplicates = async (phone: string) => {
    console.log('🔍 checkPhoneDuplicates called:', { phone, phoneLength: phone?.length, branchId });
    
    if (!phone || phone.length < 10 || !branchId) {
      console.log('🔍 Skipping duplicate check - insufficient data:', { phone, phoneLength: phone?.length, branchId });
      setDuplicateWarning('');
      return;
    }

    // Clear previous timeout
    if (phoneCheckTimeout) {
      clearTimeout(phoneCheckTimeout);
    }

    // Set new timeout for debounced checking
    const timeout = setTimeout(async () => {
      console.log('🔍 Starting duplicate check after timeout...');
      setIsCheckingDuplicates(true);
      setDuplicateWarning('Checking for existing patients...');
      
      try {
        const duplicateCheckData = {
          name: patientFormData.name || 'Unknown',
          phone: phone,
          dateOfBirth: patientFormData.dateOfBirth || '1900-01-01',
          email: patientFormData.email || ''
        };
        
        console.log('🔍 Sending duplicate check data:', duplicateCheckData);
        const response = await patientService.checkDuplicatePatients(branchId, duplicateCheckData);
        console.log('🔍 Duplicate check response received:', response);
        
        if (response.success && response.data.hasDuplicates) {
          const duplicates = response.data.potentialDuplicates;
          const maxScore = response.data.similarityScore;
          
          console.log('🔍 Duplicates found:', { duplicatesCount: duplicates.length, maxScore });
          
          // Store for display
          setPotentialDuplicates(duplicates);
          setSimilarityScore(maxScore);
          setShowDuplicateDetails(false); // Don't auto-expand, let user click "View Details"
          
          if (maxScore >= 80) {
            setDuplicateWarning(`⚠️ High similarity (${maxScore}%) - This might be a duplicate patient (you can still create)`);
          } else if (maxScore >= 60) {
            setDuplicateWarning(`⚠️ Medium similarity (${maxScore}%) - Please verify this is a different patient`);
          } else if (maxScore >= 30) {
            setDuplicateWarning(`ℹ️ Found ${duplicates.length} patient(s) with similar details - Please verify`);
          }
        } else {
          console.log('🔍 No duplicates found');
          setDuplicateWarning('');
          setPotentialDuplicates([]);
          setSimilarityScore(0);
          setShowDuplicateDetails(false);
        }
      } catch (error) {
        console.error('❌ Error checking phone duplicates:', error);
        setDuplicateWarning('Unable to check for duplicates');
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 1000); // 1 second delay

    setPhoneCheckTimeout(timeout);
  };

  // Generate unique email based on patient name
  const generateUniqueEmail = async (name: string): Promise<string> => {
    console.log('🔍 generateUniqueEmail called with name:', name);
    
    if (!name.trim()) {
      console.log('🔍 Name is empty, returning empty string');
      return '';
    }
    
    // Clean the name and create base email
    const cleanName = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '.') // Replace spaces with dots
      .substring(0, 20); // Limit length
    
    const baseEmail = `${cleanName}@dentalcare.local`;
    console.log('🔍 Generated base email:', baseEmail);
    
    try {
      // Check if email exists by trying to find a patient with this email
      console.log('🔍 Checking email uniqueness for:', baseEmail);
      const response = await api.get(`/branches/${branchId}/patients/check-email/${encodeURIComponent(baseEmail)}`);
      console.log('🔍 Email check response:', response.data);
      
      if (response.data.exists) {
        console.log('🔍 Email exists, generating unique variant');
        // If exists, add a number suffix
        let counter = 1;
        let uniqueEmail = `${cleanName}${counter}@dentalcare.local`;
        
        while (true) {
          console.log('🔍 Checking variant:', uniqueEmail);
          const checkResponse = await api.get(`/branches/${branchId}/patients/check-email/${encodeURIComponent(uniqueEmail)}`);
          console.log('🔍 Variant check response:', checkResponse.data);
          
          if (!checkResponse.data.exists) {
            console.log('🔍 Found unique email:', uniqueEmail);
            return uniqueEmail;
          }
          counter++;
          uniqueEmail = `${cleanName}${counter}@dentalcare.local`;
        }
      }
      console.log('🔍 Base email is unique:', baseEmail);
      return baseEmail;
    } catch (error) {
      console.error('🔍 Error checking email uniqueness:', error);
      console.warn('Using base email as fallback:', baseEmail);
      showWarningToast('Email Generation Warning', 'Could not verify email uniqueness. Using generated email.');
      return baseEmail;
    }
  };

  // Check for existing active appointments when patient is selected
  useEffect(() => {
    if (activeTab === 'existing' && appointmentFormData.patientId && appointmentFormData.visitType === 'scheduled') {
      // Use today's date as a placeholder since we're checking for ANY active appointment
      const today = new Date().toISOString().split('T')[0];
      checkExistingAppointment(appointmentFormData.patientId, today);
    }
  }, [appointmentFormData.patientId, activeTab, appointmentFormData.visitType]);

  const handleAppointmentInputChange = (field: keyof AppointmentFormData, value: any) => {
    setAppointmentFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTimeSlotSelect = (startTime: string) => {
    // Calculate end time with default 30-minute duration
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date();
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // Add 30 minutes
    const endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;
    
      setAppointmentFormData(prev => ({
        ...prev,
      startTime: startTime,
      endTime: endTime
    }));
  };

  // Helper function to check if a slot is in the past
  const isSlotInPast = (slotTime: string, selectedDate?: string) => {
    if (!selectedDate) return false;
    
    const now = new Date();
    const isToday = new Date(selectedDate).toDateString() === now.toDateString();
    
    if (!isToday) return false;
    
    const slotDateTime = new Date();
    const [hours, minutes] = slotTime.split(':').map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);
    
    // Add 30 minutes buffer to current time
    const bufferTime = new Date(now.getTime() + 30 * 60 * 1000);
    
    return slotDateTime < bufferTime;
  };

  const checkExistingAppointment = async (patientId: string, appointmentDate: string) => {
    if (!patientId || !appointmentDate) return;
    
    try {
      console.log('🔍 Checking existing active appointment for patient:', patientId);
      const result = await appointmentsApi.checkExistingAppointment(patientId, appointmentDate);
      
      if (result.success && result.data.hasAppointment && !result.data.canCreateNew) {
        setExistingAppointments(prev => ({
          ...prev,
          [patientId]: {
            ...result.data.existingAppointment,
            reason: result.data.reason
          }
        }));
        console.log('⚠️ Active appointment found, cannot create new one:', result.data.existingAppointment);
      } else {
        setExistingAppointments(prev => {
          const newState = { ...prev };
          delete newState[patientId];
          return newState;
        });
        console.log('✅ No active appointment found, can create new one');
      }
    } catch (error) {
      console.error('❌ Error checking existing appointment:', error);
    }
  };

  const handleCreatePatient = async (): Promise<string | null> => {
    console.log('🔍 handleCreatePatient called');
    
    if (!validatePatientForm()) {
      console.log('❌ Patient form validation failed');
      return null;
    }

    try {
      setIsSubmitting(true);
      console.log('🔍 Creating patient with data:', patientFormData);
      
      // Generate email if not provided
      let email = patientFormData.email.trim();
      if (!email) {
        console.log('🔍 Generating email for patient');
        email = await generateUniqueEmail(patientFormData.name);
        console.log('🔍 Generated email:', email);
      }

      const patientData = {
        name: patientFormData.name.trim(),
        email: email,
        phone: patientFormData.phone,
        dateOfBirth: patientFormData.dateOfBirth,
        gender: patientFormData.gender,
        area: patientFormData.address,
        city: '', // Default empty city
        medicalHistory: {
          allergies: [],
          medications: [],
          conditions: [],
          previousSurgeries: []
        },
        isActive: true
      };

      console.log('🔍 Sending patient data to service:', patientData);
      const response = await patientService.createPatient(branchId, patientData);
      console.log('🔍 Patient creation response:', response);
      
      if (response.success) {
        showSuccessToast('Patient Created Successfully', 'New patient has been added to the system.');
        console.log('✅ Patient created successfully with ID:', response.data._id);
        return response.data._id;
      } else {
        console.log('❌ Patient creation failed - no success flag');
        throw new Error('Failed to create patient');
      }
    } catch (error: any) {
      console.error('❌ Error creating patient:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      let errorMessage = 'Failed to create patient';
      let errorDetails = '';
      
      // Handle different types of errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        if (errorData.details) {
          errorDetails = errorData.details;
        } else if (errorData.error) {
          errorDetails = errorData.error;
        }
        
        // Handle specific error types
        if (error.response.status === 400) {
          errorMessage = 'Invalid patient data. Please check all fields and try again.';
        } else if (error.response.status === 409) {
          errorMessage = 'Patient with this email already exists. Please use a different email.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to create patients.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error occurred while creating patient. Please try again later.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show detailed error message using error handler
      handleApiError(error, 'create patient');
      
      // Log additional context for debugging
      console.error('❌ Patient creation error context:', {
        patientName: patientFormData.name,
        email: patientFormData.email,
        phone: patientFormData.phone,
        branchId: branchId
      });
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔍 handleSubmit called');
    e.preventDefault();
    
    console.log('🔍 Calling validateAppointmentForm...');
    if (!validateAppointmentForm()) {
      console.log('❌ Form validation failed, stopping submission');
      return;
    }
    console.log('✅ Form validation passed, proceeding with submission');

    try {
      setIsSubmitting(true);

      let patientId = appointmentFormData.patientId;

      // If creating new patient, create it first
      if (activeTab === 'new') {
        console.log('🔍 Creating new patient for appointment');
        console.log('🔍 Patient form data:', patientFormData);
        
        // Create the patient first
        const newPatientId = await handleCreatePatient();
        console.log('🔍 New patient ID received:', newPatientId);
        
        if (!newPatientId) {
          console.log('❌ Failed to create patient, stopping appointment creation');
          showErrorToast('Failed to create patient. Please try again.');
          return;
        }
        
        patientId = newPatientId;
        console.log('✅ Using new patient ID for appointment:', patientId);
      } else {
        console.log('🔍 Using existing patient ID:', patientId);
      }

      // Check for existing active appointment for this patient
      console.log('🔍 Checking for existing active appointment...');
      try {
        const existingCheck = await appointmentsApi.checkExistingAppointment(
          patientId,
          appointmentFormData.appointmentDate
        );
        
        if (existingCheck.success && !existingCheck.data.canCreateNew) {
          console.log('❌ Patient has an active appointment, cannot create new one:', existingCheck.data);
          
        showErrorToast(
          'Active Appointment Found',
          existingCheck.data.reason || 'Patient already has an active appointment. Please complete or cancel the existing appointment before creating a new one.'
        );
          return;
        }
        
        console.log('✅ No active appointment found, proceeding with creation');
      } catch (error) {
        console.error('❌ Error checking for existing appointment:', error);
        // Continue with appointment creation if check fails
        console.log('⚠️ Continuing with appointment creation despite check failure');
      }

      const appointmentData = {
        patientId,
        doctorId: appointmentFormData.doctorId || undefined,
        appointmentDate: appointmentFormData.appointmentDate,
        startTime: appointmentFormData.startTime,
        endTime: appointmentFormData.endTime, // Backend will calculate if not provided
        visitType: appointmentFormData.visitType,
        reasonForVisit: appointmentFormData.reasonForVisit,
        notes: appointmentFormData.notes || '',
        duration: 30, // Default duration in minutes
        isWalkIn: appointmentFormData.visitType === 'walk_in',
        metadata: {
          source: 'receptionist_dashboard',
          priority: 'normal' as const
        }
      };

      console.log('📅 Creating appointment with data:', appointmentData);
      console.log('📅 Appointment data validation:', {
        patientId: !!patientId,
        patientIdType: typeof patientId,
        patientIdValue: patientId,
        doctorId: appointmentFormData.doctorId,
        doctorIdType: typeof appointmentFormData.doctorId,
        appointmentDate: appointmentFormData.appointmentDate,
        startTime: appointmentFormData.startTime,
        endTime: appointmentFormData.endTime,
        visitType: appointmentFormData.visitType,
        reasonForVisit: appointmentFormData.reasonForVisit,
        isWalkIn: appointmentFormData.visitType === 'walk_in',
        duration: 30
      });
      
      // Additional validation before sending
      if (!patientId || patientId.trim() === '') {
        throw new Error('Patient ID is required');
      }
      
      if (!appointmentFormData.appointmentDate) {
        throw new Error('Appointment date is required');
      }
      
      if (!appointmentFormData.startTime) {
        throw new Error('Start time is required');
      }
      
      if (!appointmentFormData.reasonForVisit || appointmentFormData.reasonForVisit.trim() === '') {
        throw new Error('Reason for visit is required');
      }
      
      // Create the appointment using the API
      console.log('📅 About to call appointmentsApi.createAppointment with:', appointmentData);
      
      const response = await appointmentsApi.createAppointment(appointmentData);
      console.log('📅 Appointment creation response:', response);
      
      if (response) {
        console.log('✅ Appointment created successfully, calling onSuccess callback');
        onSuccess(response); // Pass the created appointment data to parent
      handleClose();
        
        // Refresh the receptionist data to show the new appointment
        console.log('🔄 Refreshing receptionist data after appointment creation...');
        dispatch(refreshReceptionistData('all'));
      } else {
        throw new Error('Failed to create appointment - no response received');
      }
    } catch (error: any) {
      console.error('❌ Error creating appointment:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
      let errorMessage = 'Failed to create appointment';
      let errorDetails = '';
      
      // Handle different types of errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        console.error('❌ Error data details:', {
          message: errorData.message,
          details: errorData.details,
          error: errorData.error,
          stack: errorData.stack
        });
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        if (errorData.details) {
          errorDetails = errorData.details;
        } else if (errorData.error) {
          errorDetails = errorData.error;
        }
        
        // Handle specific error types
        if (error.response.status === 400) {
          errorMessage = 'Invalid appointment data. Please check all fields and try again.';
          console.error('❌ Validation error details:', errorData);
        } else if (error.response.status === 409) {
          errorMessage = 'Appointment conflict detected. Please choose a different time slot.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to create this appointment.';
        } else if (error.response.status === 404) {
          errorMessage = 'Patient or doctor not found. Please refresh and try again.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
          console.error('❌ Server error details:', errorData);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show detailed error message using error handler
      handleApiError(error, 'create appointment');
      
      // Log additional context for debugging
      console.error('❌ Error context:', {
        patientId: appointmentFormData.patientId,
        doctorId: appointmentFormData.doctorId,
        appointmentDate: appointmentFormData.appointmentDate,
        startTime: appointmentFormData.startTime,
        endTime: appointmentFormData.endTime,
        visitType: appointmentFormData.visitType,
        reasonForVisit: appointmentFormData.reasonForVisit,
        activeTab: activeTab,
        branchId: branchId
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectExistingPatient = (patient: Patient) => {
    setShowDuplicateDetails(false);
    setShowAllDuplicates(false);
    setPotentialDuplicates([]);
    setSimilarityScore(0);
    setDuplicateWarning('');
    showInfoToast(`Selected existing patient: ${patient.name}`);
    handleClose();
    // Pass the selected patient data as appointment data
    onSuccess({ 
      patient: patient,
      message: 'Existing patient selected',
      type: 'existing_patient_selected'
    });
  };

  const handleClose = () => {
    setPatientFormData(initialPatientFormData);
    setAppointmentFormData(initialAppointmentFormData);
    setErrors({});
    setActiveTab('existing');
    setSearchTerm('');
    setDoctorSearchTerm('');
    setAvailableSlots([]);
    setPotentialDuplicates([]);
    setSimilarityScore(0);
    setDuplicateWarning('');
    setShowDuplicateDetails(false);
    setShowAllDuplicates(false);
    setIsPatientDropdownOpen(false);
    setIsDoctorDropdownOpen(false);
    if (phoneCheckTimeout) {
      clearTimeout(phoneCheckTimeout);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 rounded-md">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold">Create New Appointment</h2>
                <p className="text-white/80 text-xs">Schedule a patient appointment</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form id="appointment-form" onSubmit={handleSubmit} className="p-4">
          {/* Patient Selection Section */}
          <div className="mb-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Patient Selection</h3>
                  </div>
                  <div className="flex space-x-1 bg-white p-0.5 rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('existing')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  activeTab === 'existing'
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                      <div className="flex items-center gap-1.5">
                        <Search className="h-3 w-3" />
                        Existing
                      </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  activeTab === 'new'
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                      <div className="flex items-center gap-1.5">
                        <Plus className="h-3 w-3" />
                        New
                      </div>
              </button>
                  </div>
                </div>
            </div>

              {/* Content */}
              <div className="p-4">

            {activeTab === 'existing' ? (
                  <div className="space-y-3">
                    {/* Patient Dropdown */}
                    <div className="relative dropdown-container">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Select Patient *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPatientDropdownOpen(!isPatientDropdownOpen);
                          setIsDoctorDropdownOpen(false); // Close doctor dropdown when opening patient dropdown
                        }}
                        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {appointmentFormData.patientId ? (
                            (() => {
                              const selectedPatient = patients.find(p => p._id === appointmentFormData.patientId);
                              return selectedPatient ? (
                                <>
                                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                    {selectedPatient.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-gray-900">{selectedPatient.name}</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-500">Select a patient...</span>
                                </>
                              );
                            })()
                          ) : (
                            <>
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-500">Select a patient...</span>
                            </>
                          )}
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isPatientDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Search Input */}
                      {isPatientDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                          <div className="p-2 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                                placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                autoFocus
                  />
                            </div>
                </div>
                
                          {/* Patient List */}
                          <div className="max-h-48 overflow-y-auto">
                  {filteredPatients.length === 0 ? (
                              <div className="p-3 text-center text-gray-500">
                                <div className="flex flex-col items-center space-y-1">
                                  <Search className="h-4 w-4 text-gray-300" />
                                  <p className="text-xs font-medium text-gray-900">
                                    {searchTerm ? 'No patients found' : 'No patients available'}
                                  </p>
                      </div>
                    </div>
                  ) : (
                              <div className="p-1">
                      {filteredPatients.map((patient) => {
                        const hasActiveAppointment = existingAppointments[patient._id];
                        const isSelected = appointmentFormData.patientId === patient._id;
                        return (
                          <button
                            key={patient._id}
                            type="button"
                                      onClick={() => {
                                        handleAppointmentInputChange('patientId', patient._id);
                                        setIsPatientDropdownOpen(false);
                                        setSearchTerm('');
                                      }}
                            disabled={hasActiveAppointment}
                                      className={`w-full p-2 text-left rounded transition-all duration-200 ${
                              hasActiveAppointment 
                                          ? 'bg-red-50 text-red-600 cursor-not-allowed opacity-60' 
                                : isSelected
                                            ? 'bg-blue-50 text-blue-900' 
                                            : 'text-gray-900 hover:bg-blue-50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    hasActiveAppointment 
                                      ? 'bg-red-100 text-red-600' 
                                      : isSelected 
                                                ? 'bg-blue-100 text-blue-600' 
                                        : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {patient.name.charAt(0).toUpperCase()}
                                  </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                              <h4 className="font-medium truncate text-xs">{patient.name}</h4>
                                      {hasActiveAppointment && (
                                                <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                              )}
                                              {isSelected && !hasActiveAppointment && (
                                                <CheckCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                      )}
                                    </div>
                                            <div className="text-xs text-gray-500 truncate">
                                      {patient.email} • {patient.phone}
                                    </div>
                                      </div>
                                  </div>
                                        {hasActiveAppointment && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 flex-shrink-0 ml-2">
                                            Active
                                          </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                        </div>
                      )}
                    </div>

                    {/* Error Messages */}
                {errors.patientId && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                          <p className="text-xs text-red-600">{errors.patientId}</p>
                        </div>
                      </div>
                )}
                
                {/* Active appointment warning */}
                {appointmentFormData.patientId && appointmentFormData.appointmentDate && existingAppointments[appointmentFormData.patientId] && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            <p className="font-medium text-red-800 mb-1">Active Appointment Found</p>
                            <p className="text-red-700 mb-1">
                              Patient has an active {existingAppointments[appointmentFormData.patientId].status} appointment.
                            </p>
                            <p className="text-red-700 font-medium">
                              Complete or cancel existing appointment first.
                        </p>
                        {existingAppointments[appointmentFormData.patientId].reason && (
                              <p className="text-red-600 mt-1 text-xs bg-red-100 p-1.5 rounded">
                            {existingAppointments[appointmentFormData.patientId].reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    value={patientFormData.name}
                    onChange={(e) => handlePatientInputChange('name', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Enter patient full name"
                  />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                
                <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Email Address
                          <span className="text-xs text-gray-500 ml-1 font-normal">(Auto-generated)</span>
                   </label>
                        <div className="space-y-1">
                  <input
                    type="email"
                    value={patientFormData.email}
                    onChange={(e) => handlePatientInputChange('email', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Enter email address"
                     />
                     <button
                       type="button"
                       onClick={async () => {
                         const generatedEmail = await generateUniqueEmail(patientFormData.name);
                         if (generatedEmail) {
                           setPatientFormData(prev => ({ ...prev, email: generatedEmail }));
                         }
                       }}
                            className="w-full px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                       disabled={!patientFormData.name.trim()}
                     >
                       Generate Email
                     </button>
                   </div>
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                        <div className="relative">
                  <input
                    type="tel"
                    value={patientFormData.phone}
                    onChange={(e) => handlePatientInputChange('phone', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter phone number"
                  />
                          {isCheckingDuplicates && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                        </div>
                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                        {duplicateWarning && (
                          <div className={`text-xs p-3 rounded-md mt-2 ${
                            duplicateWarning.includes('High similarity') 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : duplicateWarning.includes('Medium similarity')
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span>{duplicateWarning}</span>
                              {potentialDuplicates.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setShowDuplicateDetails(!showDuplicateDetails)}
                                  className="ml-2 underline hover:no-underline font-medium"
                                >
                                  {showDuplicateDetails ? 'Hide Details' : 'View Details'}
                                </button>
                              )}
                </div>
                
                            {showDuplicateDetails && potentialDuplicates.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-gray-700">
                                    Similar patients found ({potentialDuplicates.length}):
                                  </div>
                                  {potentialDuplicates.length > 3 && (
                                    <button
                                      type="button"
                                      onClick={() => setShowAllDuplicates(!showAllDuplicates)}
                                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                                    >
                                      {showAllDuplicates ? 'Show Less' : `Show All (${potentialDuplicates.length})`}
                                    </button>
                                  )}
                                </div>
                                
                                {(showAllDuplicates ? potentialDuplicates : potentialDuplicates.slice(0, 3)).map((duplicate, index) => (
                                  <div key={duplicate._id || index} className="bg-white p-2 rounded border text-xs">
                                    <div className="flex items-center justify-between">
                <div>
                                        <div className="font-medium text-gray-900">{duplicate.name}</div>
                                        <div className="text-gray-600">
                                          📞 {duplicate.phone} | 📧 {duplicate.email || 'No email'} | 🎂 {duplicate.dateOfBirth || 'No DOB'}
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleSelectExistingPatient(duplicate)}
                                          className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-md hover:bg-emerald-700 font-medium"
                                        >
                                          Select
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                
                                {!showAllDuplicates && potentialDuplicates.length > 3 && (
                                  <div className="text-xs text-gray-500 italic text-center py-1">
                                    ... and {potentialDuplicates.length - 3} more patients
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={patientFormData.dateOfBirth}
                    onChange={(e) => handlePatientInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                        {errors.dateOfBirth && <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>}
                </div>
                
                <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    value={patientFormData.gender}
                    onChange={(e) => handlePatientInputChange('gender', e.target.value as 'male' | 'female' | 'other')}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={patientFormData.address}
                    onChange={(e) => handlePatientInputChange('address', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Enter full address"
                  />
                        {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                      </div>
                </div>
              </div>
            )}
              </div>
            </div>
          </div>

          {/* Doctor Selection Section */}
          <div className="mb-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-md">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Doctor Selection</h3>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Doctor Dropdown */}
                <div className="relative dropdown-container">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Select Doctor</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDoctorDropdownOpen(!isDoctorDropdownOpen);
                      setIsPatientDropdownOpen(false); // Close patient dropdown when opening doctor dropdown
                    }}
                    className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {appointmentFormData.doctorId ? (
                        (() => {
                          const selectedDoctor = doctors.find(d => d._id === appointmentFormData.doctorId);
                          return selectedDoctor ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                                {selectedDoctor.firstName.charAt(0).toUpperCase()}{selectedDoctor.lastName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-gray-900">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-500">Select a doctor...</span>
                            </>
                          );
                        })()
                      ) : appointmentFormData.doctorId === '' ? (
                        <>
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-gray-500">No doctor assigned</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-500">Select a doctor...</span>
                        </>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDoctorDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Search Input */}
                  {isDoctorDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                            value={doctorSearchTerm}
                            onChange={(e) => setDoctorSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                            autoFocus
                  />
                        </div>
                </div>
                
                      {/* Doctor List */}
                      <div className="max-h-48 overflow-y-auto">
                  {doctors.length === 0 ? (
                          <div className="p-3 text-center text-gray-500">
                            <div className="flex flex-col items-center space-y-1">
                              <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-xs font-medium text-gray-900">No doctors available</p>
                            </div>
                          </div>
                        ) : filteredDoctors.length === 0 ? (
                          <div className="p-3 text-center text-gray-500">
                            <div className="flex flex-col items-center space-y-1">
                              <Search className="h-4 w-4 text-gray-300" />
                              <p className="text-xs font-medium text-gray-900">No doctors found</p>
                              <p className="text-xs text-gray-500">Try adjusting your search terms</p>
                            </div>
                    </div>
                  ) : (
                          <div className="p-1">
                            {/* No Doctor Option */}
                      <button
                        type="button"
                              onClick={() => {
                                handleAppointmentInputChange('doctorId', '');
                                setIsDoctorDropdownOpen(false);
                                setDoctorSearchTerm('');
                              }}
                              className={`w-full p-2 text-left rounded transition-all duration-200 ${
                          appointmentFormData.doctorId === ''
                                  ? 'bg-gray-50 text-gray-900' 
                                  : 'text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                          </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      <h4 className="font-medium text-xs">No doctor assigned</h4>
                          {appointmentFormData.doctorId === '' && (
                                        <CheckCircle className="h-3 w-3 text-gray-600 flex-shrink-0" />
                          )}
                                    </div>
                                    <p className="text-xs text-gray-500">Can be assigned later</p>
                                  </div>
                                </div>
                        </div>
                      </button>
                      
                            {/* Doctor Options */}
                            {filteredDoctors.map((doctor) => {
                        const isSelected = appointmentFormData.doctorId === doctor._id;
                        return (
                          <button
                            key={doctor._id}
                            type="button"
                                  onClick={() => {
                                    handleAppointmentInputChange('doctorId', doctor._id);
                                    setIsDoctorDropdownOpen(false);
                                    setDoctorSearchTerm('');
                                  }}
                                  className={`w-full p-2 text-left rounded transition-all duration-200 ${
                              isSelected
                                      ? 'bg-green-50 text-green-900' 
                                      : 'text-gray-900 hover:bg-green-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                        isSelected 
                                          ? 'bg-green-100 text-green-600' 
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {doctor.firstName.charAt(0).toUpperCase()}{doctor.lastName.charAt(0).toUpperCase()}
                              </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1">
                                          <h4 className="font-medium text-xs">
                                            Dr. {doctor.firstName} {doctor.lastName}
                                          </h4>
                              {isSelected && (
                                            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                          {doctor.specialization} {doctor.email && `• ${doctor.email}`}
                                        </div>
                                      </div>
                                    </div>
                            </div>
                          </button>
                        );
                      })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details Section */}
          <div className="mb-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 rounded-md">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Appointment Details</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">

              {/* Visit Type */}
              <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Visit Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`relative flex items-center p-2.5 rounded-md border cursor-pointer transition-all duration-200 ${
                      appointmentFormData.visitType === 'scheduled'
                        ? 'border-purple-300 bg-purple-50 shadow-sm ring-1 ring-purple-200'
                        : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50'
                    }`}>
                    <input
                      type="radio"
                      value="scheduled"
                      checked={appointmentFormData.visitType === 'scheduled'}
                      onChange={(e) => handleAppointmentInputChange('visitType', e.target.value as 'walk_in' | 'scheduled')}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          appointmentFormData.visitType === 'scheduled'
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {appointmentFormData.visitType === 'scheduled' && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Scheduled</div>
                          <div className="text-xs text-gray-500">Future date</div>
                        </div>
                      </div>
                  </label>
                    
                    <label className={`relative flex items-center p-2.5 rounded-md border cursor-pointer transition-all duration-200 ${
                      appointmentFormData.visitType === 'walk_in'
                        ? 'border-purple-300 bg-purple-50 shadow-sm ring-1 ring-purple-200'
                        : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50'
                    }`}>
                    <input
                      type="radio"
                      value="walk_in"
                      checked={appointmentFormData.visitType === 'walk_in'}
                      onChange={(e) => handleAppointmentInputChange('visitType', e.target.value as 'walk_in' | 'scheduled')}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          appointmentFormData.visitType === 'walk_in'
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {appointmentFormData.visitType === 'walk_in' && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Walk-in</div>
                          <div className="text-xs text-gray-500">Immediate</div>
                        </div>
                      </div>
                  </label>
                </div>
              </div>

              {/* Appointment Date and Time - Only for scheduled appointments */}
              {appointmentFormData.visitType === 'scheduled' && (
                <>
              {/* Appointment Date */}
              <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Appointment Date *</label>
                <input
                  type="date"
                  value={appointmentFormData.appointmentDate}
                  onChange={(e) => handleAppointmentInputChange('appointmentDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                      {errors.appointmentDate && <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.appointmentDate}
                      </p>}
              </div>

              {/* Time Slot */}
              <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Time Slot *</label>
                {isLoadingSlots ? (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          <span className="text-sm">Loading slots...</span>
                  </div>
                ) : slotLoadingError ? (
                  <div className="space-y-2">
                          <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <AlertCircle className="h-3 w-3 text-red-600" />
                                <span className="text-red-700 text-xs font-medium">{slotLoadingError}</span>
                              </div>
                        <button
                          type="button"
                          onClick={() => loadAvailableSlots()}
                                className="px-2 py-0.5 text-xs bg-red-100 hover:bg-red-200 rounded transition-colors font-medium"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                          <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                      {generateTimeSlots(appointmentFormData.appointmentDate).map((slot) => {
                        const isAvailable = availableSlots.includes(slot.start);
                        const isSelected = appointmentFormData.startTime === slot.start;
                        const isPastSlot = isSlotInPast(slot.start, appointmentFormData.appointmentDate);
                        
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => isAvailable && !isPastSlot ? handleTimeSlotSelect(slot.start) : null}
                            disabled={!isAvailable || isPastSlot}
                                  className={`px-2 py-1 text-xs rounded border transition-all duration-200 ${
                              isSelected
                                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : isPastSlot
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : isAvailable
                                          ? 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="text-center">
                                    <div className="font-medium text-xs">{slot.displayStart}</div>
                              {isPastSlot && (
                                      <div className="text-xs text-gray-400">Past</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Refresh Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {availableSlots.length} available slots
                      </span>
                      <button
                        type="button"
                        onClick={() => loadAvailableSlots()}
                        className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors font-medium flex items-center gap-1"
                        title="Refresh available slots (useful after appointments are cancelled)"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Refresh
                      </button>
                    </div>
                          <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                      {generateTimeSlots(appointmentFormData.appointmentDate).map((slot) => {
                        const isAvailable = availableSlots.includes(slot.start);
                        const isSelected = appointmentFormData.startTime === slot.start;
                        const isPastSlot = isSlotInPast(slot.start, appointmentFormData.appointmentDate);
                        
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => isAvailable && !isPastSlot ? handleTimeSlotSelect(slot.start) : null}
                            disabled={!isAvailable || isPastSlot}
                                  className={`px-2 py-1 text-xs rounded border transition-all duration-200 ${
                              isSelected
                                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : isPastSlot
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : isAvailable
                                          ? 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="text-center">
                                    <div className="font-medium text-xs">{slot.displayStart}</div>
                              {isPastSlot && (
                                      <div className="text-xs text-gray-400">Past</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Legend */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-purple-600 rounded"></div>
                              <span className="text-xs">Selected</span>
                      </div>
                      <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-white border border-gray-300 rounded"></div>
                              <span className="text-xs">Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-gray-100 border border-gray-200 rounded"></div>
                              <span className="text-xs">Past</span>
                      </div>
                      <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-gray-200 rounded"></div>
                              <span className="text-xs">Unavailable</span>
                      </div>
                    </div>
                  </div>
                )}
                      {errors.startTime && <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.startTime}
                      </p>}
              </div>
                </>
              )}

              {/* Walk-in Time Display */}
              {appointmentFormData.visitType === 'walk_in' && (
                  <div className={`border rounded-md p-2.5 ${isBranchOpen ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                      {isBranchOpen ? (
                          <div className="p-1 bg-blue-100 rounded-full">
                            <svg className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                          </div>
                      ) : (
                          <div className="p-1 bg-red-100 rounded-full">
                            <svg className="h-3 w-3 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                          </div>
                      )}
                    </div>
                      <div className="flex-1">
                        <h3 className={`text-sm font-semibold ${isBranchOpen ? 'text-blue-800' : 'text-red-800'}`}>
                        Walk-in Appointment
                      </h3>
                        <div className={`mt-1 text-xs ${isBranchOpen ? 'text-blue-700' : 'text-red-700'}`}>
                        {isBranchOpen ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium">Date:</span>
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {appointmentFormData.appointmentDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium">Time:</span>
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {appointmentFormData.startTime && appointmentFormData.endTime 
                                    ? `${formatTimeTo12Hour(appointmentFormData.startTime)} - ${formatTimeTo12Hour(appointmentFormData.endTime)}`
                                    : 'Setting up...'
                                  }
                                </span>
                              </div>
                              <p className="text-xs text-blue-600 mt-1 bg-blue-100 p-1.5 rounded">
                                Auto-set to current time
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-medium text-red-800">Walk-in not available</p>
                              <p className="text-xs bg-red-100 p-1.5 rounded">{branchHoursMessage}</p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className="font-medium text-red-700">Time:</span>
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">
                                  Not available
                                </span>
                              </div>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Reason for Visit */}
            <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Visit *</label>
              <textarea
                value={appointmentFormData.reasonForVisit}
                onChange={(e) => handleAppointmentInputChange('reasonForVisit', e.target.value)}
                    rows={2}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                placeholder="Describe the reason for the appointment..."
              />
                  {errors.reasonForVisit && <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.reasonForVisit}
                  </p>}
            </div>

            {/* Notes */}
            <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                value={appointmentFormData.notes}
                onChange={(e) => handleAppointmentInputChange('notes', e.target.value)}
                rows={2}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                placeholder="Additional notes or special instructions..."
              />
            </div>
              </div>
            </div>
          </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="appointment-form"
              disabled={isSubmitting || (appointmentFormData.visitType === 'walk_in' && !isBranchOpen)}
              className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{activeTab === 'new' ? 'Creating Patient & Appointment...' : 'Creating Appointment...'}</span>
                </>
              ) : appointmentFormData.visitType === 'walk_in' && !isBranchOpen ? (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Walk-in Not Available</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>{activeTab === 'new' ? 'Create Patient & Appointment' : 'Create Appointment'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
