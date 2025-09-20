import React, { useState, useEffect } from 'react';
import { X, MapPin, Tag, Plus, CheckCircle, Save } from 'lucide-react';
import { LoadingButton } from '../Loader';
import { branchService } from '../../lib/api/services/branches';
import type { Branch, UpdateBranchData } from '../../lib/api/services/branches';

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branch: Branch | null;
}

interface EditBranchData extends UpdateBranchData {
  tags?: string[];
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
}

interface FormErrors {
  [key: string]: string;
}

export const EditBranchModal: React.FC<EditBranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branch,
}) => {
  const [formData, setFormData] = useState<EditBranchData>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    tags: [],
    isActive: true,
    operatingHours: {
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '09:00', close: '14:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: false },
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when branch changes
  useEffect(() => {
    if (isOpen && branch) {
      setFormData({
        name: branch.name || '',
        description: branch.description || '',
        address: branch.address || '',
        city: branch.city || '',
        state: branch.state || '',
        country: branch.country || '',
        postalCode: branch.postalCode || '',
        phone: branch.phone || '',
        email: branch.email || '',
        website: branch.website || '',
        tags: branch.tags || [],
        isActive: branch.isActive,
        operatingHours: branch.operatingHours || {
          monday: { open: '09:00', close: '17:00', isOpen: true },
          tuesday: { open: '09:00', close: '17:00', isOpen: true },
          wednesday: { open: '09:00', close: '17:00', isOpen: true },
          thursday: { open: '09:00', close: '17:00', isOpen: true },
          friday: { open: '09:00', close: '17:00', isOpen: true },
          saturday: { open: '09:00', close: '14:00', isOpen: true },
          sunday: { open: '10:00', close: '14:00', isOpen: false },
        },
      });
      setErrors({});
      setNewTag('');
    }
  }, [isOpen, branch]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Branch name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.country?.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.postalCode?.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !branch) {
      return;
    }

    setIsSubmitting(true);
    try {
      await branchService.updateBranch(branch._id, formData);
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Failed to update branch:', error);
      
      // Extract error message
      let errorMessage = 'Failed to update branch. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ 
        submit: errorMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setNewTag('');
    onClose();
  };

  const handleInputChange = (field: keyof EditBranchData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOperatingHoursChange = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours!,
        [day]: {
          ...prev.operatingHours![day],
          [field]: value
        }
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen || !branch) return null;

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Edit Branch</h2>
                <p className="text-white/80 text-sm">Update branch information</p>
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
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar light">
          <div className="p-4 space-y-4">
            {/* Error Message */}
            {errors.submit && (
              <div className="mb-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Update Failed</h3>
                    <p className="text-red-700 text-sm leading-relaxed">{errors.submit}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrors(prev => ({ ...prev, submit: '' }))}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Branch Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter branch name"
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter email"
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone"
                  />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.website ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com"
                  />
                  {errors.website && <p className="text-red-500 text-xs">{errors.website}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter branch description"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Address</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="Enter street address"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="Enter state"
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="Enter postal code"
                    />
                    {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.country ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="Enter country"
                  />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gradient-to-r from-blue-200 to-cyan-200">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Operating Hours
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {dayNames.map((day, index) => (
                  <div key={day} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 w-24">
                      <input
                        type="checkbox"
                        checked={formData.operatingHours?.[day]?.isOpen || false}
                        onChange={(e) => handleOperatingHoursChange(day, 'isOpen', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        {dayLabels[index]}
                      </label>
                    </div>
                    
                    {formData.operatingHours?.[day]?.isOpen && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={formData.operatingHours[day]?.open || '09:00'}
                          onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={formData.operatingHours[day]?.close || '17:00'}
                          onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    )}
                    
                    {!formData.operatingHours?.[day]?.isOpen && (
                      <span className="text-sm text-gray-500">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags & Status */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <Tag className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Tags & Status</h3>
              </div>

              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Branch is active
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText="Updating..."
                variant="primary"
                size="sm"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Update Branch</span>
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBranchModal;
