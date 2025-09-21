import React, { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiEdit2, FiCamera, FiLock, FiShield, FiUpload, FiX, FiLoader } from 'react-icons/fi';
import InitialAvatar from '../components/Common/InitialAvatar';
import { getInitials } from '../lib/utils/stringUtils';
import { updateProfile, changePassword, type UpdateProfileData } from '../lib/store/slices/profileSlice';
import { updateUserData } from '../lib/store/slices/authSlice';
import { userService } from '../lib/api/services/users';
import type { ChangePasswordData } from '../lib/api/services/users';
import { cloudinaryUploadService } from '../lib/services/cloudinaryUpload';
import toast from 'react-hot-toast';

// Edit Profile Modal Component
const EditProfileModal = ({ isOpen, onClose, user, onSave, isUpdating }: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (data: UpdateProfileData) => void;
  isUpdating?: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    age: user?.age || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    education: user?.education || '',
    licenseNumber: user?.licenseNumber || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert age to number if it's a string
    const processedData = {
      ...formData,
      age: formData.age ? Number(formData.age) : undefined,
      experience: formData.experience ? Number(formData.experience) : undefined,
    };
    onSave(processedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-gray-100 relative animate-fadeIn">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
            <input
              type="number"
              min="0"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
            />
          </div>
          
          {/* Doctor-specific fields */}
          {user?.role !== 'receptionist' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Specialization</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
                >
                  <option value="">Select Specialization</option>
                  <option value="General Dentist">General Dentist</option>
                  <option value="Orthodontist">Orthodontist</option>
                  <option value="Endodontist">Endodontist</option>
                  <option value="Periodontist">Periodontist</option>
                  <option value="Pediatric Dentist">Pediatric Dentist</option>
                  <option value="Oral Surgeon">Oral Surgeon</option>
                  <option value="Prosthodontist">Prosthodontist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Experience (years)</label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Education</label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
                />
              </div>
            </>
                     )}
           
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2 bg-[#0A0F56] text-white rounded-lg font-semibold shadow hover:bg-[#232a7c] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Change Password Modal Component
const ChangePasswordModal = ({ isOpen, onClose, onSave, isChangingPassword }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ChangePasswordData) => void;
  isChangingPassword?: boolean;
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<string[]>([]);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain at least one special character');
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePassword(formData.newPassword);
    
    if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.push('New password and confirm password do not match');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    onSave(formData);
    // Don't close modal here - let the parent component handle it after success
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 relative animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <ul className="text-sm text-red-600 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-5 py-2 bg-[#0A0F56] text-white rounded-lg font-semibold shadow hover:bg-[#232a7c] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Image Upload Modal Component
const ImageUploadModal = ({ isOpen, onClose, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setUploading(true);
      
      // Show immediate feedback
      toast.loading('Uploading image to cloud storage...', { id: 'upload-toast' });
      
      const result = await cloudinaryUploadService.uploadImage(selectedFile, {
        folder: 'profile-images',
        tags: ['profile', 'user-avatar'],
      });

      // Update toast message
      toast.loading('Updating your profile...', { id: 'upload-toast' });
      
      onSave(result.secure_url);
      
      // Success will be handled by the parent component
      toast.dismiss('upload-toast');
      onClose();
      
      // Reset state
      setSelectedFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Failed to upload image', { id: 'upload-toast' });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setImagePreview(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Profile Image</h2>
            <button
              onClick={handleClose}
              disabled={uploading}
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0F56] disabled:opacity-50"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0A0F56] transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Upload your profile image</p>
                  <p className="text-sm text-gray-500 mt-1">Drag and drop or click to browse</p>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {selectedFile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Selected:</strong> {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            Supported formats: JPEG, PNG, WebP (max 10MB)
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 px-4 py-2 bg-[#0A0F56] text-white rounded-lg hover:bg-[#232a7c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <FiLoader className="animate-spin mr-2" size={16} />
                  Uploading...
                </>
              ) : (
                'Upload Image'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { isUpdating, isChangingPassword } = useAppSelector((state: RootState) => state.profile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [optimisticProfileImage, setOptimisticProfileImage] = useState<string | null>(null);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-3xl p-12 shadow-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No User Data Found</h3>
          <p className="text-gray-500">Please log in again to access your profile.</p>
        </div>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'Doctor';
      case 'owner':
        return 'Administrator';
      case 'nurse':
        return 'Nurse';
      case 'receptionist':
        return 'Receptionist';
      default:
        return 'User';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleEditProfile = async (data: UpdateProfileData) => {
    if (!user?.id) return;
    
    try {
      await dispatch(updateProfile({ userId: user.id, profileData: data })).unwrap();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error as string || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    try {
      await dispatch(changePassword(data)).unwrap();
      toast.success('Password changed successfully!');
      setIsPasswordModalOpen(false);
    } catch (error) {
      toast.error(error as string || 'Failed to change password');
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 Updating profile with image URL:', imageUrl);
      console.log('👤 User ID:', user.id);
      
      // Optimistically update the UI immediately
      setOptimisticProfileImage(imageUrl);
      setIsUpdatingImage(true);
      
      // Call API directly to avoid global loading state
      const result = await userService.updateUser(user.id, { profileImage: imageUrl });
      
      console.log('✅ Profile update result:', result);
      
      // Update the user data in Redux without triggering loading state
      dispatch(updateUserData({ profileImage: imageUrl }));
      
      // Clear optimistic state since real data is now loaded
      setOptimisticProfileImage(null);
      setIsUpdatingImage(false);
      
      toast.success('Profile image updated successfully! 🎉');
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      
      // Revert optimistic update on error
      setOptimisticProfileImage(null);
      setIsUpdatingImage(false);
      
      toast.error('Failed to update profile image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                disabled={isUpdating}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0A0F56] text-white rounded-xl hover:bg-[#232a7c] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiEdit2 size={18} />
                <span>{isUpdating ? 'Updating...' : 'Edit Profile'}</span>
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-[#0A0F56] text-[#0A0F56] rounded-xl hover:bg-[#0A0F56] hover:text-white transition-all font-medium"
              >
                <FiLock size={18} />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center">
              {/* Profile Image */}
              <div className="relative mb-6">
                {(optimisticProfileImage || user.profileImage) ? (
                  <div className="relative">
                    <img
                      src={optimisticProfileImage || user.profileImage}
                      alt={user.name}
                      className={`w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg transition-opacity ${
                        isUpdatingImage ? 'opacity-75' : 'opacity-100'
                      }`}
                    />
                    {isUpdatingImage && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-3">
                          <FiLoader className="animate-spin w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto">
                    <InitialAvatar
                      initials={getInitials(user.name || '')}
                      size={32}
                      bgColor="bg-gradient-to-br from-blue-500 to-purple-600"
                      textColor="text-white"
                      className="text-4xl font-bold shadow-lg border-4 border-white"
                    />
                  </div>
                )}
                <button
                  className="absolute bottom-2 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-[#0A0F56] text-white p-3 rounded-full shadow-lg hover:bg-[#232a7c] transition-all disabled:opacity-50"
                  onClick={() => setIsImageUploadModalOpen(true)}
                  disabled={isUpdatingImage}
                  type="button"
                >
                  <FiCamera size={16} />
                </button>
              </div>

              {/* Basic Info */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <p className="text-blue-600 font-semibold mb-1">{getRoleDisplayName(user.role)}</p>
              <p className="text-gray-500 mb-6">{user.specialization || 'Healthcare Professional'}</p>
              
              {/* Status Badge */}
              <div className="flex justify-center mb-8">
                <span className={`px-4 py-2 text-sm rounded-full border font-medium ${getStatusColor(user.status || 'active')}`}>
                  {user.status || 'Active'}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                  </span>
                </div>
                {user.experience && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Experience</span>
                    <span className="font-semibold text-gray-900">{user.experience} years</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-3 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <FiUser className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-gray-500">Your basic account details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem icon={<FiMail />} label="Email Address" value={user.email} />
                <InfoItem icon={<FiPhone />} label="Phone Number" value={user.phone || 'Not provided'} />
                {/* <InfoItem icon={<FiCalendar />} label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'} /> */}
                <InfoItem icon={<FiUser />} label="Gender" value={user.gender || 'Not specified'} />
                <InfoItem icon={<FiCalendar />} label="Age" value={user.age ? `${user.age} years` : 'Not specified'} />
                {/* <InfoItem icon={<FiMapPin />} label="Location" value={user.address || 'Not provided'} /> */}
              </div>
            </div>

            {/* Professional Information - Hidden for receptionists */}
            {user.role !== 'receptionist' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                    <FiBriefcase className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Professional Information</h3>
                    <p className="text-gray-500">Your work-related details</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoItem icon={<FiBriefcase />} label="Specialization" value={user.specialization || 'General Practice'} />
                  <InfoItem icon={<FiShield />} label="License Number" value={user.licenseNumber || 'Not provided'} />
                  <InfoItem icon={<FiCalendar />} label="Experience" value={user.experience ? `${user.experience} years` : 'Not specified'} />
                  <InfoItem icon={<FiUser />} label="Education" value={user.education || 'Not provided'} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleEditProfile}
        isUpdating={isUpdating}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handleChangePassword}
        isChangingPassword={isChangingPassword}
      />

      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={() => setIsImageUploadModalOpen(false)}
        onSave={handleImageUpload}
      />
    </div>
  );
};

// Info Item Component
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start space-x-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all">
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-gray-900 font-semibold truncate">{value}</p>
    </div>
  </div>
);

export default UserProfile; 