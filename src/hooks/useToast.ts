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

    console.log('🍞 Ajout d\'un toast:', newToast);
    setToasts(prev => {
      const updated = [...prev, newToast];
      console.log('🍞 Toasts après ajout:', updated);
      return updated;
    });
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    console.log('🗑️ Suppression du toast:', id);
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    console.log('🧹 Suppression de tous les toasts');
    setToasts([]);
  }, []);

  // Méthodes de convenance
  const success = useCallback((title: string, message?: string, duration?: number) => {
    console.log('✅ Toast success appelé:', { title, message, duration });
    return addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    console.log('❌ Toast error appelé:', { title, message, duration });
    return addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    console.log('⚠️ Toast warning appelé:', { title, message, duration });
    return addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    console.log('ℹ️ Toast info appelé:', { title, message, duration });
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