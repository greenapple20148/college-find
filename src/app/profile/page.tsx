import { ProfileForm } from '@/components/profile/ProfileForm'
import { GraduationCapIcon } from '@/components/ui/Icon'

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <GraduationCapIcon className="w-5 h-5" style={{ color: '#FAF9F6' } as React.CSSProperties} />
          </div>
          <div>
            <h1 className="text-2xl font-bold heading-serif" style={{ color: 'var(--text-primary)' }}>
              My Student Profile
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Fill in your academic info and preferences to get personalized college matches.
              All data stays in your browser — no account required.
            </p>
          </div>
        </div>
      </div>
      <div
        className="rounded-xl border p-6 sm:p-8 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <ProfileForm />
      </div>
    </div>
  )
}
