import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../lib/hooks';
import type { RootState } from '../../lib/store/store';
import { patientService } from '../../lib/api/services/patients';
import { toast } from 'sonner';
import { 
  X, 
  Calendar, 
  Plus,
  Search,
  ChevronDown,
  CheckCircle
} from 'lucide-react';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointmentData: any) => void;
  patients: any[];
  doctors: any[];
}

interface PatientFormData {
  firstName: string;
  lastName: string;
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
  duration: number;
  isEmergency: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const initialPatientFormData: PatientFormData = {
  firstName: '',
  lastName: '',
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
  notes: '',
  duration: 30,
  isEmergency: false
};

export default function CreateAppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  patients, 
  doctors 
}: CreateAppointmentModalProps) {
  const user = useAppSelector((state: RootState) => state.auth.user);
  
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
  
  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  // Generate time slots (30-minute intervals from 9 AM to 6 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = minute === 30 
          ? `${(hour + 1).toString().padStart(2, '0')}:00`
          : `${hour.toString().padStart(2, '0')}:30`;
        slots.push({ start: time, end: endTime });
      }
    }
    return slots;
  };

  // Load available slots when date or doctor changes
  useEffect(() => {
    if (appointmentFormData.appointmentDate) {
      loadAvailableSlots();
    }
  }, [appointmentFormData.appointmentDate, appointmentFormData.doctorId]);

  const loadAvailableSlots = async () => {
    setIsLoadingSlots(true);
    try {
      // For now, we'll use all available slots
      // In a real implementation, this would check against existing appointments
      const slots = generateTimeSlots();
      setAvailableSlots(slots.map(slot => slot.start));
    } catch (error) {
      console.error('Error loading available slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const validatePatientForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!patientFormData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!patientFormData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!patientFormData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientFormData.email)) newErrors.email = 'Invalid email format';
    if (!patientFormData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!patientFormData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!patientFormData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAppointmentForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!appointmentFormData.patientId) newErrors.patientId = 'Patient selection is required';
    if (!appointmentFormData.appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
    if (!appointmentFormData.startTime) newErrors.startTime = 'Appointment time is required';
    if (!appointmentFormData.reasonForVisit.trim()) newErrors.reasonForVisit = 'Reason for visit is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePatientInputChange = (field: keyof PatientFormData, value: string) => {
    setPatientFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAppointmentInputChange = (field: keyof AppointmentFormData, value: any) => {
    setAppointmentFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTimeSlotSelect = (startTime: string) => {
    const slots = generateTimeSlots();
    const selectedSlot = slots.find(slot => slot.start === startTime);
    if (selectedSlot) {
      setAppointmentFormData(prev => ({
        ...prev,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end
      }));
    }
  };

  const handleCreatePatient = async (): Promise<string | null> => {
    if (!validatePatientForm()) return null;

    try {
      setIsSubmitting(true);
      const patientData = {
        name: `${patientFormData.firstName} ${patientFormData.lastName}`.trim(),
        email: patientFormData.email,
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

      const response = await patientService.createPatient(branchId, patientData);
      if (response.success) {
        toast.success('Patient created successfully');
        return response.data._id;
      } else {
        throw new Error('Failed to create patient');
      }
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast.error(error.response?.data?.message || 'Failed to create patient');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAppointmentForm()) return;

    try {
      setIsSubmitting(true);

      let patientId = appointmentFormData.patientId;

      // If creating new patient, create it first
      if (activeTab === 'new') {
        const newPatientId = await handleCreatePatient();
        if (!newPatientId) return;
        patientId = newPatientId;
      }

      const appointmentData = {
        patientId,
        doctorId: appointmentFormData.doctorId || undefined,
        appointmentDate: appointmentFormData.appointmentDate,
        startTime: appointmentFormData.startTime,
        endTime: appointmentFormData.endTime,
        visitType: appointmentFormData.visitType,
        reasonForVisit: appointmentFormData.reasonForVisit,
        notes: appointmentFormData.notes,
        duration: appointmentFormData.duration,
        isEmergency: appointmentFormData.isEmergency,
        isWalkIn: appointmentFormData.visitType === 'walk_in'
      };

      console.log('📅 Creating appointment with data:', appointmentData);
      onSuccess(appointmentData);
      handleClose();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
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
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Create New Appointment</h2>
                <p className="text-white/80 text-sm">Schedule a patient appointment</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Patient Selection Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
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
                    filteredPatients.map((patient) => (
                      <button
                        key={patient._id}
                        type="button"
                        onClick={() => handleAppointmentInputChange('patientId', patient._id)}
                        className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          appointmentFormData.patientId === patient._id ? 'bg-emerald-50 border-emerald-200' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.email} • {patient.phone}
                            </div>
                          </div>
                          {appointmentFormData.patientId === patient._id && (
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
                {errors.patientId && (
                  <p className="mt-2 text-sm text-red-600">{errors.patientId}</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={patientFormData.firstName}
                    onChange={(e) => handlePatientInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={patientFormData.lastName}
                    onChange={(e) => handlePatientInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={patientFormData.email}
                    onChange={(e) => handlePatientInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
              Appointment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    Loading available slots...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={appointmentFormData.startTime}
                      onChange={(e) => handleTimeSlotSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select time slot</option>
                      {availableSlots.map((slot) => {
                        const slots = generateTimeSlots();
                        const slotData = slots.find(s => s.start === slot);
                        return (
                          <option key={slot} value={slot}>
                            {slot} - {slotData?.end}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                  </div>
                )}
                {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select
                  value={appointmentFormData.duration}
                  onChange={(e) => handleAppointmentInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>

              {/* Emergency */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={appointmentFormData.isEmergency}
                    onChange={(e) => handleAppointmentInputChange('isEmergency', e.target.checked)}
                    className="mr-2 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Emergency appointment</span>
                </label>
              </div>
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
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Appointment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
