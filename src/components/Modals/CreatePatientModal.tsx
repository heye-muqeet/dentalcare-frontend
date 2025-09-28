import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../lib/hooks';
import type { RootState } from '../../lib/store/store';
import { patientService } from '../../lib/api/services/patients';
import { toast } from 'sonner';
import { LoadingButton } from '../Loader';
import api from '../../lib/api/axios';
import type { Patient } from '../../lib/api/services/patients';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart,
  Shield,
  FileText,
  Plus,
  RefreshCw,
  UserPlus,
  CheckCircle
} from 'lucide-react';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  area: string;
  city: string;
  medicalHistory: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    previousSurgeries: string[];
  };
  isActive: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: PatientFormData = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  area: '',
  city: '',
  medicalHistory: {
    allergies: [],
    medications: [],
    conditions: [],
    previousSurgeries: []
  },
  isActive: true
};

export default function CreatePatientModal({ isOpen, onClose, onSuccess }: CreatePatientModalProps) {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedEmail, setSuggestedEmail] = useState('');
  
  // Duplicate detection state
  const [potentialDuplicates, setPotentialDuplicates] = useState<Patient[]>([]);
  const [similarityScore, setSimilarityScore] = useState(0);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');
  const [phoneCheckTimeout, setPhoneCheckTimeout] = useState<number | null>(null);
  const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);
  const [showAllDuplicates, setShowAllDuplicates] = useState(false);
  
  // Form field states for dynamic lists
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newSurgery, setNewSurgery] = useState('');

  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields only
    if (!formData.name.trim()) newErrors.name = 'Patient name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Auto-generate email when name changes
  useEffect(() => {
    console.log('🔍 Email generation effect triggered:', {
      name: formData.name,
      email: formData.email,
      nameTrimmed: formData.name.trim(),
      emailTrimmed: formData.email.trim()
    });
    
    if (formData.name.trim() && !formData.email.trim()) {
      console.log('🔍 Generating email for name:', formData.name);
      const generateEmail = async () => {
        try {
          const generatedEmail = await generateUniqueEmail(formData.name);
          console.log('🔍 Generated email:', generatedEmail);
          if (generatedEmail) {
            setFormData(prev => ({ ...prev, email: generatedEmail }));
          }
        } catch (error) {
          console.error('🔍 Error generating email:', error);
        }
      };
      generateEmail();
    }
  }, [formData.name]);

  // Real-time phone number duplicate checking
  useEffect(() => {
    if (formData.phone && formData.phone.length >= 10) {
      checkPhoneDuplicates(formData.phone);
    } else {
      setDuplicateWarning('');
    }

    // Cleanup timeout on unmount
    return () => {
      if (phoneCheckTimeout) {
        clearTimeout(phoneCheckTimeout);
      }
    };
  }, [formData.phone]);

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
      toast.warning('Could not verify email uniqueness. Using generated email.');
      return baseEmail;
    }
  };

  const checkForDuplicates = async (): Promise<boolean> => {
    if (!branchId) return false;
    
    setIsCheckingDuplicates(true);
    console.log('🔍 Starting duplicate check...');
    
    try {
      const duplicateCheckData = {
        name: formData.name,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email
      };
      
      console.log('🔍 Checking duplicates for:', duplicateCheckData);
      const response = await patientService.checkDuplicatePatients(branchId, duplicateCheckData);
      console.log('🔍 Duplicate check response:', response);
      
      if (response.success && response.data.hasDuplicates) {
        console.log('🔍 Duplicates found!', response.data.potentialDuplicates.length, 'potential matches');
        setPotentialDuplicates(response.data.potentialDuplicates);
        setSimilarityScore(response.data.similarityScore);
        setShowDuplicateDetails(true);
        return true; // Duplicates found
      }
      
      console.log('🔍 No duplicates found, proceeding with creation');
      return false; // No duplicates
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      toast.error('Failed to check for duplicate patients');
      return false;
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  // Real-time phone number checking
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
          name: formData.name || 'Unknown',
          phone: phone,
          dateOfBirth: formData.dateOfBirth || '1900-01-01',
          email: formData.email || ''
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


  // Medical history management functions
  const addAllergy = () => {
    if (newAllergy.trim() && !formData.medicalHistory.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          allergies: [...prev.medicalHistory.allergies, newAllergy.trim()]
        }
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        allergies: prev.medicalHistory.allergies.filter((_, i) => i !== index)
      }
    }));
  };

  const addMedication = () => {
    if (newMedication.trim() && !formData.medicalHistory.medications.includes(newMedication.trim())) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          medications: [...prev.medicalHistory.medications, newMedication.trim()]
        }
      }));
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        medications: prev.medicalHistory.medications.filter((_, i) => i !== index)
      }
    }));
  };

  const addCondition = () => {
    if (newCondition.trim() && !formData.medicalHistory.conditions.includes(newCondition.trim())) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          conditions: [...prev.medicalHistory.conditions, newCondition.trim()]
        }
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        conditions: prev.medicalHistory.conditions.filter((_, i) => i !== index)
      }
    }));
  };

  const addSurgery = () => {
    if (newSurgery.trim() && !formData.medicalHistory.previousSurgeries.includes(newSurgery.trim())) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          previousSurgeries: [...prev.medicalHistory.previousSurgeries, newSurgery.trim()]
        }
      }));
      setNewSurgery('');
    }
  };

  const removeSurgery = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        previousSurgeries: prev.medicalHistory.previousSurgeries.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !branchId) {
      return;
    }

    // Proceed with creation (duplicates are just warnings, not blockers)
    await createPatient();
  };

  const createPatient = async () => {
    if (!branchId) return;

    setIsSubmitting(true);
    try {
      console.log('Creating patient:', formData);
      
      const response = await patientService.createPatient(branchId, formData);
      
      if (response.success) {
        toast.success('Patient created successfully');
        handleClose();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating patient:', error);
      
      // Handle specific error types
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      let errorMessage = 'Failed to create patient';
      let fieldError = '';
      
      switch (status) {
        case 409:
          errorMessage = 'A patient with this email already exists. Please use a different email address.';
          fieldError = 'email';
          // Generate a suggested alternative email
          const emailParts = formData.email.split('@');
          if (emailParts.length === 2) {
            const suggestedAlt = `${emailParts[0]}.${Date.now().toString().slice(-4)}@${emailParts[1]}`;
            setSuggestedEmail(suggestedAlt);
          }
          break;
        case 400:
          errorMessage = errorData?.message || 'Invalid data provided. Please check all fields.';
          // Check for specific field validation errors
          if (errorData?.errors) {
            const fieldErrors = errorData.errors;
            if (fieldErrors.email) fieldError = 'email';
            else if (fieldErrors.phone) fieldError = 'phone';
          }
          break;
        case 422:
          errorMessage = errorData?.message || 'Validation failed. Please check your input.';
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        default:
          errorMessage = errorData?.message || 'Failed to create patient. Please try again.';
      }
      
      // Show toast notification
      toast.error(errorMessage);
      
      // Set form errors
      const newErrors: FormErrors = { submit: errorMessage };
      if (fieldError) {
        newErrors[fieldError] = `This ${fieldError} is already in use or invalid`;
      }
      setErrors(newErrors);
      
      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.querySelector('[data-error="submit"]');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setNewAllergy('');
    setNewMedication('');
    setNewCondition('');
    setNewSurgery('');
    setSuggestedEmail('');
    setPotentialDuplicates([]);
    setSimilarityScore(0);
    setDuplicateWarning('');
    setShowDuplicateDetails(false);
    setShowAllDuplicates(false);
    if (phoneCheckTimeout) {
      clearTimeout(phoneCheckTimeout);
    }
    onClose();
  };


  const handleSelectExistingPatient = (patient: Patient) => {
    setShowDuplicateDetails(false);
    setShowAllDuplicates(false);
    setPotentialDuplicates([]);
    setSimilarityScore(0);
    setDuplicateWarning('');
    toast.info(`Selected existing patient: ${patient.name}`);
    handleClose();
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Add New Patient</h2>
                <p className="text-white/80 text-sm">Create a new patient profile for your branch</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar light">
          <div className="p-4 space-y-4">
            {/* Error Message */}
            {errors.submit && (
              <div 
                data-error="submit"
                className="mb-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-sm animate-in slide-in-from-top-2 duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Patient Creation Failed</h3>
                    <p className="text-red-700 text-sm leading-relaxed">{errors.submit}</p>
                    {errors.email && (
                      <div className="mt-2 p-2 bg-red-100 rounded-md">
                        <p className="text-red-600 text-xs">
                          💡 <strong>Tip:</strong> Try using a different email address or check if this patient already exists in your system.
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrors(prev => ({ ...prev, submit: '', email: '' }));
                      setSuggestedEmail('');
                    }}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <User className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-semibold text-gray-900">Patient Information</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Patient Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter full patient name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Email Address *
                    <span className="text-xs text-gray-500 ml-1 font-normal">(Auto-generated)</span>
                  </label>
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        errors.email ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                          errors.email ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="patient@example.com"
                      />
                      {errors.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const generatedEmail = await generateUniqueEmail(formData.name);
                        if (generatedEmail) {
                          setFormData(prev => ({ ...prev, email: generatedEmail }));
                        }
                      }}
                      className="w-full px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors text-xs font-medium"
                      disabled={!formData.name.trim()}
                    >
                      Generate Email
                    </button>
                  </div>
                  {errors.email && (
                    <div className="space-y-2">
                      <div className="flex items-start space-x-1">
                        <svg className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-500 text-xs">{errors.email}</p>
                      </div>
                      {suggestedEmail && (
                        <div className="flex items-center space-x-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                          <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-emerald-700 text-xs">Try:</span>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('email', suggestedEmail);
                              setSuggestedEmail('');
                              setErrors(prev => ({ ...prev, email: '' }));
                            }}
                            className="text-emerald-600 hover:text-emerald-800 text-xs font-medium underline"
                          >
                            {suggestedEmail}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {isCheckingDuplicates && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                      </div>
                    )}
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                  {duplicateWarning && (
                    <div className={`text-xs p-3 rounded-md ${
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

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Date of Birth *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.dateOfBirth && <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Area *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.area ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter area/locality"
                    />
                  </div>
                  {errors.area && <p className="text-red-500 text-xs">{errors.area}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter city"
                    />
                  </div>
                  {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                </div>
              </div>
            </div>

            {/* Medical History - Optional */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <Heart className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-semibold text-gray-900">Medical History (Optional)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Allergies */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">Allergies</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Add allergy"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    />
                    <button
                      type="button"
                      onClick={addAllergy}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {formData.medicalHistory.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.medicalHistory.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-700"
                        >
                          {allergy}
                          <button
                            type="button"
                            onClick={() => removeAllergy(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medications */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">Current Medications</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Add medication"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                    />
                    <button
                      type="button"
                      onClick={addMedication}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {formData.medicalHistory.medications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.medicalHistory.medications.map((medication, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700"
                        >
                          {medication}
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="ml-1 text-blue-500 hover:text-blue-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medical Conditions */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">Medical Conditions</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Add condition"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                    />
                    <button
                      type="button"
                      onClick={addCondition}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {formData.medicalHistory.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.medicalHistory.conditions.map((condition, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700"
                        >
                          {condition}
                          <button
                            type="button"
                            onClick={() => removeCondition(index)}
                            className="ml-1 text-yellow-500 hover:text-yellow-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Previous Surgeries */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">Previous Surgeries</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSurgery}
                      onChange={(e) => setNewSurgery(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Add surgery"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSurgery())}
                    />
                    <button
                      type="button"
                      onClick={addSurgery}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {formData.medicalHistory.previousSurgeries.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.medicalHistory.previousSurgeries.map((surgery, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-700"
                        >
                          {surgery}
                          <button
                            type="button"
                            onClick={() => removeSurgery(index)}
                            className="ml-1 text-purple-500 hover:text-purple-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Compact Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText="Creating..."
                variant="primary"
                size="sm"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
              >
                Create Patient
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}
