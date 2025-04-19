'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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

type FormData = {
  splitName: string
  days: Day[]
}

export async function getSplitById(splitId: string, userId: string) {
  const supabase = await createAdminClient()
  
  try {
    // Verify the split belongs to the user
    const { data: split, error: splitError } = await supabase
      .from('splits')
      .select('*')
      .eq('id', splitId)
      .eq('user_id', userId)
      .single()
    
    if (splitError) {
      console.error('Error fetching split:', splitError)
      return { 
        success: false, 
        error: 'Split not found or access denied' 
      }
    }
    
    // Get split days
    const { data: splitDays, error: splitDaysError } = await supabase
      .from('split_days')
      .select('*')
      .eq('split_id', splitId)
      .order('day_of_week', { ascending: true })
    
    if (splitDaysError) {
      console.error('Error fetching split days:', splitDaysError)
      return { 
        success: false, 
        error: 'Failed to load split days' 
      }
    }
    
    // Build the form data structure
    const formData: FormData = {
      splitName: split.name,
      days: Array(7).fill(null).map((_, index) => {
        const splitDay = splitDays.find(day => day.day_of_week === index)
        
        if (!splitDay) {
          // Default for days that don't exist in the DB (shouldn't happen)
          return {
            isRestDay: true,
            workoutName: 'Rest Day',
            exerciseCount: 0,
            exercises: [{
              name: 'Rest',
              sets: 1,
              restTimeSec: 0,
              note: 'Rest day - no exercises',
              setsData: []
            }]
          }
        }
        
        // If it's a rest day, return appropriate data
        if (splitDay.is_rest_day) {
          return {
            isRestDay: true,
            workoutName: splitDay.name,
            exerciseCount: 0,
            exercises: [{
              name: 'Rest',
              sets: 1,
              restTimeSec: 0,
              note: 'Rest day - no exercises',
              setsData: []
            }]
          }
        }
        
        // For training days, fetch the exercises
        return {
          isRestDay: false,
          workoutName: splitDay.name,
          exerciseCount: 0, // Will be updated after fetching exercises
          exercises: [] // Will be populated after fetching exercises
        }
      })
    }
    
    // Fetch and populate exercises for each training day
    for (const splitDay of splitDays) {
      if (splitDay.is_rest_day) continue
      
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('split_day_id', splitDay.id)
        .order('exercise_order', { ascending: true })
      
      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError)
        return { 
          success: false, 
          error: `Failed to load exercises for ${splitDay.name}` 
        }
      }
      
      // Create a session to get sets data (we'll use the most recent session)
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('split_day', splitDay.id)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError)
        return { 
          success: false, 
          error: `Failed to load session data for ${splitDay.name}` 
        }
      }
      
      // No exercises to process if none found
      if (!exercises.length) continue
      
      const dayIndex = splitDay.day_of_week
      const transformedExercises: Exercise[] = []
      
      for (const exercise of exercises) {
        const exerciseData: Exercise = {
          name: exercise.name,
          sets: exercise.default_sets,
          restTimeSec: exercise.rest_time_sec,
          note: exercise.note || '',
          setsData: []
        }
        
        // If we found a session, fetch the sets
        if (sessions.length > 0) {
          const { data: sets, error: setsError } = await supabase
            .from('sets')
            .select('*')
            .eq('session_id', sessions[0].id)
            .eq('exercise_id', exercise.id)
            .order('set_number', { ascending: true })
          
          if (setsError) {
            console.error('Error fetching sets:', setsError)
            // Continue without sets data rather than failing entirely
          } else if (sets.length > 0) {
            // Map sets to the format expected by the form
            exerciseData.setsData = sets.map(set => ({
              reps: set.reps,
              weight: set.weight
            }))
          }
        }
        
        // If no sets were loaded, create empty set data based on default_sets
        if (exerciseData.setsData.length === 0) {
          exerciseData.setsData = Array(exercise.default_sets).fill(null).map(() => ({
            reps: 0,
            weight: 0
          }))
        }
        
        transformedExercises.push(exerciseData)
      }
      
      // Update the day with exercises
      formData.days[dayIndex].exerciseCount = transformedExercises.length
      formData.days[dayIndex].exercises = transformedExercises
    }
    
    return { success: true, data: formData }
  } catch (error) {
    console.error('Error in getSplitById:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred while loading the split'
    }
  }
}

