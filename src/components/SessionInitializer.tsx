import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../lib/store/store';
import { initializeAuth } from '../lib/store/slices/authSlice';
import { initializeReceptionistData } from '../lib/store/slices/receptionistDataSlice';
import sessionManager from '../lib/services/sessionManager';
// import { useSessionManager } from '../lib/hooks/useSessionManager'; // Not needed since SessionTimeoutWarning is disabled
// import SessionTimeoutWarning from './SessionTimeoutWarning'; // Disabled - using automatic token refresh

interface SessionInitializerProps {
  children: React.ReactNode;
}

export const SessionInitializer: React.FC<SessionInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const hasInitializedReceptionistData = useRef(false);
  // const { isAuthenticated } = useSessionManager(); // Not needed since SessionTimeoutWarning is disabled

  useEffect(() => {
    // Initialize authentication state on app start
    dispatch(initializeAuth());
  }, [dispatch]);

  // Check for invalid sessions on app start
  useEffect(() => {
    const checkSessionValidity = async () => {
      try {
        // Check if we have any failed token markers
        const lastRefreshFailure = localStorage.getItem('lastRefreshFailure');
        const lastFailedToken = localStorage.getItem('lastFailedToken');
        const session = sessionManager.getSession();
        
        if (lastRefreshFailure && lastFailedToken && session?.refreshToken === lastFailedToken) {
          console.log('Found failed token marker - clearing session immediately');
          await sessionManager.clearSession();
          return;
        }
        
        // If there's a session but it's invalid, clear it
        if (session && !sessionManager.isSessionActive()) {
          console.log('Invalid session detected - clearing session');
          await sessionManager.clearSession();
        }
      } catch (error) {
        console.error('Error checking session validity:', error);
        // Clear session on any error
        await sessionManager.clearSession();
      }
    };

    checkSessionValidity();
  }, []);

  // Initialize receptionist data when user is available and is a receptionist
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'receptionist' && !hasInitializedReceptionistData.current) {
      console.log('🚀 User is receptionist, initializing data...');
      console.log('🔍 User data for initialization:', {
        user: user,
        hasBranchId: !!user.branchId,
        hasOrganizationId: !!user.organizationId,
        branchIdType: typeof user.branchId,
        organizationIdType: typeof user.organizationId
      });
      
      // Add a longer delay to ensure user data is fully loaded and Redux state is updated
      const timer = setTimeout(() => {
        // Double-check that user is still available before initializing
        if (user && user.role === 'receptionist') {
          hasInitializedReceptionistData.current = true;
          dispatch(initializeReceptionistData());
        } else {
          console.log('⚠️ User data not available during initialization, skipping...');
        }
      }, 500); // Increased delay to 500ms
      
      return () => clearTimeout(timer);
    }
  }, [dispatch, isAuthenticated, user]);

  // Retry mechanism for receptionist data initialization
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'receptionist' && !hasInitializedReceptionistData.current) {
      // If we're authenticated but haven't initialized yet, try again after a longer delay
      const retryTimer = setTimeout(() => {
        if (user && user.role === 'receptionist' && !hasInitializedReceptionistData.current) {
          console.log('🔄 Retrying receptionist data initialization...');
          hasInitializedReceptionistData.current = true;
          dispatch(initializeReceptionistData());
        }
      }, 1000); // Retry after 1 second
      
      return () => clearTimeout(retryTimer);
    }
  }, [dispatch, isAuthenticated, user]);

  return (
    <>
      {children}
      {/* SessionTimeoutWarning disabled - using automatic token refresh via axios interceptor */}
    </>
  );
};

export default SessionInitializer;
