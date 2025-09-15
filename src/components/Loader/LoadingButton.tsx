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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const widthClass = fullWidth ? 'w-full' : '';
  
  const focusRingClass = `focus:ring-${variant === 'primary' ? 'blue' : variant === 'secondary' ? 'gray' : variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'blue'}-500`;

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${focusRingClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <ButtonLoader size={size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'sm'} />
          {loadingText && <span>{loadingText}</span>}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