export async function updateSplit(data: FormData, userId: string, splitId: string) {
  const supabase = await createAdminClient()

  try {
    // Verify the split belongs to the user
    const { data: existingSplit, error: splitVerifyError } = await supabase
      .from('splits')
      .select('id')
      .eq('id', splitId)
      .eq('user_id', userId)
      .single()
    
    if (splitVerifyError || !existingSplit) {
      console.error('Error verifying split ownership:', splitVerifyError)
      throw new Error('Split not found or access denied')
    }
    
    // Update the split name
    const { error: splitUpdateError } = await supabase
      .from('splits')
      .update({ name: data.splitName })
      .eq('id', splitId)
    
    if (splitUpdateError) {
      console.error('Error updating split:', splitUpdateError)
      throw new Error(`Failed to update split: ${splitUpdateError.message}`)
    }
    
    // Get existing split days to compare with updated data
    const { data: existingSplitDays, error: splitDaysError } = await supabase
      .from('split_days')
      .select('*')
      .eq('split_id', splitId)
    
    if (splitDaysError) {
      console.error('Error fetching existing split days:', splitDaysError)
      throw new Error(`Failed to load existing split days: ${splitDaysError.message}`)
    }
    
    // Process each day from the form data
    for (let dayIndex = 0; dayIndex < data.days.length; dayIndex++) {
      const day = data.days[dayIndex]
      const existingSplitDay = existingSplitDays.find(d => d.day_of_week === dayIndex)
      
      // If split day exists, update it
      if (existingSplitDay) {
        // Update the split day
        const { error: splitDayUpdateError } = await supabase
          .from('split_days')
          .update({
            name: day.workoutName,
            is_rest_day: day.isRestDay
          })
          .eq('id', existingSplitDay.id)
        
        if (splitDayUpdateError) {
          console.error('Error updating split day:', splitDayUpdateError)
          throw new Error(`Failed to update split day: ${splitDayUpdateError.message}`)
        }
        
        // For training days, update exercises
        if (!day.isRestDay) {
          // Get existing exercises for this split day
          const { data: existingExercises, error: exercisesError } = await supabase
            .from('exercises')
            .select('*')
            .eq('split_day_id', existingSplitDay.id)
          
          if (exercisesError) {
            console.error('Error fetching existing exercises:', exercisesError)
            throw new Error(`Failed to load existing exercises: ${exercisesError.message}`)
          }
          
          // Create a session for this split day to store updated set data
          const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
              user_id: userId,
              split_day: existingSplitDay.id,
              date: new Date().toISOString().split('T')[0],
            })
            .select()
            .single()
          
          if (sessionError) {
            console.error('Error creating session:', sessionError)
            throw new Error(`Failed to create session: ${sessionError.message}`)
          }
          
          // Delete existing exercises
          if (existingExercises.length > 0) {
            const existingExerciseIds = existingExercises.map(ex => ex.id)
            
            // First delete associated sets
            for (const exerciseId of existingExerciseIds) {
              const { error: deleteSetError } = await supabase
                .from('sets')
                .delete()
                .eq('exercise_id', exerciseId)
              
              if (deleteSetError) {
                console.error('Error deleting exercise sets:', deleteSetError)
                // Continue without failing, as this won't affect creating new sets
              }
            }
            
            // Then delete the exercises
            const { error: deleteExerciseError } = await supabase
              .from('exercises')
              .delete()
              .in('id', existingExerciseIds)
            
            if (deleteExerciseError) {
              console.error('Error deleting exercises:', deleteExerciseError)
              throw new Error(`Failed to delete existing exercises: ${deleteExerciseError.message}`)
            }
          }
          
          // Create new exercises
          for (let exerciseIndex = 0; exerciseIndex < day.exercises.length; exerciseIndex++) {
            const exercise = day.exercises[exerciseIndex];
            const { data: exerciseData, error: exerciseError } = await supabase
              .from('exercises')
              .insert({
                split_day_id: existingSplitDay.id,
                name: exercise.name,
                default_sets: exercise.sets,
                rest_time_sec: exercise.restTimeSec,
                note: exercise.note,
                exercise_order: exerciseIndex + 1
              })
              .select()
              .single()
            
            if (exerciseError) {
              console.error('Error creating exercise:', exerciseError)
              throw new Error(`Failed to create exercise: ${exerciseError.message}`)
            }
            
            // Create sets for the exercise with proper order
            for (let setIndex = 0; setIndex < exercise.setsData.length; setIndex++) {
              const set = exercise.setsData[setIndex];
              const { error: setError } = await supabase
                .from('sets')
                .insert({
                  session_id: session.id,
                  exercise_id: exerciseData.id,
                  reps: set.reps,
                  weight: set.weight,
                  set_number: setIndex + 1
                })
              
              if (setError) {
                console.error('Error creating exercise set:', setError)
                throw new Error(`Failed to create exercise set: ${setError.message}`)
              }
            }
          }
        }
      } else {
        // Create split day (both rest and training days)
        const { data: splitDay, error: splitDayError } = await supabase
          .from('split_days')
          .insert({
            split_id: splitId,
            day_of_week: dayIndex,
            name: day.workoutName,
            is_rest_day: day.isRestDay
          })
          .select()
          .single()
        
        if (splitDayError) {
          console.error('Error creating split day:', splitDayError)
          throw new Error(`Failed to create split day: ${splitDayError.message}`)
        }
        
        // Only create exercises for training days
        if (!day.isRestDay) {
          // Create a session for this split day to store initial set data
          const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
              user_id: userId,
              split_day: splitDay.id,
              date: new Date().toISOString().split('T')[0],
            })
            .select()
            .single()
          
          if (sessionError) {
            console.error('Error creating session:', sessionError)
            throw new Error(`Failed to create session: ${sessionError.message}`)
          }
          
          // Create exercises for this day with proper ordering
          for (let exerciseIndex = 0; exerciseIndex < day.exercises.length; exerciseIndex++) {
            const exercise = day.exercises[exerciseIndex];
            const { data: exerciseData, error: exerciseError } = await supabase
              .from('exercises')
              .insert({
                split_day_id: splitDay.id,
                name: exercise.name,
                default_sets: exercise.sets,
                rest_time_sec: exercise.restTimeSec,
                note: exercise.note,
                exercise_order: exerciseIndex + 1
              })
              .select()
              .single()
            
            if (exerciseError) {
              console.error('Error creating exercise:', exerciseError)
              throw new Error(`Failed to create exercise: ${exerciseError.message}`)
            }
            
            // Create sets for the exercise with proper order
            for (let setIndex = 0; setIndex < exercise.setsData.length; setIndex++) {
              const set = exercise.setsData[setIndex];
              const { error: setError } = await supabase
                .from('sets')
                .insert({
                  session_id: session.id,
                  exercise_id: exerciseData.id,
                  reps: set.reps,
                  weight: set.weight,
                  set_number: setIndex + 1
                })
              
              if (setError) {
                console.error('Error creating exercise set:', setError)
                throw new Error(`Failed to create exercise set: ${setError.message}`)
              }
            }
          }
        }
      }
    }

    revalidatePath('/user_settings/training_split_settings')
    return { success: true }
  } catch (error) {
    console.error('Error in updateSplit:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred while updating the split'
    }
  }
}

