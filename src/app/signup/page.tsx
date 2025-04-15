'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Spinner from '@/components/ui/spinner'
import { createUserProfile } from '@/app/actions/auth'
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
} from '@/lib/utils/validation'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const nameError = validateName(formData.name)
    if (nameError) newErrors.name = nameError

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    )
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_name: formData.name,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors((prev) => ({ ...prev, email: 'Email already in use' }))
        } else {
          setErrors((prev) => ({ ...prev, submit: error.message }))
        }
        return
      }

      if (data.user) {
        try {
          // Create user profile in the database
          const result = await createUserProfile(data.user.id, formData.email, formData.name)
          if (result.success) {
            router.push('/login')
          } else {
            setErrors((prev) => ({ ...prev, submit: 'Failed to create user profile' }))
          }
        } catch (error) {
          console.error('Error creating user profile:', error)
          setErrors((prev) => ({ 
            ...prev, 
            submit: error instanceof Error ? error.message : 'Failed to create user profile' 
          }))
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      setErrors((prev) => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] p-4">
      <div className="w-full max-w-md rounded-lg bg-[#1e1e1e] p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-[#b3b3b3]">Sign up to start your fitness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-white">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-md border ${
                errors.name ? 'border-red-500' : 'border-[#404040]'
              } bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-md border ${
                errors.email ? 'border-red-500' : 'border-[#404040]'
              } bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-md border ${
                errors.password ? 'border-red-500' : 'border-[#404040]'
              } bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-white">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-md border ${
                errors.confirmPassword ? 'border-red-500' : 'border-[#404040]'
              } bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-4 w-4 rounded border-[#404040] text-[#FF5733] focus:ring-[#ff8a5f]"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-[#b3b3b3]">
              I agree to the{' '}
              <Link href="/terms" className="text-[#2E86AB] hover:text-[#FF5733]">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#2E86AB] hover:text-[#FF5733]">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}

          {errors.submit && (
            <div className="rounded-md bg-red-500/10 p-3 text-center text-sm text-red-500">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? <Spinner /> : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[#b3b3b3]">Already have an account? </span>
          <Link href="/login" className="font-medium text-[#2E86AB] hover:text-[#FF5733]">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
