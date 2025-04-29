'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Check, Loader2, AlertCircle, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSplit } from '@/app/actions/splits'
import { useUser } from '@/lib/hooks/useUser'
import SplitNameStep from './components/SplitNameStep'
import DaySetupStep from './components/DaySetupStep'
import ExerciseSetupStep from './components/ExerciseSetupStep'
import ExerciseDetailsStep from './components/ExerciseDetailsStep'
import ReviewStep from './components/ReviewStep'
import SuccessConfirmation from './components/SuccessConfirmation'

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const

// Define validation schemas for each step
const splitNameSchema = z.object({
  splitName: z.string().min(1, 'Split name is required')
})

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.number().min(1, 'At least 1 set is required'),
  restTimeSec: z.number().min(0, 'Rest time must be 0 or greater'),
  note: z.string().optional(),
  setsData: z.array(z.object({
    reps: z.number().min(1, 'At least 1 rep is required'),
    weight: z.number().min(0, 'Weight must be 0 or greater'),
    note: z.string().optional()
  }))
})

const daySchema = z.object({
  isRestDay: z.boolean(),
  workoutName: z.string().min(1, 'Workout name is required'),
  exerciseCount: z.number().min(0),
  exercises: z.array(exerciseSchema)
})

const formSchema = z.object({
  splitName: z.string().min(1, 'Split name is required'),
  days: z.array(daySchema)
})

// Export type for use in SuccessConfirmation component
export type FormData = {
  splitName: string
  days: Array<{
    isRestDay: boolean
    workoutName: string
    exerciseCount: number
    exercises: Array<{
      name: string
      sets: number
      restTimeSec: number
      note?: string
      setsData: Array<{
        reps: number
        weight: number
        note?: string
      }>
    }>
  }>
}

const steps = [
  { id: 'split-name', title: 'Split Name' },
  { id: 'day-setup', title: 'Day Setup' },
  { id: 'exercise-setup', title: 'Exercise Setup' },
  { id: 'exercise-details', title: 'Exercise Details' },
  { id: 'review', title: 'Review' }
]

