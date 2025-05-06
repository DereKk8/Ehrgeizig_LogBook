'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { X, ArrowUpRight, ArrowDownRight, ArrowRight, Dumbbell, Calendar, TrendingUp} from 'lucide-react'
import { getPreviousWorkoutInstance, WorkoutComparison, ExerciseProgressData, SetProgressData } from '@/app/actions/workout-history'

interface WorkoutComparisonModalProps {
  workoutId: string
  isOpen: boolean
  onClose: () => void
}

export default function WorkoutComparisonModal({ workoutId, isOpen, onClose }: WorkoutComparisonModalProps) {
  const [comparison, setComparison] = useState<WorkoutComparison | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkoutComparison = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getPreviousWorkoutInstance(workoutId)
      
      if (result.success && result.data) {
        // The result.data is already of type WorkoutComparison
        setComparison(result.data as WorkoutComparison)
      } else {
        setError('Failed to fetch workout comparison')
      }
    } catch {
      setError('An error occurred while fetching workout data')
    } finally {
      setLoading(false)
    }
  }, [workoutId])
  
  useEffect(() => {
    if (isOpen && workoutId) {
      fetchWorkoutComparison()
    }
  }, [isOpen, workoutId, fetchWorkoutComparison])

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy')
    } catch {
      return dateString
    }
  }

  // Helper function to render progress indicators
  const renderProgressIndicator = (value: number) => {
    if (value > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-400" />
    } else if (value < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-400" />
    } else {
      return <ArrowRight className="h-4 w-4 text-gray-500" />
    }
  }

  // Helper function to format percentage
  const formatPercentage = (value: number) => {
    const formatted = value.toFixed(1)
    return value > 0 ? `+${formatted}%` : `${formatted}%`
  }

  // Helper function to get color class based on value
  const getColorClass = (value: number) => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-gray-500'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-[#404040] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#404040] bg-[#252525]">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-[#FF5733]" />
            Workout Comparison
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#353535]"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-[#FF5733]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#121212]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5733]"></div>
            </div>
          ) : error ? (
            <div className="text-center p-6">
              <p className="text-red-400">{error}</p>
            </div>
          ) : comparison ? (
            <div className="space-y-6">
              {/* Workout Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#252525] border border-[#404040] p-4 rounded-lg">
                  <h3 className="font-medium text-[#FF5733] mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Current Workout
                  </h3>
                  {comparison.currentWorkout && (
                    <div className="space-y-3">
                      <div className="bg-[#2a2a2a] p-3 rounded-md border border-[#3a3a3a] flex items-center">
                        <div className="bg-[#FF5733] rounded-full p-1.5 mr-3">
                          <Dumbbell className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{comparison.currentWorkout.splitName}: {comparison.currentWorkout.dayName}</p>
                        </div>
                      </div>
                      
                      <div className="bg-[#2a2a2a] p-3 rounded-md border border-[#3a3a3a] flex items-center">
                        <div className="bg-[#3a3a3a] rounded-full p-1.5 mr-3">
                          <Calendar className="h-4 w-4 text-[#FF5733]" />
                        </div>
                        <div>
                          <p className="text-sm text-white">{formatDate(comparison.currentWorkout.date)}</p>
                        </div>
                      </div>
                      
                      <div className="bg-[#2a2a2a] p-3 rounded-md border border-[#3a3a3a] flex items-center">
                        <div className="bg-[#3a3a3a] rounded-full p-1.5 mr-3">
                          <TrendingUp className="h-4 w-4 text-[#FF5733]" />
                        </div>
                        <div>
                          <p className="text-sm text-white">{comparison.currentWorkout.totalSets} sets across {comparison.currentWorkout.exercises.length} exercises</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {comparison.previousWorkout ? (
                  <div className="bg-[#2a2a2a] border border-[#404040] p-4 rounded-lg">
                    <h3 className="font-medium text-blue-400 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Previous Workout
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-[#252525] p-3 rounded-md border border-[#3a3a3a] flex items-center">
                        <div className="bg-blue-500 rounded-full p-1.5 mr-3">
                          <Dumbbell className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{comparison.previousWorkout.splitName}: {comparison.previousWorkout.dayName}</p>
                        </div>
                      </div>
                      
                      <div className="bg-[#252525] p-3 rounded-md border border-[#3a3a3a] flex items-center">
                        <div className="bg-[#3a3a3a] rounded-full p-1.5 mr-3">
                          <Calendar className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white">{formatDate(comparison.previousWorkout.date)}</p>
                        </div>
                      </div>
                      
                      <div className="bg-[#252525] p-3 rounded-md border border-[#3a3a3a] flex items-center">
                        <div className="bg-[#3a3a3a] rounded-full p-1.5 mr-3">
                          <TrendingUp className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white">{comparison.previousWorkout.totalSets} sets across {comparison.previousWorkout.exercises.length} exercises</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#2a2a2a] border border-[#404040] p-4 rounded-lg">
                    <h3 className="font-medium text-blue-400 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Previous Workout
                    </h3>
                    <div className="bg-[#252525] p-4 rounded-md border border-[#3a3a3a] flex items-center justify-center">
                      <p className="text-sm text-gray-400">No previous workout data available for comparison</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Overall Progress Summary */}
              {comparison.progressData && (
                <div className="bg-[#252525] border border-[#404040] rounded-lg p-4">
                  <h3 className="font-medium text-white mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-[#FF5733]" />
                    Overall Progress
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#2a2a2a] border border-[#404040] p-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">Total Weight</p>
                      <div className="flex items-center">
                        {renderProgressIndicator(comparison.progressData.overallProgress.totalWeightChangePercent)}
                        <span className={`ml-1 font-medium ${getColorClass(comparison.progressData.overallProgress.totalWeightChangePercent)}`}>
                          {formatPercentage(comparison.progressData.overallProgress.totalWeightChangePercent)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-[#2a2a2a] border border-[#404040] p-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">Total Reps</p>
                      <div className="flex items-center">
                        {renderProgressIndicator(comparison.progressData.overallProgress.totalRepsChangePercent)}
                        <span className={`ml-1 font-medium ${getColorClass(comparison.progressData.overallProgress.totalRepsChangePercent)}`}>
                          {formatPercentage(comparison.progressData.overallProgress.totalRepsChangePercent)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-[#2a2a2a] border border-[#404040] p-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">Weight Change</p>
                      <p className="font-medium">
                        {comparison.progressData.overallProgress.totalWeightChange > 0 ? '+' : ''}
                        {comparison.progressData.overallProgress.totalWeightChange.toFixed(1)} kg/lbs
                      </p>
                    </div>
                    
                    <div className="bg-[#2a2a2a] border border-[#404040] p-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">Rep Change</p>
                      <p className="font-medium">
                        {comparison.progressData.overallProgress.totalRepsChange > 0 ? '+' : ''}
                        {comparison.progressData.overallProgress.totalRepsChange} reps
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Exercise Comparisons */}
              {comparison.progressData && comparison.progressData.exercises.map((exerciseProgress: ExerciseProgressData) => (
                <div key={exerciseProgress.exerciseId} className="border border-[#404040] rounded-lg overflow-hidden bg-[#252525] mb-6">
                  <div className="bg-gradient-to-r from-[#252525] via-[#2a2a2a] to-[#252525] p-5 border-b border-[#404040]">
                    <div className="bg-gradient-to-r from-[#FF5733]/10 via-[#FF5733]/20 to-[#FF5733]/10 p-3 rounded-lg shadow-md">
                      <h3 className="font-medium text-[#FF5733] text-lg text-center">{exerciseProgress.exerciseName}</h3>
                    </div>
                    <div className="flex flex-wrap items-center mt-2 gap-3">
                      <div className="bg-[#252525] px-3 py-2 rounded-md border border-[#3a3a3a]">
                        <span className={`flex items-center ${getColorClass(exerciseProgress.totalWeightChangePercent)}`}>
                          {renderProgressIndicator(exerciseProgress.totalWeightChangePercent)}
                          <span className="ml-1 font-medium">Weight: {formatPercentage(exerciseProgress.totalWeightChangePercent)}</span>
                        </span>
                      </div>
                      <div className="bg-[#252525] px-3 py-2 rounded-md border border-[#3a3a3a]">
                        <span className={`flex items-center ${getColorClass(exerciseProgress.totalRepsChangePercent)}`}>
                          {renderProgressIndicator(exerciseProgress.totalRepsChangePercent)}
                          <span className="ml-1 font-medium">Reps: {formatPercentage(exerciseProgress.totalRepsChangePercent)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#404040]">
                      <thead className="bg-gradient-to-r from-[#2a2a2a] to-[#323232]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#323232]">Set</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2d2d2d]">Current Weight</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2d2d2d]">Previous Weight</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2d2d2d]">Weight Change</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2d2d2d]">Current Reps</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2d2d2d]">Previous Reps</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2d2d2d]">Reps Change</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#252525] divide-y divide-[#404040]">
                        {exerciseProgress.sets.map((setProgress: SetProgressData) => (
                          <tr key={setProgress.setNumber}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white bg-[#323232]">{setProgress.setNumber}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#FF5733] bg-[#404040]">{setProgress.currentWeight} kg</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#b3b3b3] bg-[#404040]">{setProgress.previousWeight} kg</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm bg-[#404040]">
                              <span className={`flex items-center ${getColorClass(setProgress.weightChangePercent)}`}>
                                {renderProgressIndicator(setProgress.weightChangePercent)}
                                <span className="ml-1 font-medium">
                                  {setProgress.weightChange > 0 ? '+' : ''}{setProgress.weightChange} kg
                                  <span className="text-xs ml-1">({formatPercentage(setProgress.weightChangePercent)})</span>
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#FF5733] bg-[#404040]">{setProgress.currentReps}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#b3b3b3] bg-[#404040]">{setProgress.previousReps}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm bg-[#404040]">
                              <span className={`flex items-center ${getColorClass(setProgress.repsChangePercent)}`}>
                                {renderProgressIndicator(setProgress.repsChangePercent)}
                                <span className="ml-1 font-medium">
                                  {setProgress.repsChange > 0 ? '+' : ''}{setProgress.repsChange}
                                  <span className="text-xs ml-1">({formatPercentage(setProgress.repsChangePercent)})</span>
                                </span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* No Previous Workout Message */}
              {!comparison.previousWorkout && (
                <div className="bg-[#252525] border border-[#404040] rounded-lg p-5 text-center mt-6">
                  <div className="bg-gradient-to-r from-[#FF5733]/5 via-[#FF5733]/15 to-[#FF5733]/5 p-4 rounded-lg shadow-md">
                    <p className="text-[#FF5733] flex items-center justify-center font-medium">
                      This is your first time doing this workout. Complete more workouts to see progress comparisons.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FF5733] text-white rounded hover:bg-[#E64A2E] transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
