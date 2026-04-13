import React from 'react'

const variants = {
  success: 'bg-income-50 dark:bg-income-500/10 text-income-600 dark:text-income-400 border-income-200 dark:border-income-500/20',
  error: 'bg-expense-50 dark:bg-expense-500/10 text-expense-600 dark:text-expense-400 border-expense-200 dark:border-expense-500/20',
  warning: 'bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400 border-warning-200 dark:border-warning-500/20',
  info: 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-500/20',
  default: 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-600'
}

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
