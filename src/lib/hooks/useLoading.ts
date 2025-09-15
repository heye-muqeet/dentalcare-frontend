import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
}

export interface UseLoadingOptions {
  initialLoading?: boolean;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  timeout?: number;
}

export const useLoading = (options: UseLoadingOptions = {}) => {
  const {
    initialLoading = false,
    onError,
    onSuccess,
    timeout
  } = options;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    progress: undefined,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((isLoading: boolean, error: string | null = null, progress?: number) => {
    setLoadingState({
      isLoading,
      error,
      progress,
    });

    if (isLoading && timeout) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Operation timed out',
        }));
        onError?.('Operation timed out');
      }, timeout);
    } else if (!isLoading) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [timeout, onError]);

  const startLoading = useCallback((progress?: number) => {
    setLoading(true, null, progress);
  }, [setLoading]);

  const stopLoading = useCallback((error?: string) => {
    if (error) {
      setLoading(false, error);
      onError?.(error);
    } else {
      setLoading(false, null);
      onSuccess?.();
    }
  }, [setLoading, onError, onSuccess]);

  const setError = useCallback((error: string) => {
    setLoading(false, error);
    onError?.(error);
  }, [setLoading, onError]);

  const setProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress,
    }));
  }, []);

  const clearError = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setLoadingState({
      isLoading: false,
      error: null,
      progress: undefined,
    });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    setError,
    setProgress,
    clearError,
    reset,
  };
};

// Hook for async operations with loading state
export const useAsyncLoading = <T = any>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseLoadingOptions = {}
) => {
  const loading = useLoading(options);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      loading.startLoading();
      const result = await asyncFn(...args);
      loading.stopLoading();
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred';
      loading.stopLoading(errorMessage);
      return null;
    }
  }, [asyncFn, loading]);

  return {
    ...loading,
    execute,
  };
};

// Hook for multiple loading states
export const useMultipleLoading = (keys: string[]) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>(
    keys.reduce((acc, key) => ({
      ...acc,
      [key]: { isLoading: false, error: null }
    }), {})
  );

  const setLoading = useCallback((key: string, isLoading: boolean, error: string | null = null, progress?: number) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { isLoading, error, progress }
    }));
  }, []);

  const startLoading = useCallback((key: string, progress?: number) => {
    setLoading(key, true, null, progress);
  }, [setLoading]);

  const stopLoading = useCallback((key: string, error?: string) => {
    setLoading(key, false, error);
  }, [setLoading]);

  const setError = useCallback((key: string, error: string) => {
    setLoading(key, false, error);
  }, [setLoading]);

  const clearError = useCallback((key: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { ...prev[key], error: null }
    }));
  }, []);

  const reset = useCallback((key?: string) => {
    if (key) {
      setLoading(key, false, null);
    } else {
      setLoadingStates(
        keys.reduce((acc, k) => ({
          ...acc,
          [k]: { isLoading: false, error: null }
        }), {})
      );
    }
  }, [keys, setLoading]);

  const isAnyLoading = Object.values(loadingStates).some(state => state.isLoading);
  const hasAnyError = Object.values(loadingStates).some(state => state.error);

  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    setError,
    clearError,
    reset,
    isAnyLoading,
    hasAnyError,
  };
};

export default useLoading;
