import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiActivity, FiDollarSign, FiLoader, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';
import InitialAvatar from '../components/Common/InitialAvatar';
import { getInitials } from '../lib/utils/stringUtils';
import { calculateAge } from '../lib/utils/dateUtils';
import { patientService } from '../lib/api/services/patients';
import type { PatientDetailsResponse } from '../lib/api/services/patients';
import toast from 'react-hot-toast';

const PatientProfile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const patientId = params.id;
    if (!patientId) {
      navigate('/patients');
      return;
    }

    const fetchPatientDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await patientService.getPatientDetails(patientId);
        console.log("aaaaa", response);
        setPatientData(response);
      } catch (error: any) {
        console.error('Error fetching patient details:', error);
        setError(error.response?.data?.message || 'Failed to fetch patient details');
        toast.error('Failed to fetch patient details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientDetails();
  }, [params.id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f6fb] to-[#e9eaf7] flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <FiLoader className="animate-spin w-8 h-8 text-[#0A0F56] mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f6fb] to-[#e9eaf7] flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/patients')}
            className="bg-[#0A0F56] text-white px-6 py-2 rounded-lg hover:bg-[#232a7c] transition-colors"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f6fb] to-[#e9eaf7] flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <p className="text-gray-500 text-lg mb-4">
            No patient data found. Please navigate from the patient list.
          </p>
          <button
            onClick={() => navigate('/patients')}
            className="bg-[#0A0F56] text-white px-6 py-2 rounded-lg hover:bg-[#232a7c] transition-colors"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  const { patientInfo, treatmentHistory, statistics } = patientData;
  console.log(patientInfo);

  const formatDateShort = (dateString: string) => {
    // Convert date like "27/05/2025" to "27/05/25"
    const parts = dateString?.split('/');
    if (parts.length === 3) {
      const year = parts[2].slice(-2); // Get last 2 digits of year
      return `${parts[0]}/${parts[1]}/${year}`;
    }
    return dateString;
  };

  const toggleCardExpansion = (treatmentId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(treatmentId)) {
        newSet.delete(treatmentId);
      } else {
        newSet.add(treatmentId);
      }
      return newSet;
    });
  };

  const handleNavigateToTreatment = (treatmentId: string) => {
    navigate(`/treatments/${treatmentId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f6fb] to-[#e9eaf7] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center text-[#0A0F56] hover:text-[#232a7c] transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Patients
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Patient Information */}
          <div className="lg:col-span-3 space-y-6">
            {/* Patient Header Card */}
            <div className="bg-gradient-to-r from-[#0A0F56] via-[#1a1f6b] to-[#232a7c] rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                        <InitialAvatar 
                          initials={getInitials(patientInfo.name)} 
                          size={12}
                          bgColor="bg-white"
                          textColor="text-[#0A0F56]"
                          className="text-lg font-bold shadow-none border-0"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-bold mb-1 text-white truncate">{patientInfo.name}</h1>
                      <p className="text-blue-100 text-sm font-medium">Patient Profile</p>
                    </div>
                  </div>
                  {/* <div className="text-right flex-shrink-0 ml-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20">
                      <p className="text-xs text-blue-100 font-medium">Patient ID</p>
                      <p className="text-sm font-bold text-white break-all">{patientInfo.id}</p>
                    </div>
                  </div> */}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-2 bg-emerald-500/20 backdrop-blur-sm rounded-full text-sm font-semibold text-emerald-100 border border-emerald-400/30">
                      ✓ {statistics.status}
                    </span>
                    <span className="px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full text-sm font-semibold text-blue-100 border border-blue-400/30">
                      {statistics.totalVisits} Total Visits
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-100 font-medium">Member Since</p>
                    <p className="text-sm font-bold text-white">
                      {new Date(patientInfo.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0F56]">Patient Statistics</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard 
                  label="Total Visits"
                  value={statistics.totalVisits.toString()}
                  color="bg-blue-500"
                />
                <StatCard 
                  label="Total Spent"
                  value={`$${statistics.totalSpent.toFixed(0)}`}
                  color="bg-green-500"
                />
                <StatCard 
                  label="Last Visit"
                  value={statistics.lastVisit ? formatDateShort(statistics.lastVisit) : 'N/A'}
                  color="bg-purple-500"
                />
                <StatCard 
                  label="Status"
                  value={statistics.status}
                  color="bg-emerald-500"
                />
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#0A0F56] rounded-lg flex items-center justify-center">
                  <FiUser className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0F56]">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard 
                  icon={<FiMail className="text-[#0A0F56]" />}
                  label="Email Address"
                  value={patientInfo.email}
                />
                <InfoCard 
                  icon={<FiPhone className="text-[#0A0F56]" />}
                  label="Phone Number"
                  value={patientInfo.phone}
                />
                <InfoCard 
                  icon={<FiMapPin className="text-[#0A0F56]" />}
                  label="Address"
                  value={patientInfo.address}
                />
                <InfoCard 
                  icon={<FiCalendar className="text-[#0A0F56]" />}
                  label="Date of Birth"
                  value={new Date(patientInfo.dob).toLocaleDateString()}
                />
              </div>
            </div>

            {/* Personal Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#0A0F56] rounded-lg flex items-center justify-center">
                  <FiActivity className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0F56]">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard 
                  icon={<FiUser className="text-[#0A0F56]" />}
                  label="Gender"
                  value={patientInfo.gender.charAt(0).toUpperCase() + patientInfo.gender.slice(1)}
                />
                <InfoCard 
                  icon={<FiCalendar className="text-[#0A0F56]" />}
                  label="Age"
                  value={`${calculateAge(patientInfo.dob)} years`}
                />
                <InfoCard 
                  icon={<FiDollarSign className="text-[#0A0F56]" />}
                  label="Balance"
                  value={`$${patientInfo.balance.toFixed(2)}`}
                />
              </div>
            </div>

            {/* Medical Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <FiActivity className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0F56]">Medical Information</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard 
                    icon={<FiActivity className="text-[#0A0F56]" />}
                    label="Medical History"
                    value={patientInfo.medicalHistory || 'No medical history recorded'}
                  />
                  <InfoCard 
                    icon={<FiUser className="text-[#0A0F56]" />}
                    label="Allergies"
                    value={patientInfo.allergies || 'No allergies reported'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Treatment History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0A0F56]">Treatment History</h2>
                <span className="text-sm text-gray-500">
                  {treatmentHistory.length} total treatments
                </span>
              </div>

              {treatmentHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FiActivity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Treatment History</h3>
                  <p className="text-gray-500">This patient hasn't had any treatments yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {treatmentHistory.map((treatment) => {
                    const isExpanded = expandedCards.has(treatment.id);
                    return (
                      <div 
                        key={treatment.id}
                        className="bg-gradient-to-r from-[#f8f9fd] to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        {/* Card Header - Always Visible */}
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-[#0A0F56]">
                                  Treatment #{treatment.id.slice(-6)}
                                </h3>
                              </div>
                                <span className="px-2 text-xs rounded-full border bg-green-100 text-green-800 border-green-200">
                                  Completed
                                </span>
                              
                              <div className="mb-4 mt-1">
                                <p className="text-gray-600 text-sm">
                                  <strong>Diagnosis:</strong> {treatment.diagnosis}
                                </p>
                              </div>

                              {/* Summary Info - Always Visible */}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <FiCalendar className="text-[#0A0F56] flex-shrink-0" />
                                  <span>{treatment.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FiUser className="text-[#0A0F56] flex-shrink-0" />
                                  <span className="truncate">{treatment.doctorName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FiDollarSign className="text-[#0A0F56] flex-shrink-0" />
                                  <span className="font-semibold text-[#0A0F56]">
                                    ${treatment.total.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center ml-4">
                              {/* Jump to Treatment Details Button */}
                              <button
                                onClick={() => handleNavigateToTreatment(treatment.appointmentId)}
                                className="p-2 rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0 group"
                                title="View Treatment Details"
                                aria-label="View detailed treatment information"
                              >
                                <FiExternalLink className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
                              </button>

                              {/* Toggle Button */}
                              <button
                                onClick={() => toggleCardExpansion(treatment.id)}
                                className="ml-1 p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                                aria-label={isExpanded ? "Collapse details" : "Expand details"}
                              >
                                {isExpanded ? (
                                  <FiChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expandable Content */}
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                          }`}>
                            <div className="border-t border-gray-200 pt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Services Provided:</h4>
                              <div className="space-y-2">
                                {treatment.servicesProvided.map((service) => (
                                  <div key={service.id} className="flex justify-between items-start bg-gray-50 rounded-lg px-3 py-3">
                                    <span className="text-sm text-gray-700 flex-1 pr-3">{service.name}</span>
                                    <span className="text-sm font-semibold text-[#0A0F56] whitespace-nowrap">${service.price.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Summary Footer */}
              {treatmentHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-[#0A0F56] to-[#232a7c] rounded-xl p-4 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Total Treatments Completed</h4>
                        <p className="text-blue-100 text-sm">Complete treatment history</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{treatmentHistory.length}</div>
                        {/* <div className="text-blue-100 text-sm">Treatments</div> */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced info card component
const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-900 break-words leading-relaxed">{value}</p>
      </div>
    </div>
  </div>
);

// Statistics card component
const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <div className="text-center">
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
        <span className="text-white text-sm font-bold">{value.charAt(0)}</span>
      </div>
      <p className="text-base sm:text-lg font-bold text-gray-900 break-words leading-tight">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
    </div>
  </div>
);

export default PatientProfile;
