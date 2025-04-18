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
    console.log(`Fetching most recent sets for exercise ID: ${exerciseId}`)
    const supabase = await createClient()

    // First, find the most recent session for this exercise
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return { success: false, error: sessionsError.message }
    }

    if (!sessions || sessions.length === 0) {
      console.log(`No sessions found for exercise ${exerciseId}`)
      return { success: true, data: [] }
    }

    // Get session IDs from most recent to oldest
    const sessionIds = sessions.map(session => session.id)
    console.log(`Found ${sessionIds.length} recent sessions, IDs:`, sessionIds)

    // Now fetch sets for this exercise from those sessions
    const { data: sets, error: setsError } = await supabase
      .from('sets')
      .select('*')
      .eq('exercise_id', exerciseId)
      .in('session_id', sessionIds)
      .order('session_id', { ascending: false })

    if (setsError) {
      console.error('Error fetching sets:', setsError)
      return { success: false, error: setsError.message }
    }

    console.log(`Found ${sets?.length || 0} sets for exercise ${exerciseId}:`, sets)

    if (!sets || sets.length === 0) {
      // No sets found for this exercise in any session
      console.log(`No sets found for exercise ${exerciseId} in any session`)
      return { success: true, data: [] }
    }

    // Group sets by session_id
    const setsBySession: Record<string, Array<{ reps: number, weight: number, set_number: number }>> = {}
    
    sets.forEach((set: any) => {
      if (!setsBySession[set.session_id]) {
        setsBySession[set.session_id] = []
      }
      setsBySession[set.session_id].push({
        reps: set.reps,
        weight: set.weight,
        set_number: set.set_number
      })
    })

    // Get session IDs sorted by recency
    const sessionIdsWithSets = Object.keys(setsBySession)
    console.log(`Sessions with sets: ${sessionIdsWithSets.length}`, sessionIdsWithSets)
    
    if (sessionIdsWithSets.length === 0) {
      return { success: true, data: [] }
    }

    // Find the most recent session that has sets for this exercise
    const mostRecentSessionId = sessionIdsWithSets[0]
    const mostRecentSets = setsBySession[mostRecentSessionId]
    
    // Sort by set number
    mostRecentSets.sort((a, b) => a.set_number - b.set_number)
    
    console.log(`Returning ${mostRecentSets.length} sets from session ${mostRecentSessionId}:`, mostRecentSets)
    return { success: true, data: mostRecentSets }
  } catch (error) {
    console.error('Error in getMostRecentSets:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Function to load split day exercises with prefilled sets
export async function loadWorkoutWithPrefilledSets(splitDayId: string) {
  try {
    console.log(`Loading workout with prefilled sets for split day ID: ${splitDayId}`)
    
    // 1. Get all exercises for the split day
    const exercisesResult = await getSplitDayExercises(splitDayId)
    
    if (!exercisesResult.success) {
      console.error('Failed to fetch exercises for split day:', exercisesResult.error)
      return exercisesResult
    }
    
    const exercises = exercisesResult.data || []
    console.log(`Found ${exercises.length} exercises for split day ${splitDayId}`)
    
    const exercisesWithSets: ExerciseWithSets[] = []
    
    // 2. For each exercise, try to get most recent sets
    for (const exercise of exercises) {
      console.log(`Processing exercise: ${exercise.name} (ID: ${exercise.id})`)
      const setsResult = await getMostRecentSets(exercise.id)
      
      let sets = []
      
      if (setsResult.success && setsResult.data && setsResult.data.length > 0) {
        // Use most recent set data
        console.log(`Found ${setsResult.data.length} previous sets for exercise ${exercise.name}`)
        sets = setsResult.data.map((set: { set_number: number; reps: number; weight: number; }) => ({
          setNumber: set.set_number,
          reps: set.reps,
          weight: set.weight
        }))
      } else {
        // Create default empty sets
        console.log(`No previous sets found for exercise ${exercise.name}. Creating ${exercise.default_sets} default sets.`)
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
    
    console.log(`Successfully processed ${exercisesWithSets.length} exercises with their sets`)
    return { success: true, data: exercisesWithSets }
  } catch (error) {
    console.error('Error in loadWorkoutWithPrefilledSets:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Type for logging sets data
export type LogSetData = {
  sessionId: string;
  exerciseId: string;
  sets: Array<{
    setNumber: number;
    reps: number;
    weight: number;
  }>;
}

// Function to create a new workout session
export async function createWorkoutSession(splitDayId: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Create a new session
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        split_day: splitDayId,
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating workout session:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: session }
  } catch (error) {
    console.error('Error in createWorkoutSession:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Function to log sets for an exercise
export async function logExerciseSets(data: LogSetData) {
  try {
    const supabase = await createClient()
    
    const { sessionId, exerciseId, sets } = data
    
    // Check if sets already exist for this exercise in this session
    const { data: existingSets, error: checkError } = await supabase
      .from('sets')
      .select('id')
      .eq('session_id', sessionId)
      .eq('exercise_id', exerciseId)
    
    if (checkError) {
      console.error('Error checking existing sets:', checkError)
      return { success: false, error: checkError.message }
    }
    
    // If sets exist, delete them first (to replace with new values)
    if (existingSets && existingSets.length > 0) {
      const { error: deleteError } = await supabase
        .from('sets')
        .delete()
        .eq('session_id', sessionId)
        .eq('exercise_id', exerciseId)
      
      if (deleteError) {
        console.error('Error deleting existing sets:', deleteError)
        return { success: false, error: deleteError.message }
      }
    }
    
    // Insert all new sets for this exercise
    const setsToInsert = sets.map(set => ({
      session_id: sessionId,
      exercise_id: exerciseId,
      set_number: set.setNumber,
      reps: set.reps,
      weight: set.weight
    }))
    
    const { data: insertedSets, error: insertError } = await supabase
      .from('sets')
      .insert(setsToInsert)
      .select()
    
    if (insertError) {
      console.error('Error inserting sets:', insertError)
      return { success: false, error: insertError.message }
    }
    
    revalidatePath('/workout')
    return { success: true, data: insertedSets }
  } catch (error) {
    console.error('Error in logExerciseSets:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}