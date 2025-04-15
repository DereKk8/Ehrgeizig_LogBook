'use client'

import { useFormContext } from 'react-hook-form'
import { useState } from 'react'

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

export default function ExerciseSetupStep() {
  const { register, watch, setValue } = useFormContext()
  const [currentDay, setCurrentDay] = useState(0)
  const days = watch('days')

  const handleAddExercise = (dayIndex: number) => {
    const exerciseCount = days[dayIndex]?.exerciseCount || 0
    setValue(`days.${dayIndex}.exerciseCount`, exerciseCount + 1)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Configure Exercises</h2>
        <p className="mt-3 text-lg text-[#b3b3b3]">
          Set up exercises for each training day
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {DAYS.map((day, index) => (
          <div
            key={day}
            className={`rounded-xl border p-6 transition-all duration-300 ${
              currentDay === index
                ? 'border-[#FF5733] bg-[#2d2d2d] shadow-lg shadow-[#FF5733]/10'
                : 'border-[#404040] bg-[#1e1e1e] hover:border-[#FF5733]/50'
            }`}
            onClick={() => setCurrentDay(index)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{day}</h3>
              {!days[index]?.isRestDay && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddExercise(index)
                  }}
                  className="rounded-lg bg-[#FF5733] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#ff8a5f] focus:outline-none focus:ring-2 focus:ring-[#FF5733] focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
                >
                  Add Exercise
                </button>
              )}
            </div>

            {!days[index]?.isRestDay && (
              <div className="mt-6 space-y-6">
                {Array.from({ length: days[index]?.exerciseCount || 0 }).map((_, exerciseIndex) => (
                  <div key={exerciseIndex} className="space-y-4 rounded-lg border border-[#404040] bg-[#2d2d2d] p-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        Exercise {exerciseIndex + 1}
                      </label>
                      <input
                        type="text"
                        {...register(`days.${index}.exercises.${exerciseIndex}.name`)}
                        placeholder="Exercise name"
                        className="block w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-3 text-white placeholder-[#666666] transition-colors duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Sets
                        </label>
                        <input
                          type="number"
                          {...register(`days.${index}.exercises.${exerciseIndex}.sets`, { valueAsNumber: true })}
                          placeholder="Sets"
                          min="1"
                          className="block w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-3 text-white placeholder-[#666666] transition-colors duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Rest (sec)
                        </label>
                        <input
                          type="number"
                          {...register(`days.${index}.exercises.${exerciseIndex}.restTimeSec`, { valueAsNumber: true })}
                          placeholder="Rest time"
                          min="0"
                          className="block w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-3 text-white placeholder-[#666666] transition-colors duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        Notes
                      </label>
                      <textarea
                        {...register(`days.${index}.exercises.${exerciseIndex}.note`)}
                        placeholder="Add any notes about the exercise (optional)"
                        rows={2}
                        className="block w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-3 text-white placeholder-[#666666] transition-colors duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733] resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 