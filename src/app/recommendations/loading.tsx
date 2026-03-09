export default function RecommendationsLoading() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                <div>
                    <div className="h-7 w-48 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                    <div className="h-4 w-72 rounded mt-2 animate-pulse" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                </div>
            </div>

            {/* Category tabs skeleton */}
            <div className="flex gap-2 mb-6">
                {['Safety', 'Match', 'Reach'].map(label => (
                    <div key={label} className="h-9 w-24 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                ))}
            </div>

            {/* Recommendation cards */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div
                        key={i}
                        className="rounded-xl border p-5 animate-pulse"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                                <div>
                                    <div className="h-5 w-44 rounded" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                                    <div className="h-3 w-32 rounded mt-1.5" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                                </div>
                            </div>
                            <div className="h-6 w-16 rounded-full" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                        </div>
                        <div className="flex gap-4">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="h-3 w-20 rounded" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
