import sessionManager from '../services/sessionManager';

/**
 * Check if the current session is valid and active
 */
export const isSessionValid = (): boolean => {
  try {
    return sessionManager.isSessionActive();
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};

/**
 * Check if refresh token is still valid (not expired)
 */
export const isRefreshTokenValid = (): boolean => {
  try {
    const session = sessionManager.getSession();
    if (!session?.refreshToken) {
      console.log('No refresh token in session');
      return false;
    }

    const isValid = sessionManager.hasValidRefreshToken();
    console.log('Refresh token validity check:', { 
      isValid, 
      hasToken: !!session.refreshToken,
      tokenPreview: session.refreshToken?.substring(0, 10) + '...'
    });
    return isValid;
  } catch (error) {
    console.error('Error checking refresh token validity:', error);
    return false;
  }
};

/**
 * Get the current access token if session is valid
 */
export const getValidAccessToken = (): string | null => {
  try {
    if (isSessionValid()) {
      return sessionManager.getAccessToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Validate session before making API calls
 * Only throws error if both access token and refresh token are invalid
 */
export const validateSession = (): void => {
  try {
    const sessionValid = isSessionValid();
    const refreshTokenValid = isRefreshTokenValid();
    
    // If access token is valid, we're good
    if (sessionValid) {
      return;
    }
    
    // If access token is expired but refresh token is still valid,
    // let the axios interceptor handle the refresh
    if (!sessionValid && refreshTokenValid) {
      console.log('Access token expired but refresh token is valid - letting axios interceptor handle refresh');
      return;
    }
    
    // Both tokens are invalid - clear session and redirect
    if (!sessionValid && !refreshTokenValid) {
      console.log('Both tokens are invalid - clearing session');
      sessionManager.clearSession();
      window.location.href = '/login';
      throw new Error('No active session');
    }
  } catch (error) {
    console.error('Error validating session:', error);
    // Clear session and redirect on any error
    sessionManager.clearSession();
    window.location.href = '/login';
    throw new Error('Session validation failed');
  }
};
