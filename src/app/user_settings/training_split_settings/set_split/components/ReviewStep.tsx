'use client'

import { useFormContext } from 'react-hook-form'
import { Clock, Dumbbell, RotateCcw } from 'lucide-react'

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const

type Exercise = {
  name: string
  sets: number
  restTimeSec: number
  setsData?: Array<{
    reps: number
    weight: number
    note?: string
  }>
}

type Day = {
  isRestDay: boolean
  workoutName?: string
  exerciseCount?: number
  exercises?: Exercise[]
}

export default function ReviewStep() {
  const { watch } = useFormContext()
  const splitName = watch('splitName')
  const days = watch('days') as Day[]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Review Your Training Split</h2>
        <p className="mt-3 text-lg text-[#b3b3b3]">
          Please review your training split configuration before saving
        </p>
      </div>

      <div className="rounded-xl border border-[#404040] bg-[#1e1e1e] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-white">{splitName}</h3>
          <span className="rounded-lg bg-[#FF5733] px-3 py-1 text-sm font-medium text-white">
            {days.filter(day => !day.isRestDay).length} Training Days
          </span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {DAYS.map((day, index) => (
          <div
            key={day}
            className={`rounded-xl border ${
              days[index]?.isRestDay 
                ? 'border-[#404040] bg-[#1e1e1e]' 
                : 'border-[#FF5733] bg-[#2d2d2d]'
            } p-6`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{day}</h3>
              <span 
                className={`rounded-lg px-3 py-1 text-sm font-medium ${
                  days[index]?.isRestDay
                    ? 'bg-[#404040] text-[#b3b3b3]'
                    : 'bg-[#FF5733] text-white'
                }`}
              >
                {days[index]?.isRestDay ? 'Rest Day' : days[index]?.workoutName}
              </span>
            </div>

            {!days[index]?.isRestDay && days[index]?.exercises && (
              <div className="mt-6 space-y-4">
                {days[index]?.exercises.map((exercise, exerciseIndex) => (
                  <div 
                    key={exerciseIndex}
                    className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-4 transition-colors duration-200 hover:border-[#FF5733]/50"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">
                        {exercise.name || `Exercise ${exerciseIndex + 1}`}
                      </h4>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#b3b3b3]">
                      <div className="flex items-center space-x-2">
                        <Dumbbell className="h-4 w-4" />
                        <span>{exercise.sets} sets</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RotateCcw className="h-4 w-4" />
                        <span>{exercise.restTimeSec}s rest</span>
                      </div>
                      {exercise.setsData?.[0] && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {exercise.setsData[0].reps} reps @ {exercise.setsData[0].weight}kg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!days[index]?.isRestDay && (!days[index]?.exercises || days[index]?.exercises.length === 0) && (
              <div className="mt-4 text-[#b3b3b3]">
                No exercises configured yet
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 