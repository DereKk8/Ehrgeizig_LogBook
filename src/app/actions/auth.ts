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