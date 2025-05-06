'use client'

import { useState, useEffect } from 'react'
import { Dumbbell, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, X, Plus, Minus, Save, Settings } from 'lucide-react'
import { ExerciseWithSets, LogSetData, logExerciseSets, updateExerciseDetails,} from '@/app/actions/workout'
import ReLogHandler from './relogging/ReLogHandler'

interface LogSetStepProps {
  splitDayId: string
  sessionId: string
  exercises: ExerciseWithSets[]
  onExerciseCompleted: (exerciseIndex: number) => void
  onAllExercisesCompleted: () => void
  setError: (error: string | null) => void
  onExerciseUpdated?: (updatedExercise: ExerciseWithSets, index: number) => void
}

export default function LogSetStep({
  sessionId,
  exercises,
  onExerciseCompleted,
  onAllExercisesCompleted,
  setError,
  onExerciseUpdated
}: LogSetStepProps) {
  const [loading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingExercise, setIsUpdatingExercise] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<number[]>([])
  const [setValues, setSetValues] = useState<{[key: number]: {reps: number, weight: number}[]}>({})
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState<boolean>(false)
  const [exerciseFormValues, setExerciseFormValues] = useState({
    name: '',
    defaultSets: 0,
    restTimeSec: 0,
    note: ''
  })
  const [isEditingExercise, setIsEditingExercise] = useState<boolean>(false)
  const [isReloggingActive, setIsReloggingActive] = useState<boolean>(false)

  const currentExercise = exercises[currentExerciseIndex]

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
  
  // Initialize exercise form values when current exercise changes
  useEffect(() => {
    if (currentExercise) {
      setExerciseFormValues({
        name: currentExercise.name,
        defaultSets: currentExercise.defaultSets,
        restTimeSec: currentExercise.restTimeSec,
        note: currentExercise.note || ''
      })
    }
  }, [currentExercise, currentExerciseIndex])

  // Handle exercise form input change
  const handleExerciseFormChange = (field: string, value: string | number) => {
    setExerciseFormValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Toggle exercise edit mode
  const toggleEditExercise = () => {
    setIsEditingExercise(!isEditingExercise)
  }

  // Save exercise changes
  const handleSaveExerciseChanges = async () => {
    setIsUpdatingExercise(true)
    
    try {
      // Create an updated set of sets if the number of sets has changed
      const currentSets = setValues[currentExerciseIndex] || currentExercise.sets.map(set => ({
        reps: set.reps,
        weight: set.weight
      }));
      let updatedSets = [...currentSets]
      const currentSetsCount = currentSets.length
      
      // If we're increasing the number of sets
      if (exerciseFormValues.defaultSets > currentSetsCount) {
        const additionalSets = Array.from(
          { length: exerciseFormValues.defaultSets - currentSetsCount },
          () => ({
            reps: 0,
            weight: 0
          })
        )
        updatedSets = [...updatedSets, ...additionalSets]
      } 
      // If we're decreasing the number of sets, truncate the array
      else if (exerciseFormValues.defaultSets < currentSetsCount) {
        updatedSets = updatedSets.slice(0, exerciseFormValues.defaultSets)
      }
      
      // Update exercise details in the database
      const result = await updateExerciseDetails({
        exerciseId: currentExercise.id,
        name: exerciseFormValues.name,
        defaultSets: exerciseFormValues.defaultSets,
        restTimeSec: exerciseFormValues.restTimeSec,
        note: exerciseFormValues.note
      })
      
      if (!result.success) {
        setError(result.error || 'Failed to update exercise')
        return
      }
      
      // If sets need logging due to count change and we have an active session
      if (sessionId && exerciseFormValues.defaultSets !== currentSetsCount) {
        const setsData: LogSetData = {
          sessionId,
          exerciseId: currentExercise.id,
          sets: updatedSets.map((set, i) => ({
            setNumber: i + 1,
            reps: set.reps,
            weight: set.weight
          }))
        }
        
        await logExerciseSets(setsData)
      }
      
      // Update local state
      const updatedExercise: ExerciseWithSets = {
        ...currentExercise,
        name: exerciseFormValues.name,
        defaultSets: exerciseFormValues.defaultSets,
        restTimeSec: exerciseFormValues.restTimeSec,
        note: exerciseFormValues.note,
        sets: updatedSets.map((set, i) => ({
          setNumber: i + 1,
          reps: set.reps,
          weight: set.weight
        }))
      }
      
      // Update parent state if callback provided
      if (onExerciseUpdated) {
        onExerciseUpdated(updatedExercise, currentExerciseIndex)
      }
      
      setToast({
        message: 'Exercise updated successfully!',
        type: 'success'
      })
      
      // Exit edit mode
      setIsEditingExercise(false)
      
      // Clear toast after 1.5 seconds
      setTimeout(() => setToast(null), 1500)
    } catch {
      setError('An error occurred while updating the exercise')
      
      setToast({
        message: 'Failed to update exercise',
        type: 'error'
      })
      
      setTimeout(() => setToast(null), 3000)
    } finally {
      setIsUpdatingExercise(false)
    }
  }

  // Cancel exercise edit and reset form values
  const handleCancelExerciseEdit = () => {
    // Reset form values to original
    setExerciseFormValues({
      name: currentExercise.name,
      defaultSets: currentExercise.defaultSets,
      restTimeSec: currentExercise.restTimeSec,
      note: currentExercise.note || ''
    })
    
    // Exit edit mode
    setIsEditingExercise(false)
  }

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
      
      // Mark exercise as completed if not already
      if (!completedExercises.includes(currentExerciseIndex)) {
        setCompletedExercises(prev => [...prev, currentExerciseIndex])
        
        // Call the parent callback to mark the exercise as completed
        onExerciseCompleted(currentExerciseIndex)
      }
      
      const messageText = 'Sets logged successfully!'
      
      setToast({
        message: messageText,
        type: 'success'
      })
      
      // If all exercises are completed, show the completion confirmation
      if (completedExercises.length === exercises.length - 1) {
        setTimeout(() => {
          setToast(null)
          setShowCompletionConfirmation(true)
        }, 1500)
      } else {
        setTimeout(() => {
          setToast(null)
          // Move to next exercise if there is one
          if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1)
          }
        }, 1500)
      }
      
    } catch {
      setError('An error occurred while logging sets')
    } finally {
      setIsSaving(false)
    }
  }

  // Set exercise sets for re-logging
  const setExerciseSets = (index: number, sets: { reps: number, weight: number }[]) => {
    setSetValues(prev => ({
      ...prev,
      [index]: sets
    }))
  }

  // Handle sets updated from re-logging
  const handleSetsUpdated = (exerciseIndex: number) => {
    // If not already marked as completed, mark it
    if (!completedExercises.includes(exerciseIndex)) {
      setCompletedExercises(prev => [...prev, exerciseIndex])
      onExerciseCompleted(exerciseIndex)
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

  // Handle workout completion
  const handleWorkoutCompletion = () => {
    onAllExercisesCompleted()
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

  if (showCompletionConfirmation) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 text-green-500 mb-2 animate-bounce">
          <CheckCircle className="h-10 w-10" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Workout Complete!</h2>
          <p className="text-[#b3b3b3]">
            You&apos;ve successfully logged all exercises for this workout.
          </p>
        </div>
        
        <div className="bg-[#2d2d2d] rounded-lg p-6 max-w-md w-full">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">Workout Summary</h3>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="bg-[#1e1e1e] rounded-lg p-3 flex flex-col items-center">
                  <span className="text-[#FF5733] text-xl font-bold">{exercises.length}</span>
                  <span className="text-[#b3b3b3]">Exercises</span>
                </div>
                <div className="bg-[#1e1e1e] rounded-lg p-3 flex flex-col items-center">
                  <span className="text-[#FF5733] text-xl font-bold">
                    {exercises.reduce((total, ex) => total + ex.defaultSets, 0)}
                  </span>
                  <span className="text-[#b3b3b3]">Sets</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-[#404040] pt-4 mt-4">
              <p className="text-center text-sm text-[#b3b3b3] mb-4">
                Your workout has been saved. You can view your workout history anytime.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
          <button
            type="button"
            onClick={() => setShowCompletionConfirmation(false)}
            className="flex items-center rounded-lg border border-[#404040] bg-[#2d2d2d] px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-[#333333]"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Return to Workout
          </button>
          
          <button
            type="button"
            onClick={handleWorkoutCompletion}
            className="inline-flex items-center rounded-lg bg-green-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-600"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Finish Workout
          </button>
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
        
        {/* Exercise editing button */}
        <div className="relative">
          {!isEditingExercise ? (
            <>
              <h2 className="text-2xl font-bold text-white">
                {currentExercise.name}
              </h2>
              <button 
                onClick={toggleEditExercise} 
                className="absolute top-1 right-0 text-[#b3b3b3] hover:text-white transition-colors duration-200"
                title="Edit exercise"
              >
                <Settings className="h-5 w-5" />
              </button>
            </>
          ) : (
            <input
              type="text"
              value={exerciseFormValues.name}
              onChange={(e) => handleExerciseFormChange('name', e.target.value)}
              className="text-2xl font-bold text-white bg-[#404040]/50 border border-[#606060] rounded-md px-3 py-2 w-full text-center"
              placeholder="Exercise Name"
            />
          )}
        </div>
        
        {/* Display Muscle Groups */}
        {!isEditingExercise && currentExercise.muscleGroups && currentExercise.muscleGroups.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-2 mb-2">
            {currentExercise.muscleGroups.map((group: string) => (
              <span 
                key={group} 
                className="px-2 py-1 text-xs rounded-full bg-[#FF5733]/10 text-[#FF5733] border border-[#FF5733]/20"
              >
                {group}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-2 flex items-center justify-center text-sm text-[#b3b3b3]">
          {!isEditingExercise ? (
            <span className="px-2 py-1 rounded-full bg-[#404040]/50 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {Math.floor(currentExercise.restTimeSec / 60)}:{(currentExercise.restTimeSec % 60).toString().padStart(2, '0')} rest
            </span>
          ) : (
            <div className="flex items-center space-x-2">
              <label className="text-xs text-[#b3b3b3]">Rest time:</label>
              <input
                type="number"
                min="0"
                value={exerciseFormValues.restTimeSec}
                onChange={(e) => handleExerciseFormChange('restTimeSec', parseInt(e.target.value) || 0)}
                className="w-16 bg-[#404040]/50 border border-[#606060] rounded-md px-2 py-1 text-white text-center text-sm"
              />
              <span>seconds</span>
            </div>
          )}
        </div>
      </div>

      {/* Exercise Note */}
      {!isEditingExercise ? (
        currentExercise.note && (
          <div className="rounded-lg border border-[#FF5733]/20 bg-[#FF5733]/5 p-4 text-white">
            <p className="text-sm">
              <span className="font-medium">Note:</span> {currentExercise.note}
            </p>
          </div>
        )
      ) : (
        <div className="rounded-lg border border-[#505050] bg-[#2d2d2d]/50 p-4">
          <label className="block text-sm font-medium text-white mb-1">Note:</label>
          <textarea
            value={exerciseFormValues.note}
            onChange={(e) => handleExerciseFormChange('note', e.target.value)}
            className="w-full bg-[#404040]/50 border border-[#606060] rounded-md px-3 py-2 text-white text-sm"
            placeholder="Add a note about this exercise (optional)"
            rows={2}
          />
        </div>
      )}
      
      {/* Edit mode controls */}
      {isEditingExercise && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 p-4 rounded-lg border border-blue-500/20 bg-blue-500/10 space-y-4 sm:space-y-0">
          <div className="flex justify-center sm:justify-start">
            <div>
              <label className="block text-xs text-blue-300">Number of sets:</label>
              <div className="flex items-center mt-1">
                <button 
                  onClick={() => handleExerciseFormChange('defaultSets', Math.max(1, exerciseFormValues.defaultSets - 1))}
                  className="bg-[#404040] rounded-l-md p-1 text-white hover:bg-[#505050]"
                  disabled={exerciseFormValues.defaultSets <= 1}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={exerciseFormValues.defaultSets}
                  onChange={(e) => handleExerciseFormChange('defaultSets', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 bg-[#404040] border-y border-[#606060] py-1 text-white text-center text-sm"
                />
                <button 
                  onClick={() => handleExerciseFormChange('defaultSets', exerciseFormValues.defaultSets + 1)}
                  className="bg-[#404040] rounded-r-md p-1 text-white hover:bg-[#505050]"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <button
              onClick={handleCancelExerciseEdit}
              className="flex items-center rounded-md border border-[#606060] bg-[#404040] px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-[#505050]"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </button>
            
            <button
              onClick={handleSaveExerciseChanges}
              disabled={isUpdatingExercise}
              className="flex items-center rounded-md bg-blue-500 px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-blue-600"
            >
              {isUpdatingExercise ? (
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save Changes
            </button>
          </div>
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
                    disabled={isExerciseCompleted && !isReloggingActive}
                    className={`w-full rounded bg-[#404040] px-3 py-2 text-center text-white placeholder-[#666666] ${
                      isExerciseCompleted && !isReloggingActive
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
                      disabled={isExerciseCompleted && !isReloggingActive}
                      className={`w-full rounded bg-[#404040] px-3 py-2 text-center text-white placeholder-[#666666] ${
                        isExerciseCompleted && !isReloggingActive
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
        {!isExerciseCompleted && (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleLogSets}
              disabled={isSaving}
              className="w-full rounded-lg py-3 font-medium transition-colors duration-200 flex items-center justify-center bg-[#FF5733] text-white hover:bg-[#e64a2e]"
            >
              {isSaving ? (
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Save & Complete Sets</span>
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Use the ReLogHandler for completed exercises */}
        {isExerciseCompleted && (
          <ReLogHandler
            sessionId={sessionId}
            currentExercise={currentExercise}
            currentExerciseIndex={currentExerciseIndex}
            isExerciseCompleted={isExerciseCompleted}
            exerciseSets={exerciseSets}
            setExerciseSets={setExerciseSets}
            onSetsUpdated={handleSetsUpdated}
            setError={setError}
            setIsReloggingActive={setIsReloggingActive}
          />
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
          <span className="hidden sm:inline">Previous</span>
        </button>
        
        <div className="text-sm text-center mx-auto sm:mx-0 text-[#b3b3b3]">
          {completedExercises.length} of {exercises.length} exercises completed
        </div>
        
        <button
          type="button"
          onClick={goToNextExercise}
          disabled={currentExerciseIndex === exercises.length - 1}
          className="flex items-center space-x-2 rounded-md bg-[#2d2d2d] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Finish Workout Button */}
      {completedExercises.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShowCompletionConfirmation(true)}
            className="flex items-center rounded-lg bg-green-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-600"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Finish Workout
          </button>
        </div>
      )}
    </div>
  )
}