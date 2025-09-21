import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { AddPatientModal } from '../components/Patient/AddPatientModal';
import { FiUser, FiCalendar, FiFileText, FiPlus } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { createAppointment, updateAppointment, clearAppointmentErrors } from '../lib/store/slices/appointmentsSlice';
import { fetchPatients } from '../lib/store/slices/patientsSlice';
import { fetchDoctors } from '../lib/store/slices/doctorsSlice';
import { toast } from 'react-hot-toast';
import type { RootState } from '../lib/store/store';
import type { CreateAppointmentData, Appointment } from '../lib/api/services/appointments';
import type { Patient } from '../lib/api/services/patients';
import type { User } from '../lib/api/services/users';
import { appointmentService } from '../lib/api/services/appointments';
import { createPatient } from '../lib/store/slices/patientsSlice';



const AddAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Check if we're in edit mode
  const isEditing = location.state?.isEditing || false;
  const editingAppointment = location.state?.appointment as Appointment | undefined;

  const { isCreating, isUpdating, createError, updateError } = useAppSelector((state: RootState) => state.appointments);
  const { patients } = useAppSelector((state: RootState) => state.patients);
  const { doctors } = useAppSelector((state: RootState) => state.doctors);
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  // Get user role directly from Redux state to avoid function dependency issues
  const userRole = user?.role;
  const isDoctorRole = userRole === 'doctor';

  // Get the appropriate loading and error states based on mode
  const isSubmitting = isEditing ? isUpdating : isCreating;
  const submitError = isEditing ? updateError : createError;

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchPatients())
      .unwrap()
      .catch((error) => {
        toast.error(error || 'Failed to fetch patients');
      });

    // Only fetch doctors if user is not a doctor
    if (!isDoctorRole) {
      dispatch(fetchDoctors())
        .unwrap()
        .catch((error) => {
          toast.error(error || 'Failed to fetch doctors');
        });
    }
  }, [dispatch, isDoctorRole]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.appointmentDate && formData.doctorId) {
        setIsLoadingSlots(true);
        try {
          const response = await appointmentService.getAvailableSlots(formData.appointmentDate, formData.doctorId);
          let slots = response.availableSlots;
          
          // If we're editing and the current appointment time is not in available slots, add it
          if (isEditing && editingAppointment && formData.appointmentTime && 
              !slots.includes(formData.appointmentTime)) {
            slots = [...slots, formData.appointmentTime].sort();
          }
          
          setAvailableSlots(slots);
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to fetch available slots');
          
          // If fetching fails and we're editing, at least show the current time
          if (isEditing && editingAppointment && formData.appointmentTime) {
            setAvailableSlots([formData.appointmentTime]);
          }
        } finally {
          setIsLoadingSlots(false);
        }
      } else {
        setAvailableSlots([]);
      }
    };

    fetchSlots();
  }, [formData.appointmentDate, formData.doctorId, isEditing, editingAppointment, formData.appointmentTime]);

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isTimeInPast = (date: string, time: string) => {
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    return selectedDateTime < now;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'appointmentTime' && formData.appointmentDate) {
      if (isTimeInPast(formData.appointmentDate, value)) {
        toast.error('Cannot select a time that has already passed');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const appointmentData: CreateAppointmentData = {
        date: formData.appointmentDate,
        time: formData.appointmentTime,
        reason: formData.reason,
        appointmentTimestamp: new Date(`${formData.appointmentDate}T${formData.appointmentTime}`).getTime(),
        notes: formData.notes,
        patientId: formData.patientId,
        doctorId: formData.doctorId,
      };

      if (isEditing && editingAppointment) {
        await dispatch(updateAppointment({
          id: editingAppointment.id,
          appointmentData
        })).unwrap();
        toast.success('Appointment updated successfully');
      } else {
        await dispatch(createAppointment(appointmentData)).unwrap();
        toast.success('Appointment created successfully');
      }
      
      navigate('/appointments');
    } catch (error: any) {
      toast.error(error || `Failed to ${isEditing ? 'update' : 'create'} appointment`);
    }
  };

  const handleAddPatient = async (patientData: any) => {
    try {
      // First create the patient
      const newPatient = await dispatch(createPatient(patientData)).unwrap();
      
      // Refresh the patients list to make sure we have the latest data
      await dispatch(fetchPatients()).unwrap();
      
      // Set the newly added patient as selected
      setFormData(prev => ({
        ...prev,
        patientId: newPatient.id
      }));
      
      setIsPatientModalOpen(false);
      toast.success('Patient added successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to add patient');
    }
  };

  useEffect(() => {
    if (location.state && location.state.appointment) {
      const appointment = location.state.appointment as Appointment;
      // Format date for input field (YYYY-MM-DD)
      const formattedDate = appointment.date.includes('T') 
        ? appointment.date.split('T')[0] 
        : new Date(appointment.date).toISOString().split('T')[0];
      
      setFormData({
        patientId: appointment.patient.id,
        doctorId: appointment.doctor.id,
        appointmentDate: formattedDate,
        appointmentTime: appointment.time,
        reason: appointment.reason,
        notes: appointment.notes || '',
      });
    }
  }, [location.state]);

  useEffect(() => {
    dispatch(clearAppointmentErrors());
  }, [dispatch]);

  // Compute available slots to always include current appointment time when editing
  const displayAvailableSlots = React.useMemo(() => {
    let slots = [...availableSlots];
    
    // Always include the current appointment time when editing
    if (isEditing && formData.appointmentTime && !slots.includes(formData.appointmentTime)) {
      slots = [...slots, formData.appointmentTime].sort();
    }
    
    return slots;
  }, [availableSlots, isEditing, formData.appointmentTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f6fb] to-[#e9eaf7] py-3 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl border border-[#E0E3F0] overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#0A0F56] to-[#232a7c] px-8 py-2">
              <h1 className="text-2xl font-bold text-white text-center">
                {isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}
              </h1>
              {/* <p className="text-center text-blue-100 mt-1">Fill in the details below to create a new appointment</p> */}
            </div>

            {submitError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
                <span className="block sm:inline">{submitError}</span>
              </div>
            )}

            <div className="p-8 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Patient Information Card */}
                  <div className="bg-gradient-to-br from-[#f8f9fd] to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <FiUser className="text-[#0A0F56] text-xl mr-3" />
                      <h2 className="text-xl font-semibold text-[#0A0F56]">Patient Information</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                        <Select
                          options={patients.map((p: Patient) => ({ value: p.id, label: p.name }))}
                          value={patients.find((p: Patient) => p.id === formData.patientId) ? 
                            { value: formData.patientId, label: patients.find((p: Patient) => p.id === formData.patientId)?.name } : 
                            null
                          }
                          onChange={(selected) => setFormData((prev) => ({ 
                            ...prev, 
                            patientId: selected ? selected.value : ''
                          }))}
                          isClearable
                          isSearchable
                          placeholder="Select or search patient name"
                          className="text-sm"
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderRadius: '0.75rem',
                              borderColor: '#e5e7eb',
                              minHeight: '48px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              '&:hover': {
                                borderColor: '#0A0F56'
                              }
                            }),
                            menu: (base) => ({
                              ...base,
                              borderRadius: '0.75rem',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            })
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setIsPatientModalOpen(true)}
                          className="mt-1 inline-flex items-center text-sm text-[#0A0F56] hover:text-[#232a7c] transition-colors"
                        >
                          <FiPlus className="mr-1" />
                          Add New Patient
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Assignment Card */}
                  <div className="bg-gradient-to-br from-[#f8f9fd] to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <FiUser className="text-[#0A0F56] text-xl mr-3" />
                      <h2 className="text-xl font-semibold text-[#0A0F56]">Doctor Assignment</h2>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                      <Select
                        options={doctors.map((d: User) => ({ value: d.id, label: d.name }))}
                        value={doctors.find((d: User) => d.id === formData.doctorId) ? 
                          { value: formData.doctorId, label: doctors.find((d: User) => d.id === formData.doctorId)?.name } : 
                          null
                        }
                        onChange={(selected) => setFormData((prev) => ({ 
                          ...prev, 
                          doctorId: selected ? selected.value : ''
                        }))}
                        isClearable
                        isSearchable
                        placeholder="Select or search doctor"
                        className="text-sm"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: '0.75rem',
                            borderColor: '#e5e7eb',
                            minHeight: '48px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            '&:hover': {
                              borderColor: '#0A0F56'
                            }
                          }),
                          menu: (base) => ({
                            ...base,
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Visit Details Card */}
                  <div className="bg-gradient-to-br from-[#f8f9fd] to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <FiCalendar className="text-[#0A0F56] text-xl mr-3" />
                      <h2 className="text-xl font-semibold text-[#0A0F56]">Visit Details</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time</label>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                              <input
                                type="date"
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleChange}
                                min={getMinDate()}
                                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0F56] focus:border-transparent transition-all"
                                disabled={(!formData.patientId || !formData.doctorId) && !isEditing}
                              />
                            </div>
                            <div className="relative">
                              <select
                                name="appointmentTime"
                                value={formData.appointmentTime}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0F56] focus:border-transparent transition-all"
                                disabled={isLoadingSlots || (displayAvailableSlots.length === 0 && !isEditing)}
                              >
                                <option value="">Select Time</option>
                                {displayAvailableSlots.map((slot: string) => (
                                  <option key={slot} value={slot}>
                                    {slot}
                                  </option>
                                ))}
                              </select>
                              {isLoadingSlots && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0A0F56]"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section Card */}
                  <div className="bg-gradient-to-br from-[#f8f9fd] to-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-2">
                      <FiFileText className="text-[#0A0F56] text-lg mr-2" />
                      <h2 className="text-lg font-semibold text-[#0A0F56]">Additional Information</h2>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                        <textarea
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          placeholder="Enter reason for visit..."
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm h-16 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A0F56] focus:border-transparent transition-all bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="Enter additional notes..."
                          className="w-full border border-gray-200 rounded-lg p-2 text-sm h-16 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A0F56] focus:border-transparent transition-all bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-4 py-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-[#0A0F56] to-[#232a7c] text-white py-4 rounded-xl text-lg font-semibold hover:from-[#232a7c] hover:to-[#0A0F56] transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 
                    (isEditing ? 'Updating...' : 'Scheduling...') : 
                    (isEditing ? 'Update Appointment' : 'Schedule Appointment')
                  }
                  {!isSubmitting && <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <AddPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSubmit={handleAddPatient}
      />
    </div>
  );
};

export default AddAppointment;
