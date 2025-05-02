'use client'

import { useState } from 'react'
import {X, CheckCircle } from 'lucide-react'
import { ExerciseWithSets, LogSetData, logExerciseSets } from '@/app/actions/workout'
import ReLogExerciseMode from './ReLogExerciseMode'

interface ReLogHandlerProps {
  sessionId: string
  currentExercise: ExerciseWithSets
  currentExerciseIndex: number
  isExerciseCompleted: boolean
  exerciseSets: { reps: number, weight: number }[]
  setExerciseSets: (index: number, sets: { reps: number, weight: number }[]) => void
  onSetsUpdated: (exerciseIndex: number) => void
  setError: (error: string | null) => void
  setIsReloggingActive?: (isRelogging: boolean) => void
}

export default function ReLogHandler({
  sessionId,
  currentExercise,
  currentExerciseIndex,
  isExerciseCompleted,
  exerciseSets,
  setExerciseSets,
  onSetsUpdated,
  setError,
  setIsReloggingActive
}: ReLogHandlerProps) {
  const [isRelogging, setIsRelogging] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  // Handle re-logging a completed exercise
  const handleRelogExercise = () => {
    setIsRelogging(true)
    if (setIsReloggingActive) {
      setIsReloggingActive(true)
    }
  }

  // Cancel re-logging and restore original values
  const handleCancelRelog = () => {
    // Reset to the original values for this exercise
    const originalSets = currentExercise.sets.map(set => ({
      reps: set.reps,
      weight: set.weight
    }))
    
    setExerciseSets(currentExerciseIndex, originalSets)
    setIsRelogging(false)
    if (setIsReloggingActive) {
      setIsReloggingActive(false)
    }
    
    showToast('Changes cancelled', 'success')
  }

  // Helper function to show toast messages
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    
    // Clear toast after 1.5 seconds for success, 3 seconds for error
    const timeout = type === 'success' ? 1500 : 3000
    setTimeout(() => setToast(null), timeout)
  }

  // Submit sets for the current exercise
  const handleLogSets = async () => {
    if (!sessionId) {
      setError('No active session')
      return
    }
    
    // Validate inputs - all sets must have valid reps
    const isValid = exerciseSets.every(set => set.reps > 0)
    
    if (!isValid) {
      showToast('All sets must have at least 1 rep', 'error')
      return
    }
    
    setIsSaving(true)
    
    try {
      const setsData: LogSetData = {
        sessionId,
        exerciseId: currentExercise.id,
        sets: exerciseSets.map((set, i) => ({
          setNumber: i + 1,
          reps: set.reps,
          weight: set.weight
        }))
      }
      
      const result = await logExerciseSets(setsData)
      
      if (!result.success) {
        setError(result.error || 'Failed to log sets')
        return
      }
      
      showToast('Sets updated successfully!', 'success')
      
      // Notify parent that sets were updated
      onSetsUpdated(currentExerciseIndex)
      
      // Exit re-logging mode
      setIsRelogging(false)
      if (setIsReloggingActive) {
        setIsReloggingActive(false)
      }
    } catch (error) {
      console.error('Error updating sets:', error)
      setError('An error occurred while updating sets')
      showToast('Failed to update sets', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      
      {/* Log Button (only shown in re-logging mode) */}
      {isRelogging && (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleLogSets}
            disabled={isSaving}
            className="w-full rounded-lg py-3 font-medium transition-colors duration-200 flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
          >
            {isSaving ? (
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
            ) : (
              'Update Sets'
            )}
          </button>
        </div>
      )}

      {/* Re-logging UI elements */}
      <ReLogExerciseMode
        isRelogging={isRelogging}
        sessionId={sessionId}
        currentExercise={currentExercise}
        currentExerciseIndex={currentExerciseIndex}
        exerciseSets={exerciseSets}
        handleRelogExercise={handleRelogExercise}
        handleCancelRelog={handleCancelRelog}
        isExerciseCompleted={isExerciseCompleted}
        setToast={setToast}
        setError={setError}
      />
    </>
  )
}