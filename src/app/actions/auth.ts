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