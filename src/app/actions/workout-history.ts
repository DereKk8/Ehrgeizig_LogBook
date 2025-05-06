'use server'

import { createClient } from '@/lib/supabase/server'
import { normalizeMuscleGroup } from './workout'

// Interface for workout comparison data
export interface WorkoutComparison {
  currentWorkout: WorkoutDetail | null;
  previousWorkout: WorkoutDetail | null;
  progressData: ProgressData | null;
}

// Interface for detailed workout information
export interface WorkoutDetail {
  id: string;
  date: string;
  splitName: string;
  dayName: string;
  exercises: ExerciseWithSets[];
  totalSets: number;
}

// Interface for exercise with sets
export interface ExerciseWithSets {
  id: string;
  name: string;
  sets: SetDetail[];
  muscleGroup: string;
}

// Interface for set details
export interface SetDetail {
  setNumber: number;
  reps: number;
  weight: number;
}

// Interface for progress data
export interface ProgressData {
  exercises: ExerciseProgressData[];
  overallProgress: {
    totalWeightChange: number;
    totalRepsChange: number;
    totalWeightChangePercent: number;
    totalRepsChangePercent: number;
  };
}

// Interface for exercise progress data
export interface ExerciseProgressData {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: SetProgressData[];
  totalWeightChange: number;
  totalRepsChange: number;
  totalWeightChangePercent: number;
  totalRepsChangePercent: number;
}

// Interface for set progress data
export interface SetProgressData {
  setNumber: number;
  currentReps: number;
  previousReps: number;
  currentWeight: number;
  previousWeight: number;
  repsChange: number;
  weightChange: number;
  repsChangePercent: number;
  weightChangePercent: number;
}

