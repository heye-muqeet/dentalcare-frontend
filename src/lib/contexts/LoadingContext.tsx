import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface GlobalLoadingState {
  isLoading: boolean;
  loadingText: string | null;
  progress: number | null;
  error: string | null;
}

interface LoadingContextType {
  globalLoading: GlobalLoadingState;
  setGlobalLoading: (loading: Partial<GlobalLoadingState>) => void;
  startGlobalLoading: (text?: string) => void;
  stopGlobalLoading: (error?: string) => void;
  setGlobalProgress: (progress: number) => void;
  setGlobalError: (error: string) => void;
  clearGlobalError: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [globalLoading, setGlobalLoadingState] = useState<GlobalLoadingState>({
    isLoading: false,
    loadingText: null,
    progress: null,
    error: null,
  });

  const setGlobalLoading = useCallback((loading: Partial<GlobalLoadingState>) => {
    setGlobalLoadingState(prev => ({
      ...prev,
      ...loading,
    }));
  }, []);

  const startGlobalLoading = useCallback((text?: string) => {
    setGlobalLoadingState({
      isLoading: true,
      loadingText: text || 'Loading...',
      progress: null,
      error: null,
    });
  }, []);

  const stopGlobalLoading = useCallback((error?: string) => {
    setGlobalLoadingState(prev => ({
      ...prev,
      isLoading: false,
      loadingText: null,
      progress: null,
      error: error || null,
    }));
  }, []);

  const setGlobalProgress = useCallback((progress: number) => {
    setGlobalLoadingState(prev => ({
      ...prev,
      progress,
    }));
  }, []);

  const setGlobalError = useCallback((error: string) => {
    setGlobalLoadingState(prev => ({
      ...prev,
      isLoading: false,
      loadingText: null,
      progress: null,
      error,
    }));
  }, []);

  const clearGlobalError = useCallback(() => {
    setGlobalLoadingState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const value: LoadingContextType = {
    globalLoading,
    setGlobalLoading,
    startGlobalLoading,
    stopGlobalLoading,
    setGlobalProgress,
    setGlobalError,
    clearGlobalError,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingContext;
