'use client'

import { useFormContext } from 'react-hook-form'
import { useState, useEffect, useCallback } from 'react'
import { Dumbbell, CalendarRange, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import React, { memo } from 'react'

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

// Type for our local input state
type InputState = {
  [key: string]: {
    reps: string;
    weight: string;
  }
};

type Props = {
  onAllDaysConfigured?: (isConfigured: boolean) => void;
}

// Define SetItem component outside the parent component
const SetItem = memo(({ 
  dayIndex, 
  exerciseIndex, 
  setIndex,
  register,
  watch,
  setValue,
  checkDayCompletion
}: { 
  dayIndex: number
  exerciseIndex: number
  setIndex: number
  register: any
  watch: any
  setValue: any
  checkDayCompletion: (dayIndex: number) => boolean
}) => {
  // Get current values
  const repsValue = watch(`days.${dayIndex}.exercises.${exerciseIndex}.setsData.${setIndex}.reps`);
  const weightValue = watch(`days.${dayIndex}.exercises.${exerciseIndex}.setsData.${setIndex}.weight`);
  
  // Local state to ensure immediate feedback when typing
  const [localReps, setLocalReps] = useState(isNaN(repsValue) ? "" : repsValue || "");
  const [localWeight, setLocalWeight] = useState(isNaN(weightValue) ? "" : weightValue || "");
  
  // Update local state when watched values change
  useEffect(() => {
    setLocalReps(isNaN(repsValue) ? "" : repsValue || "");
  }, [repsValue]);
  
  useEffect(() => {
    setLocalWeight(isNaN(weightValue) ? "" : weightValue || "");
  }, [weightValue]);
  
  // Helper function to handle input change
  const handleInputChange = (field: string, value: string) => {
    // Update local state immediately for responsive UI
    if (field === "reps") {
      setLocalReps(value);
    } else if (field === "weight") {
      setLocalWeight(value);
    }
    
    // Convert to number or set to undefined if empty
    const numValue = value === "" ? undefined : Number(value);
    setValue(`days.${dayIndex}.exercises.${exerciseIndex}.setsData.${setIndex}.${field}`, numValue);
    
    // Trigger validation after a brief delay to avoid excessive updates
    setTimeout(() => checkDayCompletion(dayIndex), 100);
  };

  return (
    <div
      className="rounded-lg border p-4 transition-all duration-300 border-[#404040] bg-[#1e1e1e] hover:border-[#FF5733]/50 hover:shadow-md hover:shadow-[#FF5733]/10"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <span className="text-[#FF5733] font-semibold mr-1">Set</span>
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#FF5733]/10 text-[#FF5733] text-sm font-medium">{setIndex + 1}</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-white">
            <span className="mr-2 text-[#FF5733]">•</span>Reps
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter reps"
            value={localReps}
            onChange={(e) => handleInputChange("reps", e.target.value)}
            className="block w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] transition-all duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733] focus:shadow-sm focus:shadow-[#FF5733]/20"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-white">
            <span className="mr-2 text-[#FF5733]">•</span>Weight
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Enter weight"
            value={localWeight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            className="block w-full rounded-lg border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] transition-all duration-200 focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733] focus:shadow-sm focus:shadow-[#FF5733]/20"
          />
        </div>
      </div>
    </div>
  );
});

// Add display name
SetItem.displayName = 'SetItem';

// Define ExerciseCard component outside the parent component
const ExerciseCard = memo(({ 
  day, 
  index, 
  exerciseIndex, 
  exercise,
  register,
  watch,
  setValue,
  checkDayCompletion
}: { 
  day: any
  index: number
  exerciseIndex: number
  exercise: any
  register: any
  watch: any
  setValue: any
  checkDayCompletion: (dayIndex: number) => boolean
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
          <div className="text-sm text-[#b3b3b3] bg-[#1e1e1e] p-1.5 px-3 rounded-full">
            {exercise.sets} set{exercise.sets !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: exercise.sets }).map((_, setIndex) => (
            <SetItem
              key={`set-${index}-${exerciseIndex}-${setIndex}`}
              dayIndex={index}
              exerciseIndex={exerciseIndex}
              setIndex={setIndex}
              register={register}
              watch={watch}
              setValue={setValue}
              checkDayCompletion={checkDayCompletion}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// Add display name
ExerciseCard.displayName = 'ExerciseCard';

export default function ExerciseDetailsStep({ onAllDaysConfigured }: Props) {
  const { register, watch, setValue, getValues } = useFormContext()
  const [currentDay, setCurrentDay] = useState(0)
  const days = watch('days') as Day[]
  const [completedDays, setCompletedDays] = useState<number[]>([])
  
  // Track if all training days are configured
  useEffect(() => {
    // Get indices of all training days (non-rest days)
    const trainingDayIndices = days
      .map((day, index) => day.isRestDay ? -1 : index)
      .filter(index => index !== -1);
    
    // Early exit if there are no training days
    if (trainingDayIndices.length === 0) {
      if (onAllDaysConfigured) {
        onAllDaysConfigured(true); // No training days means we're done by default
      }
      return;
    }

    // Check if each training day has proper configuration
    let allConfigured = true;
    
    for (const dayIndex of trainingDayIndices) {
      // Using a separate variable here to avoid calling the function directly in the effect's body
      const isComplete = checkDayCompletion(dayIndex);
      if (!isComplete) {
        allConfigured = false;
        break;
      }
    }
    
    console.log('Training day configuration status:', {
      trainingDayIndices,
      completedDays,
      allConfigured
    });
    
    if (onAllDaysConfigured) {
      onAllDaysConfigured(allConfigured);
    }
  }, [days, completedDays, onAllDaysConfigured]);

  // Find the first non-rest day to start with
  useEffect(() => {
    const firstTrainingDayIndex = days.findIndex(day => !day.isRestDay);
    if (firstTrainingDayIndex !== -1 && currentDay === 0) {
      setCurrentDay(firstTrainingDayIndex);
    }
  }, [days, currentDay]);

  // Initialize sets data for each exercise
  useEffect(() => {
    days.forEach((day, dayIndex) => {
      if (!day.isRestDay) {
        day.exercises.forEach((exercise, exerciseIndex) => {
          if (!exercise.setsData || exercise.setsData.length !== exercise.sets) {
            // Initialize sets without default values - they will be empty inputs
            const initialSets = Array.from({ length: exercise.sets }, () => ({
              reps: undefined,
              weight: undefined
            }))
            setValue(`days.${dayIndex}.exercises.${exerciseIndex}.setsData`, initialSets)
          }
        })
      }
    })
  }, [days, setValue])

  // Check if all exercises for a day have their sets configured
  const checkDayCompletion = useCallback((dayIndex: number) => {
    const day = days[dayIndex];
    
    // Rest days are always considered complete
    if (day.isRestDay) return true;
    
    // Training day with no exercises is incomplete
    if (!day.exercises || day.exercises.length === 0) {
      if (completedDays.includes(dayIndex)) {
        setCompletedDays(prev => prev.filter(d => d !== dayIndex));
      }
      return false;
    }
    
    // Check if all exercises have proper set data
    let isComplete = true;
    
    for (const exercise of day.exercises) {
      // Check if all sets are properly defined
      if (!exercise.setsData || exercise.setsData.length !== exercise.sets) {
        isComplete = false;
        break;
      }
      
      // Check if all sets have valid reps and weight values
      for (const set of exercise.setsData) {
        // Check if reps and weight are defined and valid
        // Allow zero weights for bodyweight exercises
        if (!set.reps || set.reps <= 0 || set.weight === undefined || set.weight < 0) {
          isComplete = false;
          break;
        }
      }
      
      if (!isComplete) break;
    }

    // Update completed days state based on check result
    if (isComplete) {
      if (!completedDays.includes(dayIndex)) {
        console.log(`Day ${dayIndex} (${DAYS[dayIndex]}) marked as complete`);
        setCompletedDays(prev => [...prev, dayIndex]);
      }
    } else {
      if (completedDays.includes(dayIndex)) {
        console.log(`Day ${dayIndex} (${DAYS[dayIndex]}) marked as incomplete`);
        setCompletedDays(prev => prev.filter(d => d !== dayIndex));
      }
    }
    
    return isComplete;
  }, [days, completedDays, setCompletedDays]);

  // Navigation functions
  const goToNextDay = () => {
    // Find the next non-rest day if possible
    let nextDayIndex = currentDay + 1;
    while (nextDayIndex < days.length && days[nextDayIndex].isRestDay) {
      nextDayIndex++;
    }

    if (nextDayIndex < days.length) {
      setCurrentDay(nextDayIndex);
    }
  };

  const goToPreviousDay = () => {
    // Find the previous non-rest day if possible
    let prevDayIndex = currentDay - 1;
    while (prevDayIndex >= 0 && days[prevDayIndex].isRestDay) {
      prevDayIndex--;
    }

    if (prevDayIndex >= 0) {
      setCurrentDay(prevDayIndex);
    }
  };

  // Get next and previous training day indices
  const getAdjacentTrainingDays = () => {
    let nextTrainingDay = -1;
    let prevTrainingDay = -1;
    
    // Find next training day
    for (let i = currentDay + 1; i < days.length; i++) {
      if (!days[i].isRestDay) {
        nextTrainingDay = i;
        break;
      }
    }
    
    // Find previous training day
    for (let i = currentDay - 1; i >= 0; i--) {
      if (!days[i].isRestDay) {
        prevTrainingDay = i;
        break;
      }
    }
    
    return { nextTrainingDay, prevTrainingDay };
  };

  const { nextTrainingDay, prevTrainingDay } = getAdjacentTrainingDays();
  const trainingDayCount = days.filter(day => !day.isRestDay).length;
  const currentTrainingDayIndex = days.filter((day, idx) => !day.isRestDay && idx <= currentDay).length;

  return (
    <div className="space-y-8">
      <div className="text-center bg-gradient-to-br from-[#1e1e1e] to-[#252525] p-6 rounded-xl border border-[#404040] shadow-md">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FF5733]/10 text-[#FF5733] mb-4">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold text-white">Configure Exercise Details</h2>
        <p className="mt-3 text-lg text-[#b3b3b3]">
          Configure sets, weights, and reps for your workout routine
        </p>
      </div>

      {/* Day navigation indicators */}
      <div className="bg-[#1a1a1a] rounded-lg p-3 overflow-x-auto mb-6">
        <div className="flex space-x-2">
          {DAYS.map((day, index) => {
            const dayData = days[index];
            const isRestDay = dayData?.isRestDay;
            const exerciseCount = dayData?.exercises?.length || 0;
            const isCompleted = completedDays.includes(index);
            
            return (
              <button
                key={day}
                onClick={() => !isRestDay && setCurrentDay(index)}
                disabled={isRestDay}
                className={`flex flex-col items-center justify-center min-w-[100px] p-3 rounded-lg transition-all duration-300 relative ${
                  currentDay === index
                    ? 'bg-[#FF5733] text-white shadow-lg'
                    : isRestDay
                    ? 'bg-[#2d2d2d]/30 text-[#b3b3b3] cursor-default'
                    : isCompleted
                    ? 'bg-[#2d2d2d] text-white hover:bg-[#333333] border border-green-500/50'
                    : 'bg-[#2d2d2d] text-white hover:bg-[#333333]'
                }`}
              >
                <span className="text-xs font-medium mb-1">
                  {day.substring(0, 3)}
                </span>
                
                {isRestDay ? (
                  <span className="text-xs opacity-70">Rest Day</span>
                ) : (
                  <span className="text-xs">{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</span>
                )}
                
                {isCompleted && !isRestDay && (
                  <div className="absolute -top-1 -right-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Training day counter */}
      {trainingDayCount > 1 && (
        <div className="flex justify-center mb-2">
          <div className="px-3 py-1 bg-[#2d2d2d] rounded-full text-sm text-[#b3b3b3]">
            Training Day {currentTrainingDayIndex} of {trainingDayCount}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {DAYS.map((day, index) => {
          const dayData = days[index];
          const isRestDay = dayData?.isRestDay;
          const exercises = dayData?.exercises || [];

          if (currentDay !== index) return null;

          return (
            <div
              key={day}
              className="rounded-xl border-2 p-5 transition-all duration-300 animate-fadeIn"
              style={{
                borderColor: isRestDay ? '#404040' : '#FF5733',
                background: isRestDay ? '#1e1e1e' : 'linear-gradient(to bottom right, #1e1e1e, #252525)'
              }}
            >
              <div className="flex items-center justify-between mb-5 border-b border-[#404040] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#FF5733]/10 text-[#FF5733]">
                    <CalendarRange className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{day}</h3>
                    <p className="text-sm text-[#b3b3b3]">
                      {isRestDay ? 'Rest Day' : dayData?.workoutName || 'Workout Day'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-[#b3b3b3] bg-[#2d2d2d] py-1.5 px-3 rounded-full">
                  {isRestDay ? 'Recovery' : `${exercises.length} Exercise${exercises.length !== 1 ? 's' : ''}`}
                </div>
              </div>

              {isRestDay ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#2d2d2d]/50 text-[#b3b3b3] mb-4">
                    <CalendarRange className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-medium text-[#b3b3b3]">
                    Rest Day
                  </h4>
                  <p className="mt-2 text-[#808080] max-w-md">
                    No exercises scheduled for this day. Your body needs time to recover and grow stronger.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {exercises.length > 0 ? (
                    exercises.map((exercise, exerciseIndex) => (
                      <ExerciseCard
                        key={exerciseIndex}
                        day={dayData}
                        index={index}
                        exerciseIndex={exerciseIndex}
                        exercise={exercise}
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        checkDayCompletion={checkDayCompletion}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-[#b3b3b3]">No exercises added for this day yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={goToPreviousDay}
          disabled={prevTrainingDay === -1}
          className="flex items-center space-x-2 px-4 py-2 rounded-md bg-[#2d2d2d] text-white hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Previous Day</span>
        </button>
        
        <button
          type="button"
          onClick={goToNextDay}
          disabled={nextTrainingDay === -1}
          className="flex items-center space-x-2 px-4 py-2 rounded-md bg-[#2d2d2d] text-white hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span>Next Day</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}