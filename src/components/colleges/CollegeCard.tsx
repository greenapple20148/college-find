'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { HeartIcon, CheckIcon, PlusIcon } from '@/components/ui/Icon'
import { useCompare } from '@/context/CompareContext'
import type { College } from '@/lib/types'

function fmt(n: number | null, prefix = '$'): string {
  if (n === null) return 'N/A'
  return `${prefix}${n.toLocaleString()}`
}

function fmtPct(n: number | null): string {
  if (n === null) return 'N/A'
  return `${Math.round(n * 100)}%`
}

function getAcceptanceColor(rate: number | null): string {
  if (rate === null) return 'inherit'
  const pct = rate * 100
  if (pct <= 15) return '#f87171'
  if (pct <= 30) return '#fb923c'
  if (pct <= 50) return '#fbbf24'
  if (pct <= 75) return '#4ade80'
  return '#34d399'
}

function getAcceptanceLabel(rate: number | null): string {
  if (rate === null) return ''
  const pct = rate * 100
  if (pct <= 15) return 'Highly Selective'
  if (pct <= 30) return 'Selective'
  if (pct <= 50) return 'Moderately Selective'
  return 'Open Admissions'
}

interface CollegeCardProps {
  college: College
  onSave?: (college: College) => void
  saved?: boolean
  viewMode?: 'grid' | 'list'
  index?: number
}

