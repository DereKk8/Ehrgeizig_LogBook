'use client'

import { useFormContext } from 'react-hook-form'
import { useState, useEffect } from 'react'

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

export default function DaySetupStep() {
  const { register, watch, setValue, getValues } = useFormContext()
  const [currentDay, setCurrentDay] = useState(0)
  
  // Watch the days array to react to changes
  const days = watch('days')
  
  // Initialize days if they don't exist yet
  useEffect(() => {
    const currentDays = getValues('days')
    if (!currentDays || !Array.isArray(currentDays)) {
      // Initialize days with default values
      const initialDays = DAYS.map(() => ({
        isRestDay: true,
        workoutName: '',
        exerciseCount: 0
      }))
      setValue('days', initialDays)
    }
  }, [getValues, setValue])

  // Update a day's rest status
  const handleDayTypeChange = (dayIndex: number, isRestDay: boolean) => {
    setValue(`days.${dayIndex}.isRestDay`, isRestDay, { shouldValidate: true })
    
    // Only reset values if changing to rest day
    if (isRestDay) {
      setValue(`days.${dayIndex}.workoutName`, '')
      setValue(`days.${dayIndex}.exerciseCount`, 0)
    }
  }

  const handleDayClick = (index: number) => {
    setCurrentDay(index)
  }

  // Safely check if a day's isRestDay value is true or false
  const isDayRest = (index: number): boolean => {
    return days && days[index] ? days[index].isRestDay === true : true
  }

  // Safely check if a day's isRestDay value is false
  const isDayTraining = (index: number): boolean => {
    return days && days[index] ? days[index].isRestDay === false : false
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Set Up Your Training Days</h2>
        <p className="mt-3 text-lg text-[#b3b3b3]">
          Choose which days are training days and which are rest days
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
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => handleDayClick(index)}
            >
              <h3 className="text-xl font-semibold text-white">{day}</h3>
              <div className="flex space-x-6" onClick={(e) => e.stopPropagation()}>
                <label className="group flex cursor-pointer items-center space-x-3">
                  <div className="relative h-6 w-6">
                    <input
                      type="radio"
                      name={`dayType-${index}`}
                      checked={isDayTraining(index)}
                      onChange={() => handleDayTypeChange(index, false)}
                      className="peer absolute h-6 w-6 cursor-pointer opacity-0"
                    />
                    <div className="h-6 w-6 rounded-full border-2 border-[#404040] bg-[#2d2d2d] transition-all duration-200 peer-checked:border-[#FF5733] peer-checked:bg-[#FF5733] peer-hover:border-[#FF5733]">
                      <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2d2d2d] transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100 peer-checked:group-hover:bg-[#2d2d2d]" />
                    </div>
                  </div>
                  <span className="text-[#b3b3b3] transition-colors duration-200 group-hover:text-white">Training</span>
                </label>
                <label className="group flex cursor-pointer items-center space-x-3">
                  <div className="relative h-6 w-6">
                    <input
                      type="radio"
                      name={`dayType-${index}`}
                      checked={isDayRest(index)}
                      onChange={() => handleDayTypeChange(index, true)}
                      className="peer absolute h-6 w-6 cursor-pointer opacity-0"
                    />
                    <div className="h-6 w-6 rounded-full border-2 border-[#404040] bg-[#2d2d2d] transition-all duration-200 peer-checked:border-[#FF5733] peer-checked:bg-[#FF5733] peer-hover:border-[#FF5733]">
                      <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2d2d2d] transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100 peer-checked:group-hover:bg-[#2d2d2d]" />
                    </div>
                  </div>
                  <span className="text-[#b3b3b3] transition-colors duration-200 group-hover:text-white">Rest</span>
                </label>
              </div>
            </div>

            {isDayTraining(index) && (
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor={`workoutName-${index}`} className="block text-sm font-medium text-white">
                    Workout Name
                  </label>
                  <input
                    type="text"
                    id={`workoutName-${index}`}
                    {...register(`days.${index}.workoutName`)}
                    className="mt-1 block w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-3 text-white placeholder-[#666666] transition-colors duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733]"
                    placeholder="e.g., Push, Pull, Legs"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor={`exerciseCount-${index}`} className="block text-sm font-medium text-white">
                    Number of Exercises
                  </label>
                  <input
                    type="number"
                    id={`exerciseCount-${index}`}
                    {...register(`days.${index}.exerciseCount`, { valueAsNumber: true })}
                    min="0"
                    className="mt-1 block w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-3 text-white placeholder-[#666666] transition-colors duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733]"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}