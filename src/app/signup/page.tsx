'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Spinner from '@/components/ui/spinner'
import { createUserProfile } from '@/app/actions/auth'
import { Activity } from 'lucide-react'
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#121212] to-[#1a1a1a] p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and brand section */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center rounded-full bg-[#1e1e1e]/80 p-3 shadow-lg ring-2 ring-[#FF5733]/20">
            <Activity className="h-10 w-10 text-[#FF5733]" />
          </div>
          <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            <span className="text-[#FF5733]">Ehrgeizig</span>
          </h1>
          <p className="mt-2 text-center text-sm text-[#b3b3b3] sm:text-base">
            Sign up to start your fitness journey
          </p>
        </div>

        {/* Signup form card */}
        <div className="overflow-hidden rounded-xl bg-gradient-to-b from-[#1e1e1e] to-[#252525] p-8 shadow-xl ring-1 ring-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-white/90">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${
                      errors.name ? 'border-red-500' : 'border-[#404040]'
                    } bg-[#2d2d2d] px-4 py-2.5 text-white placeholder-[#666666] shadow-sm transition-colors focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-sm font-medium text-red-500">{errors.name}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white/90">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${
                      errors.email ? 'border-red-500' : 'border-[#404040]'
                    } bg-[#2d2d2d] px-4 py-2.5 text-white placeholder-[#666666] shadow-sm transition-colors focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="mt-1 text-sm font-medium text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white/90">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${
                      errors.password ? 'border-red-500' : 'border-[#404040]'
                    } bg-[#2d2d2d] px-4 py-2.5 text-white placeholder-[#666666] shadow-sm transition-colors focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="mt-1 text-sm font-medium text-red-500">{errors.password}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-white/90">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-[#404040]'
                    } bg-[#2d2d2d] px-4 py-2.5 text-white placeholder-[#666666] shadow-sm transition-colors focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm font-medium text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 rounded border-[#404040] bg-[#2d2d2d] text-[#FF5733] focus:ring-2 focus:ring-[#ff8a5f]/50"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="terms" className="text-sm text-[#b3b3b3]">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-[#FF5733] hover:text-[#ff8a5f]">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-medium text-[#FF5733] hover:text-[#ff8a5f]">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
            {errors.terms && <p className="text-sm font-medium text-red-500">{errors.terms}</p>}

            {errors.submit && (
              <div className="rounded-md bg-red-500/10 p-3 text-center text-sm font-medium text-red-500">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-md bg-gradient-to-r from-[#FF5733] to-[#ff7756] px-4 py-2.5 text-center font-medium text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a5f] focus:ring-offset-2 focus:ring-offset-[#1e1e1e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="absolute inset-0 h-full w-full scale-0 rounded-md bg-white/10 transition-all duration-300 group-hover:scale-100"></span>
              {isLoading ? <Spinner /> : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-[#b3b3b3]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#FF5733] hover:text-[#ff8a5f]">
              Login instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
