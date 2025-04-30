'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, ChevronRight, Dumbbell, TrendingUp, Plus, Trophy, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { getRecentWorkouts, RecentWorkout, WorkoutSummary } from '@/app/actions/workout'

// Color palette for muscle groups and progress bars
const muscleColors: Record<string, {light: string, main: string, dark: string}> = {
  'chest': {light: '#512623', main: '#ff5733', dark: '#ffebe5'},
  'back': {light: '#332b25', main: '#e67e22', dark: '#ffecd9'},
  'legs': {light: '#243327', main: '#2ecc71', dark: '#e3fcec'},
  'shoulders': {light: '#36273d', main: '#9b59b6', dark: '#f4e5ff'},
  'arms': {light: '#26333d', main: '#3498db', dark: '#e1f0fa'},
  'core': {light: '#3d3626', main: '#f39c12', dark: '#fef2dd'},
  'NA': {light: '#2d2d2d', main: '#7f8c8d', dark: '#e0e0e0'}
}

function formatDate(dateStr: string): string {
  // Example "2025-04-29" to "Today", "Yesterday" or "Apr 29"
  const today = new Date()
  const date = new Date(dateStr)

  console.log('Formatted date:', date.toDateString(), today.toDateString())
  
  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  
  // Check if it's yesterday
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  // Otherwise return formatted date
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

export function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<RecentWorkout[]>([])
  const [summaryData, setSummaryData] = useState({
    totalWorkouts: 0,
    totalSets: 0,
    averageProgression: 0,
    mostFrequentMuscle: 'NA'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchRecentWorkouts() {
      try {
        const result = await getRecentWorkouts(3) // Fetch 3 most recent workouts
        
        if (result.success && result.data) {
          setWorkouts(result.data.workouts)
          
          // Calculate summary data
          const { summary } = result.data
          
          // Find most frequent muscle group
          let mostFrequentMuscle = 'NA'
          let highestCount = 0
          
          Object.entries(summary.muscleGroupCounts).forEach(([muscle, count]) => {
            if (count > highestCount) {
              mostFrequentMuscle = muscle
              highestCount = count
            }
          })
          
          // Calculate fake progression - this would be calculated from real data in a future implementation
          const avgProgression = workouts.length > 0 ? 
            Math.floor(70 + Math.random() * 20) : 0 // Random progression between 70-90%
            
          setSummaryData({
            totalWorkouts: summary.totalWorkouts,
            totalSets: summary.totalSets,
            averageProgression: avgProgression,
            mostFrequentMuscle: mostFrequentMuscle
          })
        } else {
          setError(result.error || 'Failed to fetch workouts')
        }
      } catch (err) {
        console.error('Error fetching recent workouts:', err)
        setError('An error occurred while fetching workout data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecentWorkouts()
  }, [])

  if (loading) {
    return (
      <div className="rounded-lg border border-[#404040] bg-gradient-to-br from-[#1e1e1e] to-[#252525] p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Workouts</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FF5733] border-r-transparent" />
          <p className="mt-4 text-[#b3b3b3]">Loading your workout history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[#404040] bg-gradient-to-br from-[#1e1e1e] to-[#252525] p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Workouts</h2>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="rounded-lg border border-[#404040] bg-gradient-to-br from-[#1e1e1e] to-[#252525] p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Workouts</h2>
        <div className="flex flex-col items-center justify-center rounded-md bg-[#2a2a2a] p-8 text-center">
          <Dumbbell className="mb-3 h-10 w-10 text-[#b3b3b3]" />
          <p className="mb-4 text-[#b3b3b3]">No workout history yet</p>
          <Link 
            href="/workout" 
            className="inline-flex items-center rounded-full bg-[#FF5733] px-5 py-2 text-sm font-medium text-white"
          >
            <Plus className="mr-1 h-4 w-4" />
            Start Your First Workout
          </Link>
        </div>
      </div>
    )
  }

  // Calculate a progression value for each workout (for display purposes only)
  // In a real implementation this would be based on weight/rep improvements
  const workoutsWithProgression = workouts.map((workout, index) => ({
    ...workout,
    progression: 85 - (index * 7) + Math.floor(Math.random() * 10) // Fake progression for UI
  }))

  return (
    <div className="rounded-lg border border-[#404040] bg-gradient-to-br from-[#1e1e1e] to-[#252525] p-4 md:p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Workouts</h2>
        <Link href="/user_settings/training_split_settings/workout_split_logs" className="flex items-center text-sm text-[#FF5733] hover:underline">
          See All <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {workoutsWithProgression.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="overflow-hidden rounded-xl border border-[#404040]"
          >
            <div className="bg-gradient-to-r from-[#2d2d2d] to-[#333333] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5733]/20">
                    {index === 0 ? (
                      <Trophy className="h-5 w-5 text-[#FFD700]" />
                    ) : (
                      <Dumbbell className="h-5 w-5 text-[#FF5733]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{workout.dayName}</h3>
                    <div className="flex items-center text-xs text-[#b3b3b3]">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(workout.date)}
                      {workout.splitName && (
                        <span className="ml-2 rounded-full bg-[#3a3a3a] px-2 py-0.5">
                          {workout.splitName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {workout.progression !== undefined && (
                  <div className="text-right">
                    <div className="text-xs mb-1 font-medium text-[#FF5733]">
                      {workout.progression}% PROGRESS
                    </div>
                    <div className="w-16 h-2 bg-[#353535] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${workout.progression}%`,
                          background: `linear-gradient(to right, #FF5733aa, #FF5733)` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Exercise Tags */}
              <div className="mb-3 flex flex-wrap gap-1">
                {workout.exercises.slice(0, 4).map((exercise) => (
                  <span 
                    key={exercise.id}
                    className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                    style={{ 
                      backgroundColor: muscleColors[exercise.muscleGroup]?.light || '#424242',
                      color: muscleColors[exercise.muscleGroup]?.dark || '#e0e0e0',
                      border: `1px solid ${muscleColors[exercise.muscleGroup]?.main || '#505050'}`,
                    }}
                  >
                    {exercise.name}
                  </span>
                ))}
                {workout.exercises.length > 4 && (
                  <span className="inline-flex items-center rounded-full bg-[#3a3a3a] px-2 py-1 text-xs text-white border border-[#505050]">
                    +{workout.exercises.length - 4} more
                  </span>
                )}
              </div>

              {/* Workout Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 bg-[#252525] rounded-lg text-center border border-[#353535]">
                  <div className="text-xs text-[#b3b3b3] mb-1">Exercises</div>
                  <div className="text-sm font-medium text-white">{workout.exercises.length}</div>
                </div>
                <div className="p-2 bg-[#252525] rounded-lg text-center border border-[#353535]">
                  <div className="text-xs text-[#b3b3b3] mb-1">Total Sets</div>
                  <div className="text-sm font-medium text-white">{workout.totalSets}</div>
                </div>
                
                {/* Main Focus - Calculated from muscle groups */}
                {(() => {
                  // Count sets per muscle group for this workout
                  const muscleGroupCounts: Record<string, number> = {}
                  workout.exercises.forEach(ex => {
                    muscleGroupCounts[ex.muscleGroup] = (muscleGroupCounts[ex.muscleGroup] || 0) + ex.sets.length
                  })
                  
                  // Find most trained muscle group
                  let mainMuscleGroup = 'NA'
                  let maxSets = 0
                  Object.entries(muscleGroupCounts).forEach(([muscle, sets]) => {
                    if (sets > maxSets && muscle !== 'NA') {
                      mainMuscleGroup = muscle
                      maxSets = sets
                    }
                  })
                  
                  return (
                    <div className="p-2 bg-[#252525] rounded-lg text-center border border-[#353535]" 
                         style={{ 
                           background: `linear-gradient(to bottom, #252525, ${muscleColors[mainMuscleGroup]?.light || muscleColors['NA'].light})` 
                         }}>
                      <div className="text-xs text-[#b3b3b3] mb-1">Main Focus</div>
                      <div className="text-sm font-medium text-white capitalize">{mainMuscleGroup}</div>
                    </div>
                  )
                })()}
              </div>

              {/* Progression bar */}
              {workout.progression !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-[#b3b3b3]">Overall Progress</div>
                    <div className="text-xs font-medium text-[#FF5733]">
                      {workout.progression}%
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[#353535] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${workout.progression}%`,
                        background: `linear-gradient(to right, #FF5733aa, #FF5733)` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* View Details Button */}
              <Link 
                href={`/user_settings/training_split_settings/workout_split_logs?sessionId=${workout.id}`}
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#2a2a2a] py-2 text-sm font-medium text-white hover:bg-[#333333] transition-colors border border-[#404040]"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Summary Section */}
      <div className="mt-6 p-4 rounded-xl border border-[#404040] bg-gradient-to-br from-[#252525] to-[#2a2a2a]">
        <h3 className="text-sm font-medium text-[#b3b3b3] uppercase tracking-wider mb-3">Workout Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[#1e1e1e]/60 flex flex-col border border-[#353535]">
            <span className="text-xs text-[#b3b3b3] mb-1">Total Workouts</span>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-white">{summaryData.totalWorkouts}</span>
              <CheckCircle2 className="h-4 w-4 ml-2 text-[#FF5733]" />
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-[#1e1e1e]/60 flex flex-col border border-[#353535]">
            <span className="text-xs text-[#b3b3b3] mb-1">Total Sets</span>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-white">{summaryData.totalSets}</span>
              <Dumbbell className="h-4 w-4 ml-2 text-[#FF5733]" />
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-[#1e1e1e]/60 flex flex-col border border-[#353535]">
            <span className="text-xs text-[#b3b3b3] mb-1">Avg Progression</span>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-white">{summaryData.averageProgression}%</span>
              <TrendingUp className="h-4 w-4 ml-2 text-[#FF5733]" />
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-[#1e1e1e]/60 flex flex-col border border-[#353535]">
            <span className="text-xs text-[#b3b3b3] mb-1">Top Muscle</span>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-white capitalize">{summaryData.mostFrequentMuscle}</span>
              <div 
                className="h-4 w-4 ml-2 rounded-full" 
                style={{ backgroundColor: muscleColors[summaryData.mostFrequentMuscle]?.main || '#6c757d' }}
              ></div>
            </div>
          </div>
        </div>
        
        <Link
          href="/user_settings/training_split_settings/workout_split_logs"
          className="mt-4 flex w-full items-center justify-center rounded-lg border border-[#FF5733]/30 bg-[#1e1e1e] py-2.5 text-sm font-medium text-[#FF5733] hover:bg-[#FF5733]/10 transition-colors"
        >
          View Complete History
          <ArrowUpRight className="ml-1.5 h-4 w-4" />
        </Link>
      </div>
      
      <div className="mt-5 flex justify-center">
        <Link
          href="/workout"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#FF5733] to-[#ff7755] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-[#ff7755] hover:to-[#ff8a5f] hover:shadow-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          Start New Workout
        </Link>
      </div>
    </div>
  )
}