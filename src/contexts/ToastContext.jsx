import { createContext, useContext, useCallback, useEffect, useState } from 'react'

const listeners = new Set()

function createToast(message, type = 'success') {
  const id = Date.now() + Math.random()
  listeners.forEach(fn => fn({ id, message, type }))
  setTimeout(() => {
    listeners.forEach(fn => fn({ id, dismiss: true }))
  }, 4000)
}

export const toast = {
  success: (msg) => createToast(msg, 'success'),
  error: (msg) => createToast(msg, 'error'),
  warning: (msg) => createToast(msg, 'warning'),
  info: (msg) => createToast(msg, 'info'),
}

export const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext) || toast
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (data) => {
      if (data.dismiss) {
        setToasts(prev => prev.filter(t => t.id !== data.id))
      } else {
        setToasts(prev => [...prev, data])
      }
    }
    listeners.add(handler)
    return () => { listeners.delete(handler) }
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto" role="alert">
            <ToastCard toast={t} onClose={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ toast: t, onClose }) {
  const style = {
    success: { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-950/70', icon: 'text-green-500', text: 'text-green-800 dark:text-green-200', bar: 'bg-green-500' },
    error:   { border: 'border-red-500',    bg: 'bg-red-50 dark:bg-red-950/70',    icon: 'text-red-500',    text: 'text-red-800 dark:text-red-200',    bar: 'bg-red-500' },
    warning: { border: 'border-yellow-500',  bg: 'bg-yellow-50 dark:bg-yellow-950/70', icon: 'text-yellow-500', text: 'text-yellow-800 dark:text-yellow-200', bar: 'bg-yellow-500' },
    info:    { border: 'border-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/70',    icon: 'text-blue-500',   text: 'text-blue-800 dark:text-blue-200',   bar: 'bg-blue-500' },
  }
  const s = style[t.type]
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }

  return (
    <div className={`rounded-xl ${s.bg} border-l-4 ${s.border} shadow-lg p-4 flex items-start gap-3 backdrop-blur-sm animate-slide-in relative overflow-hidden`}>
      <span className={`text-lg font-bold ${s.icon} mt-0.5`}>{icons[t.type]}</span>
      <p className={`text-sm font-medium ${s.text} flex-1`}>{t.message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-lg leading-none flex-shrink-0">&times;</button>
      <div className="absolute bottom-0 left-0 right-0 h-1">
        <div className={`h-full ${s.bar} animate-shrink`} />
      </div>
    </div>
  )
}
