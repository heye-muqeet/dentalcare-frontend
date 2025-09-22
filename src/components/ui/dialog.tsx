import React from 'react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface DialogContentProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
}

export interface DialogHeaderProps {
  children?: React.ReactNode;
}

export interface DialogTitleProps {
  children?: React.ReactNode;
  className?: string;
}

export interface DialogDescriptionProps {
  children?: React.ReactNode;
}

export interface DialogFooterProps {
  children?: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6">
    {children}
  </div>
);

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '' }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h2>
);

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => (
  <p className="text-sm text-muted-foreground">
    {children}
  </p>
);

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className = '' }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0 ${className}`}>
    {children}
  </div>
);