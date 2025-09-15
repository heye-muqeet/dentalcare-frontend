import React from 'react';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'skeleton' | 'overlay';
export type LoaderColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'white' | 'gray';

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  color?: LoaderColor;
  text?: string;
  className?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  centered?: boolean;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-blue-500',
  white: 'text-white',
  gray: 'text-gray-400',
};

const SpinnerLoader: React.FC<{ size: LoaderSize; color: LoaderColor }> = ({ size, color }) => (
  <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}></div>
);

const DotsLoader: React.FC<{ size: LoaderSize; color: LoaderColor }> = ({ size, color }) => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={`rounded-full animate-bounce ${sizeClasses[size]} ${colorClasses[color]}`}
        style={{ animationDelay: `${i * 0.1}s` }}
      ></div>
    ))}
  </div>
);

const PulseLoader: React.FC<{ size: LoaderSize; color: LoaderColor }> = ({ size, color }) => (
  <div className={`animate-pulse rounded-full ${sizeClasses[size]} ${colorClasses[color]} bg-current`}></div>
);

const BarsLoader: React.FC<{ size: LoaderSize; color: LoaderColor }> = ({ size, color }) => (
  <div className="flex space-x-1 items-end">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={`animate-pulse ${colorClasses[color]} bg-current`}
        style={{
          width: '4px',
          height: `${12 + i * 4}px`,
          animationDelay: `${i * 0.1}s`,
        }}
      ></div>
    ))}
  </div>
);

const SkeletonLoader: React.FC<{ size: LoaderSize }> = ({ size }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  const sizeMap = {
    xs: 'h-3 w-16',
    sm: 'h-4 w-24',
    md: 'h-6 w-32',
    lg: 'h-8 w-48',
    xl: 'h-12 w-64',
  };
  
  return (
    <div className="space-y-2">
      <div className={`${baseClasses} ${sizeMap[size]}`}></div>
      <div className={`${baseClasses} ${sizeMap[size]} w-3/4`}></div>
      <div className={`${baseClasses} ${sizeMap[size]} w-1/2`}></div>
    </div>
  );
};

const LoaderContent: React.FC<{ variant: LoaderVariant; size: LoaderSize; color: LoaderColor }> = ({
  variant,
  size,
  color,
}) => {
  switch (variant) {
    case 'spinner':
      return <SpinnerLoader size={size} color={color} />;
    case 'dots':
      return <DotsLoader size={size} color={color} />;
    case 'pulse':
      return <PulseLoader size={size} color={color} />;
    case 'bars':
      return <BarsLoader size={size} color={color} />;
    case 'skeleton':
      return <SkeletonLoader size={size} />;
    default:
      return <SpinnerLoader size={size} color={color} />;
  }
};

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  className = '',
  overlay = false,
  fullScreen = false,
  centered = true,
}) => {
  const content = (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <LoaderContent variant={variant} size={size} color={color} />
      {text && (
        <p className={`text-sm ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-40">
        {content}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        {content}
      </div>
    );
  }

  return content;
};

// Specialized loader components for common use cases
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <Loader
    variant="spinner"
    size="lg"
    color="primary"
    text={text}
    fullScreen
  />
);

export const ButtonLoader: React.FC<{ size?: LoaderSize; color?: LoaderColor }> = ({ 
  size = 'sm', 
  color = 'white' 
}) => (
  <Loader
    variant="spinner"
    size={size}
    color={color}
  />
);

export const CardLoader: React.FC<{ text?: string }> = ({ text }) => (
  <Loader
    variant="skeleton"
    size="md"
    text={text}
    centered
  />
);

export const TableLoader: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <div className="animate-pulse bg-gray-200 rounded h-4 w-1/4"></div>
        <div className="animate-pulse bg-gray-200 rounded h-4 w-1/4"></div>
        <div className="animate-pulse bg-gray-200 rounded h-4 w-1/4"></div>
        <div className="animate-pulse bg-gray-200 rounded h-4 w-1/4"></div>
      </div>
    ))}
  </div>
);

export const ListLoader: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <div className="animate-pulse bg-gray-200 rounded-full h-10 w-10"></div>
        <div className="space-y-2 flex-1">
          <div className="animate-pulse bg-gray-200 rounded h-4 w-3/4"></div>
          <div className="animate-pulse bg-gray-200 rounded h-3 w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

export default Loader;
