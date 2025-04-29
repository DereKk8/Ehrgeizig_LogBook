'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, ChevronRight, Dumbbell, TrendingUp, Plus, Trophy, CheckCircle2, BarChart3, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface ExerciseSet {
  reps: number
  weight: number
}

interface Exercise {
  id: string
  name: string
  sets: ExerciseSet[]
  muscleGroup: string
}

interface Workout {
  id: string
  name: string
  date: string
  exercises: Exercise[]
  totalSets: number
  splitName?: string
  dayName?: string
  progression?: number
  previousWorkoutId?: string
}

// Color palette for muscle groups and progress bars - updated to match site aesthetic
const muscleColors: Record<string, {light: string, main: string, dark: string}> = {
  'chest': {light: '#512623', main: '#ff5733', dark: '#ffebe5'},
  'back': {light: '#332b25', main: '#e67e22', dark: '#ffecd9'},
  'legs': {light: '#243327', main: '#2ecc71', dark: '#e3fcec'},
  'shoulders': {light: '#36273d', main: '#9b59b6', dark: '#f4e5ff'},
  'arms': {light: '#26333d', main: '#3498db', dark: '#e1f0fa'},
  'core': {light: '#3d3626', main: '#f39c12', dark: '#fef2dd'},
  'cardio': {light: '#41263d', main: '#e74c3c', dark: '#fee5e2'},
  'NA': {light: '#2d2d2d', main: '#7f8c8d', dark: '#e0e0e0'}
}

function getProgressColor(progress: number): string {
  if (progress >= 90) return '#ff5733' // Site's primary orange
  if (progress >= 75) return '#ff7043' // Lighter orange
  if (progress >= 60) return '#ff9e80' // Pale orange
  if (progress >= 40) return '#ffb74d' // Amber
  if (progress >= 20) return '#ffd180' // Light amber
  return '#ffe0b2' // Very light amber
}

