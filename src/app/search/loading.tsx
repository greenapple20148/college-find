export default function SearchLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Search header */}
            <div className="mb-8">
                <div className="h-8 w-56 rounded-lg animate-pulse mb-2" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                <div className="h-4 w-80 rounded animate-pulse" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
            </div>

            {/* Search bar skeleton */}
            <div className="h-12 w-full rounded-xl animate-pulse mb-6" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />

            {/* Filter bar */}
            <div className="flex gap-3 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-9 w-28 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                ))}
            </div>

            {/* College cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div
                        key={i}
                        className="rounded-xl border p-5 animate-pulse"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                    >
                        <div className="h-5 w-40 rounded mb-3" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                        <div className="h-3 w-32 rounded mb-4" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="space-y-1">
                                    <div className="h-3 w-16 rounded" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                                    <div className="h-4 w-12 rounded" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
