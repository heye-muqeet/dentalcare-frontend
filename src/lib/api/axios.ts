import axios from 'axios';
import sessionManager from '../services/sessionManager';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

// Track the current refresh token being used
let currentRefreshToken: string | null = null;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Skip token refresh for auth endpoints
    if (config.url?.includes('/auth/')) {
      return config;
    }

    // Check if session is expiring soon and refresh proactively
    if (sessionManager.isSessionExpiringSoon() && sessionManager.hasValidRefreshToken()) {
      const refreshToken = sessionManager.getRefreshToken();
      
      // Check if we're already refreshing with this token
      if (isRefreshing && currentRefreshToken === refreshToken) {
        console.log('🔄 Token refresh already in progress with same token, skipping proactive refresh');
      } else {
        console.log('🔄 Session expiring soon - proactively refreshing token');
        console.log('🔄 Current session state:', {
          hasAccessToken: !!sessionManager.getAccessToken(),
          hasRefreshToken: !!sessionManager.getRefreshToken(),
          isSessionActive: sessionManager.isSessionActive(),
          isExpiringSoon: sessionManager.isSessionExpiringSoon(),
          hasValidRefreshToken: sessionManager.hasValidRefreshToken(),
          isRefreshing: isRefreshing,
          currentRefreshToken: currentRefreshToken?.substring(0, 10) + '...'
        });
        
        try {
          currentRefreshToken = refreshToken;
          const tokenPair = await sessionManager.refreshAccessToken();
          console.log('✅ Proactive token refresh successful');
          currentRefreshToken = null;
          if (config.headers) {
            config.headers.Authorization = `Bearer ${tokenPair.accessToken}`;
          }
          return config;
        } catch (error) {
          console.warn('❌ Proactive token refresh failed:', error);
          currentRefreshToken = null;
          // Continue with current token, let response interceptor handle it
        }
      }
    }

    // Get the current access token from session manager
    const token = sessionManager.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized) - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if this is already a refresh token request
      if (originalRequest.url?.includes('/auth/token/refresh')) {
        // Refresh token is invalid/expired, clear session and logout
        console.log('Refresh token request failed - clearing session immediately');
        await sessionManager.clearSession();
        // Redirect to login page immediately
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Check if we have a valid refresh token before attempting refresh
      if (!sessionManager.hasValidRefreshToken()) {
        console.log('No valid refresh token available - clearing session');
        await sessionManager.clearSession();
        // Redirect to login page immediately
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Check if this token has recently failed
      const lastRefreshFailure = localStorage.getItem('lastRefreshFailure');
      const lastFailedToken = localStorage.getItem('lastFailedToken');
      const currentToken = sessionManager.getSession()?.refreshToken;
      
      if (lastRefreshFailure && lastFailedToken && lastFailedToken === currentToken) {
        const failureTime = parseInt(lastRefreshFailure);
        const timeSinceFailure = Date.now() - failureTime;
        
        // If we failed to refresh this token recently, don't try again
        if (timeSinceFailure < 2 * 60 * 1000) {
          console.log('❌ Skipping refresh attempt - token recently failed');
          await sessionManager.clearSession();
          window.location.href = '/login';
          return Promise.reject(error);
        } else {
          // Clear old failure markers if enough time has passed
          localStorage.removeItem('lastRefreshFailure');
          localStorage.removeItem('lastFailedToken');
        }
      }

      if (isRefreshing) {
        // If we're already refreshing, queue this request
        console.log('Token refresh in progress - queuing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } else {
            return Promise.reject(new Error('Token refresh failed'));
          }
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      currentRefreshToken = sessionManager.getRefreshToken();

      try {
        console.log('🔄 Attempting to refresh access token...');
        console.log('🔄 Current session before refresh:', {
          hasAccessToken: !!sessionManager.getAccessToken(),
          hasRefreshToken: !!sessionManager.getRefreshToken(),
          refreshTokenPreview: sessionManager.getRefreshToken()?.substring(0, 10) + '...'
        });
        
        // Try to refresh the token
        const tokenPair = await sessionManager.refreshAccessToken();
        
        console.log('✅ Token refresh successful in response interceptor');
        console.log('🔄 New token pair:', {
          accessTokenLength: tokenPair.accessToken?.length,
          refreshTokenLength: tokenPair.refreshToken?.length,
          refreshTokenPreview: tokenPair.refreshToken?.substring(0, 10) + '...'
        });
        
        // Process queued requests with new token
        processQueue(null, tokenPair.accessToken);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${tokenPair.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - could be because refresh token is expired
        console.warn('Token refresh failed:', refreshError);
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Clear session and notify about expiration
        await sessionManager.clearSession();
        
        // Dispatch custom event for auth state change with reason
        window.dispatchEvent(new CustomEvent('auth:session-expired', { 
          detail: { 
            reason: (refreshError as any)?.response?.status === 401 ? 'refresh_token_expired' : 'refresh_failed',
            error: (refreshError as any)?.message 
          } 
        }));
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        currentRefreshToken = null;
      }
    }

    // Handle other error cases
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error('Access forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
