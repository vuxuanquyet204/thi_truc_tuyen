import { createContext, useContext, ReactNode } from 'react'
import { toast, Toaster, ToastOptions } from 'sonner'

type ToastMethod = typeof toast

interface ToastContextValue {
  toast: ToastMethod
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastMethod {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return toast
  }
  return ctx.toast
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps): JSX.Element {
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        } as ToastOptions['style']}
      />
    </ToastContext.Provider>
  )
}

export { toast }
