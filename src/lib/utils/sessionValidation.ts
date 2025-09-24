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
    return sessionManager.hasValidRefreshToken();
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
  
  // Both tokens are invalid
  if (!sessionValid && !refreshTokenValid) {
    throw new Error('No active session');
  }
};
