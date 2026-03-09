// Shared utility functions for CollegeFind

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatUSD(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'N/A'
  return `$${n.toLocaleString()}`
}

export function formatPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'N/A'
  return `${Math.round(n * 100)}%`
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'collegefind_session_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}
