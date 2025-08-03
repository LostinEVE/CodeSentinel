import { useState } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Hook for using toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>): void => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string): void => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (title: string, message: string) => {
      addToast({ type: 'success', title, message });
    },
    error: (title: string, message: string) => {
      addToast({ type: 'error', title, message });
    },
    warning: (title: string, message: string) => {
      addToast({ type: 'warning', title, message });
    },
    info: (title: string, message: string) => {
      addToast({ type: 'info', title, message });
    },
  };

  return {
    toasts,
    addToast,
    removeToast,
    toast,
  };
};
