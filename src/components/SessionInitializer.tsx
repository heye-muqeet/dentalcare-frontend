import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../lib/store/store';
import { initializeAuth } from '../lib/store/slices/authSlice';
// import { useSessionManager } from '../lib/hooks/useSessionManager'; // Not needed since SessionTimeoutWarning is disabled
// import SessionTimeoutWarning from './SessionTimeoutWarning'; // Disabled - using automatic token refresh

interface SessionInitializerProps {
  children: React.ReactNode;
}

export const SessionInitializer: React.FC<SessionInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  // const { isAuthenticated } = useSessionManager(); // Not needed since SessionTimeoutWarning is disabled

  useEffect(() => {
    // Initialize authentication state on app start
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <>
      {children}
      {/* SessionTimeoutWarning disabled - using automatic token refresh via axios interceptor */}
    </>
  );
};

export default SessionInitializer;
