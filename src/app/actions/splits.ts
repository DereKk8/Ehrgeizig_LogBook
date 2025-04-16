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
              exercise_order: exerciseIndex + 1 // Set exercise order based on index + 1
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
                exercise_id: exerciseData.id,
                reps: set.reps,
                weight: set.weight,
                set_number: setIndex + 1 // Set the order using the current index + 1
              })

            if (setError) {
              console.error('Error creating exercise set:', setError)
              throw new Error(`Failed to create exercise set: ${setError.message}`)
            }
          }
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