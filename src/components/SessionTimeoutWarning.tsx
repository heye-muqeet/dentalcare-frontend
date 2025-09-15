import React, { useState, useEffect } from 'react';
import { useSessionManager } from '../lib/hooks/useSessionManager';

interface SessionTimeoutWarningProps {
  onExtendSession?: () => void;
  onLogout?: () => void;
  warningThreshold?: number; // minutes before expiry to show warning
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  onExtendSession,
  onLogout,
  warningThreshold = 5, // 5 minutes default
}) => {
  const { sessionData, refreshToken, logout } = useSessionManager();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    if (!sessionData) {
      setShowWarning(false);
      return;
    }

    const checkSessionExpiry = () => {
      const now = Date.now();
      const timeUntilExpiry = sessionData.expiresAt - now;
      const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));

      if (minutesUntilExpiry <= warningThreshold && minutesUntilExpiry > 0) {
        setShowWarning(true);
        setTimeRemaining(minutesUntilExpiry);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSessionExpiry();

    // Check every minute
    const interval = setInterval(checkSessionExpiry, 60000);

    return () => clearInterval(interval);
  }, [sessionData, warningThreshold]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      await refreshToken();
      setShowWarning(false);
      onExtendSession?.();
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowWarning(false);
      onLogout?.();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (!showWarning || !sessionData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Session Timeout Warning
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Your session will expire in{' '}
            <span className="font-semibold text-yellow-600">
              {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}
            </span>
            . Would you like to extend your session?
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Logout
          </button>
          <button
            type="button"
            onClick={handleExtendSession}
            disabled={isExtending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExtending ? 'Extending...' : 'Extend Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
