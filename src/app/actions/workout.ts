'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Type for exercise data with pre-filled sets
export type ExerciseWithSets = {
  id: string
  name: string
  defaultSets: number
  restTimeSec: number
  note?: string
  exerciseOrder: number
  muscleGroups?: string[]
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

    // First, fetch sessions with their timestamps and join with sets for this exercise
    const { data: sessionsWithSets, error: joinError } = await supabase
      .from('sets')
      .select('*, sessions:session_id(id, created_at)')
      .eq('exercise_id', exerciseId)
      
    if (joinError) {
      console.error('Error fetching sets with sessions:', joinError)
      return { success: false, error: joinError.message }
    }

    if (!sessionsWithSets || sessionsWithSets.length === 0) {
      console.log(`No sets found for exercise ${exerciseId} in any session`)
      return { success: true, data: [] }
    }

    console.log(`Found ${sessionsWithSets.length} sets across different sessions for exercise ${exerciseId}`)
    
    // Sort sets by session creation time (most recent first)
    sessionsWithSets.sort((a, b) => {
      const dateA = new Date(a.sessions.created_at).getTime()
      const dateB = new Date(b.sessions.created_at).getTime()
      return dateB - dateA // Descending order (newest first)
    })
    
    // Find the most recent session ID
    const mostRecentSessionId = sessionsWithSets[0].session_id
    console.log(`Most recent session ID: ${mostRecentSessionId}`)
    
    // Filter only sets from the most recent session
    const mostRecentSets = sessionsWithSets
      .filter(set => set.session_id === mostRecentSessionId)
      .map(set => ({
        reps: set.reps,
        weight: set.weight,
        set_number: set.set_number
      }))
    
    // Sort by set number
    mostRecentSets.sort((a, b) => a.set_number - b.set_number)
    
    console.log(`Returning ${mostRecentSets.length} sets from most recent session ${mostRecentSessionId}:`, mostRecentSets)
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
        muscleGroups: exercise.muscle_groups ? 
          Array.isArray(exercise.muscle_groups) ? exercise.muscle_groups : JSON.parse(exercise.muscle_groups || '[]') : [],
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

// Type for updating exercise details
export type UpdateExerciseData = {
  exerciseId: string;
  name?: string;
  defaultSets?: number;
  restTimeSec?: number;
  note?: string;
  muscleGroups?: string[];
}

// Function to update exercise details during an active session
export async function updateExerciseDetails(data: UpdateExerciseData) {
  try {
    const supabase = await createClient()
    
    const { exerciseId, name, defaultSets, restTimeSec, note, muscleGroups } = data
    
    // Build the update object with only the fields that are provided
    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (defaultSets !== undefined) updateData.default_sets = defaultSets
    if (restTimeSec !== undefined) updateData.rest_time_sec = restTimeSec
    if (note !== undefined) updateData.note = note
    if (muscleGroups !== undefined) updateData.muscle_groups = muscleGroups || null
    
    // Don't proceed if no fields to update
    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No fields to update' }
    }
    
    // Update the exercise
    const { data: updatedExercise, error } = await supabase
      .from('exercises')
      .update(updateData)
      .eq('id', exerciseId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating exercise:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/workout')
    return { success: true, data: updatedExercise }
  } catch (error) {
    console.error('Error in updateExerciseDetails:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Type for modifying workout sessions
export type ModifyWorkoutSessionData = {
  sessionId: string;
  exerciseWithSetsUpdates: {
    exercise: UpdateExerciseData;
    sets?: Array<{
      setNumber: number;
      reps: number;
      weight: number;
    }>;
  }
}

// Function to modify workout session (both exercise details and sets)
export async function modifyWorkoutSession(data: ModifyWorkoutSessionData) {
  try {
    const { sessionId, exerciseWithSetsUpdates } = data
    const { exercise, sets } = exerciseWithSetsUpdates
    
    // Update the exercise details first
    const exerciseUpdateResult = await updateExerciseDetails(exercise)
    
    if (!exerciseUpdateResult.success) {
      return exerciseUpdateResult
    }
    
    // If sets are provided, update them too
    if (sets && sets.length > 0) {
      const logSetsResult = await logExerciseSets({
        sessionId,
        exerciseId: exercise.exerciseId,
        sets
      })
      
      if (!logSetsResult.success) {
        return logSetsResult
      }
    }
    
    return { 
      success: true, 
      data: { 
        exercise: exerciseUpdateResult.data,
        message: 'Workout session modified successfully' 
      } 
    }
  } catch (error) {
    console.error('Error in modifyWorkoutSession:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Type for modifying a specific set
export type ModifySetData = {
  setId: string;
  reps: number;
  weight: number;
  userId: string;
}

// Function to modify a specific set's data
export async function modifySet(data: ModifySetData) {
  try {
    const supabase = await createAdminClient()
    
    const { setId, reps, weight, userId } = data
    
    // First, verify the set belongs to the user
    const { data: setData, error: setError } = await supabase
      .from('sets')
      .select('session_id')
      .eq('id', setId)
      .single()
    
    if (setError || !setData) {
      console.error('Error finding set:', setError)
      return { success: false, error: 'Set not found' }
    }
    
    // Get the session that the set belongs to
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('id', setData.session_id)
      .single()
    
    if (sessionError || !session) {
      console.error('Error finding session:', sessionError)
      return { success: false, error: 'Session not found' }
    }
    
    // Verify user owns this session/set
    if (session.user_id !== userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Update the set
    const { data: updatedSet, error: updateError } = await supabase
      .from('sets')
      .update({
        reps,
        weight
      })
      .eq('id', setId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating set:', updateError)
      return { success: false, error: 'Failed to update set' }
    }
    
    // Revalidate relevant paths
    revalidatePath('/user_settings/training_split_settings/workout_split_logs')
    revalidatePath('/workout')
    
    return { success: true, data: updatedSet }
  } catch (error) {
    console.error('Error in modifySet:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred while updating the set'
    }
  }
}

// Function to get sets for a specific exercise
export async function getExerciseSets(exerciseId: string, userId: string) {
  try {
    const supabase = await createAdminClient()
    
    // First, verify the exercise exists and belongs to the user through the chain:
    // exercise -> split_day -> split -> user
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('split_day_id')
      .eq('id', exerciseId)
      .single()
    
    if (exerciseError || !exercise) {
      console.error('Error finding exercise:', exerciseError)
      return { success: false, error: 'Exercise not found' }
    }
    
    const { data: splitDay, error: splitDayError } = await supabase
      .from('split_days')
      .select('split_id')
      .eq('id', exercise.split_day_id)
      .single()
    
    if (splitDayError || !splitDay) {
      console.error('Error finding split day:', splitDayError)
      return { success: false, error: 'Split day not found' }
    }
    
    const { data: split, error: splitError } = await supabase
      .from('splits')
      .select('user_id')
      .eq('id', splitDay.split_id)
      .single()
    
    if (splitError || !split) {
      console.error('Error finding split:', splitError)
      return { success: false, error: 'Split not found' }
    }
    
    // Verify user owns this exercise
    if (split.user_id !== userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Find the most recent session with sets for this exercise
    const { data: sessionsWithSets, error: joinError } = await supabase
      .from('sets')
      .select('*, sessions:session_id(id, created_at, date)')
      .eq('exercise_id', exerciseId)
      .order('session_id', { ascending: false })
      
    if (joinError) {
      console.error('Error fetching sessions with sets:', joinError)
      return { success: false, error: joinError.message }
    }
    
    if (!sessionsWithSets || sessionsWithSets.length === 0) {
      return { success: true, data: { sets: [], lastSessionDate: null } }
    }
    
    // Get the most recent session ID
    const mostRecentSessionId = sessionsWithSets[0].session_id
    const lastSessionDate = sessionsWithSets[0].sessions.date
    
    // Filter sets from the most recent session and format them
    const sets = sessionsWithSets
      .filter(set => set.session_id === mostRecentSessionId)
      .sort((a, b) => a.set_number - b.set_number)
      .map(set => ({
        id: set.id,
        setNumber: set.set_number,
        reps: set.reps,
        weight: set.weight
      }))
    
    return { 
      success: true, 
      data: { 
        sets,
        lastSessionDate,
        sessionId: mostRecentSessionId
      }
    }
  } catch (error) {
    console.error('Error in getExerciseSets:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred'
    }
  }
}

// Types for recent workouts
export interface RecentWorkout {
  id: string;
  date: string;
  splitName: string;
  dayName: string;
  exercises: {
    id: string;
    name: string;
    sets: {
      setNumber: number;
      reps: number;
      weight: number;
    }[];
    muscleGroup: string;
  }[];
  totalSets: number;
}

export interface WorkoutSummary {
  totalWorkouts: number;
  totalSets: number;
  muscleGroupCounts: Record<string, number>;
}

// Function to properly normalize muscle group data
function normalizeMuscleGroup(muscleGroup: string | string[] | null): string {
  if (!muscleGroup) return 'NA';

  // If it's an array, return the first item
  if (Array.isArray(muscleGroup) && muscleGroup.length > 0) {
    return muscleGroup[0].toLowerCase();
  }

  // If it's a string, handle potential JSON format
  if (typeof muscleGroup === 'string') {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(muscleGroup);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0].toLowerCase();
      }
      return (parsed?.toString() || 'NA').toLowerCase();
    } catch (e) {
      // Not valid JSON, treat as a single string
      return muscleGroup.toLowerCase();
    }
  }

  return 'NA';
}

// Function to get recent workouts for the dashboard
export async function getRecentWorkouts(limit: number = 3) {
  try {
    console.log(`[getRecentWorkouts] Starting to fetch recent workouts with limit: ${limit}`)
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log(`[getRecentWorkouts] No authenticated user found`)
      return { success: false, error: 'User not authenticated' }
    }

    // Get recent workout sessions with basic information
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        id, 
        date,
        split_day
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(limit)

    if (sessionsError) {
      console.error(`[getRecentWorkouts] Error fetching recent sessions:`, sessionsError)
      return { success: false, error: sessionsError.message }
    }
    
    if (!recentSessions || recentSessions.length === 0) {
      console.log(`[getRecentWorkouts] No recent workouts found for user`)
      return { 
        success: true, 
        data: { 
          workouts: [], 
          summary: { 
            totalWorkouts: 0, 
            totalSets: 0, 
            muscleGroupCounts: {} 
          } 
        } 
      }
    }

    // Get all exercises and sets for these sessions
    const workouts: RecentWorkout[] = []
    let totalSets = 0
    const muscleGroupCounts: Record<string, number> = {}
    
    // Process each session to get exercises and sets
    for (const session of recentSessions) {
      // Get split day information
      const { data: splitDay, error: splitDayError } = await supabase
        .from('split_days')
        .select('id, name, split_id')
        .eq('id', session.split_day)
        .single()

      if (splitDayError || !splitDay) {
        console.error(`[getRecentWorkouts] Error fetching split day for session ${session.id}:`, splitDayError)
        continue
      }
      
      // Get split name if needed
      const { data: split, error: splitError } = await supabase
        .from('splits')
        .select('name')
        .eq('id', splitDay.split_id)
        .single()
        
      if (splitError) {
        console.error(`[getRecentWorkouts] Error fetching split for split_day ${splitDay.id}:`, splitError)
        continue
      }

      // Get exercises with muscle_groups for this split day
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, name, muscle_groups')
        .eq('split_day_id', splitDay.id)
        .order('exercise_order', { ascending: true })

      if (exercisesError) {
        console.error(`[getRecentWorkouts] Error fetching exercises for split day ${splitDay.id}:`, exercisesError)
        continue
      }

      const exercisesWithSets = []
      
      // For each exercise, get its most recent sets using getMostRecentSets
      for (const exercise of exercises) {
        console.log(`[getRecentWorkouts] Getting most recent sets for exercise: ${exercise.name} (ID: ${exercise.id})`)
        console.log(`[getRecentWorkouts] Muscle groups data:`, exercise.muscle_groups)
        
        // Use getMostRecentSets to get the most recent sets for this exercise
        const { success, data: mostRecentSets, error } = await getMostRecentSets(exercise.id)
        
        if (!success || error || !mostRecentSets || mostRecentSets.length === 0) {
          console.log(`[getRecentWorkouts] No sets found for exercise ${exercise.name}`)
          continue
        }
        
        // Format the sets properly
        const formattedSets = mostRecentSets.map(set => ({
          setNumber: set.set_number,
          reps: set.reps,
          weight: set.weight
        }))
        
        // Process muscle groups more carefully to ensure proper color mapping
        let muscleGroup = 'NA';
        
        if (exercise.muscle_groups) {
          try {
            if (typeof exercise.muscle_groups === 'string') {
              // Try to handle as JSON first
              try {
                const parsed = JSON.parse(exercise.muscle_groups);
                muscleGroup = Array.isArray(parsed) && parsed.length > 0 ? 
                  parsed[0].toLowerCase() : 
                  typeof parsed === 'string' ? parsed.toLowerCase() : 'NA';
              } catch (e) {
                // Not JSON, use as is
                muscleGroup = exercise.muscle_groups.toLowerCase();
              }
            } else if (Array.isArray(exercise.muscle_groups)) {
              muscleGroup = exercise.muscle_groups[0]?.toLowerCase() || 'NA';
            }
          } catch (e) {
            console.error(`[getRecentWorkouts] Error processing muscle groups:`, e);
            muscleGroup = 'NA';
          }
        }
        
        console.log(`[getRecentWorkouts] Determined primary muscle group: ${muscleGroup}`);
        
        // Update total sets count
        totalSets += formattedSets.length
        
        // Update muscle group counts
        if (muscleGroup && muscleGroup !== 'NA') {
          muscleGroupCounts[muscleGroup] = (muscleGroupCounts[muscleGroup] || 0) + formattedSets.length
        }
        
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

    // Create the summary data
    const summary: WorkoutSummary = {
      totalWorkouts: workouts.length,
      totalSets: totalSets,
      muscleGroupCounts
    }
    
    console.log(`[getRecentWorkouts] Summary - totalWorkouts: ${summary.totalWorkouts}, totalSets: ${summary.totalSets}`)
    console.log(`[getRecentWorkouts] Muscle group counts:`, summary.muscleGroupCounts)

    return { success: true, data: { workouts, summary } }
  } catch (error) {
    console.error('[getRecentWorkouts] Unexpected error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}