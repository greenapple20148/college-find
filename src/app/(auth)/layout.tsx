import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Link href="/" className="mb-8 text-xl font-bold" style={{ color: 'var(--gold-primary)' }}>
        CollegeFind
      </Link>
      <div className="w-full max-w-md rounded-2xl border p-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
        {children}
      </div>
    </div>
  )
}
