'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useToast, ToastItem } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (options: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string; duration?: number }) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastUtils = useToast();

  return (
    <ToastContext.Provider value={toastUtils}>
      {children}
      <ToastContainer toasts={toastUtils.toasts} onRemoveToast={toastUtils.removeToast} />
    </ToastContext.Provider>
  );
}; 