import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ALL_ESSAY_PAGES, getEssayPage } from '@/lib/essay-content'
import EssayContentTemplate from '@/components/essay/EssayContentTemplate'

// Generate static paths for all 50 pages at build time
export function generateStaticParams() {
    return ALL_ESSAY_PAGES.map(page => ({ slug: page.slug }))
}

// Dynamic metadata for each page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const page = getEssayPage(slug)
    if (!page) return {}
    return {
        title: page.seoTitle,
        description: page.metaDescription,
        openGraph: {
            title: page.seoTitle,
            description: page.metaDescription,
            type: 'article',
            url: `https://college-find.com/${page.slug}`,
        },
    }
}

export default async function EssayContentPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const page = getEssayPage(slug)

    if (!page) {
        notFound()
    }

    return <EssayContentTemplate page={page} />
}
