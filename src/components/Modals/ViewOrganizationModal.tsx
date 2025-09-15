import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, Mail, Globe, Tag, User, Calendar, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { LoadingButton } from '../Loader';
import { organizationService } from '../../lib/api/services/organizations';

interface Organization {
  _id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  tags: string[];
  isActive: boolean;
  organizationAdminId?: string;
  organizationAdmin?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ViewOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  onEdit?: (organization: Organization) => void;
  onDelete?: (organization: Organization) => void;
}

const ViewOrganizationModal: React.FC<ViewOrganizationModalProps> = ({
  isOpen,
  onClose,
  organization,
  onEdit,
  onDelete
}) => {
  const [organizationData, setOrganizationData] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch organization details with admin data when modal opens
  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      if (!isOpen || !organization) return;
      
      setLoading(true);
      try {
        const orgWithAdmin = await organizationService.getOrganizationWithAdmin(organization._id);
        setOrganizationData(orgWithAdmin);
      } catch (error) {
        console.error('Failed to fetch organization details:', error);
        // Fallback to the organization data passed as prop
        setOrganizationData(organization);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationDetails();
  }, [isOpen, organization]);

  if (!isOpen || !organization) return null;

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
    if (isActive) {
      return (
        <div className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>Active</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          <XCircle className="w-4 h-4" />
          <span>Inactive</span>
        </div>
      );
    }
  };

  // Use organizationData if available, otherwise fallback to organization prop
  const displayData = organizationData || organization;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/20 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{displayData.name}</h2>
                <p className="text-indigo-100 text-sm">Organization Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(displayData)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 backdrop-blur-sm"
                  title="Edit Organization"
                >
                  <Edit className="w-5 h-5" />
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

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading organization details...</span>
          </div>
        ) : (

        <div className="p-6 space-y-8 max-h-[calc(95vh-120px)] overflow-y-auto">
          {/* Status and Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Organization Information</span>
                </h3>
              </div>
              {getStatusBadge(displayData.isActive)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">Organization Name</label>
                <div className="p-3 bg-gray-50 rounded-xl border">
                  <p className="text-gray-900 font-medium">{displayData.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">Email Address</label>
                <div className="p-3 bg-gray-50 rounded-xl border flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{displayData.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <div className="p-3 bg-gray-50 rounded-xl border flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{displayData.phone}</p>
                </div>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">Website</label>
                <div className="p-3 bg-gray-50 rounded-xl border flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  {displayData.website ? (
                    <a 
                      href={displayData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      {displayData.website}
                    </a>
                  ) : (
                    <p className="text-gray-500 italic">No website provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {displayData.description && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <div className="p-3 bg-gray-50 rounded-xl border">
                  <p className="text-gray-900">{displayData.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Address Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span>Address Information</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Address */}
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-500">Street Address</label>
                <div className="p-3 bg-gray-50 rounded-xl border flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{displayData.address}</p>
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">City</label>
                <div className="p-3 bg-gray-50 rounded-xl border">
                  <p className="text-gray-900">{displayData.city}</p>
                </div>
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">State</label>
                <div className="p-3 bg-gray-50 rounded-xl border">
                  <p className="text-gray-900">{displayData.state}</p>
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">Country</label>
                <div className="p-3 bg-gray-50 rounded-xl border">
                  <p className="text-gray-900">{displayData.country}</p>
                </div>
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">Postal Code</label>
                <div className="p-3 bg-gray-50 rounded-xl border">
                  <p className="text-gray-900">{displayData.postalCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {displayData.tags && displayData.tags.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-red-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-pink-600" />
                  <span>Tags & Categories</span>
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {displayData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Organization Admin */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-green-600" />
                <span>Organization Admin</span>
              </h3>
            </div>

            {displayData.organizationAdmin ? (
              <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">Admin Name</label>
                    <div className="p-3 bg-white rounded-xl border">
                      <p className="text-gray-900 font-medium">
                        {displayData.organizationAdmin.firstName} {displayData.organizationAdmin.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <div className="p-3 bg-white rounded-xl border flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{displayData.organizationAdmin.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <div className="p-3 bg-white rounded-xl border flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{displayData.organizationAdmin.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">No organization admin assigned</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  This organization is inactive because no admin has been assigned.
                </p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-8 bg-gradient-to-b from-gray-500 to-slate-500 rounded-full"></div>
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span>Timestamps</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <div className="p-3 bg-gray-50 rounded-xl border">
                  <p className="text-gray-900">{formatDate(displayData.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <div className="p-3 bg-gray-50 rounded-xl border">
                  <p className="text-gray-900">{formatDate(displayData.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {(onEdit || onDelete) && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              {onDelete && (
                <button
                  onClick={() => onDelete(displayData)}
                  className="px-6 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors duration-200 font-medium flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(displayData)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Organization</span>
                </button>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default ViewOrganizationModal;

