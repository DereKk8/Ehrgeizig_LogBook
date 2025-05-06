'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Dumbbell, 
  Trash2, 
  AlertCircle, 
  ChevronRight, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  X,
  Edit2,
  Save,
  ListOrdered,
  Calendar as CalendarIcon
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { getUserSplits, getSplitDays, getSplitDayExercises, getExerciseSets, modifySet } from '@/app/actions/workout'
import { deleteExercise } from '@/app/actions/splits'
import {Split, SplitDay, Exercise as ExerciseType } from '@/app/types/db'

type ViewState = 'splits' | 'days' | 'exercises' | 'sets'

type SetData = {
  id: string
  setNumber: number
  reps: number
  weight: number
}

type ExerciseSetsData = {
  sets: SetData[]
  lastSessionDate: string | null
  sessionId: string
}

export default function WorkoutSplitLogsPage() {
  const [viewState, setViewState] = useState<ViewState>('splits')
  const [splits, setSplits] = useState<Split[]>([])
  const [selectedSplit, setSelectedSplit] = useState<Split | null>(null)
  const [splitDays, setSplitDays] = useState<SplitDay[]>([])
  const [selectedDay, setSelectedDay] = useState<SplitDay | null>(null)
  const [exercises, setExercises] = useState<ExerciseType[]>([])
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null)
  const [exerciseSets, setExerciseSets] = useState<ExerciseSetsData | null>(null)
  const [editingSetId, setEditingSetId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{reps: string, weight: string}>({ reps: '', weight: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{exerciseId: string, exerciseName: string} | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useUser()

  // Fetch initial data (splits)
  useEffect(() => {
    async function fetchSplits() {
      if (!user) return
      
      try {
        setLoading(true)
        const result = await getUserSplits()
        
        if (!result.success) {
          setError(result.error || 'Failed to load splits')
          return
        }
        
        setSplits(result.data || [])
      } catch {
        setError('An error occurred while loading your splits')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSplits()
  }, [user])

  // Handle split selection
  const handleSplitSelect = async (split: Split) => {
    setSelectedSplit(split)
    setLoading(true)
    setError(null)
    
    try {
      const result = await getSplitDays(split.id)
      
      if (!result.success) {
        setError(result.error || 'Failed to load workout days')
        return
      }
      
      setSplitDays(result.data || [])
      setViewState('days')
    } catch {
      setError('An error occurred while loading workout days')
    } finally {
      setLoading(false)
    }
  }

  // Handle day selection
  const handleDaySelect = async (day: SplitDay) => {
    setSelectedDay(day)
    setLoading(true)
    setError(null)
    
    try {
      const result = await getSplitDayExercises(day.id)
      
      if (!result.success) {
        setError(result.error || 'Failed to load exercises')
        return
      }
      
      setExercises(result.data || [])
      setViewState('exercises')
    } catch {
      setError('An error occurred while loading exercises')
    } finally {
      setLoading(false)
    }
  }

  // Handle exercise selection to view sets
  const handleExerciseSelect = async (exercise: ExerciseType) => {
    if (!user) return
    
    setSelectedExercise(exercise)
    setLoading(true)
    setError(null)
    
    try {
      const result = await getExerciseSets(exercise.id, user.id)


      
      if (!result.success) {
        setError(result.error || 'Failed to load exercise sets')
        return
      }
      
      setExerciseSets(result.data as ExerciseSetsData)
      setViewState('sets')
    } catch {
      setError('An error occurred while loading exercise sets')
    } finally {
      setLoading(false)
    }
  }

  // Go back to previous view
  const goBack = () => {
    if (viewState === 'sets') {
      setViewState('exercises')
      setSelectedExercise(null)
      setExerciseSets(null)
      setEditingSetId(null)
    } else if (viewState === 'exercises') {
      setViewState('days')
      setSelectedDay(null)
      setExercises([])
    } else if (viewState === 'days') {
      setViewState('splits')
      setSelectedSplit(null)
      setSplitDays([])
    }
  }

  // Start editing a set
  const startEditingSet = (set: SetData) => {
    setEditingSetId(set.id)
    setEditValues({
      reps: set.reps.toString(),
      weight: set.weight.toString()
    })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingSetId(null)
    setEditValues({ reps: '', weight: '' })
  }

  // Save set changes
  const saveSetChanges = async () => {
    if (!editingSetId || !user) return
    
    const reps = parseInt(editValues.reps)
    const weight = parseFloat(editValues.weight)
    
    if (isNaN(reps) || reps < 1) {
      setToast({ type: 'error', message: 'Reps must be at least 1' })
      return
    }
    
    if (isNaN(weight) || weight < 0) {
      setToast({ type: 'error', message: 'Weight must be 0 or greater' })
      return
    }
    
    setIsSaving(true)
    
    try {
      const result = await modifySet({
        setId: editingSetId,
        reps,
        weight,
        userId: user.id
      })
      
      if (!result.success) {
        setToast({ type: 'error', message: result.error || 'Failed to update set' })
        return
      }
      
      // Update local state with the modified set
      if (exerciseSets) {
        const updatedSets = exerciseSets.sets.map(set => 
          set.id === editingSetId ? { ...set, reps, weight } : set
        )
        
        setExerciseSets({
          ...exerciseSets,
          sets: updatedSets
        })
      }
      
      setToast({ type: 'success', message: 'Set updated successfully' })
      setEditingSetId(null)
    } catch {
      setToast({ type: 'error', message: 'An error occurred while updating the set' })
    } finally {
      setIsSaving(false)
    }
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  // Show confirmation dialog
  const confirmDeleteExercise = (exerciseId: string, exerciseName: string) => {
    setDeleteConfirmation({ exerciseId, exerciseName })
  }

  // Cancel deletion
  const cancelDelete = () => {
    setDeleteConfirmation(null)
  }

  // Handle exercise deletion
  const handleDeleteExercise = async () => {
    if (!deleteConfirmation || !user) return
    
    setLoading(true)
    
    try {
      const result = await deleteExercise(deleteConfirmation.exerciseId, user.id)
      
      if (!result.success) {
        setToast({ 
          type: 'error', 
          message: result.error || 'Failed to delete exercise' 
        })
        return
      }
      
      // Remove the exercise from the list
      setExercises(prev => prev.filter(ex => ex.id !== deleteConfirmation.exerciseId))
      
      setToast({ 
        type: 'success', 
        message: 'Exercise deleted successfully' 
      })
      
      // Clear confirmation dialog
      setDeleteConfirmation(null)
    } catch {
      setToast({ 
        type: 'error', 
        message: 'An error occurred while deleting the exercise' 
      })
    } finally {
      setLoading(false)
    }
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  // Get day name from day of week
  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek] || 'Unknown'
  }

  // Format date nicely
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="border-b border-[#404040] bg-[#1a1a1a] p-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center space-x-4">
            {viewState !== 'splits' && (
              <button 
                onClick={goBack}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-[#404040] hover:bg-[#505050] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h1 className="text-xl font-bold">
              {viewState === 'splits' && 'Workout Split Logs'}
              {viewState === 'days' && selectedSplit?.name}
              {viewState === 'exercises' && `${selectedDay?.name} (${getDayName(selectedDay?.day_of_week || 0)})`}
              {viewState === 'sets' && selectedExercise?.name}
            </h1>
          </div>
          
          <Link 
            href="/user_settings/training_split_settings" 
            className="rounded-md bg-[#404040] px-3 py-1 text-sm hover:bg-[#505050] transition-colors"
          >
            Back to Settings
          </Link>
        </div>
      </header>

      {/* Toast notification */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center space-x-2 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="ml-2 rounded-full p-1 hover:bg-black/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-[#1e1e1e] p-6 shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Delete Exercise</h3>
            </div>
            
            <p className="mb-6 text-[#b3b3b3]">
              Are you sure you want to delete <span className="text-white font-medium">{deleteConfirmation.exerciseName}</span>? 
              This will permanently remove the exercise and all of its associated sets data.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 rounded-md border border-[#404040] bg-[#2d2d2d] px-4 py-2 hover:bg-[#333333] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExercise}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-5xl">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-10 w-10 rounded-full border-4 border-[#FF5733] border-t-transparent animate-spin"></div>
              <p className="mt-4 text-[#b3b3b3]">Loading...</p>
            </div>
          )}
          
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-red-200">{error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <>
              {/* Splits View */}
              {viewState === 'splits' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Select a Training Split</h2>
                  
                  {splits.length === 0 ? (
                    <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-8 text-center">
                      <p className="text-[#b3b3b3]">You haven&apos;t created any training splits yet.</p>
                      <Link 
                        href="/user_settings/training_split_settings/set_split" 
                        className="mt-4 inline-block rounded-md bg-[#FF5733] px-4 py-2 text-white hover:bg-[#ff8a5f] transition-colors"
                      >
                        Create a Split
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {splits.map(split => (
                        <button
                          key={split.id}
                          onClick={() => handleSplitSelect(split)}
                          className="flex items-center justify-between rounded-lg border border-[#404040] bg-[#2d2d2d] p-4 text-left hover:border-[#FF5733]/50 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5733]/20 text-[#FF5733]">
                              <Dumbbell className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-medium">{split.name}</h3>
                              <p className="text-xs text-[#b3b3b3]">
                                Created: {new Date(split.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-[#b3b3b3]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Split Days View */}
              {viewState === 'days' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Select a Workout Day</h2>
                  
                  {splitDays.length === 0 ? (
                    <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-8 text-center">
                      <p className="text-[#b3b3b3]">No workout days found for this split.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {splitDays.map(day => (
                        <button
                          key={day.id}
                          onClick={() => !day.is_rest_day && handleDaySelect(day)}
                          disabled={day.is_rest_day}
                          className={`flex items-center justify-between rounded-lg border p-4 text-left transition-all duration-200 ${
                            day.is_rest_day 
                              ? 'border-[#404040] bg-[#1e1e1e] opacity-60 cursor-not-allowed' 
                              : 'border-[#404040] bg-[#2d2d2d] hover:border-[#FF5733]/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              day.is_rest_day ? 'bg-[#404040]/50 text-[#b3b3b3]' : 'bg-[#FF5733]/20 text-[#FF5733]'
                            }`}>
                              <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{day.name}</h3>
                                {day.is_rest_day && (
                                  <span className="rounded bg-[#404040] px-2 py-0.5 text-xs">Rest Day</span>
                                )}
                              </div>
                              <p className="text-xs text-[#b3b3b3]">
                                {getDayName(day.day_of_week)}
                              </p>
                            </div>
                          </div>
                          {!day.is_rest_day && <ChevronRight className="h-5 w-5 text-[#b3b3b3]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Exercises View */}
              {viewState === 'exercises' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Exercises</h2>
                  
                  {exercises.length === 0 ? (
                    <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-8 text-center">
                      <p className="text-[#b3b3b3]">No exercises found for this workout day.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {exercises.map(exercise => (
                        <div
                          key={exercise.id}
                          className="rounded-lg border border-[#404040] bg-[#2d2d2d] p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5733]/20 text-[#FF5733]">
                                <Dumbbell className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="font-medium">{exercise.name}</h3>
                                <div className="flex items-center space-x-2 text-xs text-[#b3b3b3]">
                                  <span>{exercise.default_sets} sets</span>
                                  <span>•</span>
                                  <span>{exercise.rest_time_sec}s rest</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Exercise Actions */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleExerciseSelect(exercise)}
                                className="rounded-full p-2 hover:bg-blue-500/20 text-blue-400 transition-colors"
                                title="View and edit sets"
                              >
                                <ListOrdered className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => confirmDeleteExercise(exercise.id, exercise.name)}
                                className="rounded-full p-2 hover:bg-red-500/20 text-red-500 transition-colors"
                                title="Delete exercise"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Muscle groups */}
                          {exercise.muscle_groups && Array.isArray(exercise.muscle_groups) && exercise.muscle_groups.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {exercise.muscle_groups.map((group: string) => (
                                <span 
                                  key={group} 
                                  className="rounded-full bg-[#FF5733]/10 px-2 py-1 text-xs text-[#FF5733] border border-[#FF5733]/20"
                                >
                                  {group}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Exercise Note */}
                          {exercise.note && (
                            <div className="mt-3 rounded-md bg-[#1a1a1a] p-3 text-sm text-[#b3b3b3]">
                              {exercise.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sets View */}
              {viewState === 'sets' && selectedExercise && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{selectedExercise.name} Sets</h2>
                    
                    {exerciseSets?.lastSessionDate && (
                      <div className="flex items-center space-x-2 text-sm text-[#b3b3b3]">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Last logged on {formatDate(exerciseSets.lastSessionDate)}</span>
                      </div>
                    )}
                  </div>
                  
                  {(!exerciseSets || exerciseSets.sets.length === 0) ? (
                    <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-8 text-center">
                      <p className="text-[#b3b3b3]">No sets data found for this exercise.</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-lg border border-[#404040] bg-[#2d2d2d] overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-[#1a1a1a]">
                            <tr className="border-b border-[#404040]">
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#b3b3b3]">Set</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#b3b3b3]">Reps</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#b3b3b3]">Weight</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-[#b3b3b3]">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {exerciseSets.sets.map((set) => (
                              <tr 
                                key={set.id} 
                                className={`border-b border-[#404040] ${
                                  editingSetId === set.id ? 'bg-blue-500/10' : ''
                                }`}
                              >
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF5733]/20 text-[#FF5733]">
                                    {set.setNumber}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {editingSetId === set.id ? (
                                    <input 
                                      type="number"
                                      min="1"
                                      value={editValues.reps}
                                      onChange={(e) => setEditValues({...editValues, reps: e.target.value})}
                                      className="w-20 rounded bg-[#404040] px-2 py-1 text-white"
                                    />
                                  ) : (
                                    <span>{set.reps}</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {editingSetId === set.id ? (
                                    <div className="flex items-center space-x-2">
                                      <input 
                                        type="text"
                                        inputMode="decimal"
                                        value={editValues.weight}
                                        onChange={(e) => setEditValues({...editValues, weight: e.target.value})}
                                        className="w-24 rounded bg-[#404040] px-2 py-1 text-white"
                                      />
                                    </div>
                                  ) : (
                                    <span>{set.weight}</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                  {editingSetId === set.id ? (
                                    <div className="flex items-center justify-end space-x-2">
                                      <button
                                        onClick={cancelEditing}
                                        className="rounded-md border border-[#404040] bg-[#2d2d2d] p-1 text-[#b3b3b3] hover:bg-[#333333]"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={saveSetChanges}
                                        disabled={isSaving}
                                        className="rounded-md bg-blue-500 p-1 text-white hover:bg-blue-600"
                                      >
                                        {isSaving ? (
                                          <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                        ) : (
                                          <Save className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => startEditingSet(set)}
                                      className="rounded-md bg-[#404040] p-1 text-[#b3b3b3] hover:bg-[#505050]"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="rounded-lg border border-[#404040] bg-[#2d2d2d] p-4">
                        <h3 className="font-medium mb-2">Exercise Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-[#b3b3b3]">Default Sets</p>
                            <p>{selectedExercise.default_sets}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#b3b3b3]">Rest Time</p>
                            <p>{selectedExercise.rest_time_sec} seconds</p>
                          </div>
                          {selectedExercise.note && (
                            <div className="col-span-2">
                              <p className="text-xs text-[#b3b3b3]">Note</p>
                              <p className="text-sm">{selectedExercise.note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}