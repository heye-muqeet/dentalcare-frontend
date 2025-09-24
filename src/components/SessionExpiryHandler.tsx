import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../lib/store/store';
import { handleSessionExpired } from '../lib/store/slices/authSlice';

interface SessionExpiryHandlerProps {
  children: React.ReactNode;
}

export const SessionExpiryHandler: React.FC<SessionExpiryHandlerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpiredEvent = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Session expired event received:', customEvent.detail);
      
      // Dispatch the session expired action to update Redux state
      await dispatch(handleSessionExpired(customEvent.detail?.reason || 'session_expired'));
      
      // Redirect to login page
      navigate('/login', { replace: true });
    };

    // Listen for session expiry events from axios interceptor
    window.addEventListener('auth:session-expired', handleSessionExpiredEvent);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpiredEvent);
    };
  }, [dispatch, navigate]);

  return <>{children}</>;
};

export default SessionExpiryHandler;
