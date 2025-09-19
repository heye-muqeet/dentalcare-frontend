import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, Mail, Globe, Tag, Plus, AlertCircle, CheckCircle, User, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { LoadingButton } from '../Loader';
import { branchService } from '../../lib/api/services/branches';
import { authService } from '../../lib/api/services/auth';
import type { CreateBranchData } from '../../lib/api/services/branches';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExtendedCreateBranchData extends CreateBranchData {
  isActive?: boolean;
  selectedAdminIds?: string[];
  createNewAdmin?: boolean;
  adminData?: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    address?: string;
    dateOfBirth?: string;
    employeeId?: string;
  };
}

interface FormErrors {
  [key: string]: string;
}

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ExtendedCreateBranchData>({
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
    operatingHours: {
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '09:00', close: '14:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: false },
    },
    isActive: false, // Default to false - requires admin
    selectedAdminIds: [],
    createNewAdmin: false,
    adminData: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      employeeId: '',
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBranchAdmins, setAvailableBranchAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Generate random alphanumeric password
  const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Generate initial password when modal opens
  useEffect(() => {
    if (isOpen && formData.createNewAdmin) {
      const initialPassword = generatePassword();
      setFormData(prev => ({
        ...prev,
        adminData: {
          ...prev.adminData!,
          password: initialPassword
        }
      }));
    }
  }, [isOpen, formData.createNewAdmin]);

  // Fetch available branch admins (for now, we'll use a placeholder)
  useEffect(() => {
    const fetchAvailableBranchAdmins = async () => {
      if (!isOpen) return;
      
      setLoadingAdmins(true);
      try {
        // TODO: Implement API call to get available branch admins
        // For now, we'll set an empty array to simulate no available admins
        setAvailableBranchAdmins([]);
      } catch (error) {
        console.error('Failed to fetch available branch admins:', error);
        setAvailableBranchAdmins([]);
      } finally {
        setLoadingAdmins(false);
      }
    };

    fetchAvailableBranchAdmins();
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Branch name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
    }

    // Branch admin validation
    if (formData.isActive) {
      if (formData.createNewAdmin) {
        // Validate new admin data
        if (!formData.adminData?.firstName?.trim()) {
          newErrors.adminFirstName = 'Admin first name is required';
        }
        if (!formData.adminData?.lastName?.trim()) {
          newErrors.adminLastName = 'Admin last name is required';
        }
        if (!formData.adminData?.email?.trim()) {
          newErrors.adminEmail = 'Admin email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminData.email)) {
          newErrors.adminEmail = 'Please enter a valid admin email address';
        }
        if (!formData.adminData?.password?.trim()) {
          newErrors.adminPassword = 'Admin password is required';
        } else if (formData.adminData.password.length !== 10) {
          newErrors.adminPassword = 'Admin password must be exactly 10 characters';
        }
        if (!formData.adminData?.phone?.trim()) {
          newErrors.adminPhone = 'Admin phone number is required';
        }
      } else if (!formData.selectedAdminIds || formData.selectedAdminIds.length === 0) {
        newErrors.selectedAdminIds = 'At least one branch admin is required for active branches';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // If creating new admin, we need to handle the sequential creation
      if (formData.isActive && formData.createNewAdmin && formData.adminData) {
        // First create the branch
        const branchData = {
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          tags: formData.tags,
          operatingHours: formData.operatingHours,
          isActive: false, // Create as inactive first
        };

        // Create branch
        const branchResponse = await branchService.createBranch(branchData);
        
        // Then create the branch admin
        if (branchResponse.success && branchResponse.data) {
          const adminData = {
            firstName: formData.adminData.firstName,
            lastName: formData.adminData.lastName,
            email: formData.adminData.email,
            password: formData.adminData.password,
            phone: formData.adminData.phone,
            address: formData.adminData.address,
            dateOfBirth: formData.adminData.dateOfBirth,
            employeeId: formData.adminData.employeeId,
            branchId: branchResponse.data._id,
            role: 'branch_admin',
          };

          // Create branch admin using auth service
          await authService.createBranchAdmin(adminData);
          
          // Finally, update branch to active
          await branchService.updateBranch(branchResponse.data._id, { isActive: true });
        }
      } else {
        // Regular branch creation (existing admin or inactive)
        const branchData = {
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          tags: formData.tags,
          operatingHours: formData.operatingHours,
          isActive: formData.isActive,
          selectedAdminIds: formData.selectedAdminIds,
        };
        
        await branchService.createBranch(branchData);
      }
      
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create branch and admin:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
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
      operatingHours: {
        monday: { open: '09:00', close: '17:00', isOpen: true },
        tuesday: { open: '09:00', close: '17:00', isOpen: true },
        wednesday: { open: '09:00', close: '17:00', isOpen: true },
        thursday: { open: '09:00', close: '17:00', isOpen: true },
        friday: { open: '09:00', close: '17:00', isOpen: true },
        saturday: { open: '09:00', close: '14:00', isOpen: true },
        sunday: { open: '10:00', close: '14:00', isOpen: false },
      },
      isActive: false,
      selectedAdminIds: [],
      createNewAdmin: false,
      adminData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        employeeId: '',
      },
    });
    setErrors({});
    setNewTag('');
    setShowPassword(false);
    onClose();
  };

  const handleInputChange = (field: keyof ExtendedCreateBranchData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAdminDataChange = (field: keyof NonNullable<ExtendedCreateBranchData['adminData']>, value: string) => {
    setFormData(prev => ({
      ...prev,
      adminData: {
        ...prev.adminData!,
        [field]: value
      }
    }));
    if (errors[`admin${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors(prev => ({ ...prev, [`admin${field.charAt(0).toUpperCase() + field.slice(1)}`]: '' }));
    }
  };

  const handleRegeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({
      ...prev,
      adminData: {
        ...prev.adminData!,
        password: newPassword
      }
    }));
    // Clear password error if any
    if (errors.adminPassword) {
      setErrors(prev => ({ ...prev, adminPassword: '' }));
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

  if (!isOpen) return null;

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/20 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Create Branch
                </h2>
                <p className="text-white/90 text-lg mt-1">Add a new branch to your organization</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-3 hover:bg-white/20 rounded-2xl backdrop-blur-sm transition-all duration-200 group border border-white/20"
            >
              <X className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-8 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gradient-to-r from-blue-200 to-teal-200">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Branch Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="Enter branch name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.website ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      placeholder="https://example.com"
                    />
                  </div>
                  {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 resize-none"
                  placeholder="Enter branch description"
                />
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gradient-to-r from-blue-200 to-teal-200">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Address Information
                </h3>
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

            {/* Tags Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gradient-to-r from-blue-200 to-teal-200">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg">
                  <Tag className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Tags
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Branch Tags
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        placeholder="Add a tag and press Enter"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add</span>
                    </button>
                  </div>
                  
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 border border-blue-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Branch is active
                </label>
              </div>
            </div>

            {/* Branch Admin Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gradient-to-r from-blue-200 to-teal-200">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Branch Admin
                </h3>
              </div>

              <div className="space-y-4">
                {formData.isActive ? (
                  <div className="space-y-4">
                    {/* Admin Selection Toggle */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="selectExistingBranchAdmin"
                          name="branchAdminOption"
                          checked={!formData.createNewAdmin}
                          onChange={() => handleInputChange('createNewAdmin', false)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="selectExistingBranchAdmin" className="text-sm font-medium text-gray-700">
                          Select existing admin
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="createNewBranchAdmin"
                          name="branchAdminOption"
                          checked={formData.createNewAdmin}
                          onChange={() => handleInputChange('createNewAdmin', true)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="createNewBranchAdmin" className="text-sm font-medium text-gray-700">
                          Create new admin
                        </label>
                      </div>
                    </div>

                    {/* Existing Admin Selection */}
                    {!formData.createNewAdmin && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Select Branch Admin *
                        </label>
                        {loadingAdmins ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading admins...</span>
                          </div>
                        ) : availableBranchAdmins.length > 0 ? (
                          <div className="space-y-2">
                            <select
                              value={formData.selectedAdminIds?.[0] || ''}
                              onChange={(e) => {
                                const adminId = e.target.value;
                                if (adminId) {
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedAdminIds: [adminId]
                                  }));
                                }
                              }}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                errors.selectedAdminIds ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                              }`}
                            >
                              <option value="">Select a branch admin</option>
                              {availableBranchAdmins.map((admin) => (
                                <option key={admin._id} value={admin._id}>
                                  {admin.firstName} {admin.lastName} ({admin.email})
                                </option>
                              ))}
                            </select>
                            {errors.selectedAdminIds && (
                              <p className="text-red-500 text-sm mt-1">{errors.selectedAdminIds}</p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                              <span className="text-yellow-800 text-sm">
                                No branch admins available. Please create a new admin.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* New Admin Creation Form */}
                    {formData.createNewAdmin && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800">Create Branch Admin</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={formData.adminData?.firstName || ''}
                              onChange={(e) => handleAdminDataChange('firstName', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                errors.adminFirstName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                              }`}
                              placeholder="Enter first name"
                            />
                            {errors.adminFirstName && <p className="text-red-500 text-sm mt-1">{errors.adminFirstName}</p>}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              value={formData.adminData?.lastName || ''}
                              onChange={(e) => handleAdminDataChange('lastName', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                errors.adminLastName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                              }`}
                              placeholder="Enter last name"
                            />
                            {errors.adminLastName && <p className="text-red-500 text-sm mt-1">{errors.adminLastName}</p>}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              value={formData.adminData?.email || ''}
                              onChange={(e) => handleAdminDataChange('email', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                errors.adminEmail ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                              }`}
                              placeholder="Enter email address"
                            />
                            {errors.adminEmail && <p className="text-red-500 text-sm mt-1">{errors.adminEmail}</p>}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={formData.adminData?.phone || ''}
                              onChange={(e) => handleAdminDataChange('phone', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                errors.adminPhone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                              }`}
                              placeholder="Enter phone number"
                            />
                            {errors.adminPhone && <p className="text-red-500 text-sm mt-1">{errors.adminPhone}</p>}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Password *
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.adminData?.password || ''}
                                onChange={(e) => handleAdminDataChange('password', e.target.value)}
                                className={`w-full px-4 py-3 pr-20 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                  errors.adminPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                                }`}
                                placeholder="Auto-generated password"
                              />
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={handleRegeneratePassword}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200 group"
                                  title="Regenerate password"
                                >
                                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                                  title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>10 character alphanumeric password</span>
                              <span className="text-blue-600 font-medium">Auto-generated</span>
                            </div>
                            {errors.adminPassword && <p className="text-red-500 text-sm mt-1">{errors.adminPassword}</p>}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Employee ID
                            </label>
                            <input
                              type="text"
                              value={formData.adminData?.employeeId || ''}
                              onChange={(e) => handleAdminDataChange('employeeId', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                              placeholder="Enter employee ID"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={formData.adminData?.dateOfBirth || ''}
                              onChange={(e) => handleAdminDataChange('dateOfBirth', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Address
                            </label>
                            <input
                              type="text"
                              value={formData.adminData?.address || ''}
                              onChange={(e) => handleAdminDataChange('address', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                              placeholder="Enter address"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 text-sm">
                        Branch will be created as inactive. You can assign an admin and activate it later.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Hours Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gradient-to-r from-blue-200 to-teal-200">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
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
          </div>

          {/* Footer */}
          <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-6 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText="Creating Branch..."
                variant="primary"
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Create Branch
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBranchModal;
