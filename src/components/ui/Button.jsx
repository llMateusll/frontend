import React from 'react'

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false, 
  icon: Icon,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group'
  
  const variants = {
    primary: 'bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md',
    secondary: 'border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50',
    outline: 'border border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10',
    danger: 'bg-expense-500 text-white shadow-sm hover:bg-expense-600 hover:shadow-lg hover:shadow-expense-500/25 hover:-translate-y-0.5'
  }

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {!loading && Icon && <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />}
      {children}
    </button>
  )
}
