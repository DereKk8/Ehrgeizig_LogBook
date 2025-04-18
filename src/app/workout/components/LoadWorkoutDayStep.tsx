'use client'

import { useState, useEffect } from 'react'
import { getSplitDays } from '@/app/actions/workout'
import { CalendarDays, Loader2 } from 'lucide-react'
import { SplitDay, DayOfWeek } from '@/app/types/db'

interface LoadWorkoutDayStepProps {
  splitId: string
  splitName: string
  onDaySelected: (dayId: string, dayName: string, dayIndex: number) => void
  setError: (error: string | null) => void
}

export default function LoadWorkoutDayStep({ 
  splitId, 
  splitName, 
  onDaySelected, 
  setError 
}: LoadWorkoutDayStepProps) {
  const [splitDays, setSplitDays] = useState<SplitDay[]>([])
  const [loading, setLoading] = useState(true)
  const [autoSelectingDay, setAutoSelectingDay] = useState(true)

  // Fetch split days and auto-select today's workout
  useEffect(() => {
    async function fetchSplitDays() {
      setLoading(true)
      try {
        const result = await getSplitDays(splitId)
        
        if (!result.success) {
          setError(result.error || 'Failed to load workout days')
          setSplitDays([])
          return
        }
        
        if (!result.data || result.data.length === 0) {
          setError('No workout days found for this split')
          setSplitDays([])
          return
        }
        
        setError(null)
        setSplitDays(result.data)
        
        // Auto-select today's workout
        const today = new Date().getDay() // 0 = Sunday, 6 = Saturday
        const todaysSplitDay = result.data.find((day: SplitDay) => day.day_of_week === today)
        
        if (todaysSplitDay) {
          // Found a workout for today
          if (todaysSplitDay.is_rest_day) {
            // It's a rest day - don't auto-select
            setAutoSelectingDay(false)
          } else {
            // Auto-select today's workout
            setTimeout(() => {
              onDaySelected(todaysSplitDay.id, todaysSplitDay.name, todaysSplitDay.day_of_week)
            }, 1500) // Add a small delay for UX purposes
          }
        } else {
          setAutoSelectingDay(false)
        }
      } catch (error) {
        console.error('Error in fetchSplitDays:', error)
        setError('An error occurred while loading workout days')
        setSplitDays([])
        setAutoSelectingDay(false)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSplitDays()
  }, [splitId, onDaySelected, setError])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF5733]" />
        <p className="mt-4 text-[#b3b3b3]">
          {autoSelectingDay ? 'Loading today\'s workout...' : 'Loading workout days...'}
        </p>
      </div>
    )
  }

  // Helper function to get day name from index
  const getDayName = (index: number): string => {
    return Object.values(DayOfWeek)[index] as string
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FF5733]/10 text-[#FF5733] mb-4">
          <CalendarDays className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Select Workout Day</h2>
        <p className="mt-3 text-[#b3b3b3]">
          Choose which workout day you want to perform from "{splitName}"
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {splitDays.map((day) => (
          <button
            key={day.id}
            onClick={() => onDaySelected(day.id, day.name, day.day_of_week)}
            disabled={day.is_rest_day}
            className={`
              flex flex-col rounded-lg border p-5
              transition-all duration-300
              ${
                day.is_rest_day
                  ? 'border-[#404040]/30 bg-[#2d2d2d]/50 cursor-not-allowed opacity-60'
                  : 'border-[#404040] bg-[#2d2d2d] hover:border-[#FF5733]/50 hover:shadow-md hover:shadow-[#FF5733]/10'
              }
              ${day.day_of_week === new Date().getDay() ? 'ring-2 ring-[#FF5733]/30' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`
                  h-10 w-10 flex items-center justify-center rounded-full 
                  ${day.day_of_week === new Date().getDay() 
                    ? 'bg-[#FF5733]/20 text-[#FF5733]' 
                    : 'bg-[#404040]/20 text-white'}
                  mr-3
                `}>
                  <span className="font-medium">{getDayName(day.day_of_week).substring(0, 3)}</span>
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="font-semibold text-white">{day.name}</h3>
                  <span className="text-xs text-[#b3b3b3]">
                    {getDayName(day.day_of_week)}
                    {day.day_of_week === new Date().getDay() && " (Today)"}
                  </span>
                </div>
              </div>
              
              {day.is_rest_day && (
                <span className="text-sm font-medium text-[#b3b3b3] bg-[#404040]/30 rounded-full px-3 py-1">
                  Rest Day
                </span>
              )}
              
              {day.day_of_week === new Date().getDay() && !day.is_rest_day && (
                <span className="text-sm font-medium text-[#FF5733] bg-[#FF5733]/10 rounded-full px-3 py-1">
                  Today
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {splitDays.every(day => day.is_rest_day) && (
        <div className="mt-4 rounded-lg bg-[#2d2d2d] p-4 text-center text-[#b3b3b3]">
          <p>All days are set as rest days in this split. Please choose a different split or update your training schedule.</p>
        </div>
      )}
    </div>
  )
}