declare module 'sonner' {
  export interface ToastOptions {
    id?: string | number;
    duration?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }

  export interface Toast {
    id: string | number;
    title?: string;
    description?: string;
    type?: 'success' | 'error' | 'info' | 'warning';
  }

  export const toast: {
    (message: string, options?: ToastOptions): void;
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
  };

  export function Toaster(): JSX.Element;
}
