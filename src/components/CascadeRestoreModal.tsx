import { useState } from 'react';
import { FiRotateCcw, FiX, FiCheck, FiUsers, FiHome, FiUserCheck } from 'react-icons/fi';
import type { Organization } from '../lib/api/services/organizations';

interface CascadeRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  organization: Organization | null;
  isLoading?: boolean;
  estimatedRestoreImpact?: {
    branches: number;
    doctors: number;
    patients: number;
    admins: number;
    receptionists: number;
  };
}

export default function CascadeRestoreModal({
  isOpen,
  onClose,
  onConfirm,
  organization,
  isLoading = false,
  estimatedRestoreImpact
}: CascadeRestoreModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen || !organization) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert('Please provide a reason for restoration');
      return;
    }
    onConfirm(reason);
  };

  const totalRestoreUsers = estimatedRestoreImpact ? 
    estimatedRestoreImpact.doctors + estimatedRestoreImpact.patients + estimatedRestoreImpact.admins + estimatedRestoreImpact.receptionists : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiRotateCcw className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Restore Organization</h2>
              <p className="text-sm text-gray-600">This will restore the organization and related entities</p>
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Organization to be restored:</h3>
            <div className="flex items-center gap-3">
              <FiHome className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{organization.name}</p>
                <p className="text-sm text-green-700">{organization.city}, {organization.state}</p>
                {organization.deletedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Deleted: {new Date(organization.deletedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Restore Impact */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <FiCheck className="w-5 h-5" />
              Cascade Restore Impact
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Restoring this organization will automatically restore all related entities that were cascade deleted:
            </p>
            
            {estimatedRestoreImpact && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <FiHome className="w-4 h-4 text-blue-600" />
                  <span>{estimatedRestoreImpact.branches} Branches</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiUsers className="w-4 h-4 text-blue-600" />
                  <span>{estimatedRestoreImpact.doctors} Doctors</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiUsers className="w-4 h-4 text-blue-600" />
                  <span>{estimatedRestoreImpact.patients} Patients</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiUserCheck className="w-4 h-4 text-blue-600" />
                  <span>{estimatedRestoreImpact.admins + estimatedRestoreImpact.receptionists} Staff</span>
                </div>
              </div>
            )}

            {totalRestoreUsers > 0 && (
              <div className="bg-blue-100 rounded p-3">
                <p className="text-sm font-medium text-blue-900">
                  Total users to be restored: <span className="text-lg">{totalRestoreUsers}</span>
                </p>
              </div>
            )}
          </div>

          {/* Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">What happens when restored:</h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Organization becomes active again</p>
              <p>• All cascade-deleted users will be reactivated</p>
              <p>• Users can log in and access their accounts</p>
              <p>• All data and records become accessible</p>
              <p>• Appointments and schedules are restored</p>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for restoration <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for this restoration..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Restoring...
              </>
            ) : (
              <>
                <FiRotateCcw className="w-4 h-4" />
                Confirm Restoration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
