'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Spinner from '@/components/ui/spinner'
import { validateEmail, validatePassword } from '@/lib/utils/validation'
import { updateRememberMeDevice } from '@/app/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

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

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors((prev) => ({ ...prev, submit: 'Invalid email or password' }))
        } else {
          setErrors((prev) => ({ ...prev, submit: error.message }))
        }
        return
      }

      if (data.user) {
        // Update remember me preference in the database
        try {
          await updateRememberMeDevice(data.user.id, rememberMe)
        } catch (error) {
          console.error('Error updating remember me preference:', error)
          // Don't block the login flow if this fails
        }

        // Set session persistence based on remember me preference
        if (rememberMe) {
          await supabase.auth.setSession({
            access_token: data.session?.access_token || '',
            refresh_token: data.session?.refresh_token || '',
          })
        }

        router.push('/home')
      }
    } catch (error) {
      console.error('Login error:', error)
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
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-[#b3b3b3]">Log in to track your fitness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[#404040] text-[#FF5733] focus:ring-[#ff8a5f]"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-[#b3b3b3]">
              Remember me on this device
            </label>
          </div>

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
            {isLoading ? <Spinner /> : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[#b3b3b3]">Don't have an account? </span>
          <Link href="/signup" className="font-medium text-[#2E86AB] hover:text-[#FF5733]">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
