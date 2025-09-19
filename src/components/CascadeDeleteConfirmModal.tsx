import { useState } from 'react';
import { FiAlertTriangle, FiX, FiTrash2, FiUsers, FiHome, FiUserCheck } from 'react-icons/fi';
import type { Organization } from '../lib/api/services/organizations';

interface CascadeDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  organization: Organization | null;
  isLoading?: boolean;
  estimatedImpact?: {
    branches: number;
    doctors: number;
    patients: number;
    admins: number;
    receptionists: number;
  };
}

export default function CascadeDeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  organization,
  isLoading = false,
  estimatedImpact
}: CascadeDeleteConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [showAdvancedWarning, setShowAdvancedWarning] = useState(false);

  if (!isOpen || !organization) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert('Please provide a reason for deletion');
      return;
    }
    onConfirm(reason);
  };

  const totalAffectedUsers = estimatedImpact ? 
    estimatedImpact.doctors + estimatedImpact.patients + estimatedImpact.admins + estimatedImpact.receptionists : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Confirm Organization Deletion</h2>
              <p className="text-sm text-gray-600">This action will cascade to all related entities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Organization Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">Organization to be deleted:</h3>
            <div className="flex items-center gap-3">
              <FiHome className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">{organization.name}</p>
                <p className="text-sm text-red-700">{organization.city}, {organization.state}</p>
              </div>
            </div>
          </div>

          {/* Impact Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5" />
              Cascade Delete Impact
            </h3>
            <p className="text-sm text-orange-800 mb-4">
              Deleting this organization will automatically soft delete all related entities:
            </p>
            
            {estimatedImpact && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <FiHome className="w-4 h-4 text-orange-600" />
                  <span>{estimatedImpact.branches} Branches</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiUsers className="w-4 h-4 text-orange-600" />
                  <span>{estimatedImpact.doctors} Doctors</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiUsers className="w-4 h-4 text-orange-600" />
                  <span>{estimatedImpact.patients} Patients</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiUserCheck className="w-4 h-4 text-orange-600" />
                  <span>{estimatedImpact.admins + estimatedImpact.receptionists} Staff</span>
                </div>
              </div>
            )}

            {totalAffectedUsers > 0 && (
              <div className="bg-orange-100 rounded p-3">
                <p className="text-sm font-medium text-orange-900">
                  Total affected users: <span className="text-lg">{totalAffectedUsers}</span>
                </p>
              </div>
            )}
          </div>

          {/* Advanced Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <button
              onClick={() => setShowAdvancedWarning(!showAdvancedWarning)}
              className="flex items-center gap-2 text-yellow-800 hover:text-yellow-900 font-medium text-sm"
            >
              <FiAlertTriangle className="w-4 h-4" />
              Important Information
            </button>
            
            {showAdvancedWarning && (
              <div className="mt-3 text-sm text-yellow-800 space-y-2">
                <p>• All related users will be immediately deactivated</p>
                <p>• Data will be preserved but marked as deleted</p>
                <p>• This action can be reversed by restoring the organization</p>
                <p>• All appointments and records will become inaccessible</p>
                <p>• Users won't be able to log in until restored</p>
              </div>
            )}
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for deletion <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for this deletion..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 className="w-4 h-4" />
                Confirm Deletion
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
