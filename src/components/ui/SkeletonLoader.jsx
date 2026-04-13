export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (type === 'card') {
    return items.map(i => (
      <div key={i} className="card p-5 space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-5 w-32 rounded" />
          </div>
        </div>
      </div>
    ))
  }

  if (type === 'chart') {
    return (
      <div className="card p-6 animate-fade-in">
        <div className="skeleton h-4 w-40 rounded mb-4" />
        <div className="skeleton h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="card p-6 animate-fade-in space-y-3">
        <div className="skeleton h-4 w-48 rounded mb-4" />
        {items.map(i => (
          <div key={i} className="flex gap-4">
            <div className="skeleton h-4 flex-1 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'transaction') {
    return items.map(i => (
      <div key={i} className="flex items-center gap-3 p-4 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
        <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-32 rounded" />
          <div className="skeleton h-2.5 w-48 rounded" />
        </div>
        <div className="skeleton h-4 w-20 rounded" />
      </div>
    ))
  }

  // text fallback
  return items.map(i => (
    <div key={i} className="skeleton h-4 rounded mb-2" style={{ width: `${70 + Math.random() * 30}%` }} />
  ))
}
