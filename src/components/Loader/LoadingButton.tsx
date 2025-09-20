import React from 'react';
import { ButtonLoader } from './Loader';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  error: 'bg-red-600 hover:bg-red-700 text-white',
  info: 'bg-blue-500 hover:bg-blue-600 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed relative overflow-hidden';
  
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const widthClass = fullWidth ? 'w-full' : '';
  
  const focusRingClass = `focus:ring-${variant === 'primary' ? 'blue' : variant === 'secondary' ? 'gray' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'blue'}-500`;

  // Apply reduced opacity when loading instead of disabled opacity
  const loadingOpacity = loading ? 'opacity-80' : '';

  // Get the appropriate loader size that matches the button size
  const getLoaderSize = () => {
    switch (size) {
      case 'sm':
        return 'xs';
      case 'lg':
        return 'sm';
      default:
        return 'xs'; // Use xs for md size to prevent height increase
    }
  };

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${focusRingClass} ${loadingOpacity} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2 min-h-0">
        {loading && (
          <div className="flex-shrink-0">
            <ButtonLoader size={getLoaderSize()} />
          </div>
        )}
        <span className={`transition-opacity duration-200 ${loading ? 'opacity-90' : 'opacity-100'} truncate`}>
          {loading && loadingText ? loadingText : children}
        </span>
      </div>
    </button>
  );
};

export default LoadingButton;
