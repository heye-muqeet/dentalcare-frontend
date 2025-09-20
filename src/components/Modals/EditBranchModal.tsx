import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Tag, Plus, CheckCircle, User, RefreshCw, Eye, EyeOff, Save, Trash2, Edit2 } from 'lucide-react';
import { LoadingButton } from '../Loader';
import { branchService } from '../../lib/api/services/branches';
import type { Branch, UpdateBranchData } from '../../lib/api/services/branches';

interface AdminFormData {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  employeeId?: string;
  isActive: boolean;
}

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  onSuccess: () => void;
}

interface FormErrors {
  [key: string]: string;
}

export const EditBranchModal: React.FC<EditBranchModalProps> = ({
  isOpen,
  onClose,
  branch,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UpdateBranchData>({
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
    isActive: true,
  });

  const [existingAdmins, setExistingAdmins] = useState<AdminFormData[]>([]);
  const [newAdminForm, setNewAdminForm] = useState<AdminFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    employeeId: '',
    isActive: true
  });
  const [showNewAdminForm, setShowNewAdminForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminFormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Generate initial password when adding new admin
  useEffect(() => {
    if (showNewAdminForm && !editingAdmin && !newAdminForm.password) {
      const initialPassword = generatePassword();
      setNewAdminForm(prev => ({
        ...prev,
        password: initialPassword
      }));
    }
  }, [showNewAdminForm, editingAdmin]);

  // Populate form when branch changes
  useEffect(() => {
    if (isOpen && branch) {
      console.log('EditBranchModal - Populating form with branch data:', {
        branchId: branch._id,
        branchName: branch.name,
        branchAdmins: branch.branchAdmins,
        adminCount: branch.branchAdmins?.length || 0
      });

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
        isActive: branch.isActive,
      });
      
      const admins = branch.branchAdmins || [];
      console.log('Setting existing admins:', admins);
      setExistingAdmins(admins);
      
      setErrors({});
      setShowNewAdminForm(false);
      setEditingAdmin(null);
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
    
    console.log('🚀 Form submission started');
    console.log('Form validation result:', validateForm());
    console.log('Branch exists:', !!branch);
    
    if (!validateForm() || !branch) {
      console.error('❌ Form validation failed or no branch');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        ...formData,
        branchAdmins: existingAdmins
      };

      console.log('📤 Sending update data:', {
        branchId: branch._id,
        updateData,
        adminCount: existingAdmins.length
      });

      const response = await branchService.updateBranch(branch._id, updateData);
      
      console.log('📥 Update response:', response);

      if (response.success) {
        console.log('✅ Branch updated successfully');
        handleClose();
        onSuccess();
      } else {
        console.error('❌ Update failed:', response.message);
        setErrors({ 
          submit: response.message || 'Failed to update branch'
        });
      }
    } catch (error: any) {
      console.error('💥 Update error:', error);
      
      let errorMessage = 'Failed to update branch. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        console.error('Server error details:', error.response.data);
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
      isActive: true,
    });
    setExistingAdmins([]);
    setNewAdminForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      isActive: true
    });
    setErrors({});
    setShowNewAdminForm(false);
    setEditingAdmin(null);
    onClose();
  };

  const handleInputChange = (field: keyof UpdateBranchData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegeneratePassword = () => {
    const newPassword = generatePassword();
    setNewAdminForm(prev => ({
      ...prev,
      password: newPassword
    }));
    // Clear password error if any
    if (errors.adminPassword) {
      setErrors(prev => ({ ...prev, adminPassword: '' }));
    }
  };

  const validateAdminForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!newAdminForm.firstName?.trim()) {
      newErrors.adminFirstName = 'First name is required';
    }
    if (!newAdminForm.lastName?.trim()) {
      newErrors.adminLastName = 'Last name is required';
    }
    if (!newAdminForm.email?.trim()) {
      newErrors.adminEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminForm.email)) {
      newErrors.adminEmail = 'Please enter a valid email address';
    }
    if (!editingAdmin && !newAdminForm.password?.trim()) {
      newErrors.adminPassword = 'Password is required';
    } else if (!editingAdmin && newAdminForm.password && newAdminForm.password.length !== 10) {
      newErrors.adminPassword = 'Password must be exactly 10 characters';
    }
    if (!newAdminForm.phone?.trim()) {
      newErrors.adminPhone = 'Phone number is required';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAdmin = () => {
    if (!validateAdminForm()) {
      return;
    }

    if (existingAdmins.some(admin => admin.email === newAdminForm.email)) {
      setErrors(prev => ({ ...prev, adminEmail: 'An admin with this email already exists' }));
      return;
    }

    setExistingAdmins(prev => [...prev, { ...newAdminForm }]);
    setNewAdminForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      employeeId: '',
      isActive: true
    });
    setShowNewAdminForm(false);
    setErrors({});
  };

  const handleRemoveAdmin = (adminToRemove: AdminFormData) => {
    setExistingAdmins(prev => 
      prev.filter(admin => admin.email !== adminToRemove.email)
    );
  };

  const handleEditAdmin = (admin: AdminFormData) => {
    console.log('Editing admin:', admin);
    setEditingAdmin(admin);
    setShowNewAdminForm(true);
    // Don't include password when editing existing admin
    setNewAdminForm({
      ...admin,
      password: '' // Don't show existing password
    });
  };

  const handleSaveEditedAdmin = () => {
    if (!editingAdmin) return;

    if (!validateAdminForm()) {
      return;
    }

    setExistingAdmins(prev => 
      prev.map(admin => 
        admin.email === editingAdmin.email ? {
          ...newAdminForm,
          _id: admin._id // Preserve the ID for existing admins
        } : admin
      )
    );
    setEditingAdmin(null);
    setShowNewAdminForm(false);
    setNewAdminForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      employeeId: '',
      isActive: true
    });
    setErrors({});
  };

  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Edit2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Edit Branch</h2>
                <p className="text-white/80 text-sm">Update branch information and administrators</p>
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
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
                <Building2 className="w-4 h-4 text-blue-600" />
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

            {/* Branch Status */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Branch Status</h3>
              </div>

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

            {/* Branch Administrators */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Branch Administrators</h3>
              </div>

              {/* Existing Admins */}
              {existingAdmins.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Current Administrators</h4>
                  {existingAdmins.map((admin, index) => (
                    <div 
                      key={admin.email || index} 
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{admin.email}</p>
                          {admin.phone && (
                            <p className="text-xs text-gray-500">{admin.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleEditAdmin(admin)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit admin"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdmin(admin)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove admin"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Admin Button */}
              {!showNewAdminForm && !editingAdmin && (
                <button
                  type="button"
                  onClick={() => setShowNewAdminForm(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add New Administrator</span>
                </button>
              )}

              {/* New/Edit Admin Form */}
              {showNewAdminForm && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-blue-100 rounded-full">
                      <CheckCircle className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-blue-800 text-sm font-medium">
                      {editingAdmin ? 'Updating administrator details' : 'Creating new branch administrator'}
                    </span>
                  </div>
                </div>
              )}

              {showNewAdminForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <h4 className="text-sm font-semibold text-gray-800">
                        {editingAdmin ? 'Edit Administrator' : 'Admin Details'}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewAdminForm(false);
                        setEditingAdmin(null);
                        setNewAdminForm({
                          firstName: '',
                          lastName: '',
                          email: '',
                          password: '',
                          phone: '',
                          address: '',
                          dateOfBirth: '',
                          employeeId: '',
                          isActive: true
                        });
                        setErrors({});
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Essential Fields */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">First Name *</label>
                      <input
                        type="text"
                        value={newAdminForm.firstName}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.adminFirstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter first name"
                      />
                      {errors.adminFirstName && <p className="text-red-500 text-xs mt-1">{errors.adminFirstName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Last Name *</label>
                      <input
                        type="text"
                        value={newAdminForm.lastName}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.adminLastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter last name"
                      />
                      {errors.adminLastName && <p className="text-red-500 text-xs mt-1">{errors.adminLastName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Email Address *</label>
                      <input
                        type="email"
                        value={newAdminForm.email}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.adminEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="admin@example.com"
                      />
                      {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Phone Number *</label>
                      <input
                        type="tel"
                        value={newAdminForm.phone}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, phone: e.target.value }))}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.adminPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.adminPhone && <p className="text-red-500 text-xs mt-1">{errors.adminPhone}</p>}
                    </div>
                  </div>

                  {/* Password Field - only for new admins */}
                  {!editingAdmin && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Password *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newAdminForm.password || ''}
                            onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                            className={`w-full px-3 py-2 pr-16 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.adminPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Auto-generated password"
                          />
                          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex space-x-1">
                            <button
                              type="button"
                              onClick={handleRegeneratePassword}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Regenerate password"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">10-character secure password</div>
                        {errors.adminPassword && <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Employee ID</label>
                        <input
                          type="text"
                          value={newAdminForm.employeeId || ''}
                          onChange={(e) => setNewAdminForm(prev => ({ ...prev, employeeId: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="EMP001 (optional)"
                        />
                      </div>
                    </div>
                  )}

                  {/* Optional Personal Information */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-1 w-8 bg-gray-300 rounded"></div>
                      <span className="text-xs text-gray-500 font-medium">Personal Information (Optional)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
                        <input
                          type="date"
                          value={newAdminForm.dateOfBirth || ''}
                          onChange={(e) => setNewAdminForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Personal Address</label>
                        <input
                          type="text"
                          value={newAdminForm.address || ''}
                          onChange={(e) => setNewAdminForm(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Home address (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewAdminForm(false);
                        setEditingAdmin(null);
                        setNewAdminForm({
                          firstName: '',
                          lastName: '',
                          email: '',
                          password: '',
                          phone: '',
                          address: '',
                          dateOfBirth: '',
                          employeeId: '',
                          isActive: true
                        });
                        setErrors({});
                      }}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={editingAdmin ? handleSaveEditedAdmin : handleAddAdmin}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      {editingAdmin ? 'Save Changes' : 'Add Admin'}
                    </button>
                  </div>
                </div>
              )}
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