'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ClipboardList, Download, History, Plus, Edit2, Loader2, Dumbbell } from "lucide-react"
import { getUserSplits } from "@/app/actions/workout"
import { Split } from "@/app/types/db"

export default function TrainingSplitSettingsPage() {
  const [splits, setSplits] = useState<Split[]>([])
  const [isLoadingSplits, setIsLoadingSplits] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's splits on component mount
  useEffect(() => {
    async function fetchSplits() {
      setIsLoadingSplits(true)
      try {
        const result = await getUserSplits()
        
        if (!result.success) {
          setError(result.error || 'Failed to load training splits')
          setSplits([])
        } else {
          setError(null)
          // Make sure we're handling possible undefined data
          setSplits(result.data || [])
        }
      } catch (error) {
        console.error('Error in fetchSplits:', error)
        setError('An error occurred while loading your splits')
        setSplits([])
      } finally {
        setIsLoadingSplits(false)
      }
    }
    
    fetchSplits()
  }, [])

  // Create split edit URL strings properly to avoid params warning
  const getEditSplitUrl = (splitId: string) => {
    return `/user_settings/training_split_settings/set_split/${splitId}`;
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header with back navigation */}
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[#404040] bg-[#1e1e1e] px-4 shadow-sm md:px-6">
        <Link 
          href="/user_settings" 
          className="group flex items-center rounded-md px-3 py-2 text-[#b3b3b3] transition-colors hover:bg-[#2d2d2d] hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="ml-2 text-sm font-medium">Back to User Settings</span>
        </Link>
      </header>

      <main className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Training Split Settings</h1>
          <p className="mt-2 text-[#b3b3b3]">Manage your workout schedule and training history</p>
        </div>

        {/* Training Split Management Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Training Splits</h2>
            <Link
              href="/user_settings/training_split_settings/set_split"
              className="inline-flex items-center rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f]"
            >
              <Plus className="mr-1 h-4 w-4" />
              Create New Split
            </Link>
          </div>

          {isLoadingSplits ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF5733]" />
              <p className="mt-4 text-[#b3b3b3]">Loading your training splits...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500">
              {error}
            </div>
          ) : splits.length === 0 ? (
            <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 text-center">
              <Dumbbell className="h-12 w-12 mx-auto text-[#b3b3b3] mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Training Splits Yet</h3>
              <p className="text-[#b3b3b3] mb-6">
                Create your first training split to get started with tracking your workouts.
              </p>
              <Link
                href="/user_settings/training_split_settings/set_split"
                className="inline-flex items-center rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f]"
              >
                <Plus className="mr-1 h-4 w-4" />
                Create First Split
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {splits.map((split) => (
                <div 
                  key={split.id}
                  className="rounded-lg border border-[#404040] bg-[#2d2d2d] p-6 transition-all duration-300 hover:border-[#FF5733]/50 hover:shadow-md hover:shadow-[#FF5733]/10"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733] mr-4">
                      <Dumbbell className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{split.name}</h3>
                      <p className="text-sm text-[#b3b3b3]">
                        Created: {new Date(split.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <Link
                      href={getEditSplitUrl(split.id)}
                      className="flex-1 inline-flex items-center justify-center rounded-md border border-[#FF5733] bg-transparent px-4 py-2 text-[#FF5733] transition-colors hover:bg-[#FF5733]/10"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Split
                    </Link>
                    <Link
                      href={`/workout?splitId=${split.id}`}
                      className="flex-1 inline-flex items-center justify-center rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f]"
                    >
                      <Dumbbell className="mr-2 h-4 w-4" />
                      Start Workout
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-white mb-6">Training Tools</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Update Workout Split Logs */}
          <Link
            href="/user_settings/training_split_settings/workout_split_logs"
            className="group relative overflow-hidden rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-[0_0_0_1px_rgba(255,87,51,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5733] hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF5733]/20">
              <ClipboardList className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-[#FF5733]">
              Update Workout Split Logs
            </h2>
            <p className="mb-4 text-[#b3b3b3]">
              Edit and manage your existing workout logs and make adjustments as needed.
            </p>
            <span className="inline-flex items-center text-[#FF5733]">
              Update logs
              <ArrowLeft className="ml-1 h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          {/* View Workout History */}
          <Link
            href="/user_settings/training_split_settings/workout_history"
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-[0_0_0_1px_rgba(255,87,51,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5733] hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF5733]/20">
              <History className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-[#FF5733]">
              View Workout History
            </h2>
            <p className="mb-4 text-[#b3b3b3]">
              Review your past workouts, track your progress, and analyze your performance over time.
            </p>
            <span className="inline-flex items-center text-[#FF5733]">
              View history
              <ArrowLeft className="ml-1 h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          {/* Download Workout History */}
          <Link
            href="/user_settings/training_split_settings/download_history"
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-[0_0_0_1px_rgba(255,87,51,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5733] hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF5733]/20">
              <Download className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-[#FF5733]">
              Download Workout History
            </h2>
            <p className="mb-4 text-[#b3b3b3]">
              Export your workout data in CSV format for external analysis or record-keeping.
            </p>
            <span className="inline-flex items-center text-[#FF5733]">
              <Download className="mr-1 h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
              Download CSV
            </span>
          </Link>
        </div>
      </main>
    </div>
  )
}
