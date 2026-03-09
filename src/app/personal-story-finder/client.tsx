'use client'
import EssayToolPage from '@/components/essay/EssayToolPage'
import { getToolBySlug } from '@/lib/essay-tools'
export default function EssayToolPageClient() { return <EssayToolPage tool={getToolBySlug('personal-story-finder')!} /> }
