'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type FormData = {
  splitName: string
  days: Array<{
    isRestDay: boolean
    workoutName: string
    exerciseCount: number
    exercises: Array<{
      name: string
      sets: number
      restTimeSec: number
      note?: string
    }>
  }>
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
          name: day.workoutName
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

      // Create exercises for this day
      for (const exercise of day.exercises) {
        const { error: exerciseError } = await supabase
          .from('exercises')
          .insert({
            split_day_id: splitDay.id,
            name: exercise.name,
            default_sets: exercise.sets,
            rest_time_sec: exercise.restTimeSec,
            note: exercise.note
          })

        if (exerciseError) {
          console.error('Error creating exercise:', exerciseError)
          throw new Error(`Failed to create exercise: ${exerciseError.message}`)
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