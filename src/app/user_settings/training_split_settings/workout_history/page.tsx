'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, BarChart2, History } from 'lucide-react'
import { getWorkoutHistoryForWeek, WorkoutDetail } from '@/app/actions/workout-history'
import WorkoutHistoryList from './WorkoutHistoryList'
import WeekSelector from './WeekSelector'

export default function WorkoutHistoryPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [daysPerWeek] = useState(7) // We're using a fixed value of 7 days per week
  const [workouts, setWorkouts] = useState<WorkoutDetail[]>([])
  const [weekRange, setWeekRange] = useState({ startDate: '', endDate: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkoutHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getWorkoutHistoryForWeek(weekOffset, daysPerWeek)
      
      if (result.success && result.data) {
        setWorkouts(result.data.workouts)
        setWeekRange(result.data.weekRange)
      } else {
        setError(result.error || 'Failed to fetch workout history')
      }
    } catch {
      setError('An error occurred while fetching workout data')
    } finally {
      setLoading(false)
    }
  }, [weekOffset, daysPerWeek])

  useEffect(() => {
    fetchWorkoutHistory()
  }, [fetchWorkoutHistory])

  const handleWeekChange = (newOffset: number) => {
    setWeekOffset(newOffset)
  }

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-6 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <Link 
              href="/user_settings/training_split_settings" 
              className="inline-flex items-center text-[#FF5733] hover:text-[#ff8a5f] transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Settings
            </Link>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
            <History className="h-7 w-7 mr-2 text-[#FF5733]" />
            Workout History
          </h1>
          
          <p className="text-gray-400 mt-2">
            Review your workout history and track your progress over time.
          </p>
        </div>

        {/* Week Selector */}
        <WeekSelector 
          weekOffset={weekOffset} 
          onWeekChange={handleWeekChange} 
        />

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5733]"></div>
          </div>
        ) : error ? (
          <div className="bg-[#2a2a2a] border border-[#404040] p-4 rounded-lg text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <WorkoutHistoryList 
            workouts={workouts} 
            weekRange={weekRange} 
          />
        )}

        {/* Empty State */}
        {!loading && !error && workouts.length === 0 && (
          <div className="bg-[#1e1e1e] border border-[#404040] rounded-lg shadow-md p-6 text-center mt-8">
            <BarChart2 className="h-16 w-16 mx-auto text-[#505050] mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Workout History</h2>
            <p className="text-gray-400 mb-6">
              You don&apos;t have any recorded workouts for this week. Complete a workout to start tracking your progress.
            </p>
            <Link 
              href="/workout" 
              className="inline-flex items-center px-4 py-2 bg-[#FF5733] text-white rounded-md hover:bg-[#ff8a5f] transition-colors"
            >
              Start a Workout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}