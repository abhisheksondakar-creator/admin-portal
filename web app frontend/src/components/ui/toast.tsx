import * as React from 'react'
import { create } from 'zustand'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface Toast {
  id: string
  title?: string
  description?: string
  variant: ToastVariant
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
}

const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2)
    const duration = toast.duration ?? 4000
    set({ toasts: [...get().toasts, { ...toast, id }] })
    if (duration > 0) {
      setTimeout(() => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) })
      }, duration)
    }
    return id
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
}))

function useToast() {
  const { addToast, removeToast } = useToastStore()

  const toast = React.useCallback(
    (args: Omit<Toast, 'id'>) => {
      return addToast(args)
    },
    [addToast]
  )

  return { toast, dismiss: removeToast }
}

const variantStyles: Record<ToastVariant, { icon: React.ReactNode; border: string }> = {
  default: {
    icon: <Info size={18} strokeWidth={1.5} className="text-ink" />,
    border: 'border-border',
  },
  success: {
    icon: <CheckCircle2 size={18} strokeWidth={1.5} className="text-success" />,
    border: 'border-success/20',
  },
  warning: {
    icon: <AlertTriangle size={18} strokeWidth={1.5} className="text-warning" />,
    border: 'border-warning/20',
  },
  danger: {
    icon: <AlertCircle size={18} strokeWidth={1.5} className="text-danger" />,
    border: 'border-danger/20',
  },
  info: {
    icon: <Info size={18} strokeWidth={1.5} className="text-info" />,
    border: 'border-info/20',
  },
}

function ToastViewport() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => {
        const { icon, border } = variantStyles[toast.variant]
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-card border bg-surface p-4',
              border
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="text-sm font-semibold text-ink">{toast.title}</div>
              )}
              {toast.description && (
                <div className="text-sm text-ink-muted mt-0.5">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-0.5 rounded-btn hover:bg-surface-2 text-ink-muted hover:text-ink"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastViewport />
    </>
  )
}

export { ToastProvider, useToast }
