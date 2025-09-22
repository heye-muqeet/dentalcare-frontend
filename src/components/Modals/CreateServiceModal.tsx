import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../lib/hooks';
import type { RootState } from '../../lib/store/store';
import { serviceService, CreateServiceData } from '../../lib/api/services/services';
import { categoryService, Category } from '../../lib/api/services/categories';
import { FiX, FiFileText, FiDollarSign, FiClock, FiTag, FiEdit3 } from 'react-icons/fi';
import { toast } from 'sonner';
import LoadingButton from '../Loader/LoadingButton';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  maxPrice?: number;
  isPriceRange: boolean;
  isActive: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: ServiceFormData = {
  name: '',
  description: '',
  category: '',
  duration: 30,
  price: 0,
  maxPrice: undefined,
  isPriceRange: false,
  isActive: true
};

export default function CreateServiceModal({ isOpen, onClose, onSuccess }: CreateServiceModalProps) {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  // Load categories when modal opens
  useEffect(() => {
    const loadCategories = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingCategories(true);
        const response = await categoryService.getCategories();
        console.log('🔍 Categories response in CreateServiceModal:', response);
        
        if (response.success) {
          console.log('📋 All categories before filtering:', response.data);
          // Show all categories that are not explicitly set to false
          // This handles cases where isActive might be undefined or true
          const activeCategories = response.data.filter(cat => cat.isActive !== false);
          console.log('✅ Active categories after filtering:', activeCategories);
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields only
    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (formData.duration <= 0) newErrors.duration = 'Duration must be greater than 0';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';
    
    // Price range validation
    if (formData.isPriceRange) {
      if (!formData.maxPrice || formData.maxPrice <= 0) {
        newErrors.maxPrice = 'Maximum price is required for price ranges';
      } else if (formData.maxPrice <= formData.price) {
        newErrors.maxPrice = 'Maximum price must be greater than starting price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !branchId) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // If not a price range, remove maxPrice
        ...(formData.isPriceRange ? {} : { maxPrice: undefined })
      };
      
      console.log('Creating service:', submitData);
      
      const response = await serviceService.createService(branchId, submitData);
      
      if (response.success) {
        toast.success('Service created successfully');
        handleClose();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating service:', error);
      
      // Handle specific error types
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      let errorMessage = 'Failed to create service';
      let fieldError = '';
      
      switch (status) {
        case 409:
          errorMessage = 'A service with this name already exists. Please use a different name.';
          fieldError = 'name';
          break;
        case 400:
          errorMessage = errorData?.message || 'Invalid data provided. Please check all fields.';
          // Check for specific field validation errors
          if (errorData?.errors) {
            const fieldErrors = errorData.errors;
            if (fieldErrors.name) fieldError = 'name';
            else if (fieldErrors.category) fieldError = 'category';
            else if (fieldErrors.price) fieldError = 'price';
          }
          break;
        case 422:
          errorMessage = errorData?.message || 'Validation failed. Please check your input.';
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        default:
          errorMessage = errorData?.message || 'Failed to create service. Please try again.';
      }
      
      // Show toast notification
      toast.error(errorMessage);
      
      // Set form errors
      const newErrors: FormErrors = { submit: errorMessage };
      if (fieldError) {
        newErrors[fieldError] = `This ${fieldError} is already in use or invalid`;
      }
      setErrors(newErrors);
      
      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.querySelector('[data-error="submit"]');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FiFileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Add New Service</h2>
                <p className="text-white/80 text-sm">Create a new service for your branch</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errors.submit && (
              <div 
                data-error="submit"
                className="mb-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-sm animate-in slide-in-from-top-2 duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Service Creation Failed</h3>
                    <p className="text-red-700 text-sm leading-relaxed">{errors.submit}</p>
                    {errors.name && (
                      <div className="mt-2 p-2 bg-red-100 rounded-md">
                        <p className="text-red-600 text-xs">
                          💡 <strong>Tip:</strong> Try using a different service name or check if this service already exists in your system.
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrors(prev => ({ ...prev, submit: '', name: '' }))}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Service Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <FiFileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-semibold text-gray-900">Service Information</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Service Name *</label>
                  <div className="relative">
                    <FiEdit3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter service name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Description *</label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none ${
                        errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter service description"
                    />
                  </div>
                  {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Category *</label>
                  <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={loadingCategories}
                    >
                      <option value="">Select a category...</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.icon && <span className="mr-1">{category.icon}</span>}
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {loadingCategories && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                      </div>
                    )}
                  </div>
                  {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
                  {categories.length === 0 && !loadingCategories && (
                    <p className="text-xs text-amber-600">
                      💡 No categories available. Contact your administrator to create categories first.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Duration (minutes) *</label>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.duration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="30"
                    />
                  </div>
                  {errors.duration && <p className="text-red-500 text-xs">{errors.duration}</p>}
                </div>

                {/* Price Range Section */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPriceRange"
                      checked={formData.isPriceRange}
                      onChange={(e) => handleInputChange('isPriceRange', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="isPriceRange" className="text-sm text-gray-700">
                      This service has a price range
                    </label>
                  </div>

                  {formData.isPriceRange ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Starting Price ($) *</label>
                        <div className="relative">
                          <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                            className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                              errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Maximum Price ($) *</label>
                        <div className="relative">
                          <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.maxPrice || ''}
                            onChange={(e) => handleInputChange('maxPrice', parseFloat(e.target.value) || undefined)}
                            className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                              errors.maxPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors.maxPrice && <p className="text-red-500 text-xs">{errors.maxPrice}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Fixed Price ($) *</label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                          className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                            errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Service is active
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Compact Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <LoadingButton
              onClick={handleSubmit}
              loading={isSubmitting}
              loadingText="Creating..."
              variant="primary"
              size="sm"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
            >
              Create Service
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}
