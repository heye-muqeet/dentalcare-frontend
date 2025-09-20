import React from 'react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface DialogContentProps {
  children?: React.ReactNode;
  className?: string;
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

export const Dialog: React.FC<DialogProps> = () => null;
export const DialogContent: React.FC<DialogContentProps> = () => null;
export const DialogHeader: React.FC<DialogHeaderProps> = () => null;
export const DialogTitle: React.FC<DialogTitleProps> = () => null;
export const DialogDescription: React.FC<DialogDescriptionProps> = () => null;
