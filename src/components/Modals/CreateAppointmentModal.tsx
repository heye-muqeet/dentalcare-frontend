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
import { 
  X, 
  Calendar, 
  Plus,
  Search,
  ChevronDown,
  CheckCircle,
  AlertCircle
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
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotLoadingError, setSlotLoadingError] = useState<string | null>(null);
  const [isBranchOpen, setIsBranchOpen] = useState(true);
  const [branchHoursMessage, setBranchHoursMessage] = useState<string>('');
  const [existingAppointments, setExistingAppointments] = useState<{[patientId: string]: any}>({});
  
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
        
        slots.push({ start: time, end: endTime });
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
      }
    } else {
      // Reset branch status for scheduled appointments
      setIsBranchOpen(true);
      setBranchHoursMessage('');
    }
  }, [appointmentFormData.visitType]);

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
        endTime: appointmentFormData.endTime,
        visitType: appointmentFormData.visitType,
        reasonForVisit: appointmentFormData.reasonForVisit,
        notes: appointmentFormData.notes || '',
        isWalkIn: appointmentFormData.visitType === 'walk_in',
        metadata: {
          source: 'receptionist_dashboard',
          priority: 'normal' as const
        }
      };

      console.log('📅 Creating appointment with data:', appointmentData);
      
      // Create the appointment using the API
      const response = await appointmentsApi.createAppointment(appointmentData);
      
      console.log('📅 Appointment creation response:', response);
      
      if (response) {
        const successMessage = activeTab === 'new' 
          ? 'Patient and appointment created successfully!' 
          : 'Appointment created successfully!';
        showSuccessToast(successMessage, 'Appointment has been scheduled successfully.');
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
      
      let errorMessage = 'Failed to create appointment';
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
          errorMessage = 'Invalid appointment data. Please check all fields and try again.';
        } else if (error.response.status === 409) {
          errorMessage = 'Appointment conflict detected. Please choose a different time slot.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to create this appointment.';
        } else if (error.response.status === 404) {
          errorMessage = 'Patient or doctor not found. Please refresh and try again.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
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
        activeTab: activeTab
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPatientFormData(initialPatientFormData);
    setAppointmentFormData(initialAppointmentFormData);
    setErrors({});
    setActiveTab('existing');
    setSearchTerm('');
    setAvailableSlots([]);
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
          <form onSubmit={handleSubmit} className="p-4">
          {/* Patient Selection Tabs */}
          <div className="mb-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('existing')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'existing'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Select Existing Patient
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'new'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create New Patient
              </button>
            </div>

            {activeTab === 'existing' ? (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search patients by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredPatients.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm ? 'No patients found matching your search' : 'No patients available'}
                    </div>
                  ) : (
                    filteredPatients.map((patient) => {
                      const hasActiveAppointment = existingAppointments[patient._id];
                      return (
                      <button
                        key={patient._id}
                        type="button"
                        onClick={() => handleAppointmentInputChange('patientId', patient._id)}
                          disabled={hasActiveAppointment}
                          className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 ${
                            hasActiveAppointment 
                              ? 'bg-red-50 border-red-200 cursor-not-allowed opacity-60' 
                              : appointmentFormData.patientId === patient._id 
                                ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                                : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900">
                                  {patient.name}
                                </div>
                                {hasActiveAppointment && (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.email} • {patient.phone}
                            </div>
                              {hasActiveAppointment && (
                                <div className="text-xs text-red-600 mt-1">
                                  Has active {existingAppointments[patient._id].status} appointment
                          </div>
                              )}
                            </div>
                            {appointmentFormData.patientId === patient._id && !hasActiveAppointment && (
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                      </button>
                      );
                    })
                  )}
                </div>
                {errors.patientId && (
                  <p className="mt-2 text-sm text-red-600">{errors.patientId}</p>
                )}
                
                {/* Active appointment warning */}
                {appointmentFormData.patientId && appointmentFormData.appointmentDate && existingAppointments[appointmentFormData.patientId] && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-red-800">Active Appointment Found</p>
                        <p className="text-red-700 mt-1">
                          This patient already has an active {existingAppointments[appointmentFormData.patientId].status} appointment scheduled for {existingAppointments[appointmentFormData.patientId].appointmentDate?.split('T')[0]} at {existingAppointments[appointmentFormData.patientId].startTime}.
                        </p>
                        <p className="text-red-700 mt-1 font-medium">
                          You cannot create a new appointment until the existing one is completed or cancelled.
                        </p>
                        {existingAppointments[appointmentFormData.patientId].reason && (
                          <p className="text-red-600 mt-1 text-xs">
                            {existingAppointments[appointmentFormData.patientId].reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    value={patientFormData.name}
                    onChange={(e) => handlePatientInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter patient name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Email (Optional)
                     <span className="text-xs text-gray-500 ml-1">- Auto-generated if empty</span>
                   </label>
                   <div className="space-y-2">
                  <input
                    type="email"
                    value={patientFormData.email}
                    onChange={(e) => handlePatientInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                       placeholder="Enter email address or leave empty for auto-generation"
                     />
                     <button
                       type="button"
                       onClick={async () => {
                         const generatedEmail = await generateUniqueEmail(patientFormData.name);
                         if (generatedEmail) {
                           setPatientFormData(prev => ({ ...prev, email: generatedEmail }));
                         }
                       }}
                       className="w-full px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
                       disabled={!patientFormData.name.trim()}
                     >
                       Generate Email
                     </button>
                   </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={patientFormData.phone}
                    onChange={(e) => handlePatientInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={patientFormData.dateOfBirth}
                    onChange={(e) => handlePatientInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    value={patientFormData.gender}
                    onChange={(e) => handlePatientInputChange('gender', e.target.value as 'male' | 'female' | 'other')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={patientFormData.address}
                    onChange={(e) => handlePatientInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter address"
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
              Appointment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={appointmentFormData.doctorId}
                    onChange={(e) => handleAppointmentInputChange('doctorId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">No doctor assigned</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
                <p className="mt-1 text-xs text-gray-500">Can be assigned later before treatment starts</p>
              </div>

              {/* Visit Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Type *</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="scheduled"
                      checked={appointmentFormData.visitType === 'scheduled'}
                      onChange={(e) => handleAppointmentInputChange('visitType', e.target.value as 'walk_in' | 'scheduled')}
                      className="mr-2 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm">Scheduled</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="walk_in"
                      checked={appointmentFormData.visitType === 'walk_in'}
                      onChange={(e) => handleAppointmentInputChange('visitType', e.target.value as 'walk_in' | 'scheduled')}
                      className="mr-2 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm">Walk-in</span>
                  </label>
                </div>
              </div>

              {/* Appointment Date and Time - Only for scheduled appointments */}
              {appointmentFormData.visitType === 'scheduled' && (
                <>
              {/* Appointment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
                <input
                  type="date"
                  value={appointmentFormData.appointmentDate}
                  onChange={(e) => handleAppointmentInputChange('appointmentDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {errors.appointmentDate && <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>}
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot *</label>
                {isLoadingSlots ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Loading available slots...
                  </div>
                ) : slotLoadingError ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <div className="flex items-center justify-between">
                        <span>{slotLoadingError}</span>
                        <button
                          type="button"
                          onClick={() => loadAvailableSlots()}
                          className="ml-2 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
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
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : isPastSlot
                                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                  : isAvailable
                                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-300'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-medium">{slot.start}</div>
                              <div className="text-xs opacity-75">{slot.end}</div>
                              {isPastSlot && (
                                <div className="text-xs text-gray-400 mt-1">Past</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
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
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : isPastSlot
                                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                  : isAvailable
                                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-300'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-medium">{slot.start}</div>
                              <div className="text-xs opacity-75">{slot.end}</div>
                              {isPastSlot && (
                                <div className="text-xs text-gray-400 mt-1">Past</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-50 border border-gray-100 rounded"></div>
                        <span>Past</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-100 rounded"></div>
                        <span>Unavailable</span>
                      </div>
                    </div>
                  </div>
                )}
                {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
              </div>
                </>
              )}

              {/* Walk-in Time Display */}
              {appointmentFormData.visitType === 'walk_in' && (
                <div className={`border rounded-lg p-4 ${isBranchOpen ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {isBranchOpen ? (
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${isBranchOpen ? 'text-blue-800' : 'text-red-800'}`}>
                        Walk-in Appointment
                      </h3>
                      <div className={`mt-1 text-sm ${isBranchOpen ? 'text-blue-700' : 'text-red-700'}`}>
                        {isBranchOpen ? (
                          <>
                            <p><strong>Date:</strong> {appointmentFormData.appointmentDate}</p>
                            <p><strong>Time:</strong> {appointmentFormData.startTime} - {appointmentFormData.endTime}</p>
                            <p className="text-xs mt-1 text-blue-600">Date and time are automatically set to current date and time</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-red-800">Walk-in appointments are not available</p>
                            <p className="text-xs mt-1">{branchHoursMessage}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit *</label>
              <textarea
                value={appointmentFormData.reasonForVisit}
                onChange={(e) => handleAppointmentInputChange('reasonForVisit', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Describe the reason for the appointment..."
              />
              {errors.reasonForVisit && <p className="mt-1 text-sm text-red-600">{errors.reasonForVisit}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={appointmentFormData.notes}
                onChange={(e) => handleAppointmentInputChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Additional notes or special instructions..."
              />
            </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (appointmentFormData.visitType === 'walk_in' && !isBranchOpen)}
              className="px-3 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  {activeTab === 'new' ? 'Creating Patient & Appointment...' : 'Creating Appointment...'}
                </>
              ) : appointmentFormData.visitType === 'walk_in' && !isBranchOpen ? (
                <>
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Walk-in Not Available
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  {activeTab === 'new' ? 'Create Patient & Appointment' : 'Create Appointment'}
                </>
              )}
            </button>
          </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
