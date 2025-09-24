import React from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Award, Clock, Globe, Star, CheckCircle, AlertCircle } from 'lucide-react';
import type { Doctor } from '../../lib/api/services/doctors';

interface ViewDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onEdit?: (doctor: Doctor) => void;
}

const ViewDoctorModal: React.FC<ViewDoctorModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onEdit
}) => {
  if (!isOpen || !doctor) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-emerald-100 text-emerald-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </>
        ) : (
          <>
            <AlertCircle className="w-3 h-3 mr-1" />
            Inactive
          </>
        )}
      </div>
    );
  };

  const getAvailabilityStatus = (day: string, availability: any) => {
    if (!availability || !availability.isAvailable) {
      return <span className="text-gray-500">Not Available</span>;
    }
    return (
      <span className="text-emerald-600 font-medium">
        {availability.start} - {availability.end}
      </span>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/20 animate-in fade-in-0 zoom-in-95 duration-300 z-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Dr. {doctor.firstName} {doctor.lastName}</h2>
                <p className="text-emerald-100 text-sm">Doctor Profile Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(doctor)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 backdrop-blur-sm"
                  title="Edit Doctor"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-emerald-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900 font-medium">Dr. {doctor.firstName} {doctor.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(doctor.isActive)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center mt-1">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{doctor.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <div className="flex items-center mt-1">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{doctor.phone}</p>
                    </div>
                  </div>
                  {doctor.dateOfBirth && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <div className="flex items-center mt-1">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-gray-900">{formatDate(doctor.dateOfBirth)}</p>
                      </div>
                    </div>
                  )}
                  {doctor.employeeId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Employee ID</label>
                      <p className="text-gray-900 font-mono">{doctor.employeeId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-emerald-600" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Specialization</label>
                    <p className="text-gray-900 font-medium">{doctor.specialization}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">License Number</label>
                    <p className="text-gray-900 font-mono">{doctor.licenseNumber}</p>
                  </div>
                  {doctor.experienceYears && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Experience</label>
                      <div className="flex items-center mt-1">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-gray-900">{doctor.experienceYears} years</p>
                      </div>
                    </div>
                  )}
                  {doctor.rating && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rating</label>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <p className="text-gray-900">{doctor.rating}/5 ({doctor.totalReviews} reviews)</p>
                      </div>
                    </div>
                  )}
                </div>
                {doctor.qualifications && doctor.qualifications.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">Qualifications</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {doctor.qualifications.map((qualification, index) => (
                        <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full">
                          {qualification}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Services */}
              {doctor.services && doctor.services.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                    Services Offered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.services.map((service, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {doctor.languages && doctor.languages.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-emerald-600" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((language, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Availability & Location */}
            <div className="space-y-6">
              {/* Availability */}
              {doctor.availability && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-emerald-600" />
                    Weekly Availability
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(doctor.availability).map(([day, schedule]: [string, any]) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 capitalize">{day}</span>
                        {getAvailabilityStatus(day, schedule)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                  Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Branch</label>
                    <p className="text-gray-900 font-medium">{doctor.branchId.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Organization</label>
                    <p className="text-gray-900">{doctor.organizationId.name}</p>
                  </div>
                  {doctor.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">{doctor.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">{formatDate(doctor.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-gray-900">{formatDate(doctor.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(doctor)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Edit Doctor
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDoctorModal;
