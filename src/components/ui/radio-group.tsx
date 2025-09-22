import React from 'react';

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface RadioGroupItemProps {
  value: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const RadioGroup = ({ value, onValueChange, children, className = '' }: RadioGroupProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
};

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ children, className = '', isSelected, onSelect, ...props }, ref) => (
    <div className="flex items-center space-x-2">
      <input
        ref={ref}
        type="radio"
        checked={isSelected}
        onChange={onSelect}
        className={`h-4 w-4 border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
      {children}
    </div>
  )
);