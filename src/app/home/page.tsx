'use client'

import Link from "next/link"
import { Activity, Home, User, Settings } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface Workout {
  id: string
  name: string
  date: string
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('user_name')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUserName(profile.user_name)
        }
      }
    }

    fetchUserData()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#121212]">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#404040] bg-[#1e1e1e] px-4 shadow-sm md:px-6">
        <div className="flex items-center">
          <Link href="/home" className="flex items-center">
            <Activity className="h-6 w-6 text-[#FF5733]" />
            <span className="ml-2 text-xl font-bold text-white">Ehrgeizig</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <aside className="fixed bottom-0 z-10 w-full border-t border-[#404040] bg-[#1e1e1e] md:static md:w-64 md:border-r md:border-t-0">
          <div className="hidden flex-col gap-2 p-4 md:flex">
            <div className="mb-4 px-4 py-2 text-sm font-medium uppercase text-[#b3b3b3]">Dashboard</div>
            <Link href="/home" className="flex items-center rounded-md bg-[#2d2d2d] px-4 py-2 text-[#FF5733]">
              <Home className="mr-2 h-5 w-5" />
              Overview
            </Link>
            <Link href="/user_settings" className="flex items-center rounded-md px-4 py-2 text-white hover:bg-[#2d2d2d]">
              <User className="mr-2 h-5 w-5" />
              Profile & Settings
            </Link>
          </div>

          {/* Mobile bottom navigation */}
          <div className="flex justify-around md:hidden">
            <Link href="/home" className="flex flex-1 flex-col items-center py-2 text-[#FF5733]">
              <Home className="h-6 w-6" />
              <span className="text-xs">Home</span>
            </Link>
            <Link
              href="/user_settings"
              className="flex flex-1 flex-col items-center py-2 text-[#b3b3b3] hover:text-[#FF5733]"
            >
              <User className="h-6 w-6" />
              <span className="text-xs">Profile & Settings</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Welcome message */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white md:text-3xl">Welcome, {userName || 'Athlete'}</h1>
            <p className="mt-2 text-[#b3b3b3]">Track your fitness journey</p>
          </div>

          {/* Dashboard content */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* Start Workout Button */}
            <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Ready to Train?</h2>
              <Link
                href="/workout"
                className="inline-flex w-full items-center justify-center rounded-md bg-[#FF5733] px-4 py-3 text-white transition-colors hover:bg-[#ff8a5f] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f] focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
              >
                Start Workout
              </Link>
            </div>

            {/* Recent Workouts */}
            <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Recent Workouts</h2>
              <div className="space-y-4">
                {recentWorkouts.length > 0 ? (
                  recentWorkouts.map((workout) => (
                    <div key={workout.id} className="rounded-md bg-[#2d2d2d] p-4">
                      <h3 className="font-medium text-white">{workout.name}</h3>
                      <p className="text-sm text-[#b3b3b3]">{workout.date}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md bg-[#2d2d2d] p-4 text-center text-[#b3b3b3]">
                    No recent workouts. Start your first workout today!
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
