import React, { useState } from 'react';
import { X, RefreshCw, MapPin, CheckCircle } from 'lucide-react';
import { LoadingButton } from '../Loader';
import type { Branch } from '../../lib/api/services/branches';

interface RestoreBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  branch: Branch | null;
  isLoading?: boolean;
}

const RestoreBranchModal: React.FC<RestoreBranchModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  branch,
  isLoading = false
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for restoration');
      return;
    }

    try {
      await onConfirm(reason.trim());
      setReason('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to restore branch');
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Restore Branch</h2>
                <p className="text-white/80 text-sm">Restore deleted branch</p>
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

        {/* Content */}
        <div className="p-6">
          {/* Branch Info */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                <p className="text-sm text-gray-600">{branch.city}, {branch.state}</p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Restoration Process</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Restoring this branch will:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Reactivate the branch and make it visible</li>
                  <li>• Restore all associated staff and admin accounts</li>
                  <li>• Restore patient records and appointments</li>
                  <li>• Restore all branch-specific settings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for restoration *
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Please provide a reason for restoring this branch..."
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                loading={isLoading}
                loadingText="Restoring..."
                variant="success"
                size="md"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Restore Branch</span>
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestoreBranchModal;