// Function to get workout history for a specific week
export async function getWorkoutHistoryForWeek(weekOffset: number = 0, daysPerWeek: number = 7) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Calculate date range for the requested week
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7))
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    // Format dates for query
    const startDate = startOfWeek.toISOString().split('T')[0]
    const endDate = endOfWeek.toISOString().split('T')[0]

    // Get workout sessions for the specified week
    const { data: weekSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        id, 
        date,
        created_at,
        split_day
      `)
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .limit(daysPerWeek)

    if (sessionsError) {
      return { success: false, error: sessionsError.message }
    }
    
    if (!weekSessions || weekSessions.length === 0) {
      return { 
        success: true, 
        data: { 
          workouts: [],
          weekRange: { startDate, endDate }
        } 
      }
    }

    // Process each session to get detailed workout information
    const workouts: WorkoutDetail[] = []
    
    for (const session of weekSessions) {
      // Get split day information
      const { data: splitDay, error: splitDayError } = await supabase
        .from('split_days')
        .select('id, name, split_id')
        .eq('id', session.split_day)
        .single()

      if (splitDayError || !splitDay) {
        continue
      }
      
      // Get split name
      const { data: split, error: splitError } = await supabase
        .from('splits')
        .select('name')
        .eq('id', splitDay.split_id)
        .single()
        
      if (splitError) {
        continue
      }

      // Get exercises for this split day
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, name, muscle_groups')
        .eq('split_day_id', splitDay.id)
        .order('exercise_order', { ascending: true })

      if (exercisesError || !exercises) {
        continue
      }

      const exercisesWithSets: ExerciseWithSets[] = []
      
      // For each exercise, get its sets for this specific session
      for (const exercise of exercises) {
        // Get sets for this exercise in this specific session
        const { data: sets, error: setsError } = await supabase
          .from('sets')
          .select('set_number, reps, weight')
          .eq('exercise_id', exercise.id)
          .eq('session_id', session.id)
          .order('set_number', { ascending: true })
        
        if (setsError || !sets || sets.length === 0) {
          continue
        }
        
        // Format the sets properly
        const formattedSets = sets.map(set => ({
          setNumber: set.set_number,
          reps: set.reps,
          weight: set.weight
        }))
        
        // Process muscle groups
        const muscleGroup = await normalizeMuscleGroup(exercise.muscle_groups)
        
        // Add this exercise with its sets to the collection
        exercisesWithSets.push({
          id: exercise.id,
          name: exercise.name,
          sets: formattedSets,
          muscleGroup: muscleGroup
        })
      }
      
      if (exercisesWithSets.length > 0) {
        workouts.push({
          id: session.id,
          date: session.date,
          splitName: split?.name || 'Unknown Split',
          dayName: splitDay.name || 'Unknown Day',
          exercises: exercisesWithSets,
          totalSets: exercisesWithSets.reduce((sum, ex) => sum + ex.sets.length, 0)
        })
      }
    }

    return { 
      success: true, 
      data: { 
        workouts,
        weekRange: { startDate, endDate }
      } 
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Function to get previous instance of a workout for comparison
export async function getPreviousWorkoutInstance(workoutId: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // First, get the current workout details to find its split_day
    const { data: currentSession, error: currentSessionError } = await supabase
      .from('sessions')
      .select('id, date, created_at, split_day')
      .eq('id', workoutId)
      .single()

    if (currentSessionError || !currentSession) {
      return { success: false, error: currentSessionError?.message || 'Workout not found' }
    }

    // Find the previous session with the same split_day
    const { data: previousSessions, error: previousSessionsError } = await supabase
      .from('sessions')
      .select('id, date, created_at, split_day')
      .eq('user_id', user.id)
      .eq('split_day', currentSession.split_day)
      .lt('created_at', currentSession.created_at)
      .order('created_at', { ascending: false })
      .limit(1)

    if (previousSessionsError) {
      return { success: false, error: previousSessionsError.message }
    }

    if (!previousSessions || previousSessions.length === 0) {
      // No previous workout found, just return the current workout
      const currentWorkoutResult = await getWorkoutDetail(workoutId)
      
      if (!currentWorkoutResult.success) {
        return currentWorkoutResult
      }
      
      return { 
        success: true, 
        data: { 
          currentWorkout: currentWorkoutResult.data,
          previousWorkout: null,
          progressData: null
        } 
      }
    }

    // Get details for both workouts
    const previousWorkoutId = previousSessions[0].id
    
    const [currentWorkoutResult, previousWorkoutResult] = await Promise.all([
      getWorkoutDetail(workoutId),
      getWorkoutDetail(previousWorkoutId)
    ])

    if (!currentWorkoutResult.success || !previousWorkoutResult.success) {
      return { 
        success: false, 
        error: currentWorkoutResult.error || previousWorkoutResult.error || 'Failed to fetch workout details' 
      }
    }

    // Calculate progress data
    const progressData = calculateWorkoutProgress(
      currentWorkoutResult.data!,
      previousWorkoutResult.data!
    )

    return { 
      success: true, 
      data: { 
        currentWorkout: currentWorkoutResult.data,
        previousWorkout: previousWorkoutResult.data,
        progressData
      } 
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Helper function to get detailed workout information
async function getWorkoutDetail(workoutId: string) {
  try {
    const supabase = await createClient()
    
    // Get session information
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, date, created_at, split_day')
      .eq('id', workoutId)
      .single()

    if (sessionError || !session) {
      return { success: false, error: sessionError?.message || 'Workout not found' }
    }

    // Get split day information
    const { data: splitDay, error: splitDayError } = await supabase
      .from('split_days')
      .select('id, name, split_id')
      .eq('id', session.split_day)
      .single()

    if (splitDayError || !splitDay) {
      return { success: false, error: splitDayError?.message || 'Split day not found' }
    }
    
    // Get split name
    const { data: split, error: splitError } = await supabase
      .from('splits')
      .select('name')
      .eq('id', splitDay.split_id)
      .single()
      
    if (splitError) {
      return { success: false, error: splitError.message }
    }

    // Get exercises for this split day
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id, name, muscle_groups')
      .eq('split_day_id', splitDay.id)
      .order('exercise_order', { ascending: true })

    if (exercisesError || !exercises) {
      return { success: false, error: exercisesError?.message || 'No exercises found' }
    }

    const exercisesWithSets: ExerciseWithSets[] = []
    
    // For each exercise, get its sets for this specific session
    for (const exercise of exercises) {
      // Get sets for this exercise in this specific session
      const { data: sets, error: setsError } = await supabase
        .from('sets')
        .select('set_number, reps, weight')
        .eq('exercise_id', exercise.id)
        .eq('session_id', session.id)
        .order('set_number', { ascending: true })
      
      if (setsError || !sets || sets.length === 0) {
        continue
      }
      
      // Format the sets properly
      const formattedSets = sets.map(set => ({
        setNumber: set.set_number,
        reps: set.reps,
        weight: set.weight
      }))
      
      // Process muscle groups
      const muscleGroup = await normalizeMuscleGroup(exercise.muscle_groups)
      
      // Add this exercise with its sets to the collection
      exercisesWithSets.push({
        id: exercise.id,
        name: exercise.name,
        sets: formattedSets,
        muscleGroup: muscleGroup
      })
    }
    
    if (exercisesWithSets.length === 0) {
      return { success: false, error: 'No exercises with sets found for this workout' }
    }

    const workoutDetail: WorkoutDetail = {
      id: session.id,
      date: session.date,
      splitName: split?.name || 'Unknown Split',
      dayName: splitDay.name || 'Unknown Day',
      exercises: exercisesWithSets,
      totalSets: exercisesWithSets.reduce((sum, ex) => sum + ex.sets.length, 0)
    }

    return { success: true, data: workoutDetail }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Function to calculate progress between two workouts
function calculateWorkoutProgress(
  currentWorkout: WorkoutDetail,
  previousWorkout: WorkoutDetail
): ProgressData {
  const exerciseProgressData: ExerciseProgressData[] = []
  
  let totalCurrentWeight = 0
  let totalPreviousWeight = 0
  let totalCurrentReps = 0
  let totalPreviousReps = 0
  
  // Process each exercise in the current workout
  currentWorkout.exercises.forEach(currentExercise => {
    // Find the corresponding exercise in the previous workout
    const previousExercise = previousWorkout.exercises.find(
      prevEx => prevEx.id === currentExercise.id
    )
    
    if (!previousExercise) return // Skip if no matching exercise in previous workout
    
    const setProgressData: SetProgressData[] = []
    let exerciseTotalWeightChange = 0
    let exerciseTotalRepsChange = 0
    let exerciseCurrentTotalWeight = 0
    let exercisePreviousTotalWeight = 0
    let exerciseCurrentTotalReps = 0
    let exercisePreviousTotalReps = 0
    
    // Process each set in the current exercise
    currentExercise.sets.forEach(currentSet => {
      // Find the corresponding set in the previous exercise
      const previousSet = previousExercise.sets.find(
        prevSet => prevSet.setNumber === currentSet.setNumber
      )
      
      if (!previousSet) return // Skip if no matching set in previous exercise
      
      // Calculate changes
      const repsChange = currentSet.reps - previousSet.reps
      const weightChange = currentSet.weight - previousSet.weight
      
      // Calculate percentage changes
      const repsChangePercent = previousSet.reps > 0 
        ? (repsChange / previousSet.reps) * 100 
        : 0
      
      const weightChangePercent = previousSet.weight > 0 
        ? (weightChange / previousSet.weight) * 100 
        : 0
      
      // Add to exercise totals
      exerciseCurrentTotalWeight += currentSet.weight * currentSet.reps
      exercisePreviousTotalWeight += previousSet.weight * previousSet.reps
      exerciseCurrentTotalReps += currentSet.reps
      exercisePreviousTotalReps += previousSet.reps
      
      // Add to set progress data
      setProgressData.push({
        setNumber: currentSet.setNumber,
        currentReps: currentSet.reps,
        previousReps: previousSet.reps,
        currentWeight: currentSet.weight,
        previousWeight: previousSet.weight,
        repsChange,
        weightChange,
        repsChangePercent,
        weightChangePercent
      })
    })
    
    // Calculate total changes for the exercise
    exerciseTotalWeightChange = exerciseCurrentTotalWeight - exercisePreviousTotalWeight
    exerciseTotalRepsChange = exerciseCurrentTotalReps - exercisePreviousTotalReps
    
    // Calculate percentage changes for the exercise
    const totalWeightChangePercent = exercisePreviousTotalWeight > 0 
      ? (exerciseTotalWeightChange / exercisePreviousTotalWeight) * 100 
      : 0
    
    const totalRepsChangePercent = exercisePreviousTotalReps > 0 
      ? (exerciseTotalRepsChange / exercisePreviousTotalReps) * 100 
      : 0
    
    // Add to overall totals
    totalCurrentWeight += exerciseCurrentTotalWeight
    totalPreviousWeight += exercisePreviousTotalWeight
    totalCurrentReps += exerciseCurrentTotalReps
    totalPreviousReps += exercisePreviousTotalReps
    
    // Add to exercise progress data
    exerciseProgressData.push({
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      muscleGroup: currentExercise.muscleGroup,
      sets: setProgressData,
      totalWeightChange: exerciseTotalWeightChange,
      totalRepsChange: exerciseTotalRepsChange,
      totalWeightChangePercent,
      totalRepsChangePercent
    })
  })
  
  // Calculate overall progress
  const totalWeightChange = totalCurrentWeight - totalPreviousWeight
  const totalRepsChange = totalCurrentReps - totalPreviousReps
  
  const totalWeightChangePercent = totalPreviousWeight > 0 
    ? (totalWeightChange / totalPreviousWeight) * 100 
    : 0
  
  const totalRepsChangePercent = totalPreviousReps > 0 
    ? (totalRepsChange / totalPreviousReps) * 100 
    : 0
  
  return {
    exercises: exerciseProgressData,
    overallProgress: {
      totalWeightChange,
      totalRepsChange,
      totalWeightChangePercent,
      totalRepsChangePercent
    }
  }
}
