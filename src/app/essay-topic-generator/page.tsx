import { Metadata } from 'next'
import { getToolBySlug } from '@/lib/essay-tools'
import EssayToolPageClient from './client'

const tool = getToolBySlug('essay-topic-generator')!

export const metadata: Metadata = {
    title: tool.seoTitle,
    description: tool.description,
}

export default function Page() {
    return <EssayToolPageClient />
}
