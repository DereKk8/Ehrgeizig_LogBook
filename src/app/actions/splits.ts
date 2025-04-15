'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type Exercise = {
  name: string
  sets: number
  restTimeSec: number
  note?: string
  setsData?: Array<{
    reps: number
    weight: number
  }>
}

type Day = {
  isRestDay: boolean
  workoutName?: string
  exerciseCount?: number
  exercises?: Exercise[]
}

type SplitData = {
  splitName: string
  days: Day[]
}

export async function createSplit(splitData: SplitData, userId: string) {
  const supabase = createAdminClient()

  try {
    // Start a transaction
    const { data: split, error: splitError } = await supabase
      .from('splits')
      .insert({
        name: splitData.splitName,
        user_id: userId
      })
      .select()
      .single()

    if (splitError) throw new Error(`Error creating split: ${splitError.message}`)
    if (!split) throw new Error('Split was not created')

    // Insert days and exercises
    for (let dayIndex = 0; dayIndex < splitData.days.length; dayIndex++) {
      const day = splitData.days[dayIndex]
      
      // Insert split day
      const { data: splitDay, error: dayError } = await supabase
        .from('split_days')
        .insert({
          split_id: split.id,
          day_of_week: dayIndex,
          workout_name: day.isRestDay ? null : day.workoutName,
          is_rest_day: day.isRestDay
        })
        .select()
        .single()

      if (dayError) throw new Error(`Error creating day ${dayIndex}: ${dayError.message}`)
      if (!splitDay) throw new Error(`Day ${dayIndex} was not created`)

      // If it's a training day, insert exercises
      if (!day.isRestDay && day.exercises) {
        for (const exercise of day.exercises) {
          // Insert exercise
          const { data: exerciseData, error: exerciseError } = await supabase
            .from('exercises')
            .insert({
              split_day_id: splitDay.id,
              name: exercise.name,
              default_sets: exercise.sets,
              rest_time_sec: exercise.restTimeSec,
              note: exercise.note || null
            })
            .select()
            .single()

          if (exerciseError) throw new Error(`Error creating exercise: ${exerciseError.message}`)
          if (!exerciseData) throw new Error('Exercise was not created')

          // Create baseline session (Session #0)
          const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
              user_id: userId,
              split_day_id: splitDay.id,
              date: null // null date indicates this is a reference session
            })
            .select()
            .single()

          if (sessionError) throw new Error(`Error creating session: ${sessionError.message}`)
          if (!session) throw new Error('Session was not created')

          // Insert baseline sets if setsData is provided
          if (exercise.setsData) {
            const setsToInsert = exercise.setsData.map((setData, setIndex) => ({
              session_id: session.id,
              exercise_id: exerciseData.id,
              set_number: setIndex + 1,
              weight: setData.weight,
              reps: setData.reps
            }))

            const { error: setsError } = await supabase
              .from('sets')
              .insert(setsToInsert)

            if (setsError) throw new Error(`Error creating sets: ${setsError.message}`)
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
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
} 