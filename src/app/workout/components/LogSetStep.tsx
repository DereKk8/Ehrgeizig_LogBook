'use client'

import { useState, useEffect } from 'react'
import { Dumbbell, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Edit, X } from 'lucide-react'
import { ExerciseWithSets, LogSetData, logExerciseSets } from '@/app/actions/workout'
import { useUser } from '@/lib/hooks/useUser'

interface LogSetStepProps {
  splitDayId: string
  sessionId: string
  exercises: ExerciseWithSets[]
  onExerciseCompleted: (exerciseIndex: number) => void
  onAllExercisesCompleted: () => void
  setError: (error: string | null) => void
}

export default function LogSetStep({
  splitDayId,
  sessionId,
  exercises,
  onExerciseCompleted,
  onAllExercisesCompleted,
  setError
}: LogSetStepProps) {
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<number[]>([])
  const [setValues, setSetValues] = useState<{[key: number]: {reps: number, weight: number}[]}>({})
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [isRelogging, setIsRelogging] = useState<boolean>(false)

  const currentExercise = exercises[currentExerciseIndex]
  const { user } = useUser()

  // Initialize set values when component mounts
  useEffect(() => {
    // Initialize set values with defaults from all exercises
    const initialValues: {[key: number]: {reps: number, weight: number}[]} = {}
    exercises.forEach((exercise, index) => {
      initialValues[index] = exercise.sets.map(set => ({
        reps: set.reps,
        weight: set.weight
      }))
    })
    setSetValues(initialValues)
  }, [exercises])

  // Handle input change for reps and weight
  const handleInputChange = (setIndex: number, field: 'reps' | 'weight', value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value)
    
    if (isNaN(numValue)) return
    
    setSetValues(prev => {
      const exerciseSets = [...(prev[currentExerciseIndex] || [])]
      exerciseSets[setIndex] = {
        ...exerciseSets[setIndex],
        [field]: numValue
      }
      
      return {
        ...prev,
        [currentExerciseIndex]: exerciseSets
      }
    })
  }

  // Handle re-logging a completed exercise
  const handleRelogExercise = () => {
    setIsRelogging(true)
  }

  // Cancel re-logging and restore original values
  const handleCancelRelog = () => {
    // Reset to the original values for this exercise
    const originalExercise = exercises[currentExerciseIndex]
    const originalSets = originalExercise.sets.map(set => ({
      reps: set.reps,
      weight: set.weight
    }))
    
    setSetValues(prev => ({
      ...prev,
      [currentExerciseIndex]: originalSets
    }))
    
    setIsRelogging(false)
    
    setToast({
      message: 'Changes cancelled',
      type: 'success'
    })

    // Clear toast after 1.5 seconds
    const toastTimeout = 1500
    
    setTimeout(() => setToast(null), toastTimeout)
  }

  // Submit sets for the current exercise
  const handleLogSets = async () => {
    if (!sessionId) {
      setError('No active session')
      return
    }
    
    const exercise = exercises[currentExerciseIndex]
    const exerciseSets = setValues[currentExerciseIndex] || []
    
    // Validate inputs - all sets must have valid reps
    const isValid = exerciseSets.every(set => set.reps > 0)
    
    if (!isValid) {
      setToast({
        message: 'All sets must have at least 1 rep',
        type: 'error'
      })
      setTimeout(() => setToast(null), 3000)
      return
    }
    
    setIsSaving(true)
    
    try {
      const setsData: LogSetData = {
        sessionId,
        exerciseId: exercise.id,
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
      
      // Mark exercise as completed if not already
      if (!completedExercises.includes(currentExerciseIndex)) {
        setCompletedExercises(prev => [...prev, currentExerciseIndex])
        
        // Call the parent callback to mark the exercise as completed
        onExerciseCompleted(currentExerciseIndex)
      }
      
      const messageText = isRelogging ? 'Sets updated successfully!' : 'Sets logged successfully!'
      
      setToast({
        message: messageText,
        type: 'success'
      })
      
      // If we're re-logging, exit re-logging mode but don't advance to next exercise
      if (isRelogging) {
        setIsRelogging(false)
        
        setTimeout(() => {
          setToast(null)
        }, 1500)
      } else {
        // If all exercises are completed, call the parent callback
        if (completedExercises.length === exercises.length - 1) {
          setTimeout(() => {
            onAllExercisesCompleted()
          }, 1500)
        }
        
        setTimeout(() => {
          setToast(null)
          // Move to next exercise if there is one
          if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1)
          }
        }, 1500)
      }
      
    } catch (error) {
      console.error('Error logging sets:', error)
      setError('An error occurred while logging sets')
    } finally {
      setIsSaving(false)
    }
  }

  // Navigate to previous exercise
  const goToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
    }
  }

  // Navigate to next exercise
  const goToNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FF5733] border-r-transparent" />
          <p className="mt-4 text-[#b3b3b3]">Loading workout session...</p>
        </div>
      </div>
    )
  }

  if (!currentExercise) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-[#FF5733]" />
          <p className="mt-4 text-white">No exercises found</p>
        </div>
      </div>
    )
  }

  const isExerciseCompleted = completedExercises.includes(currentExerciseIndex)
  const exerciseSets = setValues[currentExerciseIndex] || currentExercise.sets.map(set => ({
    reps: set.reps,
    weight: set.weight
  }))

  return (
    <div className="space-y-6">
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
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      
      {/* Exercise Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FF5733]/10 text-[#FF5733] mb-4">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          {currentExercise.name}
        </h2>
        <div className="mt-2 flex items-center justify-center text-sm text-[#b3b3b3]">
          <span className="px-2 py-1 rounded-full bg-[#404040]/50 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {currentExercise.restTimeSec}s rest
          </span>
        </div>
      </div>

      {/* Exercise Note */}
      {currentExercise.note && (
        <div className="rounded-lg border border-[#FF5733]/20 bg-[#FF5733]/5 p-4 text-white">
          <p className="text-sm">
            <span className="font-medium">Note:</span> {currentExercise.note}
          </p>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-[#b3b3b3]">
        <span>Exercise</span>
        <div className="flex items-center space-x-1">
          {exercises.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 w-2 rounded-full ${
                index === currentExerciseIndex 
                  ? 'bg-[#FF5733]' 
                  : completedExercises.includes(index)
                    ? 'bg-green-500' 
                    : 'bg-[#404040]'
              }`}
            />
          ))}
        </div>
        <span>{currentExerciseIndex + 1} of {exercises.length}</span>
      </div>

      {/* Sets Form */}
      <div className="rounded-lg border border-[#404040] bg-[#2d2d2d] p-4">
        <div className="mb-4 flex items-center justify-between pb-2 border-b border-[#404040]">
          <h3 className="font-medium text-white">Log Your Sets</h3>
          <span className="text-sm text-[#b3b3b3]">{currentExercise.defaultSets} sets</span>
        </div>
        
        <div className="space-y-3 mb-4">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-2 text-sm text-[#b3b3b3] font-medium">
            <div className="col-span-2">Set</div>
            <div className="col-span-5 text-center">Reps</div>
            <div className="col-span-5 text-center flex items-center justify-center">
              <span>Weight</span>
              <span className="ml-2 text-xs text-[#b3b3b3]">(kg/lbs)</span>
            </div>
          </div>
          
          {/* Set Rows */}
          {Array.from({ length: currentExercise.defaultSets }).map((_, setIndex) => {
            const currentSet = exerciseSets[setIndex] || { reps: 0, weight: 0 }
            
            return (
              <div 
                key={setIndex} 
                className={`grid grid-cols-12 gap-4 items-center p-3 rounded ${
                  isExerciseCompleted 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-[#1e1e1e]'
                }`}
              >
                <div className="col-span-2 flex items-center justify-center">
                  <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium ${
                    isExerciseCompleted 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-[#FF5733]/20 text-[#FF5733]'
                  }`}>
                    {setIndex + 1}
                  </div>
                </div>
                <div className="col-span-5">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={currentSet.reps || ''}
                    onChange={(e) => handleInputChange(setIndex, 'reps', e.target.value)}
                    disabled={isExerciseCompleted && !isRelogging}
                    className={`w-full rounded bg-[#404040] px-3 py-2 text-center text-white placeholder-[#666666] ${
                      isExerciseCompleted && !isRelogging
                        ? 'opacity-75 cursor-not-allowed border border-green-500/20' 
                        : ''
                    }`}
                    placeholder="Reps"
                  />
                </div>
                <div className="col-span-5 ">
                  <div className="flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={currentSet.weight || ''}
                      onChange={(e) => handleInputChange(setIndex, 'weight', e.target.value)}
                      disabled={isExerciseCompleted && !isRelogging}
                      className={`w-full rounded bg-[#404040] px-3 py-2 text-center text-white placeholder-[#666666] ${
                        isExerciseCompleted && !isRelogging
                          ? 'opacity-75 cursor-not-allowed border border-green-500/20' 
                          : ''
                      }`}
                      placeholder="Weight"
                    />
                    <span className="ml-2 text-xs text-[#b3b3b3] whitespace-nowrap"></span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Log Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleLogSets}
            disabled={isSaving || (isExerciseCompleted && !isRelogging)}
            className={`w-full rounded-lg py-3 font-medium transition-colors duration-200 flex items-center justify-center ${
              isExerciseCompleted && !isRelogging
                ? 'bg-green-500 text-white cursor-not-allowed'
                : isRelogging
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-[#FF5733] text-white hover:bg-[#e64a2e]'
            }`}
          >
            {isSaving ? (
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
            ) : isExerciseCompleted && !isRelogging ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Sets Logged
              </>
            ) : isRelogging ? (
              'Update Sets'
            ) : (
              'Log All Sets'
            )}
          </button>
        </div>

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
              <p>Re-logging Mode: You can now edit previously logged sets for this exercise. Make your changes and tap "Update Sets" to save them.</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={goToPreviousExercise}
          disabled={currentExerciseIndex === 0}
          className="flex items-center space-x-2 rounded-md bg-[#2d2d2d] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Previous</span>
        </button>
        
        <div className="text-sm text-[#b3b3b3]">
          {completedExercises.length} of {exercises.length} exercises completed
        </div>
        
        <button
          type="button"
          onClick={goToNextExercise}
          disabled={currentExerciseIndex === exercises.length - 1}
          className="flex items-center space-x-2 rounded-md bg-[#2d2d2d] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Complete Exercise Button */}
      {isExerciseCompleted && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={currentExerciseIndex < exercises.length - 1 ? goToNextExercise : onAllExercisesCompleted}
            className="inline-flex items-center rounded-lg bg-green-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-600"
          >
            {currentExerciseIndex < exercises.length - 1 ? (
              <>Next Exercise</>
            ) : (
              <>Complete Workout</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}