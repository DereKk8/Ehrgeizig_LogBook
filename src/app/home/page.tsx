'use client'

import Link from "next/link"
import { Activity, Home, User, Dumbbell, ArrowRight, Clock, Flame, TrendingUp } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { RecentWorkouts } from '@/components/RecentWorkouts'


export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [showMotivation, setShowMotivation] = useState(false)
  
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
    
    // Show motivation message after a short delay for better UX
    const timer = setTimeout(() => {
      setShowMotivation(true)
    }, 600)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#121212]">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#404040] bg-[#1e1e1e] px-4 shadow-sm md:px-6">
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
        <main className="flex-1 p-4 pt-6 md:p-6">
          {/* Welcome message */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white md:text-3xl">Welcome, {userName || 'Athlete'}</h1>
            <p className="mt-2 text-[#b3b3b3]">Track your fitness journey</p>
            
            {/* Animated motivation text */}
            {showMotivation && (
              <div className="mt-4 animate-fade-in">
                <p className="text-sm font-medium text-[#FF5733]">
                  Today is a great day for a workout! 
                </p>
              </div>
            )}
          </div>

          {/* Dashboard content */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* Start Workout Button - Enhanced */}
            <div className="relative rounded-lg border border-[#404040] bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className={`absolute inset-0 rounded-lg bg-[#FF5733] opacity-5 transition-opacity duration-300 ${isButtonHovered ? 'opacity-10' : ''}`}></div>
              
              <div className="relative z-10 mb-4 flex items-center">
                <div className="mr-3 rounded-full bg-[#FF5733]/20 p-2">
                  <Dumbbell className="h-6 w-6 text-[#FF5733]" />
                </div>
                <h2 className="text-lg font-semibold text-white">Ready to Train?</h2>
              </div>
              
              <div className="relative z-10 mb-5 flex items-center space-x-4 rounded-md bg-[#252525] p-3">
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-[#b3b3b3]" />
                  <span className="text-sm text-white">Today &apos;s Training</span>
                </div>
                <div className="flex flex-1 justify-end">
                  <span className="rounded-full bg-[#FF5733]/20 px-3 py-1 text-xs font-medium text-[#FF5733]">Available</span>
                </div>
              </div>
              
              <Link
                href="/workout"
                className="relative z-10 inline-flex w-full items-center justify-center rounded-md bg-[#FF5733] px-4 py-4 text-lg font-medium text-white transition-all duration-300 hover:bg-[#ff7755] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f] focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
              >
                <div className="flex items-center">
                  <Dumbbell className={`mr-2 h-6 w-6 transition-transform duration-300 ${isButtonHovered ? 'scale-110' : ''}`} />
                  <span>Start Workout</span>
                </div>
                <ArrowRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${isButtonHovered ? 'translate-x-1' : ''}`} />
              </Link>
              
              <div className="relative z-10 mt-4 flex justify-around">
                <div className="flex flex-col items-center">
                  <Flame className="h-5 w-5 text-[#FF5733]" />
                  <span className="mt-1 text-xs text-[#b3b3b3]">Get Stronger</span>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="h-5 w-5 text-[#FF5733]" />
                  <span className="mt-1 text-xs text-[#b3b3b3]">Track Progress</span>
                </div>
              </div>
            </div>

            {/* Recent Workouts - Using the new component */}
            <RecentWorkouts />
          </div>
        </main>
      </div>
    </div>
  )
}
