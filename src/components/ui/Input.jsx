import React, { forwardRef } from 'react'

export const Input = forwardRef(({ className = '', error, icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full">
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 outline-none transition-all duration-300 placeholder:text-surface-400 dark:placeholder:text-surface-500
            ${Icon ? 'pl-11' : ''}
            ${error 
              ? 'border-expense-400 focus:ring-2 focus:ring-expense-400/50' 
              : 'border-surface-300 dark:border-surface-600 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/50 dark:focus:border-primary-500 dark:focus:ring-primary-500/30'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-expense-500 animate-slide-up">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
