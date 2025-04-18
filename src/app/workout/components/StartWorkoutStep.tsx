'use client'

import { CheckCircle, Dumbbell, ArrowRight } from 'lucide-react'
import { ExerciseWithSets } from '@/app/actions/workout'
import { useRouter } from 'next/navigation'

interface StartWorkoutStepProps {
  splitName: string
  dayName: string
  exercises: ExerciseWithSets[]
}

export default function StartWorkoutStep({ splitName, dayName, exercises }: StartWorkoutStepProps) {
  const router = useRouter()
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="animate-bounce mb-6">
        <div className="h-20 w-20 rounded-full bg-[#FF5733]/20 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-[#FF5733]" />
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Workout Ready to Start!</h2>
        <p className="text-[#b3b3b3]">
          Your <span className="text-white font-medium">{splitName} - {dayName}</span> workout has been prepared
          with {exercises.length} exercises.
        </p>
      </div>
      
      <div className="mt-8 space-y-3 w-full max-w-sm">
        <div className="rounded-lg border border-[#404040]/50 bg-[#2d2d2d]/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Dumbbell className="h-5 w-5 text-[#FF5733] mr-2" />
              <span className="text-sm font-medium text-white">Exercise Count</span>
            </div>
            <span className="text-sm font-medium text-white">{exercises.length}</span>
          </div>
        </div>
        
        <div className="rounded-lg border border-[#404040]/50 bg-[#2d2d2d]/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-[#FF5733] mr-2" />
              <span className="text-sm font-medium text-white">Set Count</span>
            </div>
            <span className="text-sm font-medium text-white">
              {exercises.reduce((total, ex) => total + ex.sets.length, 0)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-10 w-full max-w-sm">
        <p className="text-center text-sm text-[#b3b3b3] mb-4">
          Your workout is now ready to begin. You can track your progress and log your sets during the session.
        </p>
        
        <p className="text-center text-xs text-[#b3b3b3]">
          Note: This is a preview implementation. The actual workout tracking functionality will be implemented in the future.
        </p>
      </div>
    </div>
  )
}