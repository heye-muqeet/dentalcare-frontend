import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth } from '../lib/store/slices/authSlice';
import { useSessionManager } from '../lib/hooks/useSessionManager';
import SessionTimeoutWarning from './SessionTimeoutWarning';

interface SessionInitializerProps {
  children: React.ReactNode;
}

export const SessionInitializer: React.FC<SessionInitializerProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSessionManager();

  useEffect(() => {
    // Initialize authentication state on app start
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <>
      {children}
      {isAuthenticated && <SessionTimeoutWarning />}
    </>
  );
};

export default SessionInitializer;
