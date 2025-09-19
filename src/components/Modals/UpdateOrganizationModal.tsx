import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, Mail, Globe, Tag, Save, AlertCircle } from 'lucide-react';
import { LoadingButton } from '../Loader';

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
  createdAt: string;
  updatedAt: string;
}

interface UpdateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<Organization>) => Promise<void>;
  organization: Organization | null;
  fields?: (keyof Organization)[];
  title?: string;
  description?: string;
}

interface UpdateOrganizationData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  tags?: string[];
  isActive?: boolean;
}

const UpdateOrganizationModal: React.FC<UpdateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  organization,
  fields = ['name', 'description', 'address', 'city', 'state', 'country', 'postalCode', 'phone', 'email', 'website', 'tags', 'isActive'],
  title = 'Update Organization',
  description = 'Update specific organization fields'
}) => {
  const [formData, setFormData] = useState<UpdateOrganizationData>({});
  const [errors, setErrors] = useState<Partial<UpdateOrganizationData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when organization changes
  useEffect(() => {
    if (organization) {
      const initialData: UpdateOrganizationData = {};
      fields.forEach(field => {
        if (organization[field] !== undefined) {
          (initialData as any)[field] = organization[field];
        }
      });
      setFormData(initialData);
    }
  }, [organization, fields]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'tags') {
      const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setFormData(prev => ({ ...prev, [name]: tagsArray }));
    } else if (name === 'isActive') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof UpdateOrganizationData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateOrganizationData> = {};

    // Only validate fields that are being updated
    if (formData.name !== undefined) {
      if (!formData.name.trim()) newErrors.name = 'Organization name is required';
    }
    
    if (formData.email !== undefined) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (formData.phone !== undefined) {
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }
    
    if (formData.address !== undefined) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }
    
    if (formData.city !== undefined) {
      if (!formData.city.trim()) newErrors.city = 'City is required';
    }
    
    if (formData.state !== undefined) {
      if (!formData.state.trim()) newErrors.state = 'State is required';
    }
    
    if (formData.country !== undefined) {
      if (!formData.country.trim()) newErrors.country = 'Country is required';
    }
    
    if (formData.postalCode !== undefined) {
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    }

    // Website validation (optional but must be valid URL if provided)
    if (formData.website !== undefined && formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !organization) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(organization._id, formData);
      handleClose();
    } catch (error) {
      console.error('Failed to update organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    onClose();
  };

  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80 backdrop-blur-md"
        onClick={handleClose}
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
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-indigo-100 text-sm">{description}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[calc(95vh-120px)] overflow-y-auto custom-scrollbar light">
          {/* Organization Details Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Organization Details</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Name */}
              {fields.includes('name') && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                      }`}
                      placeholder="Enter organization name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
              )}

              {/* Email */}
              {fields.includes('email') && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
              )}

              {/* Phone */}
              {fields.includes('phone') && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>
              )}

              {/* Website */}
              {fields.includes('website') && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        errors.website ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                      }`}
                      placeholder="https://example.com"
                    />
                  </div>
                  {errors.website && <p className="text-red-500 text-sm">{errors.website}</p>}
                </div>
              )}
            </div>

            {/* Description */}
            {fields.includes('description') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300"
                  placeholder="Enter organization description"
                />
              </div>
            )}
          </div>

          {/* Address Section */}
          {(fields.includes('address') || fields.includes('city') || fields.includes('state') || fields.includes('country') || fields.includes('postalCode')) && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span>Address Information</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Address */}
                {fields.includes('address') && (
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                        }`}
                        placeholder="Enter street address"
                      />
                    </div>
                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                  </div>
                )}

                {/* City */}
                {fields.includes('city') && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                  </div>
                )}

                {/* State */}
                {fields.includes('state') && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                      }`}
                      placeholder="Enter state"
                    />
                    {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                  </div>
                )}

                {/* Country */}
                {fields.includes('country') && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        errors.country ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                      }`}
                      placeholder="Enter country"
                    />
                    {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                  </div>
                )}

                {/* Postal Code */}
                {fields.includes('postalCode') && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                      }`}
                      placeholder="Enter postal code"
                    />
                    {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {fields.includes('tags') && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-red-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-pink-600" />
                  <span>Tags & Categories</span>
                </h3>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags?.join(', ') || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300"
                  placeholder="Enter tags separated by commas (e.g., dental, healthcare, premium)"
                />
                <p className="text-sm text-gray-500">Separate multiple tags with commas</p>
              </div>
            </div>
          )}

          {/* Status Section */}
          {fields.includes('isActive') && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-green-600" />
                  <span>Organization Status</span>
                </h3>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive || false}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Organization is active
                </label>
                {(formData.isActive || false) && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Update Organization'}</span>
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateOrganizationModal;

