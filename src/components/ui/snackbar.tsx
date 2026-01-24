'use client';

/**
 * Snackbar Component
 * 
 * Android-style snackbar notifications that slide up from the bottom.
 * Non-blocking, auto-dismissing feedback for user actions.
 * Material 3 design language.
 */

import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarMessage {
  id: string;
  message: string;
  type: SnackbarType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType, options?: { duration?: number; action?: { label: string; onClick: () => void } }) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}

interface SnackbarProviderProps {
  children: ReactNode;
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback((
    message: string, 
    type: SnackbarType = 'info',
    options?: { duration?: number; action?: { label: string; onClick: () => void } }
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newSnackbar: SnackbarMessage = {
      id,
      message,
      type,
      duration: options?.duration ?? 3000,
      action: options?.action,
    };
    
    setSnackbars(prev => [...prev, newSnackbar]);
  }, []);

  const removeSnackbar = useCallback((id: string) => {
    setSnackbars(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <SnackbarContainer snackbars={snackbars} onRemove={removeSnackbar} />
    </SnackbarContext.Provider>
  );
}

interface SnackbarContainerProps {
  snackbars: SnackbarMessage[];
  onRemove: (id: string) => void;
}

function SnackbarContainer({ snackbars, onRemove }: SnackbarContainerProps) {
  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] flex flex-col gap-2 pointer-events-none">
      {snackbars.map(snackbar => (
        <Snackbar key={snackbar.id} snackbar={snackbar} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface SnackbarProps {
  snackbar: SnackbarMessage;
  onRemove: (id: string) => void;
}

function Snackbar({ snackbar, onRemove }: SnackbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(snackbar.id), 200);
    }, snackbar.duration);

    return () => clearTimeout(timer);
  }, [snackbar.id, snackbar.duration, onRemove]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(snackbar.id), 200);
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  const bgColors = {
    success: 'bg-slate-900 dark:bg-slate-800',
    error: 'bg-slate-900 dark:bg-slate-800',
    warning: 'bg-slate-900 dark:bg-slate-800',
    info: 'bg-slate-900 dark:bg-slate-800',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border border-white/10 transition-all duration-200',
        bgColors[snackbar.type],
        isVisible && !isExiting ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      {/* Icon */}
      {icons[snackbar.type]}
      
      {/* Message */}
      <p className="flex-1 text-sm font-medium text-white">
        {snackbar.message}
      </p>

      {/* Action Button */}
      {snackbar.action && (
        <button
          onClick={() => {
            snackbar.action?.onClick();
            handleDismiss();
          }}
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wide"
        >
          {snackbar.action.label}
        </button>
      )}

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="p-1 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
