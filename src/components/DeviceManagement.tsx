import React, { useState, useEffect } from 'react';
import { useSessionManager } from '../lib/hooks/useSessionManager';

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  lastUsedAt: string;
  isCurrentDevice: boolean;
  isRememberMe: boolean;
  usageCount: number;
  maxUsageCount: number;
}

interface DeviceManagementProps {
  onClose?: () => void;
}

export const DeviceManagement: React.FC<DeviceManagementProps> = ({ onClose }) => {
  const { sessionData, logoutAllDevices } = useSessionManager();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would be an API call to get user's active devices
      // For now, we'll simulate with current session data
      if (sessionData) {
        const currentDevice: DeviceInfo = {
          deviceId: sessionData.deviceId,
          deviceName: sessionData.deviceName,
          lastUsedAt: new Date().toISOString(),
          isCurrentDevice: true,
          isRememberMe: sessionData.isRememberMe,
          usageCount: 0,
          maxUsageCount: 100,
        };
        setDevices([currentDevice]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutDevice = async (deviceId: string) => {
    try {
      // This would be an API call to logout specific device
      // For now, we'll just remove it from the list
      setDevices(devices.filter(device => device.deviceId !== deviceId));
    } catch (err: any) {
      setError(err.message || 'Failed to logout device');
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await logoutAllDevices();
      setDevices([]);
      onClose?.();
    } catch (err: any) {
      setError(err.message || 'Failed to logout all devices');
    }
  };

  const formatLastUsed = (lastUsedAt: string) => {
    const date = new Date(lastUsedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.toLowerCase().includes('mobile')) {
      return '📱';
    } else if (deviceName.toLowerCase().includes('tablet')) {
      return '📱';
    } else if (deviceName.toLowerCase().includes('mac')) {
      return '💻';
    } else if (deviceName.toLowerCase().includes('windows')) {
      return '🖥️';
    } else if (deviceName.toLowerCase().includes('linux')) {
      return '🖥️';
    } else {
      return '💻';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Device Management
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {devices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No active devices found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.deviceId}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  device.isCurrentDevice
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getDeviceIcon(device.deviceName)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {device.deviceName}
                      </h4>
                      {device.isCurrentDevice && (
                        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                          Current
                        </span>
                      )}
                      {device.isRememberMe && (
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          Remember Me
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Last used: {formatLastUsed(device.lastUsedAt)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Usage: {device.usageCount}/{device.maxUsageCount}
                    </p>
                  </div>
                </div>

                {!device.isCurrentDevice && (
                  <button
                    onClick={() => handleLogoutDevice(device.deviceId)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  >
                    Logout
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {devices.length > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogoutAllDevices}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout All Other Devices
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceManagement;
