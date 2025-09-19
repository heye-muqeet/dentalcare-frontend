import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { 
  setSessionData, 
  setSessionExpiring, 
  clearSession,
  refreshToken,
  logoutUser,
  handleSessionExpired 
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

  // Monitor session expiry - DISABLED: Using automatic token refresh via axios interceptor
  useEffect(() => {
    // Automatic token refresh handles session expiry, so we don't need to monitor it manually
    // Always set session expiring to false since tokens are refreshed automatically
    dispatch(setSessionExpiring(false));
  }, [sessionData, dispatch]);

  // Handle session expiry event
  useEffect(() => {
    const handleSessionExpiredEvent = (event: CustomEvent) => {
      const reason = event.detail?.reason || 'unknown';
      const error = event.detail?.error || '';
      
      console.log('Session expired event received:', { reason, error });
      
      // Dispatch the session expired action with the reason
      dispatch(handleSessionExpired(reason));
    };

    window.addEventListener('auth:session-expired', handleSessionExpiredEvent as EventListener);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpiredEvent as EventListener);
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
