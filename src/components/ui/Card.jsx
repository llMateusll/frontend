import React from 'react'

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div 
      className={`bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-200/80 dark:border-surface-700/80 transition-all ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
