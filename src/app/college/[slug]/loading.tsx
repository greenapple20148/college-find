export default function CollegeProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-8 rounded-lg w-2/3" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
      <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        ))}
      </div>
      <div className="h-48 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
    </div>
  )
}
