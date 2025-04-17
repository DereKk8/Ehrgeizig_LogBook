'use client'

import { useState, useEffect } from 'react'
import { getSplitDays } from '@/app/actions/workout'
import { loadWorkoutWithPrefilledSets } from '@/app/actions/workout'
import { ExerciseWithSets } from '@/app/actions/workout'
import { Clock, ChevronDown, Dumbbell, RotateCcw, ChevronUp } from 'lucide-react'
import { DayOfWeek, SplitDay } from '@/app/types/db'

interface WorkoutSummaryStepProps {
  splitId: string
  selectedDayName: string
  selectedDayIndex: number
  exercises: ExerciseWithSets[]
  onDayChanged: (dayId: string, dayName: string, dayIndex: number) => void
  onConfirm: () => void
  setError: (error: string | null) => void
}

export default function WorkoutSummaryStep({
  splitId,
  selectedDayName,
  selectedDayIndex,
  exercises,
  onDayChanged,
  onConfirm,
  setError
}: WorkoutSummaryStepProps) {
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false)
  const [splitDays, setSplitDays] = useState<SplitDay[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch split days for the dropdown
  useEffect(() => {
    async function fetchSplitDays() {
      try {
        const result = await getSplitDays(splitId)
        
        if (!result.success) {
          console.error('Error fetching split days:', result.error)
          return
        }
        
        // Filter out rest days
        const trainingDays = result.data ? result.data.filter((day: SplitDay) => !day.is_rest_day) : []
        setSplitDays(trainingDays)
      } catch (error) {
        console.error('Error in fetchSplitDays:', error)
      }
    }
    
    fetchSplitDays()
  }, [splitId])

  // Handle day selection from dropdown
  const handleDaySelection = async (day: SplitDay) => {
    if (day.day_of_week === selectedDayIndex) {
      setDayDropdownOpen(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
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

      {/* Exercises List */}
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold text-white border-b border-[#404040] pb-2">
          Exercise Plan
        </h3>
        
        {exercises.length > 0 ? (
          exercises.map((exercise, index) => (
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
          <div className="text-center py-8 text-[#b3b3b3]">
            <p>No exercises found for this workout day.</p>
          </div>
        )}
      </div>

      {/* Start Button - Moved to parent component for better control */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading || exercises.length === 0}
          className="inline-flex items-center justify-center rounded-md bg-[#FF5733] px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-[#e64a2e] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Dumbbell className="mr-2 h-5 w-5" />
          Start Workout
        </button>
        <p className="mt-2 text-xs text-[#b3b3b3]">
          Review your exercise plan before starting
        </p>
      </div>
    </div>
  )
}