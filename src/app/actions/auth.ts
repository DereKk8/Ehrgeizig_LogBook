'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createUserProfile(userId: string, email: string, userName: string) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email: email,
          user_name: userName,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    if (!data) {
      throw new Error('No data returned after insert')
    }

    revalidatePath('/')
    return { success: true, data }
  } catch (error) {
    console.error('Error in createUserProfile:', error)
    throw error
  }
}

export async function updateRememberMeDevice(userId: string, rememberMe: boolean) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ remember_me_device: rememberMe })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Failed to update remember me preference: ${error.message}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in updateRememberMeDevice:', error)
    throw error
  }
}

export async function handleLogout(userId: string) {
  const supabase = createAdminClient()

  try {
    // Clear remember_me_device field
    const { error: updateError } = await supabase
      .from('users')
      .update({ remember_me_device: false })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating remember_me_device:', updateError)
      throw new Error(`Failed to clear remember me preference: ${updateError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error in handleLogout:', error)
    throw error
  }
}

export async function deleteUserAccount(userId: string) {
  const supabase = createAdminClient()

  try {
    // 1. Get all session IDs for the user
    const { data: sessionIds, error: sessionIdsError } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', userId)

    if (sessionIdsError) {
      console.error('Error fetching session IDs:', sessionIdsError)
      throw new Error(`Failed to fetch user's session IDs: ${sessionIdsError.message}`)
    }

    // 2. Delete all sets related to user's sessions
    if (sessionIds && sessionIds.length > 0) {
      const { error: setsError } = await supabase
        .from('sets')
        .delete()
        .in('session_id', sessionIds.map(s => s.id))

      if (setsError) {
        console.error('Error deleting sets:', setsError)
        throw new Error(`Failed to delete user's sets: ${setsError.message}`)
      }
    }

    // 3. Delete all sessions
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .eq('user_id', userId)

    if (sessionsError) {
      console.error('Error deleting sessions:', sessionsError)
      throw new Error(`Failed to delete user's sessions: ${sessionsError.message}`)
    }

    // 4. Get all split IDs for the user
    const { data: splitIds, error: splitIdsError } = await supabase
      .from('splits')
      .select('id')
      .eq('user_id', userId)

    if (splitIdsError) {
      console.error('Error fetching split IDs:', splitIdsError)
      throw new Error(`Failed to fetch user's split IDs: ${splitIdsError.message}`)
    }

    // 5. Get all split day IDs for the user's splits
    if (splitIds && splitIds.length > 0) {
      const { data: splitDayIds, error: splitDayIdsError } = await supabase
        .from('split_days')
        .select('id')
        .in('split_id', splitIds.map(s => s.id))

      if (splitDayIdsError) {
        console.error('Error fetching split day IDs:', splitDayIdsError)
        throw new Error(`Failed to fetch user's split day IDs: ${splitDayIdsError.message}`)
      }

      // 6. Delete all exercises related to user's split days
      if (splitDayIds && splitDayIds.length > 0) {
        const { error: exercisesError } = await supabase
          .from('exercises')
          .delete()
          .in('split_day_id', splitDayIds.map(sd => sd.id))

        if (exercisesError) {
          console.error('Error deleting exercises:', exercisesError)
          throw new Error(`Failed to delete user's exercises: ${exercisesError.message}`)
        }
      }

      // 7. Delete all split days
      const { error: splitDaysError } = await supabase
        .from('split_days')
        .delete()
        .in('split_id', splitIds.map(s => s.id))

      if (splitDaysError) {
        console.error('Error deleting split days:', splitDaysError)
        throw new Error(`Failed to delete user's split days: ${splitDaysError.message}`)
      }
    }

    // 8. Delete all splits
    const { error: splitsError } = await supabase
      .from('splits')
      .delete()
      .eq('user_id', userId)

    if (splitsError) {
      console.error('Error deleting splits:', splitsError)
      throw new Error(`Failed to delete user's splits: ${splitsError.message}`)
    }

    // 9. Delete user profile
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (userError) {
      console.error('Error deleting user profile:', userError)
      throw new Error(`Failed to delete user profile: ${userError.message}`)
    }

    // 10. Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authError) {
      console.error('Error deleting auth user:', authError)
      throw new Error(`Failed to delete auth user: ${authError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteUserAccount:', error)
    throw error
  }
}