export default function SetSplitPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [allDaysConfigured, setAllDaysConfigured] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<FormData | null>(null)
  const router = useRouter()
  const { user } = useUser()

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      splitName: '',
      days: DAYS.map(() => ({
        isRestDay: true,
        workoutName: 'Rest Day',
        exerciseCount: 0,
        exercises: [] // Initialize with empty array instead of prefilled "Rest" exercise
      }))
    },
    mode: 'onChange'
  })

  // Validate current step
  const validateStep = async () => {
    let isValid = false
    
    switch (currentStep) {
      case 0:
        // Validate split name
        isValid = await methods.trigger('splitName')
        break
      case 1:
        // Validate day setup
        const days = methods.getValues('days')
        const hasTrainingDay = days.some(day => !day.isRestDay)
        const workoutNamesValid = days.every(day => 
          day.isRestDay || (day.workoutName && day.workoutName.trim().length > 0)
        )
        
        if (!hasTrainingDay) {
          setError('At least one training day is required')
          return false
        }
        if (!workoutNamesValid) {
          setError('All training days must have a workout name')
          return false
        }
        isValid = true
        break
      case 2:
        // Validate exercises
        const currentDays = methods.getValues('days')
        const exerciseErrors: string[] = []

        currentDays.forEach((day, index) => {
          if (!day.isRestDay) {
            if (!day.exercises || day.exercises.length === 0) {
              exerciseErrors.push(`${DAYS[index]}: No exercises configured`)
            } else {
              day.exercises.forEach((exercise, exerciseIndex) => {
                if (!exercise.name.trim()) {
                  exerciseErrors.push(`${DAYS[index]}, Exercise ${exerciseIndex + 1}: Name is required`)
                }
                if (!exercise.sets || exercise.sets < 1) {
                  exerciseErrors.push(`${DAYS[index]}, Exercise ${exerciseIndex + 1}: At least 1 set is required`)
                }
              })
            }
          }
        })

        if (exerciseErrors.length > 0) {
          setError(exerciseErrors.join('\n'))
          return false
        }
        isValid = true
        break
      case 3:
        // For Exercise Details step, use the allDaysConfigured state
        isValid = allDaysConfigured
        if (!isValid) {
          setError('Please configure all training days before proceeding')
          return false
        }
        break
      default:
        isValid = true
    }

    return isValid
  }

  const nextStep = async () => {
    setError(null)
    const isValid = await validateStep()
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setError(null)
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Show confirmation dialog instead of direct submission
  const handleSaveClick = async () => {
    setError(null)
    
    // Get current form values
    const formData = methods.getValues()
    console.log('Current form values:', JSON.stringify(formData, null, 2))
    
    // Validate the entire form
    const isValid = await methods.trigger()
    console.log('Form validation result:', isValid)
    
    if (!isValid) {
      const errors = methods.formState.errors
      console.log('Validation errors:', JSON.stringify(errors, null, 2))
      
      const errorMessages = Object.entries(errors).map(([key, value]) => {
        if (value.message) return value.message
        return `${key} is invalid`
      })
      setError(errorMessages.join('\n'))
      return
    }

    // Check if at least one day is a training day
    const days = formData.days
    const hasTrainingDay = days.some(day => !day.isRestDay)
    
    if (!hasTrainingDay) {
      setError('At least one training day is required')
      return
    }

    // Check if all training days have valid data
    const trainingDayErrors: string[] = []
    days.forEach((day, index) => {
      if (!day.isRestDay) {
        if (!day.workoutName?.trim()) {
          trainingDayErrors.push(`${DAYS[index]}: Workout name is required`)
        }
        if (!day.exercises || day.exercises.length === 0) {
          trainingDayErrors.push(`${DAYS[index]}: At least one exercise is required`)
        } else {
          day.exercises.forEach((exercise, exerciseIndex) => {
            if (!exercise.name.trim()) {
              trainingDayErrors.push(`${DAYS[index]}, Exercise ${exerciseIndex + 1}: Name is required`)
            }
            if (!exercise.sets || exercise.sets < 1) {
              trainingDayErrors.push(`${DAYS[index]}, Exercise ${exerciseIndex + 1}: At least 1 set is required`)
            }
          })
        }
      }
    })

    if (trainingDayErrors.length > 0) {
      setError(trainingDayErrors.join('\n'))
      return
    }

    // If all validations pass, show confirmation
    setShowConfirmation(true)
  }

  const handleConfirmSave = async () => {
    if (!user?.id) {
      setError('You must be logged in to create a split')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const formData = methods.getValues()
      console.log('Submitting form data:', JSON.stringify(formData, null, 2))
      
      const result = await createSplit(formData, user.id)
      console.log('Create split result:', result)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Store submitted data and show success page instead of redirecting
      setSubmittedData(formData)
      setIsSubmitted(true)
      setShowConfirmation(false)
      
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while saving your split')
      setIsSubmitting(false)
      setShowConfirmation(false)
    }
  }

  // Update day type (rest/training)
  const handleDayTypeChange = (dayIndex: number, isRestDay: boolean) => {
    const currentDays = methods.getValues('days')
    const updatedDays = [...currentDays]
    
    if (isRestDay) {
      // Set rest day defaults
      updatedDays[dayIndex] = {
        isRestDay: true,
        workoutName: 'Rest Day',
        exerciseCount: 0,
        exercises: [] // Keep exercises array empty for rest days
      }
    } else {
      // Clear for training day
      updatedDays[dayIndex] = {
        isRestDay: false,
        workoutName: '',
        exerciseCount: 0,
        exercises: []
      }
    }
    
    methods.setValue('days', updatedDays, { shouldValidate: true })
  }

  // Show success confirmation page if submitted
  if (isSubmitted && submittedData) {
    return <SuccessConfirmation formData={submittedData} />;
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#404040] bg-[#1e1e1e] px-4 shadow-sm md:px-6">
        <Link 
          href="/user_settings/training_split_settings" 
          className="group flex items-center rounded-md px-3 py-2 text-[#b3b3b3] transition-colors hover:bg-[#2d2d2d] hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="ml-2 text-sm font-medium">Back to Training Split Settings</span>
        </Link>
        <div className="text-sm font-medium text-white sm:hidden">
          Step {currentStep + 1} of {steps.length}
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 md:p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    index <= currentStep
                      ? 'border-[#FF5733] bg-[#FF5733] text-white'
                      : 'border-[#404040] text-[#b3b3b3]'
                  }`}
                >
                  {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
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
        </div>

        {/* Form Content */}
        <FormProvider {...methods}>
          <form className="space-y-6">
            <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-sm">
              {currentStep === 0 && <SplitNameStep />}
              {currentStep === 1 && <DaySetupStep />}
              {currentStep === 2 && <ExerciseSetupStep />}
              {currentStep === 3 && <ExerciseDetailsStep onAllDaysConfigured={setAllDaysConfigured} />}
              {currentStep === 4 && <ReviewStep />}
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                {error.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className="rounded-md border border-[#404040] bg-[#1e1e1e] px-4 py-2 text-[#b3b3b3] transition-colors hover:bg-[#2d2d2d] hover:text-white disabled:opacity-50"
              >
                Back
              </button>
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isSubmitting || (currentStep === 3 && !allDaysConfigured)}
                  className={`rounded-md px-4 py-2 text-white transition-colors disabled:opacity-50 ${
                    currentStep === 3 && !allDaysConfigured 
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-[#FF5733] hover:bg-[#ff8a5f]'
                  }`}
                >
                  {currentStep === 3 && !allDaysConfigured ? 'Configure All Days' : 'Next'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Split'
                  )}
                </button>
              )}
            </div>
          </form>
        </FormProvider>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-[#FF5733]" />
                  <h2 className="text-xl font-bold text-white">Confirm Submission</h2>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowConfirmation(false)}
                  className="rounded-full p-1 text-[#b3b3b3] hover:bg-[#2d2d2d] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="mb-6 text-[#b3b3b3]">
                Are you sure you want to save this training split? This will create a new training split with your configured exercises and sets.
              </p>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="rounded-md border border-[#404040] bg-[#1e1e1e] px-4 py-2 text-[#b3b3b3] transition-colors hover:bg-[#2d2d2d] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Confirm & Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}