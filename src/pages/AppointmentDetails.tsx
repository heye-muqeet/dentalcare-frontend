import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiPaperclip, FiEye, FiTrash2, FiCpu } from 'react-icons/fi';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import { appointmentService } from '../lib/api/services/appointments';
import { toast } from 'react-hot-toast';
import { AttachReportModal } from '../components/Report/AttachReportModal';
import type { ReportData } from '../components/Report/AttachReportModal';
import { calculateAge } from '../lib/utils/dateUtils';
import InitialAvatar from '../components/Common/InitialAvatar';
import { getInitials } from '../lib/utils/stringUtils';
import { MedicineInput } from '../components/Medicine/MedicineInput';
import type { Medicine } from '../components/Medicine/MedicineInput';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { fetchServices } from '../lib/store/slices/servicesSlice';
import { createTreatment, updateTreatment, fetchTreatment, clearTreatmentErrors, clearCurrentTreatment } from '../lib/store/slices/treatmentsSlice';
import type { RootState } from '../lib/store/store';
import type { ServiceUsed, TreatmentReport } from '../lib/api/services/treatments';
// import { cloudinaryUploadService } from '../lib/services/cloudinaryUpload';

const AppointmentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointment = location.state?.appointment;
  const dispatch = useAppDispatch();
  
  // Redux state
  const { services } = useAppSelector((state: RootState) => state.services);
  const { 
    currentTreatment, 
    isCreating, 
    isUpdating, 
    createError, 
    updateError 
  } = useAppSelector((state: RootState) => state.treatments);

  console.log(appointment);

  // Form state
  const [diagnosis, setDiagnosis] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<MultiValue<{ value: string; label: string; price: number }>>([]);
  const [selectedFile] = useState<File | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Follow-up state
  const [isFollowUpEnabled, setIsFollowUpEnabled] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpAvailableSlots, setFollowUpAvailableSlots] = useState<string[]>([]);
  const [isLoadingFollowUpSlots, setIsLoadingFollowUpSlots] = useState(false);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [attachedReports, setAttachedReports] = useState<ReportData[]>([]);

  // Treatment state
  const [existingTreatmentId, setExistingTreatmentId] = useState<string | null>(null);

  // Reset form state when appointment changes
  useEffect(() => {
    // Clear all form state when appointment changes
    setDiagnosis('');
    setReviewNotes('');
    setSelectedServices([]);
    setMedicines([]);
    setIsFollowUpEnabled(false);
    setFollowUpDate('');
    setFollowUpTime('');
    setFollowUpAvailableSlots([]);
    setAttachedReports([]);
    setExistingTreatmentId(null);
    
    // Clear Redux treatment state
    dispatch(clearCurrentTreatment());
  }, [appointment?.id, dispatch]);

  // Convert services to select options
  const serviceOptions = services.map(service => ({
    value: service.id,
    label: service.name,
    price: service.price
  }));

  // Fetch services and existing treatment on component mount
  useEffect(() => {
    dispatch(fetchServices());
    
    // If there's an existing treatment for this appointment, fetch it
    if (appointment?.treatmentId) {
      setExistingTreatmentId(appointment.treatmentId);
      dispatch(fetchTreatment(appointment.treatmentId));
    }
  }, [dispatch, appointment?.treatmentId]);

  // Populate form with existing treatment data
  useEffect(() => {
    if (currentTreatment && appointment && currentTreatment.appointment === appointment.id) {
      setDiagnosis(currentTreatment.diagnosis);
      setReviewNotes(currentTreatment.notes);
      setMedicines(currentTreatment.prescribedMedications);
      setIsFollowUpEnabled(currentTreatment.followUpRecommended);
      setFollowUpDate(currentTreatment.followUpDate || '');
      setFollowUpTime(currentTreatment.followUpTime || '');
      
      // Set selected services
      const servicesFromTreatment = currentTreatment.servicesUsed.map(service => ({
        value: service.id,
        label: service.name,
        price: service.price
      }));
      setSelectedServices(servicesFromTreatment);

      // Set attached reports - convert TreatmentReport to ReportData format
      if (currentTreatment.reports && currentTreatment.reports.length > 0) {
        const reportsFromTreatment = currentTreatment.reports.map(report => ({
          testName: report.testName,
          result: report.result,
          image: null, // No need to convert back to File object
          imageUrl: report.imageUrl,
          imagePublicId: report.imagePublicId,
          aiAnalysis: report.aiAnalysis
        }));
        setAttachedReports(reportsFromTreatment);
      }
    } else if (currentTreatment && appointment && currentTreatment.appointment !== appointment.id) {
      // If currentTreatment is for a different appointment, clear the form
      // This handles the case where old treatment data might arrive late
      setDiagnosis('');
      setReviewNotes('');
      setSelectedServices([]);
      setMedicines([]);
      setIsFollowUpEnabled(false);
      setFollowUpDate('');
      setFollowUpTime('');
      setFollowUpAvailableSlots([]);
      setAttachedReports([]);
    }
  }, [currentTreatment, appointment]);

  // Handle errors
  useEffect(() => {
    if (createError) {
      toast.error(createError);
      dispatch(clearTreatmentErrors());
    }
    if (updateError) {
      toast.error(updateError);
      dispatch(clearTreatmentErrors());
    }
  }, [createError, updateError, dispatch]);

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">
          No appointment data found. Please navigate from the appointment list.
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      // Prepare services used data
      const servicesUsed: ServiceUsed[] = selectedServices.map(service => ({
        id: service.value,
        name: service.label,
        price: service.price
      }));

      // Prepare reports data - convert ReportData to TreatmentReport format
      const reports: TreatmentReport[] = attachedReports.map(report => ({
        testName: report.testName,
        result: report.result,
        imageUrl: report.imageUrl,
        imagePublicId: report.imagePublicId,
        aiAnalysis: report.aiAnalysis
      }));

      const treatmentData = {
        appointment: appointment.id,
        patient: appointment.patient.id,
        diagnosis,
        prescribedMedications: medicines.filter(med => med.name.trim() !== ''),
        notes: reviewNotes,
        servicesUsed,
        reports,
        followUpRecommended: isFollowUpEnabled,
        ...(isFollowUpEnabled && followUpDate && { followUpDate }),
        ...(isFollowUpEnabled && followUpTime && { followUpTime }),
      };

      let savedTreatment;
      if (existingTreatmentId) {
        // Update existing treatment
        savedTreatment = await dispatch(updateTreatment({
          id: existingTreatmentId,
          treatmentData
        })).unwrap();
        toast.success('Treatment updated successfully!');
      } else {
        // Create new treatment
        savedTreatment = await dispatch(createTreatment(treatmentData)).unwrap();
        toast.success('Treatment created successfully!');
      }

      // Navigate to treatment details page after successful save
      if (savedTreatment?.id) {
        setTimeout(() => {
          navigate(`/treatments/${savedTreatment.appointment}`);
        }, 1500); // Small delay to show the success message
      }
    } catch (error) {
      // Error is handled by Redux and useEffect
    }
  };

  // Fetch available slots for follow-up
  useEffect(() => {
    const fetchSlots = async () => {
      if (isFollowUpEnabled && followUpDate && appointment?.doctor.id) {
        setIsLoadingFollowUpSlots(true);
        try {
          // Ensure appointment.doctorId is available and valid
          const response = await appointmentService.getAvailableSlots(followUpDate, appointment.doctor.id);
          setFollowUpAvailableSlots(response.availableSlots);
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to fetch follow-up slots');
          setFollowUpAvailableSlots([]);
        } finally {
          setIsLoadingFollowUpSlots(false);
        }
      } else {
        setFollowUpAvailableSlots([]);
        setFollowUpTime(''); // Reset time if date or doctorId changes or follow-up is disabled
      }
    };

    fetchSlots();
  }, [isFollowUpEnabled, followUpDate, appointment?.doctor.id]);

  const getMinDate = () => {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  };

  const handleFollowUpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFollowUpDate(e.target.value);
    // Reset time when date changes
    setFollowUpTime('');
  };

  const handleFollowUpTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTime = e.target.value;
    const now = new Date();
    const selectedDateTime = new Date(`${followUpDate}T${selectedTime}`);

    if (followUpDate === getMinDate() && selectedDateTime < now) {
      toast.error("Cannot select a past time for today's follow-up.");
      setFollowUpTime(''); // Reset time
      return;
    }
    setFollowUpTime(selectedTime);
  };

  const handleAttachReport = (reportData: ReportData) => {
    setAttachedReports(prevReports => [...prevReports, reportData]);
    // Here you might also want to upload the reportData.image to a server if it exists
    console.log('Attached Report:', reportData);
    toast.success('Report attached successfully!');
  };

  const handleRemoveReport = (index: number) => {
    setAttachedReports(prevReports => prevReports.filter((_, i) => i !== index));
    toast.success('Report removed.');
  };

  // Basic image preview for attached reports (can be expanded)
  const handlePreviewReportImage = (report: ReportData) => {
    if (report.image) {
      const imageUrl = URL.createObjectURL(report.image);
      // Open in new tab or a dedicated image viewer modal
      window.open(imageUrl, '_blank');
    } else if (report.imageUrl) {
      // Open Cloudinary image URL in new tab
      window.open(report.imageUrl, '_blank');
    } else {
      toast.error('No image to preview for this report.');
    }
  };

  return (
    <div className="h-full p-6 bg-gray-50">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#E0E3F0] h-full">
        <div className="grid grid-cols-12 h-full">
          {/* Left Column - Patient Info */}
          <div className="col-span-4 p-6 border-r border-[#E0E3F0] overflow-y-auto h-full">
            {/* Patient Image, Name, Age/Gender */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-2">
                <InitialAvatar initials={getInitials(appointment.patient.name)} size={24}
                  bgColor="bg-blue-500"
                  textColor="text-white"
                  className="border-none font-bold shadow-none text-s" />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#2563EB] rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <div className="text-center">
                <h2 className="font-bold text-xl text-[#232360]">{appointment.patient.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {appointment.patient.dob ? calculateAge(appointment.patient.dob) : 'N/A'} Years, {appointment.patient.gender}
                </p>
              </div>
            </div>
            {/* Reason For Consultation Card */}
            <div className="bg-[#F0F4FF] rounded-xl p-4 mb-8 shadow border border-[#D1D9F0] w-full">
              <p className="text-xs text-[#232360] mb-2 font-bold">Reason For Consultation</p>
              <div className='border border-[#B6C3E6] rounded-lg p-3 text-sm h-20 resize-none bg-[#F7F8FA] font-semibold text-[#232360]'>
                {appointment.reason}
                {/* <textarea
                  className="w-full border border-[#B6C3E6] rounded-lg p-3 text-sm h-20 resize-none bg-[#F7F8FA] font-semibold text-[#232360]"
                  value={appointment.disease}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Enter reason for consultation..."
                /> */}
              </div>
            </div>
            {/* Two-column grid for Email, Phone, DOB, Diseases */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs mb-2">
              <div>
                <p className="text-gray-500 font-semibold">Email</p>
                <p className="text-[#232360] font-bold break-all">{appointment.patient.email}</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold">Phone</p>
                <p className="text-[#232360] font-bold">{appointment.patient.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold">Date of Birth</p>
                <p className="text-[#232360] font-bold">{appointment.patient.dob ? new Date(appointment.patient.dob).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold">Diseases</p>
                <p className="text-[#232360] font-bold">{appointment.reason}</p>
              </div>
            </div>
          </div>
          {/* Right Column - Styled Form */}
          <div className="col-span-8 p-6 overflow-y-auto h-full">
            <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <FormField label="Doctor" value={appointment.doctor.name} readOnly />
                <FormField label="Patient Name" value={appointment.patient.name} readOnly />
                {/* Services Multi-Select */}

                <FormIconField label="Date of Consultation" value={appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'} icon={<FiCalendar className="text-[#2563EB] mr-2" />} readOnly />
                <FormIconField label="Start Time" value={appointment.time} icon={<FiClock className="text-[#2563EB] mr-2" />} readOnly />
              </div>
              <div className="col-span-2">
                <label className="block text-sm mb-2 font-bold text-[#232360]">Services</label>
                <Select
                  isMulti
                  options={serviceOptions}
                  value={selectedServices}
                  onChange={setSelectedServices}
                  isDisabled={isCreating || isUpdating}
                  classNamePrefix="react-select"
                  placeholder="Select services..."
                  styles={{
                    control: (base, state) => ({ 
                      ...base, 
                      minHeight: '44px', 
                      borderRadius: '0.75rem', 
                      borderColor: state.isFocused ? '#2563EB' : '#B6C3E6', 
                      boxShadow: state.isFocused ? '0 0 0 2px #2563EB33' : 'none', 
                      background: '#F7F8FA', 
                      fontWeight: 600,
                      opacity: state.isDisabled ? 0.5 : 1,
                      cursor: state.isDisabled ? 'not-allowed' : 'default'
                    }),
                    multiValue: (base) => ({ ...base, backgroundColor: '#2563EB22', color: '#232360', fontWeight: 600 }),
                    option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? '#0A0F56' : state.isFocused ? '#F0F4FF' : 'white', color: state.isSelected ? 'white' : '#232360', fontWeight: 600 }),
                    placeholder: (base) => ({ ...base, color: '#A0AEC0', fontWeight: 500 }),
                  }}
                />
              </div>
                              <MedicineInput
                  medicines={medicines}
                  onChange={setMedicines}
                  disabled={isCreating || isUpdating}
                />
                <FormTextArea
                  label="Diagnosis"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                  disabled={isCreating || isUpdating}
                />
                <FormTextArea
                  label="Review Notes"
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Enter review notes..."
                  disabled={isCreating || isUpdating}
                />

              {/* Follow-up Section */}
              <div className="space-y-4 mt-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isFollowUpEnabled}
                    onChange={e => {
                      setIsFollowUpEnabled(e.target.checked);
                      if (!e.target.checked) {
                        // Reset follow-up fields when disabled
                        setFollowUpDate('');
                        setFollowUpTime('');
                        setFollowUpAvailableSlots([]);
                      }
                    }}
                    disabled={isCreating || isUpdating}
                    className="accent-[#2563EB] rounded focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed"
                    id="followUpCheckbox"
                  />
                  <label htmlFor="followUpCheckbox" className="text-sm font-semibold text-[#232360]">Schedule Follow-up?</label>
                </div>

                {isFollowUpEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-sm mb-1 font-bold text-[#232360]">Follow-up Date</label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={handleFollowUpDateChange}
                        min={getMinDate()}
                        className="w-full border border-[#B6C3E6] rounded-lg p-3 text-sm bg-[#F7F8FA] font-semibold text-[#232360] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!appointment?.doctor.id || isCreating || isUpdating} // Disable if no doctorId or during submission
                      />
                      {!appointment?.doctor.id && <p className="text-xs text-red-500 mt-1">Doctor ID not available for slot booking.</p>}
                    </div>
                    <div>
                      <label className="block text-sm mb-1 font-bold text-[#232360]">Follow-up Time</label>
                      <div className="relative">
                        <select
                          value={followUpTime}
                          onChange={handleFollowUpTimeChange}
                          className="w-full border border-[#B6C3E6] rounded-lg p-3 text-sm bg-[#F7F8FA] font-semibold text-[#232360] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoadingFollowUpSlots || followUpAvailableSlots.length === 0 || isCreating || isUpdating}
                        >
                          <option value="">{isLoadingFollowUpSlots ? 'Loading...' : 'Select Time'}</option>
                          {followUpAvailableSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                        {isLoadingFollowUpSlots && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0A0F56]"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Attach Report Section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#232360]">Attached Reports</h3>
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex items-center bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0A0F56] transition font-semibold shadow focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <FiPaperclip className="mr-2" /> Attach New Report
                  </button>
                </div>
                {attachedReports.length > 0 ? (
                  <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    {attachedReports.map((report, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#232360] truncate">{report.testName}</p>
                            <p className="text-xs text-gray-500 truncate">{report.result}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            {report.aiAnalysis && (
                              <>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  <FiCpu className="mr-1 h-3 w-3" />
                                  AI Analyzed
                                </span>
                                {report.aiAnalysis.imageType && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                    {report.aiAnalysis.imageType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                  </span>
                                )}
                              </>
                            )}
                            {(report.image || report.imageUrl) && (
                              <button
                                onClick={() => handlePreviewReportImage(report)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                                title="Preview Image"
                              >
                                <FiEye size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveReport(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                              title="Remove Report"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </div>
                        
                        {/* AI Analysis Results Display */}
                        {report.aiAnalysis && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-semibold text-blue-900">AI Analysis Results</h5>
                              <span className="text-xs text-blue-700 font-medium">
                                {report.aiAnalysis.confidence}% Confidence
                              </span>
                            </div>
                            
                            {report.aiAnalysis.detectedConditions.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-semibold text-blue-800 mb-1">Detected Conditions:</p>
                                <div className="flex flex-wrap gap-1">
                                  {report.aiAnalysis.detectedConditions.map((condition, condIndex) => (
                                    <span
                                      key={condIndex}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    >
                                      {condition}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {report.aiAnalysis.recommendations.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-blue-800 mb-1">AI Recommendations:</p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                  {report.aiAnalysis.recommendations.slice(0, 2).map((rec, recIndex) => (
                                    <li key={recIndex} className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4 bg-white rounded-lg border border-gray-200 shadow-sm">No reports attached yet.</p>
                )}
              </div>

              {/* File Progress */}
              {selectedFile && (
                <div className="mt-4 bg-[#F7F8FA] rounded-lg p-4 border border-[#2563EB]">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      {selectedFile.name} <span className="text-gray-400 ml-2">200 KB</span>
                    </span>
                    <span className="font-semibold text-[#2563EB]">10%</span>
                  </div>
                  <div className="bg-gray-200 h-1 rounded-full mt-1">
                    <div className="bg-[#2563EB] h-1 rounded-full w-[10%]"></div>
                  </div>
                </div>
              )}
              <div className="flex justify-end mt-10">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-[#0A0F56] text-white px-8 py-3 rounded-lg text-base hover:bg-[#2563EB] transition font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {(isCreating || isUpdating) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      {existingTreatmentId ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    existingTreatmentId ? 'Update Treatment' : 'Save Treatment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <AttachReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleAttachReport}
      />
    </div>
  );
};

// Helper Components
// const DetailField = ({ label, value }: { label: string; value: string }) => (
//   <div>
//     <p className="text-sm text-gray-500">{label}</p>
//     <p className="text-sm">{value}</p>
//   </div>
// );

const FormField = ({ label, value, readOnly = false }: { label: string; value: string; readOnly?: boolean }) => (
  <div>
    <label className="block text-sm mb-2 font-bold text-[#232360]">{label}</label>
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      className="w-full border border-[#B6C3E6] rounded-lg p-3 text-sm bg-[#F7F8FA] font-semibold text-[#232360] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
    />
  </div>
);

// const FormSelect = ({ label, value, options }: { label: string; value: string; options: string[] }) => (
//   <div>
//     <label className="block text-sm mb-2 font-bold text-[#232360]">{label}</label>
//     <select className="w-full border border-[#B6C3E6] rounded-lg p-3 text-sm bg-[#F7F8FA] font-semibold text-[#232360] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]" value={value}>
//       {options.map(opt => <option key={opt}>{opt}</option>)}
//     </select>
//   </div>
// );

const FormIconField = ({ label, value, icon, readOnly = false }: { label: string; value: string; icon: React.ReactNode; readOnly?: boolean }) => (
  <div>
    <label className="block text-sm mb-2 font-bold text-[#232360]">{label}</label>
    <div className="flex items-center border border-[#B6C3E6] rounded-lg p-3 bg-[#F7F8FA] font-semibold text-[#232360] focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]">
      {icon}
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        className="bg-transparent border-none outline-none text-sm w-full font-semibold text-[#232360]"
      />
    </div>
  </div>
);

const FormTextArea = ({ label, value, onChange, placeholder, disabled = false }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; disabled?: boolean }) => (
  <div>
    <label className="block text-sm mb-2 font-bold text-[#232360]">{label}</label>
    <textarea
      className="w-full border border-[#B6C3E6] rounded-lg p-3 text-sm h-20 resize-none bg-[#F7F8FA] font-semibold text-[#232360] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
);

export default AppointmentDetails; 