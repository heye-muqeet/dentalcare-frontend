import React from 'react';
import { X, MapPin, Phone, Mail, Globe, Tag, User, Calendar, CheckCircle, XCircle, Edit, Trash2, Clock, Building2 } from 'lucide-react';
import type { Branch } from '../../lib/api/services/branches';

interface ViewBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  onEdit?: (branch: Branch) => void;
  onDelete?: (branch: Branch) => void;
}

const ViewBranchModal: React.FC<ViewBranchModalProps> = ({
  isOpen,
  onClose,
  branch,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !branch) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOperatingHoursDisplay = () => {
    if (!branch?.operatingHours) {
      return (
        <div className="text-center py-4">
          <span className="text-sm text-gray-500">Operating hours not specified</span>
        </div>
      );
    }
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const hoursElements = days.map((day, index) => {
      const hours = branch.operatingHours?.[day];
      if (!hours) {
        return (
          <div key={day} className="flex justify-between items-center py-1">
            <span className="text-sm font-medium text-gray-700">{dayLabels[index]}</span>
            <span className="text-sm text-gray-600">Not set</span>
          </div>
        );
      }
      
      return (
        <div key={day} className="flex justify-between items-center py-1">
          <span className="text-sm font-medium text-gray-700">{dayLabels[index]}</span>
          <span className="text-sm text-gray-600">
            {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
          </span>
        </div>
      );
    });
    
    return hoursElements;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-xl flex flex-col">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{String(branch.name || 'Unnamed Branch')}</h2>
                <p className="text-blue-100 text-sm">{String(branch.city || '')}, {String(branch.state || '')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                branch.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {branch.isActive ? (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Active</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <XCircle className="h-3 w-3" />
                    <span>Inactive</span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar light">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span>Branch Information</span>
                  </h3>
                  <div className="space-y-3">
                    {branch.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{String(branch.description)}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {String(branch.address || '')}<br />
                        {String(branch.city || '')}, {String(branch.state || '')} {String(branch.postalCode || '')}<br />
                        {String(branch.country || '')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span>Contact Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-gray-900">{String(branch.email || 'Not provided')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-gray-900">{String(branch.phone || 'Not provided')}</p>
                      </div>
                    </div>
                    {branch.website && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Website</p>
                          <a 
                            href={String(branch.website)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {String(branch.website)}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Statistics</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{Number(branch.totalDoctors || 0)}</p>
                      <p className="text-sm text-blue-800">Doctors</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{Number(branch.totalReceptionists || 0)}</p>
                      <p className="text-sm text-green-800">Receptionists</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">{Number(branch.totalPatients || 0)}</p>
                      <p className="text-sm text-purple-800">Patients</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600">{Number(branch.totalStaff || 0)}</p>
                      <p className="text-sm text-orange-800">Total Staff</p>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Operating Hours</span>
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                    {getOperatingHoursDisplay()}
                  </div>
                </div>

                {/* Tags */}
                {branch.tags && Array.isArray(branch.tags) && branch.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-blue-600" />
                      <span>Tags</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {branch.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {String(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Metadata</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">{formatDate(branch.createdAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <span className="ml-2 text-gray-600">{formatDate(branch.updatedAt)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Branch ID:</span>
                    <span className="ml-2 text-gray-600 font-mono text-xs">{branch._id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Organization:</span>
                    <span className="ml-2 text-gray-600 text-xs">
                      {typeof branch.organizationId === 'string' 
                        ? branch.organizationId 
                        : (branch.organizationId as any)?.name || (branch.organizationId as any)?._id || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Close
            </button>
            <div className="flex items-center space-x-2">
              {onEdit && !branch.isDeleted && (
                <button
                  onClick={() => onEdit(branch)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
              {onDelete && !branch.isDeleted && (
                <button
                  onClick={() => onDelete(branch)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBranchModal;
