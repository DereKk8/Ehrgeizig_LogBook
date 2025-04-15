'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import SplitNameStep from './components/SplitNameStep'
import DaySetupStep from './components/DaySetupStep'
import ExerciseSetupStep from './components/ExerciseSetupStep'
import ReviewStep from './components/ReviewStep'

// Define the form schema
const formSchema = z.object({
  splitName: z.string().min(1, 'Split name is required'),
  days: z.array(z.object({
    isRestDay: z.boolean(),
    workoutName: z.string().optional(),
    exerciseCount: z.number().min(0).optional(),
    exercises: z.array(z.object({
      name: z.string(),
      sets: z.number().min(1),
      restTimeSec: z.number().min(0),
      setsData: z.array(z.object({
        reps: z.number().min(1),
        weight: z.number().min(0),
        note: z.string().optional()
      }))
    })).optional()
  }))
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
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      splitName: '',
      days: Array(7).fill(null).map(() => ({
        isRestDay: false,
        workoutName: '',
        exerciseCount: 0,
        exercises: []
      }))
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      // TODO: Implement Supabase submission
      console.log('Form submitted:', data)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
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
        {/* Mobile Progress Steps */}
        <div className="mb-8 sm:hidden">
          <div className="mb-4 text-lg font-semibold text-white">
            {steps[currentStep].title}
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center space-x-3 rounded-lg p-2 ${
                  index === currentStep ? 'bg-[#2d2d2d]' : ''
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                    index < currentStep
                      ? 'bg-[#FF5733] text-white'
                      : index === currentStep
                      ? 'border-2 border-[#FF5733] text-white'
                      : 'border-2 border-[#404040] text-[#b3b3b3]'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span 
                  className={`text-sm ${
                    index === currentStep 
                      ? 'font-medium text-white' 
                      : 'text-[#b3b3b3]'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Progress Steps */}
        <div className="mb-8 hidden sm:block">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    index <= currentStep
                      ? 'border-[#FF5733] bg-[#FF5733] text-white'
                      : 'border-[#404040] text-[#b3b3b3]'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
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
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-sm">
              {currentStep === 0 && <SplitNameStep />}
              {currentStep === 1 && <DaySetupStep />}
              {currentStep === 2 && <ExerciseSetupStep />}
              {currentStep === 3 && <ReviewStep />}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="rounded-md border border-[#404040] bg-[#1e1e1e] px-4 py-2 text-[#b3b3b3] transition-colors hover:bg-[#2d2d2d] hover:text-white disabled:opacity-50"
              >
                Back
              </button>
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f]"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f]"
                >
                  Save Split
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  )
}