function formatDate(dateStr: string): string {
  // Example "2025-04-29" to "Today", "Yesterday" or "Apr 29"
  const today = new Date()
  const date = new Date(dateStr)
  
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

const MOCK_WORKOUTS: Workout[] = [
  {
    id: '1',
    name: 'Upper Body Power',
    date: '2025-04-29',
    splitName: 'PHAT',
    dayName: 'Day 1',
    totalSets: 14,
    progression: 86,
    previousWorkoutId: 'prev1',
    exercises: [
      {
        id: 'e1',
        name: 'Bench Press',
        muscleGroup: 'chest',
        sets: [
          { reps: 5, weight: 175 },
          { reps: 5, weight: 185 },
          { reps: 3, weight: 195 }
        ]
      },
      {
        id: 'e2',
        name: 'Pull-Ups',
        muscleGroup: 'back',
        sets: [
          { reps: 8, weight: 0 },
          { reps: 8, weight: 0 },
          { reps: 6, weight: 0 }
        ]
      },
      {
        id: 'e3',
        name: 'OHP',
        muscleGroup: 'shoulders',
        sets: [
          { reps: 5, weight: 95 },
          { reps: 5, weight: 95 },
          { reps: 5, weight: 95 }
        ]
      },
      {
        id: 'e4',
        name: 'Barbell Curl',
        muscleGroup: 'arms',
        sets: [
          { reps: 10, weight: 65 },
          { reps: 10, weight: 65 },
        ]
      },
      {
        id: 'e5',
        name: 'Skull Crushers',
        muscleGroup: 'arms',
        sets: [
          { reps: 12, weight: 55 },
          { reps: 10, weight: 55 },
          { reps: 8, weight: 55 }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Leg Day',
    date: '2025-04-28',
    splitName: 'PHAT',
    dayName: 'Day 2',
    totalSets: 8,
    progression: 72,
    previousWorkoutId: 'prev2',
    exercises: [
      {
        id: 'e4',
        name: 'Squats',
        muscleGroup: 'legs',
        sets: [
          { reps: 5, weight: 225 },
          { reps: 5, weight: 225 },
          { reps: 5, weight: 225 }
        ]
      },
      {
        id: 'e5',
        name: 'Romanian Deadlift',
        muscleGroup: 'legs',
        sets: [
          { reps: 8, weight: 185 },
          { reps: 8, weight: 185 },
          { reps: 8, weight: 185 }
        ]
      },
      {
        id: 'e6',
        name: 'Leg Press',
        muscleGroup: 'legs',
        sets: [
          { reps: 12, weight: 300 },
          { reps: 12, weight: 300 }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Hypertrophy Upper',
    date: '2025-04-26',
    splitName: 'PHAT',
    dayName: 'Day 3',
    totalSets: 10,
    progression: 94,
    previousWorkoutId: 'prev3',
    exercises: [
      {
        id: 'e6',
        name: 'Incline DB Press',
        muscleGroup: 'chest',
        sets: [
          { reps: 12, weight: 60 },
          { reps: 10, weight: 65 },
          { reps: 8, weight: 70 }
        ]
      },
      {
        id: 'e7',
        name: 'Cable Row',
        muscleGroup: 'back',
        sets: [
          { reps: 12, weight: 120 },
          { reps: 12, weight: 130 },
          { reps: 10, weight: 140 }
        ]
      },
      {
        id: 'e8',
        name: 'Lateral Raises',
        muscleGroup: 'shoulders',
        sets: [
          { reps: 15, weight: 20 },
          { reps: 15, weight: 20 },
          { reps: 12, weight: 20 },
          { reps: 12, weight: 20 }
        ]
      }
    ]
  }
]

export function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [summaryData, setSummaryData] = useState({
    totalWorkouts: 0,
    totalSets: 0,
    averageProgression: 0,
    mostFrequentMuscle: ''
  })
  
  useEffect(() => {
    // In a real implementation, this would fetch from Supabase
    setWorkouts(MOCK_WORKOUTS)
    
    // Calculate summary data
    const totalWorkouts = MOCK_WORKOUTS.length
    const totalSets = MOCK_WORKOUTS.reduce((sum, workout) => sum + workout.totalSets, 0)
    const avgProgression = MOCK_WORKOUTS.reduce((sum, workout) => sum + (workout.progression || 0), 0) / totalWorkouts
    
    // Find most frequent muscle group
    const muscleGroups: Record<string, number> = {}
    MOCK_WORKOUTS.forEach(workout => {
      workout.exercises.forEach(ex => {
        muscleGroups[ex.muscleGroup] = (muscleGroups[ex.muscleGroup] || 0) + 1
      })
    })
    
    let mostFrequent = ''
    let highestCount = 0
    Object.entries(muscleGroups).forEach(([muscle, count]) => {
      if (count > highestCount) {
        mostFrequent = muscle
        highestCount = count
      }
    })
    
    setSummaryData({
      totalWorkouts,
      totalSets,
      averageProgression: Math.round(avgProgression),
      mostFrequentMuscle: mostFrequent
    })
  }, [])

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

  return (
    <div className="rounded-lg border border-[#404040] bg-gradient-to-br from-[#1e1e1e] to-[#252525] p-4 md:p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Workouts</h2>
        <Link href="/user_settings/workout_history" className="flex items-center text-sm text-[#FF5733] hover:underline">
          See All <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {workouts.map((workout, index) => (
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
                    <h3 className="font-medium text-white">{workout.name}</h3>
                    <div className="flex items-center text-xs text-[#b3b3b3]">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(workout.date)}
                      {workout.splitName && (
                        <span className="ml-2 rounded-full bg-[#3a3a3a] px-2 py-0.5">
                          {workout.splitName}: {workout.dayName}
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

              {/* Exercise Tags - Updated styling */}
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
                <div className="p-2 bg-[#252525] rounded-lg text-center border border-[#353535]" 
                     style={{ 
                       background: `linear-gradient(to bottom, #252525, ${muscleColors[workout.exercises[0]?.muscleGroup || 'NA'].light})` 
                     }}>
                  <div className="text-xs text-[#b3b3b3] mb-1">Main Focus</div>
                  <div className="text-sm font-medium text-white capitalize">{workout.exercises[0]?.muscleGroup || 'NA'}</div>
                </div>
              </div>

              {/* Progression bar - Updated styling */}
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
                href={`/user_settings/workout_history?id=${workout.id}`}
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#2a2a2a] py-2 text-sm font-medium text-white hover:bg-[#333333] transition-colors border border-[#404040]"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Summary Section - Updated styling */}
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
          href="/user_settings/workout_history"
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