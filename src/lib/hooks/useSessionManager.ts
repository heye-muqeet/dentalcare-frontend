import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { 
  setSessionData, 
  setSessionExpiring, 
  clearSession,
  refreshToken,
  logoutUser 
} from '../store/slices/authSlice';
import sessionManager from '../services/sessionManager';

export const useSessionManager = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sessionData, isSessionExpiring, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      const session = sessionManager.getSession();
      if (session) {
        dispatch(setSessionData(session));
      }
    };

    initializeSession();
  }, [dispatch]);

  // Set up session change listener
  useEffect(() => {
    const unsubscribe = sessionManager.addListener((session) => {
      dispatch(setSessionData(session));
    });

    return unsubscribe;
  }, [dispatch]);

  // Monitor session expiry
  useEffect(() => {
    const checkSessionExpiry = () => {
      if (sessionData && sessionManager.isSessionExpiringSoon()) {
        dispatch(setSessionExpiring(true));
      } else {
        dispatch(setSessionExpiring(false));
      }
    };

    const interval = setInterval(checkSessionExpiry, 30000); // Check every 30 seconds
    checkSessionExpiry(); // Check immediately

    return () => clearInterval(interval);
  }, [sessionData, dispatch]);

  // Handle session expiry event
  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(clearSession());
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [dispatch]);

  // Manual refresh token
  const handleRefreshToken = useCallback(async () => {
    try {
      await dispatch(refreshToken()).unwrap();
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      dispatch(clearSession());
    }
  }, [dispatch]);

  // Manual logout
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(clearSession());
    }
  }, [dispatch]);

  // Logout from all devices
  const handleLogoutAllDevices = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Logout all devices failed:', error);
      dispatch(clearSession());
    }
  }, [dispatch]);

  // Get session statistics
  const getSessionStats = useCallback(() => {
    return sessionManager.getSessionStats();
  }, []);

  // Update session configuration
  const updateSessionConfig = useCallback((config: any) => {
    sessionManager.updateConfig(config);
  }, []);

  return {
    sessionData,
    isSessionExpiring,
    isAuthenticated,
    refreshToken: handleRefreshToken,
    logout: handleLogout,
    logoutAllDevices: handleLogoutAllDevices,
    getSessionStats,
    updateSessionConfig,
  };
};

export default useSessionManager;
