import React from 'react'

export function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-surface-200 dark:bg-surface-700/50 rounded-lg ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent shadow-[0_0_20px_20px_rgba(255,255,255,0.05)]" />
    </div>
  )
}
