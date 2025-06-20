import { useState, useCallback } from 'react';
import { ToastProps } from '@/components/ui/Toast';

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToast = useCallback((options: ToastOptions) => {
    const id = generateId();
    const newToast: ToastItem = {
      ...options,
      id,
      duration: options.duration ?? 5000
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Méthodes de convenance
  const success = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  };
}; 