import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const tokenPair = await sessionManager.refreshAccessToken();
        
        // Process queued requests
        processQueue(null, tokenPair.accessToken);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${tokenPair.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear session and redirect to login
        processQueue(refreshError, null);
        await sessionManager.clearSession();
        
        // Dispatch custom event for auth state change
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
