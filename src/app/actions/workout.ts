'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DayOfWeek, Split, SplitDay, Exercise, Set } from '../types/db'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Type for exercise data with pre-filled sets
export type ExerciseWithSets = {
  id: string
  name: string
  defaultSets: number
  restTimeSec: number
  note?: string
  exerciseOrder: number
  sets: Array<{
    setNumber: number
    reps: number
    weight: number
  }>
}

// Function to get all splits for the current user
export async function getUserSplits() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: splits, error } = await supabase
      .from('splits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching splits:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: splits }
  } catch (error) {
    console.error('Error in getUserSplits:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Function to get split days for a specific split
export async function getSplitDays(splitId: string) {
  try {
    const supabase = await createClient()

    const { data: splitDays, error } = await supabase
      .from('split_days')
      .select('*')
      .eq('split_id', splitId)
      .order('day_of_week', { ascending: true })

    if (error) {
      console.error('Error fetching split days:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: splitDays }
  } catch (error) {
    console.error('Error in getSplitDays:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Function to get exercises for a specific split day
export async function getSplitDayExercises(splitDayId: string) {
  try {
    const supabase = await createClient()

    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('split_day_id', splitDayId)
      .order('exercise_order', { ascending: true })

    if (error) {
      console.error('Error fetching exercises:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: exercises }
  } catch (error) {
    console.error('Error in getSplitDayExercises:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Type for session set data
interface SessionSet {
  session_id: string;
  reps: number;
  weight: number;
  set_number: number;
}

// Function to get most recent sets for a specific exercise
export async function getMostRecentSets(exerciseId: string) {
  try {
    const supabase = await createClient()

    // First, find the most recent session (other than session #0) that has sets for this exercise
    const { data: sessionSets, error: sessionError } = await supabase
      .from('sets')
      .select('session_id, reps, weight, set_number')
      .eq('exercise_id', exerciseId)
      .order('session_id', { ascending: false })
      .limit(10) // Limit to avoid fetching too many records

    if (sessionError) {
      console.error('Error fetching session sets:', sessionError)
      return { success: false, error: sessionError.message }
    }

    if (!sessionSets || sessionSets.length === 0) {
      // No previous sets found, return empty array
      return { success: true, data: [] }
    }

    // Group sets by session_id
    const setsBySession: Record<string, Array<{ reps: number, weight: number, set_number: number }>> = {}
    
    sessionSets.forEach((set: SessionSet) => {
      if (!setsBySession[set.session_id]) {
        setsBySession[set.session_id] = []
      }
      setsBySession[set.session_id].push({
        reps: set.reps,
        weight: set.weight,
        set_number: set.set_number
      })
    })

    // Get the first session ID (most recent one)
    const mostRecentSessionId = Object.keys(setsBySession)[0]
    
    if (!mostRecentSessionId) {
      return { success: true, data: [] }
    }

    // Return the sets from the most recent session
    const mostRecentSets = setsBySession[mostRecentSessionId]
    
    // Sort by set number
    mostRecentSets.sort((a, b) => a.set_number - b.set_number)

    return { success: true, data: mostRecentSets }
  } catch (error) {
    console.error('Error in getMostRecentSets:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Function to load split day exercises with prefilled sets
export async function loadWorkoutWithPrefilledSets(splitDayId: string) {
  try {
    // 1. Get all exercises for the split day
    const exercisesResult = await getSplitDayExercises(splitDayId)
    
    if (!exercisesResult.success) {
      return exercisesResult
    }
    
    const exercises = exercisesResult.data || []
    const exercisesWithSets: ExerciseWithSets[] = []
    
    // 2. For each exercise, try to get most recent sets
    for (const exercise of exercises) {
      const setsResult = await getMostRecentSets(exercise.id)
      
      let sets = []
      
      if (setsResult.success && setsResult.data && setsResult.data.length > 0) {
        // Use most recent set data
        sets = setsResult.data.map((set: { set_number: number; reps: number; weight: number; }) => ({
          setNumber: set.set_number,
          reps: set.reps,
          weight: set.weight
        }))
      } else {
        // Create default sets
        sets = Array.from({ length: exercise.default_sets }, (_, i) => ({
          setNumber: i + 1,
          reps: 0, // Default reps
          weight: 0 // Default weight
        }))
      }
      
      exercisesWithSets.push({
        id: exercise.id,
        name: exercise.name,
        defaultSets: exercise.default_sets,
        restTimeSec: exercise.rest_time_sec,
        note: exercise.note,
        exerciseOrder: exercise.exercise_order,
        sets
      })
    }
    
    return { success: true, data: exercisesWithSets }
  } catch (error) {
    console.error('Error in loadWorkoutWithPrefilledSets:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}