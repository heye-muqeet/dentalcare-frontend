import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'link' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const Button: React.FC<ButtonProps> = () => null;
