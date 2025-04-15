'use client'

import { useFormContext } from 'react-hook-form'

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

export default function ReviewStep() {
  const { watch } = useFormContext()
  const splitName = watch('splitName')
  const days = watch('days')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Review Your Training Split</h2>
        <p className="mt-2 text-[#b3b3b3]">
          Please review your training split configuration before saving
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-4">
          <h3 className="text-lg font-medium text-white">Split Name</h3>
          <p className="mt-1 text-[#b3b3b3]">{splitName}</p>
        </div>

        <div className="space-y-4">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-4"
            >
              <h3 className="text-lg font-medium text-white">{day}</h3>
              {days[index]?.isRestDay ? (
                <p className="mt-1 text-[#b3b3b3]">Rest Day</p>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="text-[#b3b3b3]">
                    Workout: {days[index]?.workoutName}
                  </p>
                  <p className="text-[#b3b3b3]">
                    Exercises: {days[index]?.exerciseCount}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 