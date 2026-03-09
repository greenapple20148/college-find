export default function DashboardLoading() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="h-7 w-48 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                    <div className="h-4 w-64 rounded mt-2 animate-pulse" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main list skeleton */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="h-5 w-32 rounded animate-pulse mb-4" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="rounded-xl border p-4 animate-pulse"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-48 rounded" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                                    <div className="h-3 w-32 rounded" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                                </div>
                                <div className="h-8 w-20 rounded-lg" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="rounded-xl border p-4 animate-pulse"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                        >
                            <div className="h-4 w-24 rounded mb-3" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                            <div className="space-y-2">
                                <div className="h-3 w-full rounded" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                                <div className="h-3 w-3/4 rounded" style={{ backgroundColor: 'var(--skeleton-color, rgba(120,120,120,0.1))' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
