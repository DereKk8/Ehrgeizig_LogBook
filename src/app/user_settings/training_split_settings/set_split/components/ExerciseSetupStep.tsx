'use client'

import { useFormContext } from 'react-hook-form'
import { useState } from 'react'
import { MUSCLE_GROUPS } from '@/app/types/db'

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

type Exercise = {
  name: string
  sets: number
  restTimeSec: number
  note?: string
  muscleGroups: string[]
}

type Day = {
  isRestDay: boolean
  workoutName: string
  exerciseCount: number
  exercises: Exercise[]
}

export default function ExerciseSetupStep() {
  const { register, watch, setValue, getValues } = useFormContext()
  const [currentDay, setCurrentDay] = useState(0)
  const days = watch('days') as Day[]
  const [muscleGroupDropdowns, setMuscleGroupDropdowns] = useState<{[key: string]: boolean}>({})

  const handleAddExercise = (dayIndex: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const dayData = days[dayIndex]
    if (dayData.isRestDay) return

    const currentExerciseCount = dayData.exerciseCount || 0
    
    // Create a blank new exercise with proper numeric values
    const newExercise = {
      name: '',
      sets: '',
      restTimeSec: '',
      note: '',
      muscleGroups: []
    }

    // Create a completely fresh exercises array instead of appending
    // This ensures we don't have any lingering "Rest" data
    const updatedExercises = currentExerciseCount === 0 
      ? [newExercise] 
      : [...(dayData.exercises || []).map(ex => ({...ex})), newExercise]
    
    // Update the form with the fresh data
    setValue(`days.${dayIndex}.exerciseCount`, currentExerciseCount + 1)
    setValue(`days.${dayIndex}.exercises`, updatedExercises)
  }

  // Toggle dropdown for muscle group selection
  const toggleMuscleGroupDropdown = (dayIndex: number, exerciseIndex: number) => {
    const key = `${dayIndex}-${exerciseIndex}`
    setMuscleGroupDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Handle muscle group selection
  const handleMuscleGroupSelection = (dayIndex: number, exerciseIndex: number, muscleGroup: string) => {
    const currentGroups = getValues(`days.${dayIndex}.exercises.${exerciseIndex}.muscleGroups`) || []
    const newGroups = currentGroups.includes(muscleGroup)
      ? currentGroups.filter((group: string) => group !== muscleGroup)
      : [...currentGroups, muscleGroup]
    
    setValue(`days.${dayIndex}.exercises.${exerciseIndex}.muscleGroups`, newGroups)
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
        {DAYS.map((day, index) => {
          const dayData = days[index]
          const isRestDay = dayData?.isRestDay
          const exerciseCount = dayData?.exerciseCount || 0

          return (
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
                {!isRestDay && (
                  <button
                    onClick={(e) => handleAddExercise(index, e)}
                    className="rounded-lg bg-[#FF5733] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#ff8a5f] focus:outline-none focus:ring-2 focus:ring-[#FF5733] focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
                  >
                    Add Exercise
                  </button>
                )}
              </div>

              {isRestDay ? (
                <div className="mt-4 text-[#b3b3b3]">
                  Rest day - no exercises
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {Array.from({ length: exerciseCount }).map((_, exerciseIndex) => (
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
                      
                      {/* Muscle Group Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Muscle Groups
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => toggleMuscleGroupDropdown(index, exerciseIndex)}
                            className="flex items-center justify-between w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-3 text-white transition-colors duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733]"
                          >
                            <span>
                              {(watch(`days.${index}.exercises.${exerciseIndex}.muscleGroups`) || []).length > 0
                                ? (watch(`days.${index}.exercises.${exerciseIndex}.muscleGroups`) || []).join(', ')
                                : 'Select muscle groups'}
                            </span>
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {/* Dropdown Menu */}
                          {muscleGroupDropdowns[`${index}-${exerciseIndex}`] && (
                            <div className="absolute z-10 mt-1 w-full rounded-md bg-[#1e1e1e] shadow-lg max-h-60 overflow-auto">
                              <div className="py-1">
                                {MUSCLE_GROUPS.map((muscleGroup) => {
                                  const isSelected = (watch(`days.${index}.exercises.${exerciseIndex}.muscleGroups`) || []).includes(muscleGroup);
                                  return (
                                    <div
                                      key={muscleGroup}
                                      onClick={() => handleMuscleGroupSelection(index, exerciseIndex, muscleGroup)}
                                      className={`flex items-center px-4 py-2 text-sm cursor-pointer ${
                                        isSelected ? 'bg-[#FF5733]/10 text-[#FF5733]' : 'text-white hover:bg-[#404040]'
                                      }`}
                                    >
                                      <div className="flex-shrink-0 mr-2">
                                        {isSelected && (
                                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                      <span className="ml-2">{muscleGroup}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Hidden form field to store selected muscle groups */}
                        <input
                          type="hidden"
                          {...register(`days.${index}.exercises.${exerciseIndex}.muscleGroups`)}
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
          )
        })}
      </div>
    </div>
  )
}