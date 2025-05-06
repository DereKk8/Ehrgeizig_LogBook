'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronRight, Calendar } from 'lucide-react'
import { WorkoutDetail } from '@/app/actions/workout-history'
import WorkoutComparisonModal from './WorkoutComparisonModal'

interface WorkoutHistoryListProps {
  workouts: WorkoutDetail[]
  weekRange: { startDate: string; endDate: string }
}

export default function WorkoutHistoryList({ workouts, weekRange }: WorkoutHistoryListProps) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy')
    } catch {
      return dateString
    }
  }

  const handleWorkoutClick = (workoutId: string) => {
    setSelectedWorkoutId(workoutId)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          <Calendar className="inline-block mr-2 h-5 w-5 text-[#FF5733]" />
          Week of {formatDate(weekRange.startDate)} - {formatDate(weekRange.endDate)}
        </h2>
      </div>

      {workouts.length === 0 ? (
        <div className="bg-[#1e1e1e] border border-[#404040] rounded-lg p-6 text-center">
          <p className="text-gray-400">No workouts found for this week.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div 
              key={workout.id} 
              className="bg-[#1e1e1e] border border-[#404040] rounded-lg hover:border-[#FF5733]/50 hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)] transition-all duration-300 cursor-pointer"
              onClick={() => handleWorkoutClick(workout.id)}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-white">
                    {workout.splitName}: {workout.dayName}
                  </h3>
                  <span className="text-sm text-gray-400">{formatDate(workout.date)}</span>
                </div>
                
                <div className="text-sm text-gray-400 mb-3">
                  {workout.totalSets} sets across {workout.exercises.length} exercises
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {workout.exercises.map((exercise) => (
                    <span 
                      key={exercise.id} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF5733]/20 text-[#FF5733] border border-[#FF5733]/30"
                    >
                      {exercise.name}
                    </span>
                  ))}
                </div>
                
                <div className="mt-3 flex justify-end">
                  <span className="text-sm text-[#FF5733] flex items-center">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedWorkoutId && (
        <WorkoutComparisonModal 
          workoutId={selectedWorkoutId} 
          isOpen={isModalOpen} 
          onClose={closeModal} 
        />
      )}
    </div>
  )
}
