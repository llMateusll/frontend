export default function ProgressBar({
  value = 0,
  max = 100,
  color = 'primary',
  size = 'md',
  animated = true,
  showLabel = false,
  className = ''
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
  const height = heights[size] || heights.md

  const gradients = {
    primary: 'from-primary-400 to-primary-600',
    income: 'from-income-400 to-income-600',
    expense: 'from-expense-400 to-expense-600',
    accent: 'from-accent-400 to-accent-600',
    warning: 'from-warning-400 to-warning-500',
    auto: pct >= 100 ? 'from-income-400 to-income-600'
        : pct >= 70 ? 'from-warning-400 to-warning-500'
        : 'from-primary-400 to-primary-600',
  }
  const gradient = gradients[color] || gradients.primary

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-surface-200 dark:bg-surface-700 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out ${animated ? 'animate-progress-fill' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-surface-500">{Math.round(pct)}%</span>
        </div>
      )}
    </div>
  )
}
