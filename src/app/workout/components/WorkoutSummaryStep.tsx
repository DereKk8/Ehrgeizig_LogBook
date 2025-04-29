'use client'

import { useState, useEffect } from 'react'
import { getSplitDays, loadWorkoutWithPrefilledSets } from '@/app/actions/workout'
import { ExerciseWithSets } from '@/app/actions/workout'
import { Clock, ChevronDown, Dumbbell, RotateCcw, ChevronUp, Home } from 'lucide-react'
import { DayOfWeek, SplitDay } from '@/app/types/db'
import Link from 'next/link'

interface WorkoutSummaryStepProps {
  splitId: string
  selectedDayName: string
  selectedDayIndex: number
  exercises: ExerciseWithSets[]
  onDayChanged: (dayId: string, dayName: string, dayIndex: number) => void
  onConfirm: () => void
  setError: (error: string | null) => void
  safeNavigate?: (url: string) => void
}

export default function WorkoutSummaryStep({
  splitId,
  selectedDayName,
  selectedDayIndex,
  exercises,
  onDayChanged,
  onConfirm,
  setError,
  safeNavigate
}: WorkoutSummaryStepProps) {
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false)
  const [splitDays, setSplitDays] = useState<SplitDay[]>([])
  const [loading, setLoading] = useState(false)
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseWithSets[]>(exercises)

  // Fetch split days for the dropdown and load initial exercises
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      try {
        // Step 1: Get split days for the dropdown
        const splitDaysResult = await getSplitDays(splitId)
        
        if (!splitDaysResult.success) {
          console.error('Error fetching split days:', splitDaysResult.error)
          setError(`Failed to load workout days: ${splitDaysResult.error}`)
          setLoading(false)
          return
        }
        
        // Filter out rest days
        const trainingDays = splitDaysResult.data ? splitDaysResult.data.filter((day: SplitDay) => !day.is_rest_day) : []
        setSplitDays(trainingDays)
        
        // Step 2: Find the selected day from the days we just loaded
        const selectedDay = trainingDays.find(day => day.day_of_week === selectedDayIndex)
        
        if (!selectedDay) {
          console.log('No day found with index:', selectedDayIndex)
          setLoading(false)
          return
        }
        
        // Step 3: Fetch exercises with sets for the selected day
        console.log(`Fetching exercises for day ${selectedDay.name} (ID: ${selectedDay.id})`)
        const exercisesResult = await loadWorkoutWithPrefilledSets(selectedDay.id)
        
        if (!exercisesResult.success) {
          console.error('Error loading workout with prefilled sets:', exercisesResult.error)
          setError(`Failed to load exercises: ${exercisesResult.error}`)
          setLoading(false)
          return
        }
        
        console.log('Successfully loaded exercises with sets:', exercisesResult.data)
        
        if (exercisesResult.data && exercisesResult.data.length > 0) {
          // Update the exercises with the ones that have prefilled sets
          setWorkoutExercises(exercisesResult.data)
        } else {
          console.log('No exercises found for this day')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load workout data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [splitId, selectedDayIndex, setError])

  // Handle day selection from dropdown
  const handleDaySelection = async (day: SplitDay) => {
    if (day.day_of_week === selectedDayIndex) {
      setDayDropdownOpen(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log(`Changing workout day to ${day.name} (day_of_week: ${day.day_of_week})`)
      onDayChanged(day.id, day.name, day.day_of_week)
    } catch (error) {
      console.error('Error changing day:', error)
      setError('Failed to change workout day')
    } finally {
      setDayDropdownOpen(false)
      setLoading(false)
    }
  }

  // Helper function to get day name from index
  const getDayName = (index: number): string => {
    return Object.values(DayOfWeek)[index] as string
  }
  
  // Handle navigation back to home
  const handleHomeNavigation = () => {
    if (safeNavigate) {
      safeNavigate('/home');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FF5733]/10 text-[#FF5733] mb-4">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Workout Summary</h2>
        <p className="mt-3 text-[#b3b3b3]">
          Review your workout before starting
        </p>
      </div>

      {/* Workout Day Selector */}
      <div className="relative">
        <button
          onClick={() => setDayDropdownOpen(!dayDropdownOpen)}
          disabled={loading || splitDays.length <= 1}
          className="w-full flex items-center justify-between rounded-lg border border-[#404040] bg-[#2d2d2d] p-4 text-white transition-all duration-200 hover:border-[#FF5733]/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#FF5733]/20 text-[#FF5733] mr-3">
              <span className="font-medium">{getDayName(selectedDayIndex).substring(0, 3)}</span>
            </div>
            <div>
              <h3 className="font-semibold">{selectedDayName}</h3>
              <p className="text-xs text-[#b3b3b3]">
                {getDayName(selectedDayIndex)}
                {selectedDayIndex === new Date().getDay() && " (Today)"}
              </p>
            </div>
          </div>
          {splitDays.length > 1 && (
            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${dayDropdownOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        {/* Day selection dropdown */}
        {dayDropdownOpen && (
          <div className="absolute z-10 mt-2 w-full rounded-lg border border-[#404040] bg-[#1e1e1e] shadow-lg">
            <div className="p-2">
              {splitDays.map((day) => (
                <button
                  key={day.id}
                  onClick={() => handleDaySelection(day)}
                  disabled={day.day_of_week === selectedDayIndex}
                  className={`
                    w-full text-left flex items-center p-3 rounded-md my-1
                    ${day.day_of_week === selectedDayIndex 
                      ? 'bg-[#FF5733]/10 text-[#FF5733]' 
                      : 'hover:bg-[#2d2d2d] text-white'}
                  `}
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#404040]/20 mr-3">
                    <span className="text-sm">{getDayName(day.day_of_week).substring(0, 3)}</span>
                  </div>
                  <span>{day.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FF5733] border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2 text-sm text-[#b3b3b3]">Loading exercises...</p>
        </div>
      )}

      {/* Exercises List */}
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold text-white border-b border-[#404040] pb-2">
          Exercise Plan
        </h3>
        
        {!loading && workoutExercises.length > 0 ? (
          workoutExercises.map((exercise, index) => (
            <div 
              key={exercise.id}
              className="rounded-lg border border-[#404040] bg-[#2d2d2d] p-4 transition-all duration-200 hover:border-[#FF5733]/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-[#FF5733]/10 text-[#FF5733] mr-3">
                    <span className="font-medium">{index + 1}</span>
                  </div>
                  <h4 className="font-medium text-white">{exercise.name}</h4>
                </div>
                <span className="text-sm px-2 py-1 rounded-full bg-[#404040]/50 text-[#b3b3b3]">
                  {exercise.defaultSets} sets
                </span>
              </div>
              
              {/* Display muscle groups */}
              {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {exercise.muscleGroups.map((group: string) => (
                    <span 
                      key={group} 
                      className="px-2 py-1 text-xs rounded-full bg-[#FF5733]/10 text-[#FF5733] border border-[#FF5733]/20"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-2 space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div 
                    key={setIndex} 
                    className="flex items-center justify-between rounded px-3 py-2 bg-[#1e1e1e]"
                  >
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-[#FF5733] mr-2">Set {set.setNumber}</span>
                      <div className="flex items-center text-sm">
                        <span className="text-white">{set.reps || '-'} reps</span>
                        <span className="mx-1 text-[#666666]">×</span>
                        <span className="text-white">{set.weight || '-'} </span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-[#b3b3b3]">
                      {set.reps > 0 || set.weight > 0 ? (
                        <div className="flex items-center">
                          <RotateCcw className="h-3 w-3 mr-1" />
                          <span>Previous</span>
                        </div>
                      ) : (
                        <span>New</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {exercise.note && (
                <div className="mt-3 text-sm text-[#b3b3b3] italic border-t border-[#404040]/50 pt-2">
                  {exercise.note}
                </div>
              )}

              <div className="flex items-center mt-3 text-xs text-[#b3b3b3]">
                <Clock className="h-3 w-3 mr-1" />
                <span>{exercise.restTimeSec}s rest between sets</span>
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div className="text-center py-8 text-[#b3b3b3]">
              <p>No exercises found for this workout day.</p>
            </div>
          )
        )}
      </div>

      {/* Action Buttons - Updated to include Back to Home button */}
      <div className="mt-6 text-center flex flex-col space-y-4">
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading || workoutExercises.length === 0}
          className="inline-flex items-center justify-center rounded-md bg-[#FF5733] px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-[#e64a2e] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Dumbbell className="mr-2 h-5 w-5" />
          Start Workout
        </button>
        
        <button
          onClick={handleHomeNavigation}
          className="inline-flex items-center justify-center rounded-md bg-[#404040] px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-[#505050]"
        >
          <Home className="mr-2 h-5 w-5" />
          Back to Home
        </button>
        
        <p className="mt-2 text-xs text-[#b3b3b3]">
          Review your exercise plan before starting
        </p>
      </div>
    </div>
  )
}