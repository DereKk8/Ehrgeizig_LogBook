'use client'

import { useFormContext } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { GripVertical, Dumbbell, CalendarRange } from 'lucide-react'

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

type ExerciseSet = {
  reps: number
  weight: number
}

type Exercise = {
  name: string
  sets: number
  restTimeSec: number
  note?: string
  setsData: ExerciseSet[]
}

type Day = {
  isRestDay: boolean
  workoutName: string
  exerciseCount: number
  exercises: Exercise[]
}

export default function ExerciseDetailsStep() {
  const { register, watch, setValue, getValues } = useFormContext()
  const [currentDay, setCurrentDay] = useState(0)
  const days = watch('days') as Day[]

  // Initialize sets data for each exercise
  useEffect(() => {
    days.forEach((day, dayIndex) => {
      if (!day.isRestDay) {
        day.exercises.forEach((exercise, exerciseIndex) => {
          if (!exercise.setsData || exercise.setsData.length !== exercise.sets) {
            const initialSets = Array.from({ length: exercise.sets }, () => ({
              reps: 0,
              weight: 0
            }))
            setValue(`days.${dayIndex}.exercises.${exerciseIndex}.setsData`, initialSets)
          }
        })
      }
    })
  }, [days, setValue])

  // Handle input changes for reps and weight without causing field reset
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight'
  ) => {
    const value = e.target.value
    // Only update the form value on valid inputs
    if (value === '' || !isNaN(parseFloat(value))) {
      setValue(
        `days.${dayIndex}.exercises.${exerciseIndex}.setsData.${setIndex}.${field}`,
        value === '' ? '' : parseFloat(value),
        { shouldDirty: true }
      )
    }
  }

  // Handle numeric input changes properly when focus leaves the field
  const handleNumberInput = (
    e: React.FocusEvent<HTMLInputElement>, 
    dayIndex: number, 
    exerciseIndex: number, 
    setIndex: number, 
    field: 'reps' | 'weight'
  ) => {
    const value = e.target.value
    const numValue = value === '' ? 0 : parseFloat(value)
    setValue(`days.${dayIndex}.exercises.${exerciseIndex}.setsData.${setIndex}.${field}`, numValue)
  }

  // Clean implementation of drag and drop handler
  const handleDragEnd = (result: any, dayIndex: number, exerciseIndex: number) => {
    // Drop outside the droppable area
    if (!result.destination) return
    
    // Source and destination are the same
    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) return

    // Get the current day and exercise
    const day = days[dayIndex]
    if (!day || day.isRestDay) return

    const exercise = day.exercises[exerciseIndex]
    if (!exercise || !exercise.setsData) return

    // Create a copy of the sets array
    const updatedSets = [...exercise.setsData]
    
    // Remove the dragged item
    const [movedSet] = updatedSets.splice(result.source.index, 1)
    
    // Add it at the destination
    updatedSets.splice(result.destination.index, 0, movedSet)
    
    // Update the form state with the new order
    setValue(`days.${dayIndex}.exercises.${exerciseIndex}.setsData`, updatedSets)
    
    // Log the new order for debugging
    console.log(`Set reordered: from position ${result.source.index + 1} to ${result.destination.index + 1}`)
  }

  // Extract set rendering to a separate component for clarity
  const SetItem = ({ 
    dayIndex, 
    exerciseIndex, 
    setIndex, 
    provided, 
    isDragging 
  }: { 
    dayIndex: number
    exerciseIndex: number
    setIndex: number
    provided: any
    isDragging: boolean
  }) => {
    const setValues = watch(`days.${dayIndex}.exercises.${exerciseIndex}.setsData.${setIndex}`) || { reps: 0, weight: 0 }
    
    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`rounded-lg border p-4 transition-all duration-200 ${
          isDragging
            ? 'border-[#FF5733] bg-[#2d2d2d] shadow-lg shadow-[#FF5733]/20'
            : 'border-[#404040] bg-[#1e1e1e] hover:border-[#FF5733]/50'
        }`}
        style={{
          ...provided.draggableProps.style,
          zIndex: isDragging ? 1 : 0,
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center space-x-3">
            <div className="cursor-grab rounded-lg p-2 text-[#b3b3b3] transition-colors duration-200 hover:bg-[#2d2d2d] hover:text-white active:cursor-grabbing">
              <GripVertical className="h-5 w-5" />
            </div>
            <span className="text-[#b3b3b3]">Set {setIndex + 1}</span>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Reps
            </label>
            <input
              type="number"
              value={setValues.reps}
              onChange={(e) => handleInputChange(e, dayIndex, exerciseIndex, setIndex, 'reps')}
              onBlur={(e) => handleNumberInput(e, dayIndex, exerciseIndex, setIndex, 'reps')}
              min="0"
              className="block w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] transition-colors duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Weight (kg)
            </label>
            <input
              type="number"
              value={setValues.weight}
              onChange={(e) => handleInputChange(e, dayIndex, exerciseIndex, setIndex, 'weight')}
              onBlur={(e) => handleNumberInput(e, dayIndex, exerciseIndex, setIndex, 'weight')}
              min="0"
              step="0.5"
              className="block w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] transition-colors duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733]"
            />
          </div>
        </div>
      </div>
    );
  };

  // Extract exercise card rendering for better organization
  const ExerciseCard = ({ 
    day, 
    index, 
    exerciseIndex, 
    exercise 
  }: { 
    day: any
    index: number
    exerciseIndex: number
    exercise: any
  }) => {
    if (!exercise) return null;

    return (
      <div className="space-y-4 rounded-lg border border-[#404040] bg-gradient-to-br from-[#2d2d2d] to-[#252525] p-5 shadow-md hover:shadow-lg hover:shadow-[#FF5733]/5 transition-all duration-300">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-[#FF5733]/10 text-[#FF5733]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <h4 className="font-medium text-white text-lg">
              {exercise.name || `Exercise ${exerciseIndex + 1}`}
            </h4>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h5 className="text-sm font-medium text-white flex items-center">
              <span className="inline-block h-1 w-4 bg-[#FF5733] rounded-full mr-2"></span>
              Sets Configuration
            </h5>
            <div className="flex items-center space-x-2 text-sm text-[#b3b3b3] bg-[#1e1e1e] p-1.5 px-3 rounded-full">
              <GripVertical className="h-4 w-4 text-[#FF5733]" />
              <span>Drag to reorder sets</span>
            </div>
          </div>
          
          <DragDropContext onDragEnd={(result) => handleDragEnd(result, index, exerciseIndex)}>
            <Droppable droppableId={`sets-${index}-${exerciseIndex}`}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {Array.from({ length: exercise.sets }).map((_, setIndex) => (
                    <Draggable
                      key={`set-${index}-${exerciseIndex}-${setIndex}`}
                      draggableId={`set-${index}-${exerciseIndex}-${setIndex}`}
                      index={setIndex}
                    >
                      {(provided, snapshot) => (
                        <SetItem
                          dayIndex={index}
                          exerciseIndex={exerciseIndex}
                          setIndex={setIndex}
                          provided={provided}
                          isDragging={snapshot.isDragging}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Configure Exercise Details</h2>
        <p className="mt-3 text-lg text-[#b3b3b3]">
          Set exercise order and configure sets, weights, and reps
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {DAYS.map((day, index) => {
          const dayData = days[index];
          const isRestDay = dayData?.isRestDay;
          const exercises = dayData?.exercises || [];

          return (
            <div
              key={day}
              className={`rounded-xl border p-4 sm:p-6 transition-all duration-300 ${
                currentDay === index
                  ? 'border-[#FF5733] bg-[#2d2d2d] shadow-lg shadow-[#FF5733]/10'
                  : 'border-[#404040] bg-[#1e1e1e] hover:border-[#FF5733]/50'
              }`}
              onClick={() => setCurrentDay(index)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">{day}</h3>
              </div>

              {isRestDay ? (
                <div className="mt-4 text-[#b3b3b3]">
                  Rest day - no exercises
                </div>
              ) : (
                <div className="mt-6 space-y-4 sm:space-y-6">
                  {exercises.map((exercise, exerciseIndex) => (
                    <ExerciseCard
                      key={exerciseIndex}
                      day={dayData}
                      index={index}
                      exerciseIndex={exerciseIndex}
                      exercise={exercise}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}