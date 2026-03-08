import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
    title: 'Forgot Password',
    description: 'Reset your CollegeFind account password. Enter your email and we\'ll send you a password reset link.',
}

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />
}
