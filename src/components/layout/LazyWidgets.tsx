'use client'

import dynamic from 'next/dynamic'

const ChatWidget = dynamic(
    () => import('@/components/chat/ChatWidget').then(m => m.ChatWidget),
    { ssr: false }
)

const FeedbackWidget = dynamic(
    () => import('@/components/feedback/FeedbackWidget').then(m => m.FeedbackWidget),
    { ssr: false }
)

export function LazyWidgets() {
    return (
        <>
            <ChatWidget />
            <FeedbackWidget />
        </>
    )
}
