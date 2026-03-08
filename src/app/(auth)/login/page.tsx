import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your CollegeFind account to access your saved colleges and application tracker.',
}

export default function LoginPage() {
  return <LoginForm />
}
