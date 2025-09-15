import React from 'react';
import { Loader, CardLoader, TableLoader, ListLoader } from './Loader';

interface LoadingWrapperProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loader?: 'spinner' | 'skeleton' | 'table' | 'list' | 'card';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  error,
  children,
  loader = 'spinner',
  size = 'md',
  text,
  className = '',
  fallback,
}) => {
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-red-600 text-center">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-medium mb-2">Something went wrong</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    switch (loader) {
      case 'skeleton':
        return <CardLoader text={text} />;
      case 'table':
        return <TableLoader />;
      case 'list':
        return <ListLoader />;
      case 'card':
        return <CardLoader text={text} />;
      default:
        return (
          <Loader
            variant="spinner"
            size={size}
            text={text}
            className={className}
          />
        );
    }
  }

  return <>{children}</>;
};

// Specialized loading wrappers for common use cases
export const DataTableLoadingWrapper: React.FC<{
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  rows?: number;
}> = ({ loading, error, children, rows = 5 }) => (
  <LoadingWrapper
    loading={loading}
    error={error}
    loader="table"
    fallback={<TableLoader rows={rows} />}
  >
    {children}
  </LoadingWrapper>
);

export const CardLoadingWrapper: React.FC<{
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  text?: string;
}> = ({ loading, error, children, text }) => (
  <LoadingWrapper
    loading={loading}
    error={error}
    loader="card"
    text={text}
  >
    {children}
  </LoadingWrapper>
);

export const ListLoadingWrapper: React.FC<{
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  items?: number;
}> = ({ loading, error, children, items = 3 }) => (
  <LoadingWrapper
    loading={loading}
    error={error}
    loader="list"
    fallback={<ListLoader items={items} />}
  >
    {children}
  </LoadingWrapper>
);

export default LoadingWrapper;
