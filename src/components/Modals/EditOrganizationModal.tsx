import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, Mail, Globe, Tag, Plus, User, AlertCircle, CheckCircle, RefreshCw, Eye, EyeOff, Save } from 'lucide-react';
import { LoadingButton } from '../Loader';
import { systemService } from '../../lib/api/services/system';
import { organizationService } from '../../lib/api/services/organizations';
import { authService } from '../../lib/api/services/auth';
import type { SystemUser } from '../../lib/api/services/system';

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

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: any) => Promise<void>;
  organization: Organization | null;
}

interface EditOrganizationData {
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
  organizationAdminId: string;
  createNewAdmin: boolean;
  adminData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    dateOfBirth: string;
  };
}

const EditOrganizationModal: React.FC<EditOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  organization
}) => {
  const [formData, setFormData] = useState<EditOrganizationData>({
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
    isActive: false,
    organizationAdminId: '',
    createNewAdmin: false,
    adminData: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      dateOfBirth: '',
    },
  });

  const [errors, setErrors] = useState<Partial<EditOrganizationData>>({});
  const [availableAdmins, setAvailableAdmins] = useState<SystemUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when organization changes
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        address: organization.address || '',
        city: organization.city || '',
        state: organization.state || '',
        country: organization.country || '',
        postalCode: organization.postalCode || '',
        phone: organization.phone || '',
        email: organization.email || '',
        website: organization.website || '',
        tags: organization.tags || [],
        isActive: organization.isActive || false,
        organizationAdminId: organization.organizationAdminId || '',
        createNewAdmin: false,
        adminData: {
          firstName: organization.organizationAdmin?.firstName || '',
          lastName: organization.organizationAdmin?.lastName || '',
          email: organization.organizationAdmin?.email || '',
          password: '',
          phone: organization.organizationAdmin?.phone || '',
          address: organization.organizationAdmin?.address || '',
          dateOfBirth: organization.organizationAdmin?.dateOfBirth || '',
        },
      });
    }
  }, [organization]);

  // Fetch available admins when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableAdmins();
    }
  }, [isOpen]);

  // Auto-generate password when createNewAdmin is true
  useEffect(() => {
    if (formData.createNewAdmin && !formData.adminData.password) {
      setFormData(prev => ({
        ...prev,
        adminData: {
          ...prev.adminData,
          password: generatePassword()
        }
      }));
    }
  }, [formData.createNewAdmin]);

  const fetchAvailableAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const response = await systemService.getSystemUsers({
        role: 'organization_admin',
        isActive: true,
        limit: 100
      });
      setAvailableAdmins(response.users || []);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setAvailableAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleRegeneratePassword = () => {
    setFormData(prev => ({
      ...prev,
      adminData: {
        ...prev.adminData,
        password: generatePassword()
      }
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('adminData.')) {
      const fieldName = name.split('.')[1] as keyof EditOrganizationData['adminData'];
      setFormData(prev => ({
        ...prev,
        adminData: {
          ...prev.adminData,
          [fieldName]: value
        }
      }));
    } else if (name === 'tags') {
      const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setFormData(prev => ({ ...prev, [name]: tagsArray }));
    } else if (name === 'isActive' || name === 'createNewAdmin') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof EditOrganizationData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EditOrganizationData> = {};

    // Basic organization validation
    if (!formData.name.trim()) newErrors.name = 'Organization name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    // Website validation (optional but must be valid URL if provided)
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (starting with http:// or https://)';
    }

    // Admin validation if creating new admin
    if (formData.isActive && formData.createNewAdmin) {
      if (!formData.adminData.firstName.trim()) newErrors.adminData = { ...newErrors.adminData, firstName: 'First name is required' };
      if (!formData.adminData.lastName.trim()) newErrors.adminData = { ...newErrors.adminData, lastName: 'Last name is required' };
      if (!formData.adminData.email.trim()) newErrors.adminData = { ...newErrors.adminData, email: 'Email is required' };
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminData.email)) {
        newErrors.adminData = { ...newErrors.adminData, email: 'Please enter a valid email address' };
      }
      if (!formData.adminData.password.trim()) newErrors.adminData = { ...newErrors.adminData, password: 'Password is required' };
      else if (formData.adminData.password.length !== 10) {
        newErrors.adminData = { ...newErrors.adminData, password: 'Password must be exactly 10 characters' };
      }
      if (!formData.adminData.phone.trim()) newErrors.adminData = { ...newErrors.adminData, phone: 'Phone number is required' };
    } else if (formData.isActive && !formData.createNewAdmin) {
      if (!formData.organizationAdminId) {
        newErrors.organizationAdminId = 'Please select an organization admin';
      }
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
      // If creating new admin, handle sequential updates
      if (formData.isActive && formData.createNewAdmin && formData.adminData) {
        // First update the organization
        const organizationData = {
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
          isActive: false, // Update as inactive first
        };

        // Update organization
        await organizationService.updateOrganization(organization._id, organizationData);
        
        // Then create the organization admin
        const adminData = {
          firstName: formData.adminData.firstName,
          lastName: formData.adminData.lastName,
          email: formData.adminData.email,
          password: formData.adminData.password,
          phone: formData.adminData.phone,
          address: formData.adminData.address,
          dateOfBirth: formData.adminData.dateOfBirth,
          organizationId: organization._id,
          role: 'organization_admin',
        };

        // Create organization admin
        await authService.createOrganizationAdmin(adminData);
        
        // Finally, update organization to active
        await organizationService.updateOrganization(organization._id, { isActive: true });
      } else {
        // Regular organization update
        const organizationData = {
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
          isActive: formData.isActive,
          organizationAdminId: formData.organizationAdminId,
        };

        await onSubmit(organization._id, organizationData);
      }
      
      handleClose();
    } catch (error) {
      console.error('Failed to update organization:', error);
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
      isActive: false,
      organizationAdminId: '',
      createNewAdmin: false,
      adminData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        dateOfBirth: '',
      },
    });
    setErrors({});
    setShowPassword(false);
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
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/20 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Organization</h2>
                <p className="text-indigo-100 text-sm">Update organization details and settings</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[calc(95vh-120px)] overflow-y-auto">
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
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    placeholder="Enter organization name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.website ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    placeholder="https://example.com"
                  />
                </div>
                {errors.website && <p className="text-red-500 text-sm">{errors.website}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300"
                placeholder="Enter organization description"
              />
            </div>
          </div>

          {/* Address Section */}
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
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    placeholder="Enter street address"
                  />
                </div>
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                  }`}
                  placeholder="Enter state"
                />
                {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.country ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                  }`}
                  placeholder="Enter country"
                />
                {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                  }`}
                  placeholder="Enter postal code"
                />
                {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
              </div>
            </div>
          </div>

          {/* Tags Section */}
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
                value={formData.tags.join(', ')}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300"
                placeholder="Enter tags separated by commas (e.g., dental, healthcare, premium)"
              />
              <p className="text-sm text-gray-500">Separate multiple tags with commas</p>
            </div>
          </div>

          {/* Organization Admin Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-green-600" />
                <span>Organization Admin</span>
              </h3>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Organization is active
              </label>
              {formData.isActive && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              )}
            </div>

            {formData.isActive && (
              <div className="space-y-4">
                {/* Admin Selection Options */}
                <div className="space-y-4">
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="adminOption"
                        checked={!formData.createNewAdmin}
                        onChange={() => setFormData(prev => ({ ...prev, createNewAdmin: false }))}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Select existing admin</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="adminOption"
                        checked={formData.createNewAdmin}
                        onChange={() => setFormData(prev => ({ ...prev, createNewAdmin: true }))}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Create new admin</span>
                    </label>
                  </div>

                  {/* Existing Admin Selection */}
                  {!formData.createNewAdmin && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Organization Admin <span className="text-red-500">*</span>
                      </label>
                      {loadingAdmins ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Loading admins...</span>
                        </div>
                      ) : availableAdmins.length > 0 ? (
                        <select
                          name="organizationAdminId"
                          value={formData.organizationAdminId}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            errors.organizationAdminId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                          }`}
                        >
                          <option value="">Select an admin</option>
                          {availableAdmins.map((admin) => (
                            <option key={admin._id} value={admin._id}>
                              {admin.firstName} {admin.lastName} ({admin.email})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm text-yellow-800">No available organization admins found</span>
                        </div>
                      )}
                      {errors.organizationAdminId && <p className="text-red-500 text-sm">{errors.organizationAdminId}</p>}
                    </div>
                  )}

                  {/* New Admin Creation Form */}
                  {formData.createNewAdmin && (
                    <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                        <Plus className="w-5 h-5 text-green-600" />
                        <span>Create New Organization Admin</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="adminData.firstName"
                            value={formData.adminData.firstName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                              errors.adminData?.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                            }`}
                            placeholder="Enter first name"
                          />
                          {errors.adminData?.firstName && <p className="text-red-500 text-sm">{errors.adminData.firstName}</p>}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="adminData.lastName"
                            value={formData.adminData.lastName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                              errors.adminData?.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                            }`}
                            placeholder="Enter last name"
                          />
                          {errors.adminData?.lastName && <p className="text-red-500 text-sm">{errors.adminData.lastName}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="adminData.email"
                            value={formData.adminData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                              errors.adminData?.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                            }`}
                            placeholder="Enter email address"
                          />
                          {errors.adminData?.email && <p className="text-red-500 text-sm">{errors.adminData.email}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="adminData.phone"
                            value={formData.adminData.phone}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                              errors.adminData?.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                            }`}
                            placeholder="Enter phone number"
                          />
                          {errors.adminData?.phone && <p className="text-red-500 text-sm">{errors.adminData.phone}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="adminData.password"
                              value={formData.adminData.password}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 pr-20 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                                errors.adminData?.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300'
                              }`}
                              placeholder="Auto-generated password"
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                              <button
                                type="button"
                                onClick={handleRegeneratePassword}
                                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                                title="Regenerate password"
                              >
                                <RefreshCw className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                                title={showPassword ? 'Hide password' : 'Show password'}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">10-character alphanumeric password (auto-generated)</p>
                          {errors.adminData?.password && <p className="text-red-500 text-sm">{errors.adminData.password}</p>}
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <input
                            type="text"
                            name="adminData.address"
                            value={formData.adminData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300"
                            placeholder="Enter address"
                          />
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                          <input
                            type="date"
                            name="adminData.dateOfBirth"
                            value={formData.adminData.dateOfBirth}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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

export default EditOrganizationModal;

