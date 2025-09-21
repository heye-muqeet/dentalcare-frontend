import React, { useState } from 'react';
import { useAppSelector } from '../../lib/hooks';
import type { RootState } from '../../lib/store/store';
import { categoryService, CreateCategoryData } from '../../lib/api/services/categories';
import { FiX, FiTag, FiEdit3, FiHash, FiCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import LoadingButton from '../Loader/LoadingButton';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  color: '#10b981', // Default emerald color
  icon: '🏷️',
  isActive: true
};

// Predefined color options
const colorOptions = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
];

// Predefined icon options
const iconOptions = [
  '🏷️', '🦷', '💊', '🔬', '🏥', '⚕️', '🩺', '💉',
  '🦴', '🧬', '🔍', '📋', '📊', '🎯', '⭐', '💎'
];

export default function CreateCategoryModal({ isOpen, onClose, onSuccess }: CreateCategoryModalProps) {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields only
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (formData.name.length > 50) newErrors.name = 'Category name must be less than 50 characters';

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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const submitData: CreateCategoryData = {
        ...formData,
        // Remove empty optional fields
        description: formData.description.trim() || undefined,
        color: formData.color || undefined,
        icon: formData.icon || undefined
      };
      
      console.log('Creating category:', submitData);
      
      const response = await categoryService.createCategory(submitData);
      
      if (response.success) {
        toast.success('Category created successfully');
        handleClose();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      
      // Handle specific error types
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      let errorMessage = 'Failed to create category';
      let fieldError = '';
      
      switch (status) {
        case 409:
          errorMessage = 'A category with this name already exists. Please use a different name.';
          fieldError = 'name';
          break;
        case 400:
          errorMessage = errorData?.message || 'Invalid data provided. Please check all fields.';
          break;
        case 422:
          errorMessage = errorData?.message || 'Validation failed. Please check your input.';
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        default:
          errorMessage = errorData?.message || 'Failed to create category. Please try again.';
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
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FiTag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Add New Category</h2>
                <p className="text-white/80 text-sm">Create a new category for services and treatments</p>
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
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Category Creation Failed</h3>
                    <p className="text-red-700 text-sm leading-relaxed">{errors.submit}</p>
                    {errors.name && (
                      <div className="mt-2 p-2 bg-red-100 rounded-md">
                        <p className="text-red-600 text-xs">
                          💡 <strong>Tip:</strong> Try using a different category name or check if this category already exists in your organization.
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

            {/* Category Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <FiTag className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-semibold text-gray-900">Category Information</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Category Name *</label>
                  <div className="relative">
                    <FiEdit3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter category name"
                      maxLength={50}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Description</label>
                  <div className="relative">
                    <FiHash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                      placeholder="Enter category description (optional)"
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>

              {/* Visual Customization */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                  <FiCircle className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-semibold text-gray-900">Visual Customization</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Color Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">Color Theme</label>
                    <div className="grid grid-cols-5 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleInputChange('color', color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">Custom color</span>
                    </div>
                  </div>

                  {/* Icon Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">Icon</label>
                    <div className="grid grid-cols-8 gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => handleInputChange('icon', icon)}
                          className={`w-8 h-8 rounded border text-lg transition-all ${
                            formData.icon === icon 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">Preview</label>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div 
                      className="w-12 h-12 rounded flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${formData.color}20`,
                        color: formData.color
                      }}
                    >
                      <span className="text-xl">{formData.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{formData.name || 'Category Name'}</h4>
                      {formData.description && (
                        <p className="text-sm text-gray-600">{formData.description}</p>
                      )}
                    </div>
                  </div>
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
                  Category is active
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
              Create Category
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}
