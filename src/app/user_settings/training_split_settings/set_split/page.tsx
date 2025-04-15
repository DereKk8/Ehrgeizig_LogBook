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
import ReviewStep from './components/ReviewStep'

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

const daySchema = z.object({
  isRestDay: z.boolean(),
  workoutName: z.string().optional(),
  exerciseCount: z.number().min(0).optional(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.number().min(1),
    restTimeSec: z.number().min(0),
    note: z.string().optional()
  })).optional()
})

const formSchema = z.object({
  splitName: z.string().min(1, 'Split name is required'),
  days: z.array(daySchema)
})

type FormData = z.infer<typeof formSchema>

const steps = [
  { id: 'split-name', title: 'Split Name' },
  { id: 'day-setup', title: 'Day Setup' },
  { id: 'exercise-setup', title: 'Exercise Setup' },
  { id: 'review', title: 'Review' }
]

export default function SetSplitPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const router = useRouter()
  const { user } = useUser()

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      splitName: '',
      days: Array(7).fill(null).map(() => ({
        isRestDay: true,
        workoutName: '',
        exerciseCount: 0,
        exercises: []
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
        // Review step - validate entire form
        isValid = await methods.trigger()
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

  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      setError('You must be logged in to create a split')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const result = await createSplit(data, user.id)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Redirect to the splits list page
      router.push('/user_settings/training_split_settings')
      router.refresh()
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while saving your split')
    } finally {
      setIsSubmitting(false)
      setShowConfirmation(false)
    }
  }

  // Show confirmation dialog instead of direct submission
  const handleSaveClick = async () => {
    const isValid = await methods.trigger()
    if (isValid) {
      setShowConfirmation(true)
    }
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
              {currentStep === 3 && <ReviewStep />}
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
                  disabled={isSubmitting}
                  className="rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f] disabled:opacity-50"
                >
                  Next
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
      </main>

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
                onClick={() => methods.handleSubmit(onSubmit)()}
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
    </div>
  )
}