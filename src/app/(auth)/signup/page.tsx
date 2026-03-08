import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a free CollegeFind account to save colleges, track deadlines, and get personalized admission estimates.',
}

export default function SignupPage() {
  return <SignupForm />
}
