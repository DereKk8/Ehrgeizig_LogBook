'use client'

import Link from "next/link"
import { ArrowLeft, Edit, LogOut, Trash2 } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { handleLogout, deleteUserAccount } from '@/app/actions/auth'
import { useState } from 'react'

export default function UserSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleLogoutClick = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Clear remember_me_device field using server action
        await handleLogout(user.id)

        // Sign out from Supabase
        await supabase.auth.signOut()
        
        // Redirect to login page
        router.push('/login')
      }
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Delete the account using server action
        await deleteUserAccount(user.id)
        
        // Sign out from Supabase
        await supabase.auth.signOut()
        
        // Redirect to login page
        router.push('/login')
      }
    } catch (error) {
      console.error('Error during account deletion:', error)
      setIsDeleting(false)
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
              href="/user_settings/training_split_settings"
              className="inline-flex items-center rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f] focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Training Split
            </Link>
          </section>

          {/* Log Out Section */}
          <section className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">Account Access</h2>
            <p className="mb-4 text-[#b3b3b3]">Log out of your account on this device. This will clear your "Remember Me" preference.</p>
            <button
              type="button"
              onClick={handleLogoutClick}
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
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center rounded-md border border-red-500 bg-[#1e1e1e] px-4 py-2 text-red-500 transition-colors hover:bg-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </button>
          </section>
        </div>
      </main>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-red-500/20 bg-[#1e1e1e] p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-semibold text-red-500">Delete Account</h3>
            <p className="mb-6 text-[#b3b3b3]">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border border-[#404040] bg-[#1e1e1e] px-4 py-2 text-[#b3b3b3] transition-colors hover:bg-[#2d2d2d] hover:text-white"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
