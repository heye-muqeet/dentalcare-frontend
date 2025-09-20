import { useState } from 'react';
import { useAppSelector } from '../../lib/hooks';
import type { RootState } from '../../lib/store/store';
import { receptionistService } from '../../lib/api/services/receptionists';
import { toast } from 'sonner';
import { 
  FiX, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiClock, 
  FiEye, 
  FiEyeOff,
  FiPlus,
  FiShield,
  FiGlobe
} from 'react-icons/fi';

interface CreateReceptionistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReceptionistFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  employeeId: string;
  languages: string[];
  workingHours: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  permissions: string[];
  experienceYears: number;
  isActive: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: ReceptionistFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  employeeId: '',
  languages: [],
  workingHours: {
    monday: { start: '09:00', end: '17:00', isWorking: true },
    tuesday: { start: '09:00', end: '17:00', isWorking: true },
    wednesday: { start: '09:00', end: '17:00', isWorking: true },
    thursday: { start: '09:00', end: '17:00', isWorking: true },
    friday: { start: '09:00', end: '17:00', isWorking: true },
    saturday: { start: '09:00', end: '13:00', isWorking: false },
    sunday: { start: '09:00', end: '13:00', isWorking: false }
  },
  permissions: [],
  experienceYears: 0,
  isActive: true
};

const availablePermissions = [
  'appointment_management',
  'patient_registration',
  'billing_access',
  'report_viewing',
  'inventory_management',
  'schedule_management',
  'payment_processing',
  'patient_records_access'
];

export default function CreateReceptionistModal({ isOpen, onClose, onSuccess }: CreateReceptionistModalProps) {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [formData, setFormData] = useState<ReceptionistFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newLanguage, setNewLanguage] = useState('');

  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      // Basic Information
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day as keyof typeof prev.workingHours],
          [field]: value
        }
      }
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(1) || !branchId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating receptionist:', formData);
      
      const response = await receptionistService.createReceptionist(branchId, formData);
      
      if (response.success) {
        toast.success('Receptionist created successfully');
        handleClose();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating receptionist:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create receptionist';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setCurrentStep(1);
    setNewLanguage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add New Receptionist</h2>
              <p className="text-green-100 text-sm">Step {currentStep} of 3</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  <span className={`ml-2 text-sm ${
                    step <= currentStep ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Basic Info'}
                    {step === 2 && 'Professional'}
                    {step === 3 && 'Working Hours'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter first name"
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter last name"
                      />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter phone number"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Generate
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter employee ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Years of experience"
                  />
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Add language"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => (
                      <label key={permission} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center space-x-2">
                          <FiShield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 capitalize">
                            {permission.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Working Hours */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Working Hours</h3>
                {Object.entries(formData.workingHours).map(([day, schedule]) => (
                  <div key={day} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-20">
                      <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={schedule.isWorking}
                        onChange={(e) => handleWorkingHoursChange(day, 'isWorking', e.target.checked)}
                        className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600">Working</span>
                    </label>
                    {schedule.isWorking && (
                      <>
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" />
                      <span>Create Receptionist</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {errors.submit && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}
      </div>
    </div>
  );
}