export function CollegeCard({ college, onSave, saved = false, viewMode = 'grid', index = 0 }: CollegeCardProps) {
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare()
  const inCompare = isInCompare(college.id)
  const [isSaved, setIsSaved] = useState(saved)

  function handleSave(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsSaved(s => !s)
    onSave?.(college)
  }

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (inCompare) {
      removeFromCompare(college.id)
    } else {
      addToCompare(college)
    }
  }

  const controlBadge = college.control === 'public' ? 'public' : 'private'
  const controlLabel = college.control === 'public' ? 'Public' : college.control === 'private_nonprofit' ? 'Private Non-Profit' : college.control === 'private_forprofit' ? 'Private For-Profit' : 'Private'
  const isPublic = college.control === 'public'

  const gradPct = college.graduation_rate !== null ? Math.round(college.graduation_rate * 100) : null

  if (viewMode === 'list') {
    return (
      <div
        className="group relative rounded-xl border transition-all duration-300 overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-subtle)',
          animationDelay: `${index * 30}ms`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--gold-primary)'
          e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div className="flex items-center gap-6 p-5">
          {/* Accent stripe */}
          <div
            className="w-1 self-stretch rounded-full flex-shrink-0"
            style={{ backgroundColor: isPublic ? 'var(--accent-public-to)' : 'var(--accent-private-to)' }}
          />

          {/* Acceptance donut */}
          <div className="flex-shrink-0 hidden sm:block">
            <AcceptanceDonut rate={college.acceptance_rate} size={52} />
          </div>

          {/* Name & location */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base leading-tight truncate transition-colors duration-200"
              style={{ color: 'var(--text-primary)' }}
            >
              {college.name}
            </h3>
            <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-faint)' }}>
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {college.city}{college.city && college.state ? ', ' : ''}{college.state}
            </p>
          </div>

          {/* Stats row */}
          <div className="hidden md:flex items-center gap-6">
            <StatCompact label="Tuition" value={fmt(college.tuition_out_state)} />
            <StatCompact label="Net Price" value={fmt(college.net_price)} />
            <StatCompact label="Grad Rate" value={fmtPct(college.graduation_rate)} highlight={gradPct !== null && gradPct >= 70} />
            {college.median_earnings !== null && (
              <StatCompact label="Earnings" value={fmt(college.median_earnings)} />
            )}
          </div>

          {/* Badges */}
          <div className="flex gap-1.5 flex-shrink-0">
            <Badge variant={controlBadge as 'public' | 'private'}>{controlLabel.split(' ')[0]}</Badge>
            {college.size_category && (
              <Badge variant="gray" className="capitalize">{college.size_category}</Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 flex-shrink-0">
            {college.slug && (
              <Link
                href={`/college/${college.slug}`}
                className="p-2 rounded-lg transition-all duration-200 text-xs font-medium hidden sm:flex items-center"
                style={{ color: 'var(--gold-primary)' }}
                title="View college profile"
              >
                Profile
              </Link>
            )}
            <button
              onClick={handleSave}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: isSaved ? 'rgba(201,146,60,0.15)' : 'transparent',
                color: isSaved ? 'var(--gold-primary)' : 'var(--text-ghost)',
              }}
              title={isSaved ? 'Unsave' : 'Save'}
            >
              <HeartIcon className="w-4 h-4" filled={isSaved} />
            </button>
            <button
              onClick={handleCompare}
              disabled={!inCompare && !canAddMore}
              className="p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: inCompare ? 'rgba(201,146,60,0.15)' : 'transparent',
                color: inCompare ? 'var(--gold-primary)' : 'var(--text-ghost)',
              }}
              title={inCompare ? 'Remove from compare' : !canAddMore ? 'Compare list full' : 'Add to compare'}
            >
              {inCompare ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Grid view (default)
  return (
    <div
      className="group relative rounded-xl border transition-all duration-300 hover:-translate-y-1 overflow-hidden card-animate-in flex flex-col"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
        animationDelay: `${index * 40}ms`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--gold-primary)'
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: isPublic
            ? `linear-gradient(to right, var(--accent-public-from), var(--accent-public-to))`
            : `linear-gradient(to right, var(--accent-private-from), var(--accent-private-to))`,
        }}
      />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base leading-tight line-clamp-2 transition-colors duration-200"
              style={{ color: 'var(--text-primary)' }}
            >
              {college.name}
            </h3>
            <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: 'var(--text-faint)' }}>
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {college.city}{college.city && college.state ? ', ' : ''}{college.state}
            </p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Badge variant={controlBadge as 'public' | 'private'}>{controlLabel.split(' ')[0]}</Badge>
            {college.size_category && (
              <Badge variant="gray" className="capitalize">{college.size_category}</Badge>
            )}
          </div>
        </div>

        {/* Visual acceptance indicator */}
        {college.acceptance_rate !== null && (
          <div
            className="flex items-center gap-3 p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <AcceptanceDonut rate={college.acceptance_rate} size={44} />
            <div>
              <p className="text-sm font-semibold" style={{ color: getAcceptanceColor(college.acceptance_rate) }}>
                {fmtPct(college.acceptance_rate)} Acceptance
              </p>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{getAcceptanceLabel(college.acceptance_rate)}</p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1">
          <Stat label="Out-of-State Tuition" value={fmt(college.tuition_out_state)} />
          <Stat label="Net Price" value={fmt(college.net_price)} />
          <Stat
            label="Graduation Rate"
            value={fmtPct(college.graduation_rate)}
            highlight={gradPct !== null && gradPct >= 70}
          />
          {college.median_earnings !== null ? (
            <Stat label="Median Earnings" value={fmt(college.median_earnings)} highlight={college.median_earnings >= 50000} />
          ) : (
            <Stat label="Enrollment" value={college.enrollment?.toLocaleString() ?? 'N/A'} />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 mt-auto" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {college.slug && (
            <Link
              href={`/college/${college.slug}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border hover:border-[var(--gold-primary)]"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--gold-primary)',
                borderColor: 'rgba(201,146,60,0.2)',
              }}
            >
              View Profile
            </Link>
          )}
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
            style={{
              backgroundColor: isSaved ? 'rgba(201,146,60,0.12)' : 'transparent',
              color: isSaved ? 'var(--gold-primary)' : 'var(--text-muted)',
              borderColor: isSaved ? 'rgba(201,146,60,0.2)' : 'var(--border-subtle)',
            }}
          >
            <HeartIcon className="w-3.5 h-3.5" filled={isSaved} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleCompare}
            disabled={!inCompare && !canAddMore}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: inCompare ? 'rgba(201,146,60,0.12)' : 'transparent',
              color: inCompare ? 'var(--gold-primary)' : 'var(--text-muted)',
              borderColor: inCompare ? 'rgba(201,146,60,0.2)' : 'var(--border-subtle)',
            }}
            title={!inCompare && !canAddMore ? 'Remove a college from compare to add more' : ''}
          >
            {inCompare
              ? <><CheckIcon className="w-3.5 h-3.5" /> Comparing</>
              : <><PlusIcon className="w-3.5 h-3.5" /> Compare</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Acceptance Rate Donut ──────────────────── */
function AcceptanceDonut({ rate, size = 44 }: { rate: number | null; size?: number }) {
  if (rate === null) {
    return (
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: size, height: size, backgroundColor: 'var(--bg-tertiary)' }}
      >
        <span className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>N/A</span>
      </div>
    )
  }

  const pct = Math.round(rate * 100)
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (rate * circumference)

  const color =
    pct <= 15 ? '#f87171' :
      pct <= 30 ? '#fb923c' :
        pct <= 50 ? '#fbbf24' :
          pct <= 75 ? '#4ade80' : '#34d399'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--donut-track)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {pct}%
      </span>
    </div>
  )
}

/* ─── Stat sub-components ─────────────────────── */
function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</p>
      <p
        className="text-sm font-medium"
        style={{ color: value === 'N/A' ? 'var(--text-ghost)' : highlight ? '#34d399' : 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  )
}

function StatCompact({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>{label}</p>
      <p
        className="text-sm font-semibold"
        style={{ color: value === 'N/A' ? 'var(--text-ghost)' : highlight ? '#34d399' : 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  )
}
