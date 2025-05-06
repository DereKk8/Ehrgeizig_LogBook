'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronRight, Calendar, Dumbbell, BarChart, Activity } from 'lucide-react'
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
              className="bg-gradient-to-b from-[#252525] to-[#1e1e1e] border border-[#404040] rounded-lg hover:border-[#FF5733]/50 hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)] transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => handleWorkoutClick(workout.id)}
            >
              {/* Header with workout name and date */}
              <div className="bg-gradient-to-r from-[#252525] via-[#2a2a2a] to-[#252525] p-3 border-b border-[#404040] flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-[#FF5733] rounded-full p-1.5 mr-3">
                    <Dumbbell className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-lg">
                    {workout.splitName}: <span className="text-[#FF5733]">{workout.dayName}</span>
                  </h3>
                </div>
                <div className="flex items-center bg-[#323232] px-3 py-1 rounded-full">
                  <Calendar className="h-3.5 w-3.5 text-[#FF5733] mr-1.5" />
                  <span className="text-sm text-gray-300">{formatDate(workout.date)}</span>
                </div>
              </div>
              
              <div className="p-4">
                {/* Workout stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#323232] rounded-lg p-3 flex items-center">
                    <div className="bg-[#404040] rounded-full p-1.5 mr-2">
                      <BarChart className="h-4 w-4 text-[#FF5733]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Total Sets</div>
                      <div className="text-white font-medium">{workout.totalSets}</div>
                    </div>
                  </div>
                  
                  <div className="bg-[#323232] rounded-lg p-3 flex items-center">
                    <div className="bg-[#404040] rounded-full p-1.5 mr-2">
                      <Activity className="h-4 w-4 text-[#FF5733]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Exercises</div>
                      <div className="text-white font-medium">{workout.exercises.length}</div>
                    </div>
                  </div>
                </div>
                
                {/* Exercise tags and View Details button in same row */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Exercises</div>
                    <div className="flex flex-wrap gap-2">
                      {workout.exercises.map((exercise) => (
                        <span 
                          key={exercise.id} 
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-[#FF5733]/10 to-[#FF5733]/20 text-[#FF5733] border border-[#FF5733]/30"
                        >
                          {exercise.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* View details button */}
                  <div className="ml-3 mt-4">
                    <span className="bg-[#323232] hover:bg-[#404040] transition-colors px-3 py-1.5 rounded-lg text-sm text-white flex items-center whitespace-nowrap">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1 text-[#FF5733]" />
                    </span>
                  </div>
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
