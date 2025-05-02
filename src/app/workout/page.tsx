'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, ArrowRight, Dumbbell, CheckCircle, AlertCircle, X } from 'lucide-react'
import { ExerciseWithSets, createWorkoutSession } from '../actions/workout'
import SelectSplitStep from './components/SelectSplitStep'
import LoadWorkoutDayStep from './components/LoadWorkoutDayStep'
import FetchExercisesStep from './components/FetchExercisesStep'
import WorkoutSummaryStep from './components/WorkoutSummaryStep'
import StartWorkoutStep from './components/StartWorkoutStep'
import LogSetStep from './components/LogSetStep'

// Define the steps for our workout flow
const steps = [
  { id: 'select-split', title: 'Select Split' },
  { id: 'load-workout-day', title: 'Today\'s Workout' },
  { id: 'fetch-exercises', title: 'Load Exercises' },
  { id: 'workout-summary', title: 'Workout Summary' },
  { id: 'log-sets', title: 'Log Workout' },
  { id: 'workout-complete', title: 'Complete' }
]

export default function WorkoutPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Selected workout data
  const [selectedSplitId, setSelectedSplitId] = useState<string | null>(null)
  const [selectedSplitName, setSelectedSplitName] = useState<string | null>(null)
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [selectedDayName, setSelectedDayName] = useState<string | null>(null)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
  const [exerciseList, setExerciseList] = useState<ExerciseWithSets[]>([])
  const [completedExercises, setCompletedExercises] = useState<number[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isTodayWorkout, setIsTodayWorkout] = useState(false)
  
  // Navigation confirmation dialog state
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  
  // Handle browser back/refresh/close during active workout
  useEffect(() => {
    // Only add the beforeunload handler when we're in the logging step and have an active workout
    if (currentStep === 4 && sessionId) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        const message = "You have an active workout in progress. Are you sure you want to leave? Your unsaved progress will be lost.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      };
      
      // Handle popstate events (browser back/forward buttons)
      const handlePopState = (e: PopStateEvent) => {
        // Show our custom confirmation dialog
        setShowExitConfirmation(true);
        // Set a temporary URL so we know where to go if confirmed
        setPendingNavigation('/home');
        
        // Prevent the default navigation
        e.preventDefault();
        
        // Push the current state back to the history to prevent navigation
        window.history.pushState(null, '', pathname);
      };
      
      // Add event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      
      // Add a history entry to ensure popstate works when back is clicked
      window.history.pushState(null, '', pathname);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [currentStep, sessionId, pathname]);
  
  // Custom router navigation handler
  const safeNavigate = useCallback((url: string) => {
    // If we're in the logging step and have an active workout, show confirmation
    if (currentStep === 4 && sessionId) {
      setPendingNavigation(url);
      setShowExitConfirmation(true);
    } else {
      // Otherwise just navigate
      router.push(url);
    }
  }, [currentStep, sessionId, router]);
  
  // Confirm exit and navigate
  const confirmNavigation = () => {
    if (pendingNavigation) {
      // External navigation
      router.push(pendingNavigation);
    } else {
      // Internal navigation (back button click)
      setCurrentStep(currentStep - 1);
    }
    setShowExitConfirmation(false);
  };
  
  // Cancel exit
  const cancelNavigation = () => {
    setPendingNavigation(null);
    setShowExitConfirmation(false);
  };

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Go back to previous step
  const prevStep = () => {
    // If we're in the logging step, show a confirmation dialog
    if (currentStep === 4 && sessionId) {
      setShowExitConfirmation(true);
      setPendingNavigation(null); // We'll handle this internally, not with router
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle split selection
  const handleSplitSelected = (splitId: string, splitName: string) => {
    setSelectedSplitId(splitId)
    setSelectedSplitName(splitName)
    nextStep()
  }

  // Handle day selection/autoloading
  const handleDaySelected = (dayId: string, dayName: string, dayIndex: number) => {
    setSelectedDayId(dayId)
    setSelectedDayName(dayName)
    setSelectedDayIndex(dayIndex)
    
    // Check if the selected day is today
    setIsTodayWorkout(dayIndex === new Date().getDay())
    
    nextStep()
  }

  // Handle exercise data loaded
  const handleExercisesLoaded = (exercises: ExerciseWithSets[]) => {
    setExerciseList(exercises)
    nextStep()
  }

  // Handle day change from summary
  const handleDayChanged = (dayId: string, dayName: string, dayIndex: number) => {
    setSelectedDayId(dayId)
    setSelectedDayName(dayName)
    setSelectedDayIndex(dayIndex)
    
    // Update if this is today's workout
    setIsTodayWorkout(dayIndex === new Date().getDay())
    
    // We stay on the current step but will reload exercises
    setCurrentStep(2) // Go back to fetch exercises step
  }

  // Handle start workout
  const handleStartWorkout = async () => {
    if (!selectedDayId) {
      setError('No workout day selected')
      return
    }
    
    setLoading(true)
    
    try {
      // Create a single session for the entire workout
      const sessionResult = await createWorkoutSession(selectedDayId)
      
      if (!sessionResult.success) {
        setError(sessionResult.error || 'Failed to create workout session')
        return
      }
      
      setSessionId(sessionResult.data.id)
      // Move to the log sets step
      nextStep()
    } catch (error) {
      console.error('Error starting workout:', error)
      setError('Failed to start workout session')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle exercise completion during logging
  const handleExerciseCompleted = (exerciseIndex: number) => {
    if (!completedExercises.includes(exerciseIndex)) {
      setCompletedExercises(prev => [...prev, exerciseIndex])
    }
  }
  
  // Handle exercise update during logging
  const handleExerciseUpdated = (updatedExercise: ExerciseWithSets, index: number) => {
    setExerciseList(prevExercises => {
      const updatedExercises = [...prevExercises];
      updatedExercises[index] = updatedExercise;
      return updatedExercises;
    });
  }
  
  // Handle completion of all exercises
  const handleAllExercisesCompleted = () => {
    nextStep()
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[#1e1e1e] border border-[#404040] rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-[#FF5733]/20">
                <AlertCircle className="h-8 w-8 text-[#FF5733]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Exit Active Workout?</h3>
            <p className="text-[#b3b3b3] text-center mb-6">
              You have an active workout in progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={cancelNavigation}
                className="px-4 py-2 bg-[#404040] text-white rounded-md hover:bg-[#505050] flex items-center justify-center sm:order-1"
              >
                <X className="h-4 w-4 mr-2" />
                Stay on Workout
              </button>
              <button
                onClick={confirmNavigation}
                className="px-4 py-2 bg-[#FF5733] text-white rounded-md hover:bg-[#e64a2e] flex items-center justify-center sm:order-2"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-[#404040] bg-[#1e1e1e] p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="flex items-center text-xl font-bold text-white">
            <Dumbbell className="mr-2 h-6 w-6 text-[#FF5733]" />
            {currentStep > 0 && currentStep < steps.length - 1 && selectedDayName && isTodayWorkout 
              ? `Today's Workout: ${selectedDayName}`
              : "Start Workout"}
          </h1>
          <div className="text-sm font-medium text-white">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4 md:p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    index <= currentStep
                      ? 'border-[#FF5733] bg-[#FF5733] text-white'
                      : 'border-[#404040] text-[#b3b3b3]'
                  }`}
                >
                  {index < currentStep ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>
                <div
                  className={`ml-2 text-sm font-medium ${
                    index <= currentStep ? 'text-white' : 'text-[#b3b3b3]'
                  }`}
                >
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-8 ${
                      index < currentStep ? 'bg-[#FF5733]' : 'bg-[#404040]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile progress indicator */}
          <div className="flex items-center justify-between md:hidden">
            <div className="w-full bg-[#404040] h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF5733] transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-sm">
          {currentStep === 0 && (
            <SelectSplitStep
              onSplitSelected={handleSplitSelected}
              setError={setError}
            />
          )}
          
          {currentStep === 1 && selectedSplitId && (
            <LoadWorkoutDayStep
              splitId={selectedSplitId}
              splitName={selectedSplitName || ''}
              onDaySelected={handleDaySelected}
              setError={setError}
            />
          )}
          
          {currentStep === 2 && selectedDayId && (
            <FetchExercisesStep
              splitDayId={selectedDayId}
              splitDayName={selectedDayName || ''}
              onExercisesLoaded={handleExercisesLoaded}
              setError={setError}
            />
          )}
          
          {currentStep === 3 && selectedDayId && (
            <WorkoutSummaryStep
              splitId={selectedSplitId || ''}
              selectedDayName={selectedDayName || ''}
              selectedDayIndex={selectedDayIndex || 0}
              exercises={exerciseList}
              onDayChanged={handleDayChanged}
              onConfirm={handleStartWorkout}
              setError={setError}
              safeNavigate={safeNavigate}
            />
          )}
          
          {currentStep === 4 && selectedDayId && sessionId && (
            <LogSetStep
              splitDayId={selectedDayId}
              sessionId={sessionId}
              exercises={exerciseList}
              onExerciseCompleted={handleExerciseCompleted}
              onAllExercisesCompleted={handleAllExercisesCompleted}
              onExerciseUpdated={handleExerciseUpdated}
              setError={setError}
            />
          )}
          
          {currentStep === 5 && (
            <StartWorkoutStep
              splitName={selectedSplitName || ''}
              dayName={selectedDayName || ''}
              exercises={exerciseList}
              isCompleted={true}
            />
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0 || loading}
              className="flex items-center space-x-2 rounded-md border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            
            {currentStep === 3 && (
              <button
                type="button"
                onClick={handleStartWorkout}
                disabled={loading || exerciseList.length === 0}
                className="flex items-center space-x-2 rounded-md bg-[#FF5733] px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#e64a2e] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2" />
                ) : (
                  <Dumbbell className="h-5 w-5 mr-2" />
                )}
                <span>{isTodayWorkout ? "Start Today's Workout" : "Start Workout"}</span>
              </button>
            )}
          </div>
        )}
        
        {/* Return to Dashboard (shown on complete step) */}
        {currentStep === 5 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => safeNavigate('/home')}
              className="flex items-center space-x-2 rounded-md bg-[#2d2d2d] px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#333333]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}