'use client';
import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastOptions {
  id: string;
  type: ToastType;
  message: string;
}

type ToastState = { toasts: ToastOptions[] };

type Action = 
  | { type: 'ADD_TOAST'; payload: ToastOptions }
  | { type: 'REMOVE_TOAST'; payload: string };

function toastReducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return { toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
}

const ToastContext = createContext<{
  toasts: ToastOptions[];
  addToast: (type: ToastType, message: string) => string;
  removeToast: (id: string) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  loading: (msg: string) => string;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    dispatch({ type: 'ADD_TOAST', payload: { id, type, message } });

    if (type !== 'loading') {
      const duration = type === 'error' ? 5000 : 3000;
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const error = useCallback((msg: string) => addToast('error', msg), [addToast]);
  const info = useCallback((msg: string) => addToast('info', msg), [addToast]);
  const loading = useCallback((msg: string) => addToast('loading', msg), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast, success, error, info, loading }}>
      {children}
      <ToastContainer toasts={state.toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastContainer({ toasts, removeToast }: { toasts: ToastOptions[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto bg-[#1e293b] border border-[#334155] rounded-xl p-4 shadow-lg min-w-[280px] max-w-[380px] flex items-center gap-3 animate-slide-in-right transform transition-all duration-300">
          <div className="flex-shrink-0">
            {toast.type === 'success' && <span className="text-[#10b981] text-lg">✓</span>}
            {toast.type === 'error' && <span className="text-[#ef4444] text-lg">✕</span>}
            {toast.type === 'info' && <span className="text-[#3b82f6] text-lg">ℹ</span>}
            {toast.type === 'loading' && <div className="w-5 h-5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>}
          </div>
          <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
          {toast.type !== 'loading' && (
            <button onClick={() => removeToast(toast.id)} className="text-[#94a3b8] hover:text-white transition-colors">
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