export async function createSplit(data: FormData, userId: string) {
  const supabase = await createAdminClient()

  try {
    // Create the split
    const { data: split, error: splitError } = await supabase
      .from('splits')
      .insert({
        user_id: userId,
        name: data.splitName
      })
      .select()
      .single()

    if (splitError) {
      console.error('Error creating split:', splitError)
      throw new Error(`Failed to create split: ${splitError.message}`)
    }

    if (!split) {
      throw new Error('Split was not created')
    }

    console.log('Created split:', split)

    // Create split days and exercises
    for (let dayIndex = 0; dayIndex < data.days.length; dayIndex++) {
      const day = data.days[dayIndex]
      
      // Create split day (both rest and training days)
      const { data: splitDay, error: splitDayError } = await supabase
        .from('split_days')
        .insert({
          split_id: split.id,
          day_of_week: dayIndex,
          name: day.workoutName,
          is_rest_day: day.isRestDay
        })
        .select()
        .single()

      if (splitDayError) {
        console.error('Error creating split day:', splitDayError)
        throw new Error(`Failed to create split day: ${splitDayError.message}`)
      }

      if (!splitDay) {
        throw new Error(`Split day ${dayIndex} was not created`)
      }

      // Only create exercises for training days
      if (!day.isRestDay) {
        // Create a session for this split day to store initial set data
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            user_id: userId,
            split_day: splitDay.id,  // Reference to the split day as required by schema
            date: new Date().toISOString().split('T')[0],  // Current date in YYYY-MM-DD format
          })
          .select()
          .single()

        if (sessionError) {
          console.error('Error creating session:', sessionError)
          throw new Error(`Failed to create session: ${sessionError.message}`)
        }

        if (!session) {
          throw new Error('Session was not created')
        }

        console.log(`Created session for ${day.workoutName}:`, session)

        // Create exercises for this day with proper ordering
        for (let exerciseIndex = 0; exerciseIndex < day.exercises.length; exerciseIndex++) {
          const exercise = day.exercises[exerciseIndex];
          const { data: exerciseData, error: exerciseError } = await supabase
            .from('exercises')
            .insert({
              split_day_id: splitDay.id,
              name: exercise.name,
              default_sets: exercise.sets,
              rest_time_sec: exercise.restTimeSec,
              note: exercise.note,
              exercise_order: exerciseIndex + 1 // This field isn't in your schema - we should add it or remove it
            })
            .select()
            .single()

          if (exerciseError) {
            console.error('Error creating exercise:', exerciseError)
            throw new Error(`Failed to create exercise: ${exerciseError.message}`)
          }

          if (!exerciseData) {
            throw new Error('Exercise was not created')
          }

          // Create sets for the exercise with proper order
          for (let setIndex = 0; setIndex < exercise.setsData.length; setIndex++) {
            const set = exercise.setsData[setIndex];
            const { error: setError } = await supabase
              .from('sets')
              .insert({
                session_id: session.id,
                exercise_id: exerciseData.id,
                reps: set.reps,
                weight: set.weight,
                set_number: setIndex + 1
              })

            if (setError) {
              console.error('Error creating exercise set:', setError)
              throw new Error(`Failed to create exercise set: ${setError.message}`)
            }
          }
          
          console.log(`Created ${exercise.setsData.length} sets for exercise: ${exercise.name}`)
        }
      }
    }

    revalidatePath('/user_settings/training_split_settings')
    return { success: true }
  } catch (error) {
    console.error('Error in createSplit:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred while creating the split'
    }
  }
}