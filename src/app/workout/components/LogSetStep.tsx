'use client'

import { useState, useEffect } from 'react'
import { Dumbbell, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
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
      
      // Mark exercise as completed
      setCompletedExercises(prev => [...prev, currentExerciseIndex])
      
      setToast({
        message: 'Sets logged successfully!',
        type: 'success'
      })
      
      // Call the parent callback to mark the exercise as completed
      onExerciseCompleted(currentExerciseIndex)
      
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
          <div className="grid grid-cols-12 gap-2 px-2 text-sm text-[#b3b3b3] font-medium">
            <div className="col-span-3">Set</div>
            <div className="col-span-4 text-center">Reps</div>
            <div className="col-span-5 text-center">Weight</div>
          </div>
          
          {/* Set Rows */}
          {Array.from({ length: currentExercise.defaultSets }).map((_, setIndex) => {
            const currentSet = exerciseSets[setIndex] || { reps: 0, weight: 0 }
            
            return (
              <div 
                key={setIndex} 
                className={`grid grid-cols-12 gap-2 items-center p-2 rounded ${
                  isExerciseCompleted 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-[#1e1e1e]'
                }`}
              >
                <div className="col-span-3 flex items-center">
                  <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium ${
                    isExerciseCompleted 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-[#FF5733]/20 text-[#FF5733]'
                  }`}>
                    {setIndex + 1}
                  </div>
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={currentSet.reps || ''}
                    onChange={(e) => handleInputChange(setIndex, 'reps', e.target.value)}
                    disabled={isExerciseCompleted}
                    className={`w-full rounded bg-[#404040] px-3 py-2 text-center text-white placeholder-[#666666] ${
                      isExerciseCompleted 
                        ? 'opacity-75 cursor-not-allowed border border-green-500/20' 
                        : ''
                    }`}
                    placeholder="Reps"
                  />
                </div>
                <div className="col-span-5">
                  <div className="flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={currentSet.weight || ''}
                      onChange={(e) => handleInputChange(setIndex, 'weight', e.target.value)}
                      disabled={isExerciseCompleted}
                      className={`w-full rounded bg-[#404040] px-3 py-2 text-center text-white placeholder-[#666666] ${
                        isExerciseCompleted 
                          ? 'opacity-75 cursor-not-allowed border border-green-500/20' 
                          : ''
                      }`}
                      placeholder="Weight"
                    />
                    <span className="ml-1 text-sm text-[#b3b3b3]">kg/lbs</span>
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
            disabled={isSaving || isExerciseCompleted}
            className={`w-full rounded-lg py-3 font-medium transition-colors duration-200 flex items-center justify-center ${
              isExerciseCompleted
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-[#FF5733] text-white hover:bg-[#e64a2e]'
            }`}
          >
            {isSaving ? (
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
            ) : isExerciseCompleted ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Sets Logged
              </>
            ) : (
              'Log All Sets'
            )}
          </button>
        </div>
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