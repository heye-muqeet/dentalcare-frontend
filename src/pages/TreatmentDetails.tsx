import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {    
  FiFileText, 
  FiDollarSign, 
  FiEye, 
  FiCpu, 
  FiActivity,
  // FiPrinter,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
} from 'react-icons/fi';
import { treatmentService } from '../lib/api/services/treatments';
import { toast } from 'react-hot-toast';
import { calculateAge } from '../lib/utils/dateUtils';
import InitialAvatar from '../components/Common/InitialAvatar';
import { getInitials } from '../lib/utils/stringUtils';

// Extended interface for populated treatment data
interface PopulatedTreatment {
  id: string;
  diagnosis: string;
  prescribedMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes: string;
  servicesUsed: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  reports: Array<{
    testName: string;
    result: string;
    imageUrl?: string;
    imagePublicId?: string;
    aiAnalysis?: {
      findings: string;
      confidence: number;
      recommendations: string[];
      detectedConditions: string[];
      imageType?: string;
    };
  }>;
  followUpRecommended: boolean;
  followUpDate?: string;
  followUpTime?: string;
  appointment: {
    id: string;
    date: string;
    time: string;
    reason: string;
    status: string;
    notes: string;
    fee: number;
  };
  doctor: {
    id: string;
    name: string;
    email: string;
    specialization: string;
    licenseNumber: string;
    experience: number;
    education: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    dob: string;
    address?: string;
    medicalHistory?: string;
    allergies?: string;
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    notes: string;
    services: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  };
  organization: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

const TreatmentDetails = () => {
  const { treatmentId } = useParams<{ treatmentId: string }>();
  const navigate = useNavigate();
  
  const [currentTreatment, setCurrentTreatment] = useState<PopulatedTreatment | null>(null);
  const [expandedReports, setExpandedReports] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    if (treatmentId) {
      treatmentService.getTreatment(treatmentId)
        .then(response => {
          setCurrentTreatment(response as any as PopulatedTreatment);
        })
        .catch(error => {
          toast.error(error.response?.data?.message || 'Failed to fetch treatment details');
        });
    }
  }, [treatmentId]);

  const handlePreviewReportImage = (imageUrl: string) => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    } else {
      toast.error('No image to preview for this report.');
    }
  };

  // const handlePrintTreatment = () => {
  //   window.print();
  // };

  const toggleReportExpansion = (index: number) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!currentTreatment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f6fb] to-[#e9eaf7] flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <FiLoader className="animate-spin w-8 h-8 text-[#0A0F56] mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading treatment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f6fb] to-[#e9eaf7] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#0A0F56] hover:text-[#232a7c] transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Previous Page
          </button>
        </div>

        {/* Treatment Header with Patient Info Integrated */}
        <div className="bg-gradient-to-r from-[#0A0F56] via-[#1a1f6b] to-[#232a7c] rounded-2xl shadow-xl p-6 text-white relative overflow-hidden mb-8">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
              {/* Patient Info */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <InitialAvatar 
                      initials={getInitials(currentTreatment.patient.name)} 
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
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-white truncate" title={currentTreatment.patient.name}>
                    {currentTreatment.patient.name}
                  </h1>
                  <p className="text-blue-100 text-sm truncate">
                    {calculateAge(currentTreatment.patient.dob)} years, {currentTreatment.patient.gender}
                  </p>
                  <p className="text-blue-200 text-xs truncate" title={currentTreatment.patient.email}>
                    {currentTreatment.patient.email}
                  </p>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="text-center lg:text-left">
                <p className="text-blue-100 text-sm font-medium">Appointment</p>
                <p className="text-white font-bold">{new Date(currentTreatment.appointment.date).toLocaleDateString()}</p>
                <p className="text-blue-200 text-sm">Dr. {currentTreatment.doctor.name}</p>
              </div>

              {/* Quick Stats */}
              <div className="text-center lg:text-left">
                <p className="text-blue-100 text-sm font-medium">Treatment Cost</p>
                <p className="text-white font-bold text-2xl">${currentTreatment.servicesUsed.reduce((total, service) => total + service.price, 0).toFixed(0)}</p>
                <p className="text-blue-200 text-sm">{currentTreatment.servicesUsed.length} services provided</p>
              </div>

              {/* Actions */}
              {/* <div className="flex justify-center lg:justify-end">
                <button
                  onClick={handlePrintTreatment}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition font-semibold flex items-center gap-2"
                >
                  <FiPrinter />
                  Print
                </button>
              </div> */}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Diagnosis & Services */}
          <div className="xl:col-span-1 space-y-6">
            {/* Diagnosis - Main Focus */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <FiFileText className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0F56]">Primary Diagnosis</h3>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-red-800 font-bold text-lg leading-relaxed">{currentTreatment.diagnosis}</p>
              </div>
            </div>

            {/* Services Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0F56]">Services Provided</h3>
              </div>
              <div className="space-y-3">
                {currentTreatment.servicesUsed.map((service, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-800">{service.name}</span>
                    <span className="font-bold text-green-600">${service.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="font-bold text-gray-800">Total Cost</span>
                    <span className="font-bold text-green-600 text-xl">
                      ${currentTreatment.servicesUsed.reduce((total, service) => total + service.price, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medications */}
            {currentTreatment.prescribedMedications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FiActivity className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0A0F56]">Prescribed Medications</h3>
                </div>
                <div className="space-y-3">
                  {currentTreatment.prescribedMedications.map((medication, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h4 className="font-bold text-blue-800 mb-2">{medication.name}</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-blue-600 font-medium">Dosage</p>
                          <p className="text-blue-800">{medication.dosage}</p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-medium">Frequency</p>
                          <p className="text-blue-800">{medication.frequency}</p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-medium">Duration</p>
                          <p className="text-blue-800">{medication.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Medical Reports (Main Focus) */}
          <div className="xl:col-span-2">
            {currentTreatment.reports.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FiCpu className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#0A0F56]">Medical Reports</h2>
                    <p className="text-gray-500 text-sm">{currentTreatment.reports.length} report{currentTreatment.reports.length > 1 ? 's' : ''} available</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {currentTreatment.reports.map((report, index) => {
                    const isExpanded = expandedReports.has(index);
                    return (
                      <div key={index} className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                        {/* Report Header - Always Visible */}
                        <div className="bg-white p-4 cursor-pointer" onClick={() => toggleReportExpansion(index)}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-gray-800 text-lg">{report.testName}</h3>
                                <div className="flex items-center gap-2">
                                  {report.aiAnalysis && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                      <FiCpu className="mr-1 h-3 w-3" />
                                      AI Analyzed
                                    </span>
                                  )}
                                  {report.aiAnalysis?.imageType && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                      {report.aiAnalysis.imageType.split('-').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                      ).join(' ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {isExpanded ? report.result : `${report.result.substring(0, 120)}${report.result.length > 120 ? '...' : ''}`}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-3 ml-4">
                              {report.imageUrl && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreviewReportImage(report.imageUrl!);
                                  }}
                                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Preview Image"
                                >
                                  <FiEye size={18} />
                                </button>
                              )}
                              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          {report.aiAnalysis && (
                            <div className="p-4 bg-blue-50 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-blue-800 text-lg">AI Analysis Results</h4>
                                <span className="text-blue-800 font-bold text-sm">
                                  {report.aiAnalysis.confidence}% Confidence
                                </span>
                              </div>
                              
                              {/* Detected Conditions */}
                              {report.aiAnalysis.detectedConditions.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="text-blue-800 font-medium text-sm mb-2">Detected Conditions:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {report.aiAnalysis.detectedConditions.map((condition, condIndex) => (
                                      <span
                                        key={condIndex}
                                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200"
                                      >
                                        {condition}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* AI Recommendations */}
                              {report.aiAnalysis.recommendations.length > 0 && (
                                <div>
                                  <h5 className="text-blue-800 font-medium text-sm mb-3">AI Recommendations:</h5>
                                  <ul className="space-y-2">
                                    {report.aiAnalysis.recommendations.map((rec, recIndex) => (
                                      <li key={recIndex} className="flex items-start text-sm text-blue-800">
                                        <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                                        <span className="leading-relaxed">{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <FiFileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Medical Reports</h3>
                <p className="text-gray-500">No reports have been attached to this treatment.</p>
              </div>
            )}

            {/* Treatment Notes */}
            {currentTreatment.notes && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                    <FiFileText className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0A0F56]">Treatment Notes</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{currentTreatment.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced info card component
// const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
//   <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow">
//     <div className="flex items-start gap-3">
//       <div className="flex-shrink-0 mt-0.5">{icon}</div>
//       <div className="flex-1 min-w-0">
//         <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
//         <p className="text-sm font-semibold text-gray-900 break-words leading-relaxed">{value}</p>
//       </div>
//     </div>
//   </div>
// );

// // Statistics card component
// const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
//   <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
//     <div className="text-center">
//       <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
//         <span className="text-white text-sm font-bold">{value.charAt(0)}</span>
//       </div>
//       <p className="text-base font-bold text-gray-900 break-words leading-tight">{value}</p>
//       <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
//     </div>
//   </div>
// );

export default TreatmentDetails; 