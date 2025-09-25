import { toast } from 'sonner';
import { AxiosError } from 'axios';

export interface ErrorResponse {
  message: string;
  details?: string;
  statusCode?: number;
  error?: string;
}

export interface ApiError {
  response?: {
    data?: ErrorResponse;
    status?: number;
  };
  message?: string;
  code?: string;
}

/**
 * Extracts error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error as ApiError;
    
    // Check for API response error
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    
    // Check for validation errors
    if (apiError.response?.data?.details) {
      return apiError.response.data.details;
    }
    
    // Check for HTTP status errors
    if (apiError.response?.status) {
      switch (apiError.response.status) {
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 401:
          return 'You are not authorized to perform this action. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'This action conflicts with existing data. Please check and try again.';
        case 422:
          return 'Invalid data provided. Please check your input and try again.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'Server error occurred. Please try again later.';
        case 502:
          return 'Service temporarily unavailable. Please try again later.';
        case 503:
          return 'Service is currently unavailable. Please try again later.';
        default:
          return `Request failed with status ${apiError.response.status}`;
      }
    }
    
    // Check for network errors
    if (apiError.code === 'NETWORK_ERROR' || apiError.code === 'ERR_NETWORK') {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // Check for timeout errors
    if (apiError.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    
    // Fallback to error message
    return apiError.message || 'An unexpected error occurred.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Gets detailed error information for debugging
 */
export const getErrorDetails = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error as ApiError;
    return apiError.response?.data?.details || apiError.response?.data?.error || '';
  }
  
  if (error instanceof Error) {
    return error.stack || '';
  }
  
  return '';
};

/**
 * Determines the appropriate toast type based on error
 */
export const getToastType = (error: unknown): 'error' | 'warning' | 'info' => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    
    if (status === 401 || status === 403) {
      return 'warning';
    }
    
    if (status === 429 || status === 503) {
      return 'info';
    }
  }
  
  return 'error';
};

/**
 * Shows error toast with appropriate styling and duration
 */
export const showErrorToast = (error: unknown, customMessage?: string) => {
  const message = customMessage || getErrorMessage(error);
  const details = getErrorDetails(error);
  const type = getToastType(error);
  
  const toastOptions = {
    duration: type === 'error' ? 8000 : 5000,
  };
  
  const fullMessage = details ? `${message}\n\nDetails: ${details}` : message;
  
  switch (type) {
    case 'warning':
      toast.warning(fullMessage, toastOptions);
      break;
    case 'info':
      toast.info(fullMessage, toastOptions);
      break;
    default:
      toast.error(fullMessage, toastOptions);
  }
};

/**
 * Shows success toast
 */
export const showSuccessToast = (message: string, description?: string) => {
  const fullMessage = description ? `${message}\n\n${description}` : message;
  toast.success(fullMessage, {
    duration: 4000,
  });
};

/**
 * Shows warning toast
 */
export const showWarningToast = (message: string, description?: string) => {
  const fullMessage = description ? `${message}\n\n${description}` : message;
  toast.warning(fullMessage, {
    duration: 5000,
  });
};

/**
 * Shows info toast
 */
export const showInfoToast = (message: string, description?: string) => {
  const fullMessage = description ? `${message}\n\n${description}` : message;
  toast.info(fullMessage, {
    duration: 4000,
  });
};

/**
 * Shows loading toast
 */
export const showLoadingToast = (message: string) => {
  // Sonner doesn't have a loading method, so we'll use info instead
  return toast.info(message, { duration: Infinity });
};

/**
 * Updates a loading toast
 */
export const updateLoadingToast = (toastId: string, message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  // Sonner doesn't have dismiss method, so we'll just show a new toast
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warning(message);
      break;
  }
};

/**
 * Handles API errors with consistent error handling
 */
export const handleApiError = (error: unknown, context?: string): void => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
  showErrorToast(error, context ? `Failed to ${context}` : undefined);
};

/**
 * Handles form validation errors
 */
export const handleValidationError = (errors: Record<string, string>): void => {
  const firstError = Object.values(errors)[0];
  if (firstError) {
    toast.error(`Please fix the following errors:\n\n${firstError}`, {
      duration: 6000,
    });
  }
};

/**
 * Handles network errors specifically
 */
export const handleNetworkError = (): void => {
  toast.error('Network Error\n\nPlease check your internet connection and try again.', {
    duration: 8000,
  });
};

/**
 * Handles authentication errors
 */
export const handleAuthError = (): void => {
  toast.warning('Authentication Required\n\nPlease log in again to continue.', {
    duration: 6000,
  });
};

/**
 * Handles permission errors
 */
export const handlePermissionError = (): void => {
  toast.warning('Permission Denied\n\nYou do not have permission to perform this action.', {
    duration: 6000,
  });
};
