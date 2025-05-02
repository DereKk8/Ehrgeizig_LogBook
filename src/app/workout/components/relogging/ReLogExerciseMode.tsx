'use client'

import { Edit, X } from 'lucide-react'
import { ExerciseWithSets} from '@/app/actions/workout'

interface ReLogExerciseModeProps {
  isRelogging: boolean
  sessionId: string
  currentExercise: ExerciseWithSets
  currentExerciseIndex: number
  exerciseSets: { reps: number, weight: number }[]
  handleRelogExercise: () => void
  handleCancelRelog: () => void
  isExerciseCompleted: boolean
  setToast: (toast: { message: string, type: 'success' | 'error' } | null) => void
  setError: (error: string | null) => void
}

export default function ReLogExerciseMode({
  isRelogging,
  handleRelogExercise,
  handleCancelRelog,
  isExerciseCompleted
}: ReLogExerciseModeProps) {
  
  return (
    <>
      {/* Re-log button */}
      {isExerciseCompleted && !isRelogging && (
        <div className="mt-4 flex items-center justify-center space-x-4">
          <button
            type="button"
            onClick={handleRelogExercise}
            className="flex items-center space-x-2 rounded-md border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#333333]"
          >
            <Edit className="h-5 w-5 mr-1" />
            <span>Re-log Exercise</span>
          </button>
        </div>
      )}

      {/* Re-logging mode controls */}
      {isRelogging && (
        <div className="mt-4 flex items-center justify-center space-x-4">
          <button
            type="button"
            onClick={handleCancelRelog}
            className="flex items-center space-x-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-400 transition-colors duration-200 hover:bg-red-500/20"
          >
            <X className="h-5 w-5 mr-1" />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {/* Re-logging mode indicator */}
      {isRelogging && (
        <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-400">
          <div className="flex items-center">
            <Edit className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>Re-logging Mode: You can now edit previously logged sets for this exercise. Make your changes and tap &quot;Update Sets&quot; to save them.</p>
          </div>
        </div>
      )}
    </>
  )
}