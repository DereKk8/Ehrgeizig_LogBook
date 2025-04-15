'use client'

import Link from "next/link"
import { ArrowLeft, Edit, LogOut, Trash2 } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UserSettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header with back navigation */}
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[#404040] bg-[#1e1e1e] px-4 shadow-sm md:px-6">
        <Link 
          href="/home" 
          className="group flex items-center rounded-md px-3 py-2 text-[#b3b3b3] transition-colors hover:bg-[#2d2d2d] hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="ml-2 text-sm font-medium">Back to Home</span>
        </Link>
      </header>

      <main className="mx-auto max-w-2xl p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white md:text-3xl">User Settings</h1>
          <p className="mt-2 text-[#b3b3b3]">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Training Split Section */}
          <section className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">Training Split</h2>
            <p className="mb-4 text-[#b3b3b3]">Customize your weekly workout schedule and exercise preferences.</p>
            <Link
              href="/user-settings/training-split-settings"
              className="inline-flex items-center rounded-md border border-[#2E86AB] bg-[#1e1e1e] px-4 py-2 text-[#2E86AB] transition-colors hover:bg-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Training Split
            </Link>
          </section>

          {/* Log Out Section */}
          <section className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">Account Access</h2>
            <p className="mb-4 text-[#b3b3b3]">Log out of your account on this device.</p>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f] focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </button>
          </section>

          {/* Delete Account Section */}
          <section className="rounded-lg border border-red-500/20 bg-[#1e1e1e] p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-red-500">Danger Zone</h2>
            <p className="mb-2 text-[#b3b3b3]">Permanently delete your account and all associated data.</p>
            <p className="mb-4 text-sm text-red-500">
              Warning: This action cannot be undone. All your data will be permanently removed.
            </p>
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-red-500 bg-[#1e1e1e] px-4 py-2 text-red-500 transition-colors hover:bg-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}
