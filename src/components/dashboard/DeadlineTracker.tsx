import type { SavedCollege } from '@/lib/types'

function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null
  return Math.floor((new Date(deadline + 'T00:00:00').getTime() - Date.now()) / 86400000)
}

function formatDays(days: number): string {
  if (days < 0) return 'Past deadline'
  if (days === 0) return 'Due today!'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

interface DeadlineTrackerProps {
  savedColleges: SavedCollege[]
}

export function DeadlineTracker({ savedColleges }: DeadlineTrackerProps) {
  const upcoming = savedColleges
    .filter(s => s.deadline !== null)
    .map(s => ({ ...s, days: daysUntil(s.deadline) }))
    .filter(s => s.days !== null && s.days >= 0)
    .sort((a, b) => (a.days as number) - (b.days as number))
    .slice(0, 5)

  if (upcoming.length === 0) {
    return (
      <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
        <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Upcoming Deadlines</h3>
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No upcoming deadlines set. Add deadlines to your saved colleges.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
      <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Upcoming Deadlines</h3>
      <div className="space-y-3">
        {upcoming.map(saved => {
          const days = saved.days as number
          const color = days < 7 ? '#dc2626' : days < 30 ? '#ca8a04' : '#16a34a'
          const bgColor = days < 7 ? 'rgba(239,68,68,0.08)' : days < 30 ? 'rgba(234,179,8,0.08)' : 'rgba(34,197,94,0.08)'

          return (
            <div key={saved.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
              <div>
                <p className="text-sm font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {saved.college?.name ?? 'Unknown College'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{saved.college?.state}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color }}>{formatDays(days)}</p>
                <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                  {new Date(saved.deadline! + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
