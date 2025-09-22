import React, { useState, useRef, useEffect } from 'react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
  selectedValue?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
  isSelected?: boolean;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const Select = ({ value, onValueChange, children, className = '' }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onValueChange?.(value);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {children}
    </div>
  );
};

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className = '', children, onClick, isOpen, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isOpen ? 'ring-2 ring-ring' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
);

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className = '', children, onSelect, selectedValue, ...props }, ref) => (
    <div
      ref={ref}
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className = '', children, value, onSelect, isSelected, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${isSelected ? 'bg-accent text-accent-foreground' : ''} ${className}`}
      onClick={() => onSelect?.(value)}
      {...props}
    >
      {children}
    </div>
  )
);

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className = '', placeholder, ...props }, ref) => (
    <span
      ref={ref}
      className={`text-left ${className}`}
      {...props}
    >
      {placeholder}
    </span>
  )
);