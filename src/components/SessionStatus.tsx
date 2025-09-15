import React, { useState } from 'react';
import { useSessionManager } from '../lib/hooks/useSessionManager';
import DeviceManagement from './DeviceManagement';

interface SessionStatusProps {
  className?: string;
}

export const SessionStatus: React.FC<SessionStatusProps> = ({ className = '' }) => {
  const { sessionData, isSessionExpiring, getSessionStats } = useSessionManager();
  const [showDeviceManagement, setShowDeviceManagement] = useState(false);
  const [showStats, setShowStats] = useState(false);

  if (!sessionData) {
    return null;
  }

  const stats = getSessionStats();
  const timeUntilExpiry = Math.floor(stats.timeUntilExpiry / (1000 * 60)); // minutes
  const timeSinceLastActivity = Math.floor(stats.timeSinceLastActivity / (1000 * 60)); // minutes

  const getStatusColor = () => {
    if (isSessionExpiring) return 'text-red-600';
    if (timeUntilExpiry < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusText = () => {
    if (isSessionExpiring) return 'Expiring Soon';
    if (timeUntilExpiry < 10) return 'Expires Soon';
    return 'Active';
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isSessionExpiring ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className={`text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-xs text-gray-500 hover:text-gray-700"
              title="Session Details"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowDeviceManagement(true)}
              className="text-xs text-gray-500 hover:text-gray-700"
              title="Device Management"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {showStats && (
          <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-64">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm">Session Details</h4>
              
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span className="font-medium">{stats.deviceInfo?.deviceName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Time until expiry:</span>
                  <span className="font-medium">
                    {timeUntilExpiry > 0 ? `${timeUntilExpiry}m` : 'Expired'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Last activity:</span>
                  <span className="font-medium">
                    {timeSinceLastActivity > 0 ? `${timeSinceLastActivity}m ago` : 'Just now'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Remember me:</span>
                  <span className="font-medium">
                    {stats.deviceInfo?.isRememberMe ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setShowStats(false)}
                className="w-full mt-2 px-3 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {showDeviceManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <DeviceManagement onClose={() => setShowDeviceManagement(false)} />
        </div>
      )}
    </>
  );
};

export default SessionStatus;
