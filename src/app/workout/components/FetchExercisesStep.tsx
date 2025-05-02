'use client'

import { useState, useEffect } from 'react'
import { loadWorkoutWithPrefilledSets } from '@/app/actions/workout'
import { ExerciseWithSets } from '@/app/actions/workout'
import { Loader2, Dumbbell } from 'lucide-react'

interface FetchExercisesStepProps {
  splitDayId: string
  splitDayName: string
  onExercisesLoaded: (exercises: ExerciseWithSets[]) => void
  setError: (error: string | null) => void
}

export default function FetchExercisesStep({ 
  splitDayId, 
  splitDayName, 
  onExercisesLoaded, 
  setError 
}: FetchExercisesStepProps) {
  const [, setLoading] = useState(true)
  
  // Fetch exercises and auto-advance to the next step
  useEffect(() => {
    async function loadWorkoutData() {
      setLoading(true)
      try {
        const result = await loadWorkoutWithPrefilledSets(splitDayId)
        
        if (!result.success) {
          setError(result.error || 'Failed to load workout exercises')
          return
        }
        
        if (!result.data || result.data.length === 0) {
          setError('No exercises found for this workout day')
          return
        }
        
        setError(null)
        
        // Adding a small delay for UX purposes
        setTimeout(() => {
          onExercisesLoaded(result.data)
        }, 1500)
      } catch (error) {
        console.error('Error in loadWorkoutData:', error)
        setError('An error occurred while loading workout exercises')
      }
    }
    
    loadWorkoutData()
  }, [splitDayId, onExercisesLoaded, setError])

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="animate-pulse flex flex-col items-center">
        <Dumbbell className="h-16 w-16 text-[#FF5733] animate-bounce" />
      </div>
      
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold text-white">Preparing Your Workout</h2>
        <p className="text-[#b3b3b3]">
          Loading exercises for <span className="text-white font-medium">{splitDayName}</span>
        </p>
      </div>
      
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF5733]" />
        <div className="mt-4 bg-[#2d2d2d] rounded-full overflow-hidden w-64 h-2">
          <div className="h-full bg-[#FF5733] animate-pulse"></div>
        </div>
        <p className="mt-2 text-sm text-[#b3b3b3]">
          Fetching your previous records...
        </p>
      </div>
      
      <div className="text-center max-w-md text-sm text-[#b3b3b3]">
        <p>We&apos;re pre-filling your workout with your most recent weights and reps for each exercise.</p>
      </div>
    </div>
  )
}