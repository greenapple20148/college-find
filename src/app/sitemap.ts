import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { US_STATES, MAJOR_OPTIONS } from '@/lib/types'
import { ALL_SAT_SCORE_PAGES } from '@/lib/sat-seo-data'

const SITE_URL = 'https://collegefindtool.com'

const GPA_VALUES = [4.0, 3.9, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3, 3.2, 3.0, 2.8, 2.5]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Fetch top 2000 college slugs
  let collegeUrls: MetadataRoute.Sitemap = []
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('colleges')
      .select('slug, updated_at')
      .not('slug', 'is', null)
      .order('enrollment', { ascending: false })
      .limit(2000)
    collegeUrls = (data ?? [])
      .filter((c: { slug?: string | null }) => c.slug)
      .map((c: { slug: string; updated_at?: string }) => ({
        url: `${SITE_URL}/college/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
  } catch {
    // If DB is unavailable at build time, skip college URLs
  }

  const gpaUrls: MetadataRoute.Sitemap = GPA_VALUES.map(g => ({
    url: `${SITE_URL}/gpa/${g.toFixed(1)}-colleges`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const satUrls: MetadataRoute.Sitemap = ALL_SAT_SCORE_PAGES.map(p => ({
    url: `${SITE_URL}/sat/${p.score}-colleges`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const majorUrls: MetadataRoute.Sitemap = MAJOR_OPTIONS
    .filter(m => m !== 'Undecided')
    .map(m => ({
      url: `${SITE_URL}/major/${m.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}-colleges`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  const stateUrls: MetadataRoute.Sitemap = US_STATES.map(s => ({
    url: `${SITE_URL}/state/${s.name.toLowerCase().replace(/\s+/g, '-')}-colleges`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cost-calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/scholarships`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/profile`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    ...collegeUrls,
    ...gpaUrls,
    ...satUrls,
    ...majorUrls,
    ...stateUrls,
    // SAT Ace pages
    { url: `${SITE_URL}/sat-prep`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${SITE_URL}/sat-prep/calculator`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${SITE_URL}/sat-prep/practice`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${SITE_URL}/sat-prep/planner`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: `${SITE_URL}/sat-prep/dashboard`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.6 },
    { url: `${SITE_URL}/sat-prep/mock-tests`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 },
  ]
}
