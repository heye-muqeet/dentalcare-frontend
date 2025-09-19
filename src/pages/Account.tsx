import { useState, useEffect } from 'react';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiEdit2, 
  FiSave, 
  FiX,
  FiKey,
  FiShield,
  FiSettings
} from 'react-icons/fi';

export default function Account() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      // Here you would call an API to update the user profile
      console.log('Saving profile:', formData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error message
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <FiEdit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-1 text-sm transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm transition-colors"
                  >
                    <FiSave className="w-4 h-4" />
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4 inline mr-1" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4 inline mr-1" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4 inline mr-1" />
                  Role
                </label>
                <p className="text-gray-900 py-2 capitalize">{user.role?.replace('_', ' ')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiShield className="w-4 h-4 inline mr-1" />
                  Status
                </label>
                <p className={`py-2 font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details & Actions */}
        <div className="space-y-6">
          {/* Account Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {user.role?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {user.organizationId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Organization</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.organizationId}
                  </span>
                </div>
              )}
              {user.branchId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Branch</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.branchId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Security Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FiKey className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Change Password</div>
                  <div className="text-sm text-gray-500">Update your account password</div>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <FiShield className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-500">Enhance account security</div>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <FiSettings className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">Privacy Settings</div>
                  <div className="text-sm text-gray-500">Manage data and privacy</div>
                </div>
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <FiCalendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Account Created</h4>
                <p className="text-sm text-blue-700">
                  {user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString() 
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowChangePassword(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle password change
                  setShowChangePassword(false);
                }}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
